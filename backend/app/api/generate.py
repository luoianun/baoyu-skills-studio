import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.portfolio import Portfolio
from app.schemas.generate import (
    GenerateOut, ImageOut,
    CoverImageIn, InfographicIn, ArticleIllustratorIn,
    ComicIn, SlideDeckIn, XhsImagesIn,
)
from app.services import image_gen_service, file_service, credits_service
from app.services.modules import (
    cover_image, infographic, article_illustrator, comic, slide_deck, xhs_images
)

router = APIRouter()

async def _generate_in_background(portfolio_id: str, user_id: int, prompt: str, image_count: int, module_name: str):
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        portfolio = db.get(Portfolio, portfolio_id)
        user = db.get(User, user_id)

        try:
            b64_images = await image_gen_service.generate_images(prompt, count=image_count)
        except Exception as e:
            portfolio.status = "failed"
            portfolio.error_msg = str(e)
            db.commit()
            return

        paths = []
        try:
            for i, b64 in enumerate(b64_images):
                filename = f"{i+1:02d}-{module_name}.png"
                path = file_service.save_image(b64, user_id, module_name, portfolio_id, filename)
                paths.append(path)
        except Exception as e:
            portfolio.status = "failed"
            portfolio.error_msg = f"File save error: {e}"
            db.commit()
            return

        portfolio.status = "success"
        portfolio.image_paths = paths
        portfolio.image_count = len(paths)
        portfolio.completed_at = datetime.now(timezone.utc)

        credits_service.deduct_for_generation(user, portfolio_id, db, count=len(paths))
        db.commit()
    finally:
        db.close()

async def _run_generation(module_name: str, params: dict, prompt: str,
                           image_count: int, user: User, db: Session,
                           background_tasks: BackgroundTasks) -> GenerateOut:
    # NOTE: For high-concurrency production use, this check should use SELECT FOR UPDATE
    # to prevent TOCTOU race conditions on user.credits. Current implementation is
    # acceptable for low-concurrency deployments.
    if user.credits < image_count:
        raise HTTPException(status_code=402, detail="Insufficient credits")

    portfolio_id = str(uuid.uuid4())
    content_preview = (params.get("content") or "").strip()[:10]
    timestamp = datetime.now().strftime('%Y-%m-%d %H:%M')
    title = f"{content_preview} · {timestamp}" if content_preview else timestamp

    portfolio = Portfolio(id=portfolio_id, user_id=user.id, module=module_name,
                          title=title, params=params, status="pending")
    db.add(portfolio)
    db.commit()

    background_tasks.add_task(_generate_in_background, portfolio_id, user.id, prompt, image_count, module_name)

    return GenerateOut(portfolio_id=portfolio_id, title=title, status="pending", image_count=image_count)

@router.post("/cover-image", response_model=GenerateOut)
async def gen_cover_image(data: CoverImageIn, background_tasks: BackgroundTasks,
                           user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prompt = cover_image.build_prompt(data.model_dump())
    return await _run_generation("cover_image", data.model_dump(), prompt, 1, user, db, background_tasks)

@router.post("/infographic", response_model=GenerateOut)
async def gen_infographic(data: InfographicIn, background_tasks: BackgroundTasks,
                           user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prompt = infographic.build_prompt(data.model_dump())
    return await _run_generation("infographic", data.model_dump(), prompt, 1, user, db, background_tasks)

@router.post("/article-illustrator", response_model=GenerateOut)
async def gen_article_illustrator(data: ArticleIllustratorIn, background_tasks: BackgroundTasks,
                                   user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prompt = article_illustrator.build_prompt(data.model_dump())
    count = {"minimal": 2, "balanced": 4, "per-section": 3, "rich": 6}.get(data.density, 3)
    return await _run_generation("article_illustrator", data.model_dump(), prompt, count, user, db, background_tasks)

@router.post("/comic", response_model=GenerateOut)
async def gen_comic(data: ComicIn, background_tasks: BackgroundTasks,
                    user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prompt = comic.build_prompt(data.model_dump())
    return await _run_generation("comic", data.model_dump(), prompt, 4, user, db, background_tasks)

@router.post("/slide-deck", response_model=GenerateOut)
async def gen_slide_deck(data: SlideDeckIn, background_tasks: BackgroundTasks,
                          user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prompt = slide_deck.build_prompt(data.model_dump())
    return await _run_generation("slide_deck", data.model_dump(), prompt, data.slides, user, db, background_tasks)

@router.post("/xhs-images", response_model=GenerateOut)
async def gen_xhs_images(data: XhsImagesIn, background_tasks: BackgroundTasks,
                          user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    prompt = xhs_images.build_prompt(data.model_dump())
    return await _run_generation("xhs_images", data.model_dump(), prompt, data.image_count, user, db, background_tasks)
