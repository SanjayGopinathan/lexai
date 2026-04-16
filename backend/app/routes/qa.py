"""
Legal Q&A Routes
POST /api/qa
"""
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.core.security import get_current_user
from app.models.user import User
from app.services.qa_service import answer_legal_question

router = APIRouter()


class QARequest(BaseModel):
    question: str
    language: str = "auto"   # auto | English | Hindi | Tamil


@router.post("")
async def legal_qa(
    body: QARequest,
    current_user: User = Depends(get_current_user),
):
    if not body.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    if len(body.question) > 2000:
        raise HTTPException(status_code=400, detail="Question too long (max 2000 chars)")

    try:
        result = await answer_legal_question(body.question, body.language)
        return {"success": True, "data": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}")
