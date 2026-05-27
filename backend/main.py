from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pathlib import Path
from app.core.config import settings
from app.api import auth, generate, portfolios, admin

app = FastAPI(title="baoyu-skills-studio API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Path(settings.output_dir).mkdir(parents=True, exist_ok=True)
app.mount("/output", StaticFiles(directory=settings.output_dir), name="output")

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(generate.router, prefix="/api/generate", tags=["generate"])
app.include_router(portfolios.router, prefix="/api/portfolios", tags=["portfolios"])
app.include_router(admin.router, prefix="/api/admin", tags=["admin"])
