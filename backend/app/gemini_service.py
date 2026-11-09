import requests
from typing import Optional
from app.config import settings

def call_gemini_api(prompt: str, model: str = "gemini-flash-latest") -> Optional[str]:
    """
    Calls the Gemini REST API using GEMINI_API_KEY from environment.
    Falls back gracefully to None if the network times out or model is unavailable.
    """
    if not settings.GEMINI_API_KEY or settings.GEMINI_API_KEY.startswith("mock"):
        return None

    # Google Generative Language API endpoint
    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={settings.GEMINI_API_KEY}"
    
    payload = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ],
        "generationConfig": {
            "temperature": 0.2,
            "maxOutputTokens": 2048
        }
    }
    
    headers = {"Content-Type": "application/json"}
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=4)
        if response.status_code == 200:
            data = response.json()
            candidates = data.get("candidates", [])
            if candidates:
                parts = candidates[0].get("content", {}).get("parts", [])
                if parts:
                    return parts[0].get("text")
    except Exception:
        pass
        
    return None
