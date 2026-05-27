def build_prompt(params: dict) -> str:
    return f"""Generate a Xiaohongshu (Little Red Book) infographic card.
Content: {params.get('content', '')}
Visual Style: {params.get('style', 'cute')}
Layout: {params.get('layout', 'balanced')}
Content Strategy: {params.get('strategy', 'auto')}
Output Language: {params.get('lang', 'auto')}

Create an engaging XHS-style visual card following these specifications exactly."""
