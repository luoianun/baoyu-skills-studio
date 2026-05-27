from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, date, timedelta
from typing import Optional
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import require_admin
from app.core.security import hash_password
from app.models.user import User
from app.models.portfolio import Portfolio
from app.models.credit_transaction import CreditTransaction
from app.models.user_activity import UserActivity
from app.services import credits_service

router = APIRouter()

class IssueCreditsIn(BaseModel):
    amount: int
    note: str = ""

class CreateUserIn(BaseModel):
    email: str
    username: str
    password: str
    role: str = "user"
    initial_credits: int = 0

class PatchUserIn(BaseModel):
    username: Optional[str] = None
    is_active: Optional[bool] = None

@router.get("/stats/daily")
def daily_stats(days: int = 14, db: Session = Depends(get_db), _=Depends(require_admin)):
    today = date.today()
    start_date = today - timedelta(days=days - 1)
    start_dt = datetime.combine(start_date, datetime.min.time())

    # Single query: active users per day
    au_rows = db.query(
        UserActivity.date,
        func.count(func.distinct(UserActivity.user_id)).label("cnt")
    ).filter(
        UserActivity.date >= start_date,
        UserActivity.date <= today,
    ).group_by(UserActivity.date).all()
    au_map = {row.date: row.cnt for row in au_rows}

    # Single query: generations per day
    gen_rows = db.query(
        func.date(Portfolio.completed_at).label("d"),
        func.count().label("cnt")
    ).filter(
        Portfolio.status == "success",
        Portfolio.completed_at >= start_dt,
    ).group_by(func.date(Portfolio.completed_at)).all()
    gen_map = {row.d: row.cnt for row in gen_rows}

    result = []
    for i in range(days - 1, -1, -1):
        d = today - timedelta(days=i)
        result.append({
            "date": d.strftime("%m-%d"),
            "active_users": au_map.get(d, 0),
            "generations": gen_map.get(d, 0),
        })
    return result

@router.get("/stats")
def stats(db: Session = Depends(get_db), _=Depends(require_admin)):
    today_start = datetime.combine(date.today(), datetime.min.time())
    return {
        "total_users": db.query(User).count(),
        "today_generations": db.query(Portfolio).filter(
            Portfolio.status == "success",
            Portfolio.completed_at >= today_start
        ).count(),
        "credits_issued": db.query(func.sum(CreditTransaction.amount)).filter(
            CreditTransaction.type == "admin_grant"
        ).scalar() or 0,
        "credits_used": db.query(CreditTransaction).filter(
            CreditTransaction.type == "generation"
        ).count(),
    }

@router.get("/users")
def list_users(page: int = 1, size: int = 20, search: str = "",
               db: Session = Depends(get_db), _=Depends(require_admin)):
    q = db.query(User)
    if search:
        q = q.filter(User.email.ilike(f"%{search}%") | User.username.ilike(f"%{search}%"))
    total = q.count()
    users = q.order_by(User.created_at.desc()).offset((page-1)*size).limit(size).all()
    return {"total": total, "items": [_user_out(u) for u in users]}

@router.post("/users")
def create_user(body: CreateUserIn, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(409, "Email taken")
    user = User(email=body.email, username=body.username,
                password_hash=hash_password(body.password), role=body.role)
    db.add(user)
    db.flush()
    if body.initial_credits > 0:
        credits_service.admin_adjust(user, body.initial_credits, "Initial credits", admin.id, db)
    else:
        db.commit()
    db.refresh(user)
    return _user_out(user)

@router.patch("/users/{user_id}")
def patch_user(user_id: int, body: PatchUserIn, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    if body.username is not None:
        user.username = body.username
    if body.is_active is not None:
        user.is_active = body.is_active
    db.commit()
    return _user_out(user)

@router.post("/users/{user_id}/credits")
def issue_credits(user_id: int, body: IssueCreditsIn, db: Session = Depends(get_db), admin: User = Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if body.amount == 0:
        raise HTTPException(status_code=400, detail="Amount cannot be zero")
    return credits_service.admin_adjust(user, body.amount, body.note, admin.id, db)

@router.get("/users/{user_id}/credits")
def credit_history(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    txs = db.query(CreditTransaction).filter(CreditTransaction.user_id == user_id)\
            .order_by(CreditTransaction.created_at.desc()).limit(50).all()
    return [{"id": t.id, "amount": t.amount, "balance_after": t.balance_after,
             "type": t.type, "note": t.note, "created_at": str(t.created_at)} for t in txs]

@router.get("/users/{user_id}")
def get_user(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(404, "User not found")
    return _user_out(user)

@router.get("/users/{user_id}/portfolios")
def user_portfolios(user_id: int, db: Session = Depends(get_db), _=Depends(require_admin)):
    items = db.query(Portfolio).filter(Portfolio.user_id == user_id)\
               .order_by(Portfolio.created_at.desc()).limit(50).all()
    return [{"id": p.id, "module": p.module, "title": p.title,
             "image_count": p.image_count, "status": p.status, "created_at": str(p.created_at)} for p in items]

@router.get("/generations")
def all_generations(page: int = 1, size: int = 20, module: str = "", status: str = "",
                    db: Session = Depends(get_db), _=Depends(require_admin)):
    q = db.query(Portfolio)
    if module:
        q = q.filter(Portfolio.module == module)
    if status:
        q = q.filter(Portfolio.status == status)
    total = q.count()
    items = q.order_by(Portfolio.created_at.desc()).offset((page-1)*size).limit(size).all()
    return {"total": total, "items": [{"id": p.id, "user_id": p.user_id, "module": p.module,
            "title": p.title, "image_count": p.image_count, "status": p.status,
            "created_at": str(p.created_at)} for p in items]}

def _user_out(u: User) -> dict:
    return {"id": u.id, "email": u.email, "username": u.username, "role": u.role,
            "credits": u.credits, "is_active": u.is_active, "created_at": str(u.created_at)}
