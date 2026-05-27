from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.portfolio import Portfolio

router = APIRouter()

class PatchPortfolioIn(BaseModel):
    title: Optional[str] = None

@router.get("/")
def list_portfolios(page: int = 1, size: int = 20, module: str = "",
                    user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    q = db.query(Portfolio).filter(Portfolio.user_id == user.id, Portfolio.is_deleted == False)
    if module:
        q = q.filter(Portfolio.module == module)
    total = q.count()
    items = q.order_by(Portfolio.created_at.desc()).offset((page-1)*size).limit(size).all()
    return {"total": total, "items": [_portfolio_out(p) for p in items]}

@router.get("/{portfolio_id}")
def get_portfolio(portfolio_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.user_id == user.id, Portfolio.is_deleted == False).first()
    if not p:
        raise HTTPException(404, "Not found")
    return _portfolio_out(p)

@router.patch("/{portfolio_id}")
def patch_portfolio(portfolio_id: str, body: PatchPortfolioIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.user_id == user.id).first()
    if not p:
        raise HTTPException(404, "Not found")
    if body.title is not None:
        p.title = body.title
    db.commit()
    return _portfolio_out(p)

@router.delete("/{portfolio_id}")
def delete_portfolio(portfolio_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    p = db.query(Portfolio).filter(Portfolio.id == portfolio_id, Portfolio.user_id == user.id).first()
    if not p:
        raise HTTPException(404, "Not found")
    p.is_deleted = True
    db.commit()
    return {"ok": True}

def _portfolio_out(p: Portfolio) -> dict:
    return {
        "id": p.id, "module": p.module, "title": p.title,
        "status": p.status,
        "image_count": p.image_count, "created_at": str(p.created_at),
        "completed_at": str(p.completed_at) if p.completed_at else None,
        "params": p.params or {},
        "cover_url": f"/output/{p.image_paths[0]}" if p.image_paths else None,
        "image_paths": p.image_paths or [],
        "images": [{"url": f"/output/{path}", "filename": path.split("/")[-1]}
                   for path in (p.image_paths or [])],
        "error_msg": p.error_msg,
    }
