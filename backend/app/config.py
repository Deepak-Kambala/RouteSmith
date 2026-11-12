import os
from pydantic import BaseModel
from typing import Optional

class Settings(BaseModel):
    # App
    app_name: str = "RouteSmith"
    env: str = os.getenv("ENV", "production")
    
    # Gemini API Key (loaded from .env)
    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    
    # Flagsmith Credentials
    flagsmith_environment_key: Optional[str] = os.getenv("FLAGSMITH_ENVIRONMENT_KEY")
    flagsmith_api_url: str = os.getenv("FLAGSMITH_API_URL", "https://edge.api.flagsmith.com/api/v1/")
    flagsmith_admin_api_key: Optional[str] = os.getenv("FLAGSMITH_ADMIN_API_KEY")
    
    # GitHub Integration
    github_access_token: Optional[str] = os.getenv("GITHUB_ACCESS_TOKEN")
    github_default_repo: str = os.getenv("GITHUB_DEFAULT_REPO", "Deepak-Kambala/RouteSmith")
    
    # Database
    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./routesmith.db")
    supabase_url: Optional[str] = os.getenv("SUPABASE_URL")
    supabase_service_role_key: Optional[str] = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

settings = Settings()
