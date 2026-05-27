def build_prompt(params: dict) -> str:
    return f"""Generate a professional infographic image.
Content: {params.get('content', '')}
Layout: {params.get('layout', 'bento-grid')}
Visual Style: {params.get('style', 'craft-handmade')}
Aspect Ratio: {params.get('aspect', 'landscape')}
Output Language: {params.get('lang', 'auto')}

Create a high-quality infographic following these specifications exactly."""
