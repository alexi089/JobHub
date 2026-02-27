"""
ATS (Applicant Tracking System) integration endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

from app.database import get_db
from app.models.user import User
from app.models.ats_account import ATSAccount
from app.models.application import Application
from app.api.auth import get_current_user
from app.utils.security import encrypt_credentials, decrypt_credentials
from app.integrations.greenhouse import (
    GreenhouseClient,
    extract_application_data,
)

router = APIRouter(prefix="/api/ats", tags=["ATS"])


# Schemas
class ConnectGreenhouseRequest(BaseModel):
    api_key: str
    company_name: str


class ATSAccountResponse(BaseModel):
    id: str
    platform: str
    company_name: str
    last_synced: Optional[datetime]
    sync_enabled: bool
    created_at: datetime

    class Config:
        from_attributes = True


class SyncResponse(BaseModel):
    success: bool
    applications_synced: int
    message: str


# Endpoints
@router.post("/greenhouse/connect", response_model=ATSAccountResponse)
def connect_greenhouse(
    request: ConnectGreenhouseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Connect a Greenhouse account by providing API key.
    
    This stores the encrypted API key and enables syncing.
    """
    # Test the API key
    try:
        client = GreenhouseClient(request.api_key)
        if not client.test_connection():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid Greenhouse API key or no access to applications",
            )
        client.close()
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to connect to Greenhouse: {str(e)}",
        )
    
    # Check if account already exists for this user/company
    existing = db.query(ATSAccount).filter(
        ATSAccount.user_id == current_user.id,
        ATSAccount.platform == "greenhouse",
        ATSAccount.company_name == request.company_name,
    ).first()
    
    if existing:
        # Update existing account
        existing.credentials = encrypt_credentials(request.api_key)
        existing.sync_enabled = True
        existing.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing)
        return existing
    
    # Create new ATS account
    ats_account = ATSAccount(
        user_id=current_user.id,
        platform="greenhouse",
        company_name=request.company_name,
        credentials=encrypt_credentials(request.api_key),
        sync_enabled=True,
    )
    
    db.add(ats_account)
    db.commit()
    db.refresh(ats_account)
    
    return ats_account


@router.get("/accounts", response_model=List[ATSAccountResponse])
def list_ats_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """List all connected ATS accounts for the current user."""
    accounts = db.query(ATSAccount).filter(
        ATSAccount.user_id == current_user.id
    ).all()
    
    return accounts


@router.post("/greenhouse/sync/{account_id}", response_model=SyncResponse)
def sync_greenhouse_applications(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Sync applications from Greenhouse for a specific ATS account.
    
    Fetches all applications and stores them in the database.
    """
    # Get ATS account
    ats_account = db.query(ATSAccount).filter(
        ATSAccount.id == account_id,
        ATSAccount.user_id == current_user.id,
    ).first()
    
    if not ats_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ATS account not found",
        )
    
    if ats_account.platform != "greenhouse":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This endpoint only supports Greenhouse accounts",
        )
    
    # Decrypt API key
    try:
        api_key = decrypt_credentials(ats_account.credentials)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to decrypt API key",
        )
    
    # Fetch applications from Greenhouse
    try:
        client = GreenhouseClient(api_key)
        
        # Get applications created after last sync (if any)
        created_after = ats_account.last_synced if ats_account.last_synced else None
        
        gh_applications = client.get_applications(created_after=created_after)
        client.close()
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch applications from Greenhouse: {str(e)}",
        )
    
    # Store applications in database
    synced_count = 0
    
    for gh_app in gh_applications:
        # Check if application already exists (by Greenhouse ID)
        existing = db.query(Application).filter(
            Application.user_id == current_user.id,
            Application.ats_account_id == ats_account.id,
            Application.job_data["id"].astext == str(gh_app.get("id")),
        ).first()
        
        if existing:
            # Update existing application
            app_data = extract_application_data(gh_app, ats_account.company_name)
            for key, value in app_data.items():
                setattr(existing, key, value)
            existing.last_updated = datetime.utcnow()
        else:
            # Create new application
            app_data = extract_application_data(gh_app, ats_account.company_name)
            application = Application(
                user_id=current_user.id,
                ats_account_id=ats_account.id,
                **app_data,
            )
            db.add(application)
            synced_count += 1
    
    # Update last synced time
    ats_account.last_synced = datetime.utcnow()
    
    db.commit()
    
    return SyncResponse(
        success=True,
        applications_synced=synced_count,
        message=f"Successfully synced {synced_count} new applications from Greenhouse",
    )


@router.delete("/accounts/{account_id}")
def disconnect_ats_account(
    account_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Disconnect an ATS account.
    
    This deletes the ATS account but keeps the applications (sets ats_account_id to NULL).
    """
    ats_account = db.query(ATSAccount).filter(
        ATSAccount.id == account_id,
        ATSAccount.user_id == current_user.id,
    ).first()
    
    if not ats_account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="ATS account not found",
        )
    
    # Applications will have ats_account_id set to NULL due to ON DELETE SET NULL
    db.delete(ats_account)
    db.commit()
    
    return {"message": "ATS account disconnected successfully"}
