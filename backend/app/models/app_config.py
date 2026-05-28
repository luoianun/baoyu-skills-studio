from sqlalchemy import Column, String, Text, DateTime, func
from app.core.database import Base

class AppConfig(Base):
    __tablename__ = "app_config"

    key = Column(String(64), primary_key=True)
    value = Column(Text, nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
