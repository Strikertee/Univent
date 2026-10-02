from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    app_name: str = "Univent API"
    # sqlite:///./univent.db locally; Render injects postgres://... via DATABASE_URL
    database_url: str = "sqlite:///./univent.db"
    secret_key: str = "change-me-in-production"
    access_token_expire_days: int = 7
    # comma-separated extra origins besides localhost (e.g. https://univent.vercel.app)
    frontend_url: str = "http://localhost:3000"
    upload_dir: str = "uploads"

    class Config:
        env_file = ".env"


settings = Settings()
