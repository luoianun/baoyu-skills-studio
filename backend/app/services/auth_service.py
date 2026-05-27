from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.core.security import hash_password, verify_password, create_access_token, generate_refresh_token, hash_refresh_token
from app.core.config import settings
from app.schemas.auth import RegisterIn, LoginIn, TokenOut

def register(data: RegisterIn, db: Session) -> TokenOut:
    if db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")
    user = User(email=data.email, username=data.username, password_hash=hash_password(data.password))
    db.add(user)
    db.flush()
    return _issue_tokens(user, db)

def login(data: LoginIn, db: Session) -> TokenOut:
    user = db.query(User).filter(User.email == data.email).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account disabled")
    return _issue_tokens(user, db)

def refresh_tokens(raw_token: str, db: Session) -> TokenOut:
    token_hash = hash_refresh_token(raw_token)
    record = db.query(RefreshToken).filter(
        RefreshToken.token_hash == token_hash,
        RefreshToken.revoked == False,
        RefreshToken.expires_at > datetime.now(timezone.utc)
    ).first()
    if not record:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
    record.revoked = True
    user = db.get(User, record.user_id)
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or disabled")
    return _issue_tokens(user, db)

def logout(raw_token: str, db: Session) -> None:
    token_hash = hash_refresh_token(raw_token)
    record = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if record:
        record.revoked = True
        db.commit()

def _issue_tokens(user: User, db: Session) -> TokenOut:
    raw, hashed = generate_refresh_token()
    expires = datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days)
    db.add(RefreshToken(user_id=user.id, token_hash=hashed, expires_at=expires))
    db.commit()
    return TokenOut(access_token=create_access_token(user.id), refresh_token=raw)
