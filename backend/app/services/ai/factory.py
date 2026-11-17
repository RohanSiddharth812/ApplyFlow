from app.core.config import settings
from app.services.ai.base import BaseLLMProvider
from app.services.ai.mock_provider import MockAIProvider
from app.services.ai.openai_provider import OpenAIProvider

def get_ai_provider() -> BaseLLMProvider:
    if settings.USE_MOCK_AI or not settings.AI_API_KEY:
        return MockAIProvider()
    return OpenAIProvider()
