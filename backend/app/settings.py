from urllib.parse import quote_plus

from pydantic import computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    postgres_user: str
    postgres_password: str
    postgres_db: str
    postgres_host: str = "localhost"
    postgres_port: int = 5432
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int

    mailersend_api_token: str
    mailersend_from_email: str
    mailersend_from_name: str = "Oito"

    @computed_field
    @property
    def database_url(self) -> str:
        p = quote_plus(self.postgres_password)
        u = quote_plus(self.postgres_user)
        return (
            f"postgresql+psycopg://{u}:{p}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


settings = Settings()