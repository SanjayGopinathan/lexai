"""
Document Risk Scanner Service
Text extraction + clause analysis
"""
import io
from app.ai.llm_service import call_llm, PROMPTS


def extract_text_from_upload(content: bytes, filename: str) -> str:
    """
    Extract text from uploaded file.
    For production: install pymupdf and python-docx for real extraction.
    Currently handles plain text files directly.
    """
    if filename.endswith(".txt"):
        return content.decode("utf-8", errors="ignore")
    # For PDF/DOCX: would use PyMuPDF / python-docx here
    # Fallback: try raw decode
    try:
        return content.decode("utf-8", errors="ignore")
    except Exception:
        return ""


async def scan_document(text: str, filename: str = "document") -> dict:
    """
    Full document scanning pipeline:
    1. Receive extracted text
    2. Send to LLM for clause analysis
    3. Return colour-coded risk report
    """
    # Limit to first 3000 tokens worth of text
    truncated = text[:4000]
    prompt = f"Analyse this legal document ({filename}):\n\n{truncated}"
    result = await call_llm(PROMPTS["document"], prompt, parse_json=True)

    # Compute clause counts
    clauses = result.get("clauses", [])
    result["safe_count"]    = sum(1 for c in clauses if c.get("classification") == "SAFE")
    result["risky_count"]   = sum(1 for c in clauses if c.get("classification") == "RISKY")
    result["illegal_count"] = sum(1 for c in clauses if c.get("classification") == "ILLEGAL")

    return result
