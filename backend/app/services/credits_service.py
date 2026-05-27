from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.user import User
from app.models.credit_transaction import CreditTransaction
from app.models.portfolio import Portfolio  # noqa: F401 — ensure portfolios table is in metadata

def deduct_for_generation(user: User, portfolio_id: str, db: Session, count: int = 1) -> None:
    """Check credits >= count, deduct count, record transaction. Must be called inside an open transaction — caller is responsible for commit."""
    if user.credits < count:
        raise HTTPException(status_code=402, detail="Insufficient credits")
    user.credits -= count
    db.add(CreditTransaction(
        user_id=user.id,
        amount=-count,
        balance_after=user.credits,
        type="generation",
        portfolio_id=portfolio_id,
    ))

def admin_adjust(user: User, amount: int, note: str, operator_id: int, db: Session) -> User:
    """Admin grant or deduct. amount can be positive or negative."""
    new_balance = user.credits + amount
    if new_balance < 0:
        raise HTTPException(status_code=400, detail="Credits cannot go below 0")
    user.credits = new_balance
    tx_type = "admin_grant" if amount > 0 else "admin_deduct"
    db.add(CreditTransaction(
        user_id=user.id,
        amount=amount,
        balance_after=new_balance,
        type=tx_type,
        note=note,
        operator_id=operator_id,
    ))
    db.commit()
    db.refresh(user)
    return user
