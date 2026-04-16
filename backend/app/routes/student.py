"""
Student Dashboard Routes
GET /api/student/dashboard
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.services.student_service import get_dashboard_data

router = APIRouter()


@router.get("/dashboard")
async def dashboard(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    data = await get_dashboard_data(current_user.id, db)
    return {"success": True, "data": data}
