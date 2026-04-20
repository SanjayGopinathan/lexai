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
    3. Normalise keys and return colour-coded risk report
    """
    truncated = text[:4000]
    prompt = f"Analyse this legal document ({filename}):\n\n{truncated}"
    result = await call_llm(PROMPTS["document"], prompt, parse_json=True)

    # ── Normalise overallRisk ────────────────────────────────────
    if "overall_risk" in result and "overallRisk" not in result:
        result["overallRisk"] = result.pop("overall_risk")
    if not result.get("overallRisk"):
        result["overallRisk"] = "MEDIUM"
    result["overallRisk"] = result["overallRisk"].upper()

    # ── Normalise clauses list ───────────────────────────────────
    if not isinstance(result.get("clauses"), list):
        result["clauses"] = []

    normalised = []
    for c in result["clauses"]:
        classification = (
            c.get("classification") or
            c.get("risk_level") or
            c.get("risk") or
            "RISKY"
        ).upper()
        # Map any variant like "SAFE_CLAUSE" → "SAFE"
        if "SAFE" in classification:
            classification = "SAFE"
        elif "ILLEGAL" in classification or "UNLAWFUL" in classification:
            classification = "ILLEGAL"
        else:
            classification = "RISKY"

        normalised.append({
            "text": (
                c.get("text") or c.get("clause") or
                c.get("content") or c.get("clause_text") or ""
            ),
            "classification": classification,
            "explanation": (
                c.get("explanation") or c.get("reason") or
                c.get("analysis") or c.get("description") or ""
            ),
            "legalReference": (
                c.get("legalReference") or c.get("legal_reference") or
                c.get("section") or c.get("reference") or
                c.get("applicable_law") or ""
            ),
        })
    result["clauses"] = normalised

    # ── Normalise recommendations ───────────────────────────────
    if not isinstance(result.get("recommendations"), list):
        result["recommendations"] = []

    # ── Ensure summary ──────────────────────────────────────────
    if not result.get("summary"):
        result["summary"] = "Document analysis complete. Review the flagged clauses below."

    # ── Clause counts ───────────────────────────────────────────
    result["safe_count"]    = sum(1 for c in result["clauses"] if c["classification"] == "SAFE")
    result["risky_count"]   = sum(1 for c in result["clauses"] if c["classification"] == "RISKY")
    result["illegal_count"] = sum(1 for c in result["clauses"] if c["classification"] == "ILLEGAL")

    return result