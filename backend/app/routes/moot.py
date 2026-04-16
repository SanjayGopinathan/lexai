"""
Moot Court Routes
POST /api/moot/start
POST /api/moot/turn
POST /api/moot/end
GET  /api/moot/sessions
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel
from datetime import datetime

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.session import MootSession
from app.services.moot_service import (
    get_judge_response, get_opponent_response,
    generate_verdict, calculate_overall_score,
)

router = APIRouter()


class StartRequest(BaseModel):
    case_title: str
    case_domain: str
    user_role: str  # Plaintiff | Defendant


class TurnRequest(BaseModel):
    session_id: int
    argument: str
    conversation_history: list


class EndRequest(BaseModel):
    session_id: int
    conversation_history: list
    live_scores: dict


@router.post("/start")
async def start_session(
    body: StartRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    session = MootSession(
        user_id=current_user.id,
        case_title=body.case_title,
        case_domain=body.case_domain,
        user_role=body.user_role,
    )
    db.add(session)
    await db.flush()
    await db.refresh(session)

    # Judge opens the session
    opening = await get_judge_response(
        [],
        f"New moot session: {body.case_title} ({body.case_domain}). "
        f"Student appears for {body.user_role}. Open court formally.",
    )
    return {"session_id": session.id, "judge_opening": opening}


@router.post("/turn")
async def moot_turn(
    body: TurnRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MootSession).where(
            MootSession.id == body.session_id,
            MootSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    api_history = [
        {"role": "user", "content": f"[{m.get('speaker','?')}]: {m.get('content','')}"}
        for m in body.conversation_history[-8:]
    ]
    case_ctx = f"{session.case_title} ({session.case_domain})"

    judge_reply    = await get_judge_response(api_history, case_ctx)
    opponent_reply = await get_opponent_response(api_history, case_ctx, session.user_role)

    return {
        "judge_response":    judge_reply,
        "opponent_response": opponent_reply,
    }


@router.post("/end")
async def end_session(
    body: EndRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MootSession).where(
            MootSession.id == body.session_id,
            MootSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    verdict = await generate_verdict(
        session.case_title,
        session.user_role,
        body.conversation_history,
        body.live_scores,
    )
    scores = verdict.get("scores", {})
    overall = calculate_overall_score(scores)

    # Persist results
    session.verdict          = verdict.get("verdict")
    session.reasoning        = verdict.get("reasoning")
    session.feedback         = verdict.get("feedback")
    session.score_argument   = scores.get("argumentQuality", 0)
    session.score_citation   = scores.get("citationAccuracy", 0)
    session.score_rebuttal   = scores.get("rebuttalStrength", 0)
    session.score_terminology= scores.get("legalTerminology", 0)
    session.score_persuasion = scores.get("persuasiveness", 0)
    session.overall_score    = overall
    session.strong_points    = verdict.get("strongPoints", [])
    session.weak_points      = verdict.get("weakPoints", [])
    session.messages         = body.conversation_history
    session.ended_at         = datetime.utcnow()
    await db.flush()

    return {"success": True, "verdict": verdict, "overall_score": overall}


@router.get("/sessions")
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(MootSession)
        .where(MootSession.user_id == current_user.id)
        .order_by(MootSession.started_at.desc())
        .limit(20)
    )
    sessions = result.scalars().all()
    return {
        "sessions": [
            {
                "id": s.id, "case": s.case_title, "domain": s.case_domain,
                "role": s.user_role, "verdict": s.verdict,
                "score": s.overall_score, "date": str(s.started_at)[:10],
            }
            for s in sessions
        ]
    }
