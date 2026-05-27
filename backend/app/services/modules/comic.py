def build_prompt(params: dict) -> str:
    return f"""Generate a comic/manga style image.
Story/Content: {params.get('content', '')}
Art Style: {params.get('art', 'ligne-claire')}
Tone: {params.get('tone', 'neutral')}
Panel Layout: {params.get('layout', 'standard')}
Aspect Ratio: {params.get('aspect', '3:4')}
Output Language: {params.get('lang', 'auto')}

Create a high-quality comic image following these specifications exactly."""
