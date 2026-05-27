def build_prompt(params: dict) -> str:
    content = params.get("content", "")
    cover_type = params.get("type", "conceptual")
    palette = params.get("palette", "warm")
    rendering = params.get("rendering", "flat-vector")
    text_level = params.get("text_level", "title-only")
    mood = params.get("mood", "balanced")
    aspect = params.get("aspect", "16:9")
    lang = params.get("lang", "auto")

    return f"""Generate a professional article cover image.
Content/Title: {content}
Type: {cover_type}
Color Palette: {palette}
Rendering Style: {rendering}
Text Level: {text_level}
Mood: {mood}
Aspect Ratio: {aspect}
Output Language: {lang}

Create a high-quality cover image following these specifications exactly."""
