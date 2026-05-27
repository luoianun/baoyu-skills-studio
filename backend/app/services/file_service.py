import base64
import re
from pathlib import Path
from app.core.config import settings

_SAFE = re.compile(r'^[\w\-]+$')

def save_image(b64_data: str, user_id: int, module: str, portfolio_id: str, filename: str) -> str:
    """Writes decoded base64 image to disk. Returns relative path usable in URL."""
    if not _SAFE.match(module):
        raise ValueError(f"Invalid module name: {module!r}")
    if not _SAFE.match(portfolio_id):
        raise ValueError(f"Invalid portfolio_id: {portfolio_id!r}")
    # Filename: strip directory components, keep only the basename
    filename = Path(filename).name
    if not filename:
        raise ValueError("Empty filename")

    dir_path = Path(settings.output_dir) / str(user_id) / module / portfolio_id
    dir_path.mkdir(parents=True, exist_ok=True)
    file_path = dir_path / filename
    image_bytes = base64.b64decode(b64_data, validate=True)
    if not image_bytes:
        raise ValueError("Decoded image is empty — base64 input was blank")
    file_path.write_bytes(image_bytes)
    return f"{user_id}/{module}/{portfolio_id}/{filename}"
