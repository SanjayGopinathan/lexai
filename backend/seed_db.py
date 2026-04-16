"""
Seed script — creates demo user and sample data
Run: python seed_db.py
"""
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import select
from app.core.config import settings
from app.core.database import Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.session import MootSession
from app.models.document_scan import DocumentScan, CaseSearch
from datetime import datetime, timedelta
import random

engine = create_async_engine(settings.DATABASE_URL, echo=False)
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def seed():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with SessionLocal() as db:
        # ── Demo User ──────────────────────────────────────────
        existing = await db.execute(select(User).where(User.email == "demo@lexai.in"))
        user = existing.scalar_one_or_none()

        if not user:
            user = User(
                name="Arjun Sharma",
                email="demo@lexai.in",
                hashed_password=get_password_hash("demo1234"),
                role=UserRole.student,
                is_active=True,
            )
            db.add(user)
            await db.flush()
            print(f"✅ Created demo user: demo@lexai.in / demo1234")
        else:
            print(f"ℹ️  Demo user already exists")

        # ── Moot Sessions ──────────────────────────────────────
        session_count = await db.execute(
            select(MootSession).where(MootSession.user_id == user.id)
        )
        if not session_count.scalars().first():
            sessions_data = [
                {
                    "case_title": "Environmental Pollution by Factory",
                    "case_domain": "Environmental Law",
                    "user_role": "Plaintiff",
                    "verdict": "For Plaintiff",
                    "score_argument": 78, "score_citation": 72,
                    "score_rebuttal": 80, "score_terminology": 75, "score_persuasion": 82,
                    "overall_score": 77.4,
                    "days_ago": 1,
                },
                {
                    "case_title": "Tenancy Rights Dispute",
                    "case_domain": "Property Law",
                    "user_role": "Defendant",
                    "verdict": "For Plaintiff",
                    "score_argument": 62, "score_citation": 58,
                    "score_rebuttal": 65, "score_terminology": 70, "score_persuasion": 60,
                    "overall_score": 63.0,
                    "days_ago": 4,
                },
                {
                    "case_title": "Consumer Fraud – Defective Product",
                    "case_domain": "Consumer Law",
                    "user_role": "Plaintiff",
                    "verdict": "For Plaintiff",
                    "score_argument": 85, "score_citation": 80,
                    "score_rebuttal": 78, "score_terminology": 82, "score_persuasion": 88,
                    "overall_score": 82.6,
                    "days_ago": 8,
                },
                {
                    "case_title": "Wrongful Termination",
                    "case_domain": "Labour Law",
                    "user_role": "Plaintiff",
                    "verdict": "For Defendant",
                    "score_argument": 60, "score_citation": 55,
                    "score_rebuttal": 58, "score_terminology": 65, "score_persuasion": 62,
                    "overall_score": 60.0,
                    "days_ago": 15,
                },
                {
                    "case_title": "Cheque Dishonour – NI Act",
                    "case_domain": "Criminal Law",
                    "user_role": "Plaintiff",
                    "verdict": "For Plaintiff",
                    "score_argument": 72, "score_citation": 68,
                    "score_rebuttal": 74, "score_terminology": 78, "score_persuasion": 70,
                    "overall_score": 72.4,
                    "days_ago": 20,
                },
            ]
            for s in sessions_data:
                days = s.pop("days_ago")
                session = MootSession(
                    user_id=user.id,
                    feedback="Good use of legal terminology. Work on citing case law more precisely.",
                    strong_points=["Clear argument structure", "Good understanding of facts"],
                    weak_points=["Need more case citations", "Rebuttal can be sharper"],
                    started_at=datetime.utcnow() - timedelta(days=days),
                    ended_at=datetime.utcnow() - timedelta(days=days, hours=-1),
                    **s,
                )
                db.add(session)
            print(f"✅ Created {len(sessions_data)} moot sessions")

        # ── Document Scans ─────────────────────────────────────
        scan_q = await db.execute(
            select(DocumentScan).where(DocumentScan.user_id == user.id)
        )
        if not scan_q.scalars().first():
            scan = DocumentScan(
                user_id=user.id,
                filename="employment_contract.txt",
                overall_risk="HIGH",
                summary="Contract contains several clauses that violate Indian labour law.",
                clauses=[
                    {"id": 1, "text": "Terminated without notice at employer's will", "classification": "ILLEGAL", "explanation": "Violates Section 25F of the Industrial Disputes Act", "legalReference": "ID Act S.25F"},
                    {"id": 2, "text": "50-year confidentiality clause", "classification": "RISKY", "explanation": "Unreasonably long post-employment restriction", "legalReference": "Contract Act S.27"},
                    {"id": 3, "text": "12 days annual leave", "classification": "SAFE", "explanation": "Complies with Factories Act minimum leave entitlement", "legalReference": "Factories Act S.79"},
                ],
                recommendations=[
                    "Negotiate a minimum 30-day notice period",
                    "Reduce confidentiality clause to 2 years",
                    "Remove blanket IP assignment for personal time work",
                ],
                safe_count=1, risky_count=1, illegal_count=1,
                scanned_at=datetime.utcnow() - timedelta(days=3),
            )
            db.add(scan)
            print("✅ Created sample document scan")

        await db.commit()
        print("\n🎉 Database seeded successfully!")
        print("   Login: demo@lexai.in | demo1234")


if __name__ == "__main__":
    asyncio.run(seed())
