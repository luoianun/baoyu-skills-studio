import asyncio
import base64
import json
import logging
import re
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

def _get_config() -> dict:
    """Read image API config from DB, fall back to env vars."""
    try:
        from app.core.database import SessionLocal
        from app.models.app_config import AppConfig
        db = SessionLocal()
        try:
            rows = db.query(AppConfig).filter(
                AppConfig.key.in_({"image_api_mode", "image_model_base_url", "image_model_api_key", "image_model_name"})
            ).all()
            db_cfg = {r.key: r.value for r in rows}
        finally:
            db.close()
    except Exception:
        db_cfg = {}

    return {
        "mode": db_cfg.get("image_api_mode") or settings.image_api_mode,
        "base_url": db_cfg.get("image_model_base_url") or settings.image_model_base_url,
        "api_key": db_cfg.get("image_model_api_key") or settings.image_model_api_key,
        "model_name": db_cfg.get("image_model_name") or settings.image_model_name,
    }

async def generate_images(prompt: str, count: int = 1) -> list[str]:
    """Returns list of base64 PNG strings."""
    cfg = _get_config()
    if cfg["mode"] == "openai":
        return await _call_openai(prompt, count, cfg)
    return await _call_gemini(prompt, count, cfg)

def _extract_b64_from_content(content) -> str | None:
    """Extract base64 image data from string or list content."""
    if not content:
        return None
    if isinstance(content, str):
        if "data:image" in content:
            return content.split("base64,")[-1].strip().rstrip('"')
        return None
    if isinstance(content, list):
        for part in content:
            if not isinstance(part, dict):
                continue
            if part.get("type") == "image_url":
                url = (part.get("image_url") or {}).get("url") or ""
                if "base64," in url:
                    return url.split("base64,")[-1].strip()
            if part.get("type") == "image":
                data = part.get("source", {}).get("data") or part.get("data")
                if data:
                    return data
    return None

async def _url_to_b64(client: httpx.AsyncClient, url: str) -> str:
    r = await client.get(url, follow_redirects=True)
    r.raise_for_status()
    return base64.b64encode(r.content).decode()

def _extract_image_urls_from_markdown(text: str) -> list[str]:
    return re.findall(r'!\[.*?\]\((https?://[^)]+)\)', text)

async def _call_openai_once(client: httpx.AsyncClient, prompt: str, cfg: dict) -> str:
    url = f"{cfg['base_url']}/v1/chat/completions"
    headers = {"Authorization": f"Bearer {cfg['api_key']}"}
    body = {
        "model": cfg["model_name"],
        "messages": [{"role": "user", "content": prompt}],
    }
    r = await client.post(url, json=body, headers=headers)
    r.raise_for_status()
    data = r.json()
    for choice in data.get("choices", []):
        msg = choice.get("message", {})

        # base64 in content or list parts
        b64 = _extract_b64_from_content(msg.get("content"))
        if b64:
            return b64

        # images field
        images_field = msg.get("images")
        if images_field:
            if isinstance(images_field, list) and images_field:
                entry = images_field[0]
                if isinstance(entry, str):
                    return entry.split("base64,")[-1].strip() if "base64," in entry else entry
                if isinstance(entry, dict):
                    b64 = _extract_b64_from_content([entry])
                    if b64:
                        return b64
                    raise RuntimeError(f"images[0] unrecognized format. keys={list(entry.keys())}")
            if isinstance(images_field, str):
                return images_field.split("base64,")[-1].strip() if "base64," in images_field else images_field

        # markdown image URL in text content (e.g. ![](https://...))
        content_str = msg.get("content") or ""
        if isinstance(content_str, str):
            urls = _extract_image_urls_from_markdown(content_str)
            if urls:
                return await _url_to_b64(client, urls[0])

    first_msg = (data.get("choices") or [{}])[0].get("message", {})
    content_text = first_msg.get("content") or ""
    if isinstance(content_text, str) and content_text.strip():
        # API returned a text error message (e.g. "模型负载较高，请重试")
        clean = re.sub(r'[>\*`\[\]!\n]+', ' ', content_text).strip()[:200]
        raise RuntimeError(f"API 返回错误：{clean}")
    raise RuntimeError(f"No image found. message keys: {list(first_msg.keys())}, message dump: {json.dumps(first_msg, ensure_ascii=False)[:300]}")

async def _call_openai(prompt: str, count: int, cfg: dict) -> list[str]:
    async with httpx.AsyncClient(timeout=300) as client:
        tasks = [_call_openai_once(client, prompt, cfg) for _ in range(count)]
        images = await asyncio.gather(*tasks)
    if not images:
        raise RuntimeError("Image generation API returned no images")
    return list(images)

async def _call_gemini(prompt: str, count: int, cfg: dict) -> list[str]:
    base = cfg["base_url"] or "https://generativelanguage.googleapis.com"
    url = f"{base}/v1beta/models/{cfg['model_name']}:generateContent"
    headers = {"x-goog-api-key": cfg["api_key"]}
    body = {
        "contents": [{"parts": [{"text": prompt}]}],
        "generationConfig": {"responseModalities": ["IMAGE", "TEXT"]},
    }
    async with httpx.AsyncClient(timeout=120) as client:
        r = await client.post(url, json=body, headers=headers)
        if r.status_code >= 400:
            raise RuntimeError(f"Gemini API {r.status_code}: {r.text}")
        r.raise_for_status()
    data = r.json()
    images = []
    candidates = data.get("candidates") or []
    parts = candidates[0].get("content", {}).get("parts", []) if candidates else []
    for part in parts:
        if part and "inlineData" in part:
            images.append(part["inlineData"]["data"])
    if not images:
        raise RuntimeError("Image generation API returned no images")
    return images
