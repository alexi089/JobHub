"""
User model - represents authenticated users.
"""
from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    emails = Column(JSON, default=list)  # Additional emails for account discovery
    name = Column(String, nullable=True)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    applications = relationship(
        "Application",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    ats_accounts = relationship(
        "ATSAccount",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    interviews = relationship(
        "Interview",
        back_populates="user",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<User {self.email}>"
