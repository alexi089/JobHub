"""
Application configuration loaded from environment variables.
"""
from pydantic_settings import BaseSettings
from typing import List, Optional


class Settings(BaseSettings):
    """Application settings with validation."""
    
    # Database
    DATABASE_URL: str
    
    # JWT Authentication
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Encryption for ATS credentials
    ENCRYPTION_KEY: str
    
    # Application
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_TITLE: str = "Job Tracker API"
    API_VERSION: str = "1.0.0"
    
    # CORS
    CORS_ORIGINS: str = "http://localhost:5173"
    
    # ATS API Keys (optional)
    GREENHOUSE_API_KEY: Optional[str] = None
    WORKDAY_CLIENT_ID: Optional[str] = None
    WORKDAY_CLIENT_SECRET: Optional[str] = None
    
    # Email (optional)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Global settings instance
settings = Settings()
