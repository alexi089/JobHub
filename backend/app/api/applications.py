"""
Applications API endpoints - CRUD operations for job applications.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.database import get_db
from app.models.user import User
from app.models.application import Application, ApplicationUpdate as ApplicationUpdateModel
from app.schemas.application import (
    ApplicationCreate,
    ApplicationUpdate,
    ApplicationResponse,
    ApplicationWithUpdates,
    ApplicationUpdateCreate,
    ApplicationUpdateResponse
)
from app.api.auth import get_current_user

router = APIRouter(prefix="/applications", tags=["applications"])


@router.post("", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
def create_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new job application."""
    
    new_application = Application(
        user_id=current_user.id,
        ats_account_id=application_data.ats_account_id,
        job_title=application_data.job_title,
        company_name=application_data.company_name,
        status=application_data.status,
        applied_at=application_data.applied_at,
        job_url=application_data.job_url,
        job_data=application_data.job_data,
        notes=application_data.notes
    )
    
    db.add(new_application)
    db.commit()
    db.refresh(new_application)
    
    # Create initial update record
    initial_update = ApplicationUpdateModel(
        application_id=new_application.id,
        status=application_data.status,
        note="Application created"
    )
    db.add(initial_update)
    db.commit()
    
    return new_application


@router.get("", response_model=List[ApplicationResponse])
def list_applications(
    status: Optional[str] = Query(None, description="Filter by status"),
    company_name: Optional[str] = Query(None, description="Filter by company name"),
    limit: int = Query(100, ge=1, le=500),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all applications for the current user with optional filters."""
    
    query = db.query(Application).filter(Application.user_id == current_user.id)
    
    if status:
        query = query.filter(Application.status == status)
    
    if company_name:
        query = query.filter(Application.company_name.ilike(f"%{company_name}%"))
    
    applications = query.order_by(Application.last_updated.desc()).offset(offset).limit(limit).all()
    
    return applications


@router.get("/{application_id}", response_model=ApplicationWithUpdates)
def get_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific application with its update history."""
    
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    return application


@router.patch("/{application_id}", response_model=ApplicationResponse)
def update_application(
    application_id: str,
    application_data: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an application."""
    
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Update fields if provided
    update_data = application_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(application, field, value)
    
    # If status changed, create an update record
    if application_data.status and application_data.status != application.status:
        status_update = ApplicationUpdateModel(
            application_id=application.id,
            status=application_data.status,
            note=f"Status changed to {application_data.status}"
        )
        db.add(status_update)
    
    db.commit()
    db.refresh(application)
    
    return application


@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an application."""
    
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    db.delete(application)
    db.commit()
    
    return None


@router.post("/{application_id}/updates", response_model=ApplicationUpdateResponse, status_code=status.HTTP_201_CREATED)
def create_application_update(
    application_id: str,
    update_data: ApplicationUpdateCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Add a status update to an application."""
    
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # Create update
    new_update = ApplicationUpdateModel(
        application_id=application_id,
        status=update_data.status,
        note=update_data.note
    )
    
    # Update application status
    application.status = update_data.status
    
    db.add(new_update)
    db.commit()
    db.refresh(new_update)
    
    return new_update


@router.get("/{application_id}/updates", response_model=List[ApplicationUpdateResponse])
def list_application_updates(
    application_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all updates for a specific application."""
    
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    return application.updates
