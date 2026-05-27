from pydantic import BaseModel
from typing import Optional

class ImageOut(BaseModel):
    url: str
    filename: str

class GenerateOut(BaseModel):
    portfolio_id: str
    title: str
    status: str  # "pending" | "success" | "failed"
    image_count: int = 1
    images: list[ImageOut] = []

class CoverImageIn(BaseModel):
    content: str
    type: str = "conceptual"
    palette: str = "warm"
    rendering: str = "flat-vector"
    text_level: str = "title-only"
    mood: str = "balanced"
    font: str = "clean"
    aspect: str = "16:9"
    lang: str = "auto"

class InfographicIn(BaseModel):
    content: str
    layout: str = "bento-grid"
    style: str = "craft-handmade"
    aspect: str = "landscape"
    lang: str = "auto"

class ArticleIllustratorIn(BaseModel):
    content: str
    type: str = "infographic"
    style: str = "notion"
    density: str = "balanced"
    lang: str = "auto"

class ComicIn(BaseModel):
    content: str
    art: str = "ligne-claire"
    tone: str = "neutral"
    layout: str = "standard"
    aspect: str = "3:4"
    lang: str = "auto"

class SlideDeckIn(BaseModel):
    content: str
    style: str = "blueprint"
    audience: str = "general"
    slides: int = 10
    lang: str = "auto"

class XhsImagesIn(BaseModel):
    content: str
    style: str = "cute"
    layout: str = "balanced"
    image_count: int = 6
    strategy: str = "auto"
    lang: str = "auto"
