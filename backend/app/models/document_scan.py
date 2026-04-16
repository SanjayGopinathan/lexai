"""
Document Scan and Case Search database models
"""
from sqlalchemy import Column, Integer, String, DateTime, JSON, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime

from app.core.database import Base


class DocumentScan(Base):
    __tablename__ = "document_scans"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), nullable=False)
    filename        = Column(String(255))
    overall_risk    = Column(String(20))        # LOW / MEDIUM / HIGH
    summary         = Column(Text)
    clauses         = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    safe_count      = Column(Integer, default=0)
    risky_count     = Column(Integer, default=0)
    illegal_count   = Column(Integer, default=0)
    scanned_at      = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="document_scans")


class CaseSearch(Base):
    __tablename__ = "case_searches"

    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    query      = Column(Text, nullable=False)
    results    = Column(JSON, default=list)
    searched_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="case_searches")
