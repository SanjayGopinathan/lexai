"""
Case Law Explorer Service
Semantic search using LLM-based retrieval
"""
from app.ai.llm_service import call_llm, PROMPTS


async def search_case_law(query: str) -> dict:
    """
    Semantic case law search:
    1. Retrieve top relevant Indian cases via LLM
    2. Return ranked results with summaries and relevance
    """
    prompt = f"Find relevant Indian case law for this legal scenario: \"{query}\""
    result = await call_llm(PROMPTS["cases"], prompt, parse_json=True)

    # Normalise — ensure cases key always exists as a list
    if "cases" not in result or not isinstance(result["cases"], list):
        # Sometimes LLM returns a top-level array directly
        if isinstance(result, list):
            result = {"cases": result, "legalContext": ""}
        else:
            result["cases"] = []

    if not result.get("legalContext"):
        result["legalContext"] = ""

    return result