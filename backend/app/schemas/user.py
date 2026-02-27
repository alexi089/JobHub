"""
User schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, validator
from typing import List, Optional
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for creating a new user."""
    email: EmailStr
    password: str
    name: Optional[str] = None
    emails: List[str] = []
    
    @validator('password')
    def password_strength(cls, v):
        """Validate password strength."""
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user response (without password)."""
    id: str
    email: str
    name: Optional[str]
    emails: List[str]
    created_at: datetime
    
    class Config:
        from_attributes = True  # Allows creation from SQLAlchemy models
