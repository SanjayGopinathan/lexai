"""
Google Gemini AI Service
Central wrapper for all LLM calls in LexAI
"""

import json
import re
import asyncio

from app.core.config import settings
from groq import Groq

client = Groq(api_key=settings.GROQ_API_KEY)
MODEL_NAME = "llama-3.3-70b-versatile"


# ── System Prompts ───────────────────────────────────────────────
PROMPTS = {
    "qa": """You are LexAI, an expert Indian legal advisor with 20+ years of experience.
Answer legal questions clearly for ordinary citizens.

ALWAYS respond in this EXACT JSON format (no markdown, no preamble):
{
  "domain": "one of: Constitutional, Criminal, Civil, Family, Property, Consumer, Labour, Corporate",
  "detectedLanguage": "English/Hindi/Tamil",
  "applicableLaw": "The specific Act, Section, or legal provision",
  "explanation": "Clear explanation in simple language (2-3 paragraphs)",
  "userRights": ["Right 1", "Right 2", "Right 3"],
  "suggestedActions": ["Action 1", "Action 2", "Action 3"],
  "whereToApproach": [
    "Authority or office name"
  ],
  "requiredDocuments": [
    "Document 1",
    "Document 2"
  ],
"confidence": "Low | Medium | High",
  "citations": ["Case or statute 1", "Case or statute 2",etc],
  "disclaimer": "This is legal information, not legal advice. Consult a qualified lawyer for your specific situation."
}""",

    "moot_judge": """You are a strict, authoritative High Court Judge presiding over moot court.
- Open sessions formally and maintain decorum
- Ask probing, pointed questions to test arguments
- Interrupt weak or irrelevant arguments
- Be fair but demanding; cite procedure
Keep responses under 120 words. Use formal judicial language.""",

    "moot_opponent": """You are a sharp, aggressive opposing counsel in Indian moot court.
- Challenge every weak legal argument immediately
- Cite real Indian statutes and case law
- Make strong counter-arguments with legal precision
- Address the Judge respectfully ("My Lord" / "Your Lordship")
Keep responses under 150 words. Be strategic and legally precise.""",

    "moot_verdict": """You are a senior High Court Judge delivering final moot court verdict.
Respond ONLY in this exact JSON (no markdown):
{
  "verdict": "For Plaintiff / For Defendant / Split Decision",
  "reasoning": "2-3 sentence legal reasoning citing specific arguments",
  "scores": {
    "argumentQuality": 0,
    "citationAccuracy": 0,
    "rebuttalStrength": 0,
    "legalTerminology": 0,
    "persuasiveness": 0
  },
  "overallScore": 0,
  "feedback": "2-3 sentences of specific constructive feedback",
  "strongPoints": [],
  "weakPoints": []
}""",

     "document": """You are a senior Indian legal document analyst specialising in contract law.
Analyse legal documents for risky, unfair or illegal clauses under Indian law.

Respond ONLY in this exact JSON format (no markdown, no preamble, no extra text):
{
  "overallRisk": "LOW or MEDIUM or HIGH",
  "summary": "2-3 sentence plain-language summary of the document and its overall risk",
  "clauses": [
    {
      "text": "exact clause text quoted from the document",
      "classification": "SAFE or RISKY or ILLEGAL",
      "explanation": "why this clause is safe, risky, or illegal under Indian law",
      "legalReference": "relevant Act or Section, e.g. Section 27 Indian Contract Act 1872, or empty string"
    }
  ],
  "recommendations": [
    "specific actionable recommendation 1",
    "specific actionable recommendation 2",
    "specific actionable recommendation 3"
  ]
}

Rules:
- Identify EVERY clause in the document, not just problematic ones
- SAFE = fair and legal under Indian law
- RISKY = one-sided, unfair, or potentially unenforceable
- ILLEGAL = directly violates Indian law (IPC, Contract Act, Labour law, etc.)
- legalReference must be a real Indian Act/Section or an empty string""",

    "cases": """You are an expert Indian legal researcher with encyclopaedic knowledge of Supreme Court and High Court judgments.

Respond ONLY in this exact JSON format (no markdown, no preamble):
{
  "cases": [
    {
      "title": "Case Name vs Case Name",
      "citation": "AIR YYYY SC XXXX or (YYYY) N SCC XXX",
      "court": "Supreme Court of India or relevant High Court",
      "year": "YYYY",
      "summary": "2-3 sentence summary of the case facts and ruling",
      "relevance": "why this case is relevant to the query",
      "principle": "key legal principle or ratio decidendi established"
    }
  ],
  "legalContext": "brief explanation of the area of law and how these cases relate to the query"
}

Return 3-5 most relevant cases. Only include real, verifiable Indian cases."""
}




# ── JSON PARSER ───────────────────────────────────────────────────
def parse_json_response(text: str) -> dict:
    text = re.sub(r"```(?:json)?\n?", "", text)
    text = re.sub(r"```", "", text).strip()

    # Fix unescaped control characters inside JSON strings
    text = re.sub(r'[\x00-\x1f\x7f](?=[^"]*"(?:[^"]*"[^"]*")*[^"]*$)', ' ', text)

    match = re.search(r"\{[\s\S]*\}", text)
    if match:
        json_str = match.group()
        # Replace literal newlines inside string values
        json_str = re.sub(r'(?<!\\)\n', '\\n', json_str)
        json_str = re.sub(r'(?<!\\)\r', '\\r', json_str)
        json_str = re.sub(r'(?<!\\)\t', '\\t', json_str)
        try:
            return json.loads(json_str)
        except json.JSONDecodeError:
            # Last resort: use ast-style cleaning
            json_str = json_str.replace('\n', '\\n').replace('\r', '\\r').replace('\t', '\\t')
            return json.loads(json_str)

    return json.loads(text)
# ── SINGLE TURN CALL ──────────────────────────────────────────────
async def call_llm(system: str, user_message: str, parse_json: bool = True):
    for attempt in range(3):
        try:
            response = client.chat.completions.create(
                model=MODEL_NAME,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_message}
                ]
            )
            text = response.choices[0].message.content

            if not parse_json:
                return text

            return parse_json_response(text)

        except json.JSONDecodeError as e:
            raise ValueError(f"LLM returned invalid JSON: {e}")

        except Exception as e:
            err = str(e)
            if "429" in err and attempt < 2:
                await asyncio.sleep(30 * (attempt + 1))
                continue
            raise RuntimeError(f"AI service error: {e}")


# ── CONVERSATION CALL ─────────────────────────────────────────────
async def call_llm_conversation(system: str, messages: list[dict], parse_json: bool = False):
    try:
        groq_messages = [{"role": "system", "content": system}]

        for msg in messages:
            role = "user" if msg.get("role") == "user" else "assistant"
            groq_messages.append({
                "role": role,
                "content": msg.get("content", "")
            })

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=groq_messages
        )

        return response.choices[0].message.content

    except Exception as e:
        raise RuntimeError(f"AI conversation error: {e}")