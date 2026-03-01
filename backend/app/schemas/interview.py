"""
Interview schemas for request/response validation.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class InterviewBase(BaseModel):
    interview_date: datetime
    interview_type: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class InterviewCreate(InterviewBase):
    application_id: str


class InterviewUpdate(BaseModel):
    interview_date: Optional[datetime] = None
    interview_type: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class Interview(InterviewBase):
    id: str
    application_id: str
    user_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    # Include application details for calendar display
    company_name: Optional[str] = None
    job_title: Optional[str] = None

    class Config:
        from_attributes = True
