import os
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseModel):
    FLAGSMITH_ENVIRONMENT_KEY: str = os.getenv("FLAGSMITH_ENVIRONMENT_KEY", "ser.mock_routesmith_key")
    FLAGSMITH_CLIENT_KEY: str = os.getenv("FLAGSMITH_CLIENT_KEY", "mock_client_key")
    FLAGSMITH_ADMIN_API_KEY: str = os.getenv("FLAGSMITH_ADMIN_API_KEY", "")
    FLAGSMITH_API_URL: str = os.getenv("FLAGSMITH_API_URL", "https://edge.api.flagsmith.com/api/v1/")
    FLAGSMITH_PROJECT_ID: str = os.getenv("FLAGSMITH_PROJECT_ID", "routesmith-prod")
    FLAGSMITH_FEATURE_NAME: str = "rag_pipeline_strategy"
    
    # Secondary guardrail flags
    FLAG_ENABLE_SEMANTIC_CACHE: str = "enable_semantic_cache"
    FLAG_MAX_CONTEXT_TOKENS: str = "max_context_tokens"
    
    # Conversion metric name
    METRIC_ANSWER_RESOLVED: str = "answer_resolved"

settings = Settings()
