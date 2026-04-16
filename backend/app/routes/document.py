"""
Document Scanner Routes
POST /api/document/scan
GET  /api/document/history
"""
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from typing import Optional

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.document_scan import DocumentScan
from app.services.document_service import scan_document, extract_text_from_upload

router = APIRouter()


class TextScanRequest(BaseModel):
    text: str
    filename: Optional[str] = "pasted_document"


@router.post("/scan")
async def scan_doc(
    file: Optional[UploadFile] = File(None),
    text: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    filename = "document"
    doc_text = ""

    if file:
        content = await file.read()
        filename = file.filename
        doc_text = extract_text_from_upload(content, filename)
    elif text:
        doc_text = text
    else:
        raise HTTPException(status_code=400, detail="Provide file or text")

    if not doc_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from document")

    result = await scan_document(doc_text, filename)

    # Persist scan
    scan = DocumentScan(
        user_id=current_user.id,
        filename=filename,
        overall_risk=result.get("overallRisk"),
        summary=result.get("summary"),
        clauses=result.get("clauses", []),
        recommendations=result.get("recommendations", []),
        safe_count=result.get("safe_count", 0),
        risky_count=result.get("risky_count", 0),
        illegal_count=result.get("illegal_count", 0),
    )
    db.add(scan)
    await db.flush()

    return {"success": True, "scan_id": scan.id, "data": result}


@router.post("/scan-text")
async def scan_text(
    body: TextScanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not body.text.strip():
        raise HTTPException(status_code=400, detail="Text cannot be empty")

    result = await scan_document(body.text, body.filename)

    scan = DocumentScan(
        user_id=current_user.id,
        filename=body.filename,
        overall_risk=result.get("overallRisk"),
        summary=result.get("summary"),
        clauses=result.get("clauses", []),
        recommendations=result.get("recommendations", []),
        safe_count=result.get("safe_count", 0),
        risky_count=result.get("risky_count", 0),
        illegal_count=result.get("illegal_count", 0),
    )
    db.add(scan)
    await db.flush()

    return {"success": True, "scan_id": scan.id, "data": result}


@router.get("/history")
async def scan_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(DocumentScan)
        .where(DocumentScan.user_id == current_user.id)
        .order_by(DocumentScan.scanned_at.desc())
        .limit(20)
    )
    scans = result.scalars().all()
    return {
        "scans": [
            {
                "id": s.id, "filename": s.filename,
                "overallRisk": s.overall_risk, "summary": s.summary,
                "safe": s.safe_count, "risky": s.risky_count,
                "illegal": s.illegal_count, "date": str(s.scanned_at)[:10],
            }
            for s in scans
        ]
    }
