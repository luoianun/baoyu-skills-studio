from pydantic import BaseModel
from typing import Optional

class PortfolioOut(BaseModel):
    id: str
    module: str
    title: str
    image_count: int
    created_at: str
    cover_url: Optional[str]
    images: list[dict]
