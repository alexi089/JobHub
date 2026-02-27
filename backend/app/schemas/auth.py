"""
Authentication schemas for JWT tokens.
"""
from pydantic import BaseModel
from typing import Optional


class Token(BaseModel):
    """JWT token response."""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Data extracted from JWT token."""
    email: Optional[str] = None
