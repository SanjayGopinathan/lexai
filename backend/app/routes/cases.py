"""
Case Law Explorer Routes
GET  /api/cases/search
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.document_scan import CaseSearch
from app.services.case_service import search_case_law

router = APIRouter()


class SearchRequest(BaseModel):
    query: str


@router.post("/search")
async def search_cases(
    body: SearchRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not body.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    result = await search_case_law(body.query)

    # Log search
    search = CaseSearch(
        user_id=current_user.id,
        query=body.query,
        results=result.get("cases", []),
    )
    db.add(search)
    await db.flush()

    return {"success": True, "data": result}
