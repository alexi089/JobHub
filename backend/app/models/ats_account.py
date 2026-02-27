"""
ATSAccount model - represents connections to ATS platforms.
"""
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from app.database import Base


class ATSAccount(Base):
    __tablename__ = "ats_accounts"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Platform details
    platform = Column(String, nullable=False)  # "greenhouse", "workday", etc.
    platform_id = Column(String, nullable=True)  # Their account/user ID
    company_name = Column(String, nullable=False)
    
    # Encrypted OAuth tokens/credentials (encrypted with Fernet)
    credentials = Column(Text, nullable=True)
    
    # Sync tracking
    last_synced = Column(DateTime, nullable=True)
    sync_enabled = Column(String, default="true")  # "true" or "false" as string
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="ats_accounts")
    applications = relationship(
        "Application",
        back_populates="ats_account",
        cascade="all, delete-orphan"
    )
    
    def __repr__(self):
        return f"<ATSAccount {self.platform} - {self.company_name}>"
