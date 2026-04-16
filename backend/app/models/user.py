"""
User database model
"""
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum

from app.core.database import Base


class UserRole(str, enum.Enum):
    student = "student"
    citizen = "citizen"
    lawyer = "lawyer"
    admin = "admin"


class User(Base):
    __tablename__ = "users"

    id            = Column(Integer, primary_key=True, index=True)
    name          = Column(String(100), nullable=False)
    email         = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role          = Column(Enum(UserRole), default=UserRole.student)
    is_active     = Column(Boolean, default=True)
    created_at    = Column(DateTime, default=datetime.utcnow)
    updated_at    = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    moot_sessions   = relationship("MootSession", back_populates="user", cascade="all, delete-orphan")
    document_scans  = relationship("DocumentScan", back_populates="user", cascade="all, delete-orphan")
    case_searches   = relationship("CaseSearch", back_populates="user", cascade="all, delete-orphan")
