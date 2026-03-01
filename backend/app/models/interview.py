"""
Interview models - track scheduled interviews for applications.
"""
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base


class Interview(Base):
    __tablename__ = "interviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(
        String,
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Interview details
    interview_date = Column(DateTime, nullable=False)
    interview_type = Column(String, nullable=True)  # phone, video, onsite, etc.
    location = Column(String, nullable=True)  # Address or video link
    notes = Column(Text, nullable=True)
    status = Column(String, default="scheduled")  # scheduled, completed, cancelled

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    application = relationship("Application", back_populates="interviews")
    user = relationship("User", back_populates="interviews")

    def __repr__(self):
        return f"<Interview {self.interview_type} on {self.interview_date}>"
