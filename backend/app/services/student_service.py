"""
Student Dashboard Service
Aggregates session history, score trends, weak areas
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.session import MootSession
from app.models.document_scan import DocumentScan, CaseSearch


async def get_dashboard_data(user_id: int, db: AsyncSession) -> dict:
    """Build full dashboard payload for a student"""

    # ── Moot Sessions ──────────────────────────────────────────
    sessions_q = await db.execute(
        select(MootSession)
        .where(MootSession.user_id == user_id)
        .order_by(MootSession.started_at.desc())
        .limit(20)
    )
    sessions = sessions_q.scalars().all()

    total_sessions = len(sessions)
    completed      = [s for s in sessions if s.verdict]
    wins           = sum(1 for s in completed if "Plaintiff" in (s.verdict or "") or "Win" in (s.verdict or ""))
    avg_score      = round(sum(s.overall_score for s in completed) / len(completed), 1) if completed else 0

    # Score trend (last 10 sessions)
    score_trend = [
        {"session": f"S{i+1}", "score": round(s.overall_score, 0), "case": s.case_title[:30]}
        for i, s in enumerate(reversed(completed[-10:]))
    ]

    # Skill averages
    skill_avg = {
        "argumentQuality":  _avg([s.score_argument   for s in completed]),
        "citationAccuracy": _avg([s.score_citation    for s in completed]),
        "rebuttalStrength": _avg([s.score_rebuttal    for s in completed]),
        "legalTerminology": _avg([s.score_terminology for s in completed]),
        "persuasiveness":   _avg([s.score_persuasion  for s in completed]),
    }

    # Session history list
    history = [
        {
            "id":        s.id,
            "case":      s.case_title,
            "domain":    s.case_domain,
            "side":      s.user_role,
            "verdict":   s.verdict,
            "score":     s.overall_score,
            "date":      s.started_at.strftime("%Y-%m-%d") if s.started_at else "",
        }
        for s in sessions
    ]

    # ── Doc Scans ─────────────────────────────────────────────
    scans_q = await db.execute(
        select(func.count(DocumentScan.id)).where(DocumentScan.user_id == user_id)
    )
    total_scans = scans_q.scalar() or 0

    # ── Case Searches ─────────────────────────────────────────
    searches_q = await db.execute(
        select(func.count(CaseSearch.id)).where(CaseSearch.user_id == user_id)
    )
    total_searches = searches_q.scalar() or 0

    return {
        "stats": {
            "totalSessions":  total_sessions,
            "averageScore":   avg_score,
            "wins":           wins,
            "winRate":        round(wins / len(completed) * 100, 1) if completed else 0,
            "totalDocScans":  total_scans,
            "totalSearches":  total_searches,
        },
        "skillAverages": skill_avg,
        "scoreTrend":    score_trend,
        "sessionHistory": history,
        "weakAreas": _identify_weak_areas(skill_avg),
    }


def _avg(values: list) -> float:
    clean = [v for v in values if v is not None]
    return round(sum(clean) / len(clean), 1) if clean else 0.0


def _identify_weak_areas(skill_avg: dict) -> list:
    """Return skills below 70 as weak areas with improvement tips"""
    tips = {
        "argumentQuality":  "Structure arguments using IRAC method (Issue, Rule, Application, Conclusion)",
        "citationAccuracy": "Practice citing exact section numbers and subsections of Indian statutes",
        "rebuttalStrength": "Address each of opponent's points directly before making your own",
        "legalTerminology": "Study Black's Law Dictionary and Indian legal glossary terms",
        "persuasiveness":   "Use storytelling, analogies and emotional appeal alongside legal logic",
    }
    return [
        {"skill": k, "score": v, "tip": tips.get(k, "")}
        for k, v in skill_avg.items()
        if v < 70
    ]
