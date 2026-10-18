from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    llm_provider: str = "mock"  # google | openai | mock
    llm_api_key: str = ""
    llm_model: str = "gemma-4"
    llm_base_url: str = ""
    llm_timeout_seconds: float = 60
    llm_temperature: float = 0.2

    cors_origins: str = "*"
    chat_max_messages: int = 20
    max_code_chars: int = 20000

    @property
    def cors_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
