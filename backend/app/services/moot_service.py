"""
Moot Court Service
Manages AI judge and opponent interactions, scoring, verdicts
"""
from typing import Optional
from app.ai.llm_service import call_llm, call_llm_conversation, PROMPTS


async def get_judge_response(conversation_history: list, case_context: str) -> str:
    """Get judge's response to the current argument"""
    messages = [
        {"role": "user", "content": f"Case context: {case_context}"},
        *conversation_history[-8:],   # Last 8 messages for context window
    ]
    return await call_llm_conversation(PROMPTS["moot_judge"], messages)


async def get_opponent_response(conversation_history: list, case_context: str, user_role: str) -> str:
    """Get opposing counsel's counter-argument"""
    opp_role = "Defendant" if user_role == "Plaintiff" else "Plaintiff"
    context = f"Case: {case_context}. You represent the {opp_role}."
    messages = [
        {"role": "user", "content": context},
        *conversation_history[-8:],
    ]
    return await call_llm_conversation(PROMPTS["moot_opponent"], messages)


async def generate_verdict(
    case_title: str,
    user_role: str,
    conversation_history: list,
    live_scores: dict,
) -> dict:
    """Generate final verdict and detailed scorecard"""
    # Summarise session for verdict prompt
    summary_lines = []
    for msg in conversation_history[:12]:
        speaker = msg.get("speaker", msg.get("role", "Unknown"))
        content = msg.get("content", "")[:200]
        summary_lines.append(f"{speaker}: {content}")

    prompt = (
        f"Case: {case_title}\n"
        f"Student appeared for: {user_role}\n"
        f"Session transcript:\n" + "\n".join(summary_lines) + "\n"
        f"Running scores: {live_scores}"
    )
    return await call_llm(PROMPTS["moot_verdict"], prompt, parse_json=True)


def calculate_overall_score(scores: dict) -> float:
    """Weighted average of all score dimensions"""
    weights = {
        "argumentQuality": 0.25,
        "citationAccuracy": 0.20,
        "rebuttalStrength": 0.20,
        "legalTerminology": 0.15,
        "persuasiveness": 0.20,
    }
    total = sum(scores.get(k, 0) * w for k, w in weights.items())
    return round(total, 1)
