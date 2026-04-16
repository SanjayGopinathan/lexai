"""
Legal Q&A Service
Handles language detection, domain classification, and answer generation
"""
from app.ai.llm_service import call_llm, PROMPTS


async def answer_legal_question(question: str, language: str = "auto") -> dict:
    """
    Full Q&A pipeline:
    1. Detect language
    2. Classify legal domain
    3. Retrieve relevant law via LLM (RAG-style)
    4. Generate structured answer
    """
    user_prompt = f"Legal Question: {question}\nPreferred Language: {language}"
    result = await call_llm(PROMPTS["qa"], user_prompt, parse_json=True)
    return result
