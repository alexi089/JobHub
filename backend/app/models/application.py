"""
Application models - job applications and their update history.
"""
from sqlalchemy import Column, String, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base


class Application(Base):
    __tablename__ = "applications"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    ats_account_id = Column(String, ForeignKey("ats_accounts.id", ondelete="SET NULL"), nullable=True)
    
    # Job details
    job_title = Column(String, nullable=False)
    company_name = Column(String, nullable=False)
    status = Column(String, default="applied")  # applied, screening, interview, offer, rejected, withdrawn
    
    # Dates
    applied_at = Column(DateTime, nullable=False)
    last_updated = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Additional info
    job_url = Column(String, nullable=True)
    job_data = Column(JSON, nullable=True)  # Full job posting data from ATS
    notes = Column(Text, nullable=True)  # User's personal notes
    
    # Relationships
    user = relationship("User", back_populates="applications")
    ats_account = relationship("ATSAccount", back_populates="applications")
    updates = relationship(
        "ApplicationUpdate",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="ApplicationUpdate.created_at.desc()"
    )
    interviews = relationship(
        "Interview",
        back_populates="application",
        cascade="all, delete-orphan",
        order_by="Interview.interview_date.asc()"
    )
    
    def __repr__(self):
        return f"<Application {self.job_title} at {self.company_name}>"


class ApplicationUpdate(Base):
    __tablename__ = "application_updates"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(
        String,
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    
    status = Column(String, nullable=False)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship
    application = relationship("Application", back_populates="updates")
    
    def __repr__(self):
        return f"<ApplicationUpdate {self.status} at {self.created_at}>"
