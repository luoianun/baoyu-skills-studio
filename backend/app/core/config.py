from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str
    jwt_secret_key: str
    jwt_access_token_expire_minutes: int = 15
    jwt_refresh_token_expire_days: int = 30

    image_model_api_key: str = ""
    image_model_base_url: str = ""
    image_model_name: str = "gemini-3.1-flash-image-preview"
    image_api_mode: str = "openai"  # "openai" | "gemini"

    output_dir: str = "./output"
    frontend_url: str = "http://localhost:5173"

settings = Settings()
