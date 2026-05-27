def build_prompt(params: dict) -> str:
    return f"""Generate article illustration images.
Article Content: {params.get('content', '')}
Illustration Type: {params.get('type', 'infographic')}
Visual Style: {params.get('style', 'notion')}
Density: {params.get('density', 'balanced')}
Output Language: {params.get('lang', 'auto')}

Create high-quality article illustrations following these specifications exactly."""
