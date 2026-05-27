def build_prompt(params: dict) -> str:
    return f"""Generate a presentation slide image.
Content: {params.get('content', '')}
Visual Style: {params.get('style', 'blueprint')}
Target Audience: {params.get('audience', 'general')}
Number of Slides: {params.get('slides', 10)}
Output Language: {params.get('lang', 'auto')}

Create a professional slide following these specifications exactly."""
