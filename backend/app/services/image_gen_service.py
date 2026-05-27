import asyncio
import json
import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

async def generate_images(prompt: str, count: int = 1) -> list[str]:
    """Returns list of base64 PNG strings."""
    if settings.image_api_mode == "openai":
        return await _call_openai(prompt, count)
    return await _call_gemini(prompt, count)

def _extract_b64_from_content(content) -> str | None:
    """Extract base64 image data from string or list content."""
    if not content:
        return None
    # String format: "data:image/png;base64,<data>"
    if isinstance(content, str):
        if "data:image" in content:
            return content.split("base64,")[-1].strip().rstrip('"')
        return None
    # List format (multimodal): [{"type": "image_url", "image_url": {"url": "data:image/...;base64,..."}}, ...]
    if isinstance(content, list):
        for part in content:
            if not isinstance(part, dict):
                continue
            if part.get("type") == "image_url":
                url = (part.get("image_url") or {}).get("url") or ""
                if "base64," in url:
                    return url.split("base64,")[-1].strip()
            # Some APIs use inline_data or image directly
            if part.get("type") == "image":
                data = part.get("source", {}).get("data") or part.get("data")
                if data:
                    return data
    return None

async def _call_openai_once(client: httpx.AsyncClient, prompt: str) -> str:
    """Single API call, returns one base64 image."""
    url = f"{settings.image_model_base_url}/v1/chat/completions"
    headers = {"Authorization": f"Bearer {settings.image_model_api_key}"}
    body = {
        "model": settings.image_model_name,
        "messages": [{"role": "user", "content": prompt}],
    }
    r = await client.post(url, json=body, headers=headers)
    r.raise_for_status()
    data = r.json()
    for choice in data.get("choices", []):
        msg = choice.get("message", {})
        # Try content field first (string or list)
        b64 = _extract_b64_from_content(msg.get("content"))
        if b64:
            return b64
        # Some providers (e.g. OpenRouter) return images in a separate "images" field
        images_field = msg.get("images")
        if images_field:
            if isinstance(images_field, list) and images_field:
                entry = images_field[0]
                if isinstance(entry, str):
                    return entry.split("base64,")[-1].strip() if "base64," in entry else entry
                if isinstance(entry, dict):
                    # {"type": "image_url", "image_url": {"url": "data:image/png;base64,..."}}
                    b64 = _extract_b64_from_content([entry])
                    if b64:
                        return b64
                    raise RuntimeError(f"images[0] unrecognized format. keys={list(entry.keys())}")
            if isinstance(images_field, str):
                return images_field.split("base64,")[-1].strip() if "base64," in images_field else images_field
    first_msg = (data.get("choices") or [{}])[0].get("message", {})
    raise RuntimeError(f"No image found. message keys: {list(first_msg.keys())}, message dump: {json.dumps(first_msg, ensure_ascii=False)[:500]}")

async def _call_openai(prompt: str, count: int) -> list[str]:
    async with httpx.AsyncClient(timeout=120) as client:
        tasks = [_call_openai_once(client, prompt) for _ in range(count)]
        images = await asyncio.gather(*tasks)
    if not images:
        raise RuntimeError("Image generation API returned no images")
    return list(images)

async def _call_gemini(prompt: str, count: int) -> list[str]:
    url = f"{settings.image_model_base_url}/v1beta/models/{settings.image_model_name}:generateContent"
    headers = {"x-goog-api-key": settings.image_model_api_key}
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
