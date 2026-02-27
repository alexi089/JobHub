"""
Application schemas for request/response validation.
"""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class ApplicationCreate(BaseModel):
    """Schema for creating a new application."""
    job_title: str
    company_name: str
    status: str = "applied"
    applied_at: datetime
    job_url: Optional[str] = None
    job_data: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    ats_account_id: Optional[str] = None


class ApplicationUpdate(BaseModel):
    """Schema for updating an application."""
    job_title: Optional[str] = None
    company_name: Optional[str] = None
    status: Optional[str] = None
    job_url: Optional[str] = None
    notes: Optional[str] = None


class ApplicationUpdateCreate(BaseModel):
    """Schema for creating an application status update."""
    status: str
    note: Optional[str] = None


class ApplicationUpdateResponse(BaseModel):
    """Schema for application update response."""
    id: str
    status: str
    note: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True


class ApplicationResponse(BaseModel):
    """Schema for application response."""
    id: str
    user_id: str
    ats_account_id: Optional[str]
    job_title: str
    company_name: str
    status: str
    applied_at: datetime
    last_updated: datetime
    job_url: Optional[str]
    job_data: Optional[Dict[str, Any]]
    notes: Optional[str]
    
    class Config:
        from_attributes = True


class ApplicationWithUpdates(ApplicationResponse):
    """Schema for application with its update history."""
    updates: List[ApplicationUpdateResponse] = []
    
    class Config:
        from_attributes = True
