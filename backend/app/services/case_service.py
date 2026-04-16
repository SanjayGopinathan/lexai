"""
Case Law Explorer Service
Semantic search using LLM-based retrieval
"""
from app.ai.llm_service import call_llm, PROMPTS


async def search_case_law(query: str) -> dict:
    """
    Semantic case law search:
    1. Embed user query (conceptually)
    2. Retrieve top relevant Indian cases via LLM
    3. Return ranked results with summaries and relevance
    """
    prompt = f"Find relevant Indian case law for this legal scenario: \"{query}\""
    result = await call_llm(PROMPTS["cases"], prompt, parse_json=True)
    return result
