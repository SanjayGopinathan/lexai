"""
Moot Court Session database model
"""
from sqlalchemy import Column, Integer, String, DateTime, Float, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class MootSession(Base):
    __tablename__ = "moot_sessions"

    id            = Column(Integer, primary_key=True, index=True)
    user_id       = Column(Integer, ForeignKey("users.id"), nullable=False)
    case_title    = Column(String(255), nullable=False)
    case_domain   = Column(String(100))
    user_role     = Column(String(20))          # Plaintiff / Defendant
    verdict       = Column(String(50))
    reasoning     = Column(Text)
    feedback      = Column(Text)

    # Score columns
    score_argument     = Column(Float, default=0)
    score_citation     = Column(Float, default=0)
    score_rebuttal     = Column(Float, default=0)
    score_terminology  = Column(Float, default=0)
    score_persuasion   = Column(Float, default=0)
    overall_score      = Column(Float, default=0)

    messages      = Column(JSON, default=list)   # Full chat history
    strong_points = Column(JSON, default=list)
    weak_points   = Column(JSON, default=list)

    started_at    = Column(DateTime, default=datetime.utcnow)
    ended_at      = Column(DateTime, nullable=True)

    user = relationship("User", back_populates="moot_sessions")
