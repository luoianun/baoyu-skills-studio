from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from datetime import date
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.user_activity import UserActivity
from app.schemas.auth import RegisterIn, LoginIn, TokenOut, MeOut, RefreshIn
from app.services import auth_service
from app.core.security import hash_password, verify_password

router = APIRouter()

class UpdateProfileIn(BaseModel):
    username: Optional[str] = None
    current_password: Optional[str] = None
    new_password: Optional[str] = None

@router.post("/register", response_model=TokenOut)
def register(data: RegisterIn, db: Session = Depends(get_db)):
    return auth_service.register(data, db)

@router.post("/login", response_model=TokenOut)
def login(data: LoginIn, db: Session = Depends(get_db)):
    return auth_service.login(data, db)

@router.post("/refresh", response_model=TokenOut)
def refresh(data: RefreshIn, db: Session = Depends(get_db)):
    return auth_service.refresh_tokens(data.refresh_token, db)

@router.post("/logout")
def logout(data: RefreshIn, db: Session = Depends(get_db)):
    auth_service.logout(data.refresh_token, db)
    return {"ok": True}

@router.get("/me", response_model=MeOut)
def me(user: User = Depends(get_current_user)):
    return user

@router.patch("/me")
def update_me(body: UpdateProfileIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if body.username is not None:
        user.username = body.username
    if body.new_password is not None:
        if not body.current_password:
            raise HTTPException(400, "需要提供当前密码")
        if not verify_password(body.current_password, user.password_hash):
            raise HTTPException(400, "当前密码错误")
        user.password_hash = hash_password(body.new_password)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "username": user.username, "email": user.email, "role": user.role, "credits": user.credits}

@router.post("/ping")
def ping(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    today = date.today()
    db.add(UserActivity(user_id=user.id, date=today))
    db.commit()
    return {"ok": True}
