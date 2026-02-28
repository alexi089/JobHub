"""
Interview API endpoints.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from datetime import datetime

from app.database import get_db
from app.models import Interview, Application
from app.schemas.interview import Interview as InterviewSchema, InterviewCreate, InterviewUpdate
from app.api.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/interviews", tags=["interviews"])


@router.get("", response_model=List[InterviewSchema])
def list_interviews(
    upcoming_only: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all interviews for the current user."""
    query = db.query(Interview).filter(Interview.user_id == current_user.id)

    if upcoming_only:
        query = query.filter(
            Interview.interview_date >= datetime.utcnow(),
            Interview.status == "scheduled"
        )

    interviews = query.options(joinedload(Interview.application)).order_by(Interview.interview_date.asc()).all()

    # Add company and job title to response
    result = []
    for interview in interviews:
        interview_dict = {
            "id": interview.id,
            "application_id": interview.application_id,
            "user_id": interview.user_id,
            "interview_date": interview.interview_date,
            "interview_type": interview.interview_type,
            "location": interview.location,
            "notes": interview.notes,
            "status": interview.status,
            "created_at": interview.created_at,
            "updated_at": interview.updated_at,
            "company_name": interview.application.company_name if interview.application else None,
            "job_title": interview.application.job_title if interview.application else None,
        }
        result.append(InterviewSchema(**interview_dict))

    return result


@router.post("", response_model=InterviewSchema)
def create_interview(
    interview: InterviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new interview."""
    # Verify the application belongs to the user
    application = db.query(Application).filter(
        Application.id == interview.application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    db_interview = Interview(
        **interview.model_dump(),
        user_id=current_user.id
    )
    db.add(db_interview)
    db.commit()
    db.refresh(db_interview)

    # Add company and job title to response
    interview_dict = {
        "id": db_interview.id,
        "application_id": db_interview.application_id,
        "user_id": db_interview.user_id,
        "interview_date": db_interview.interview_date,
        "interview_type": db_interview.interview_type,
        "location": db_interview.location,
        "notes": db_interview.notes,
        "status": db_interview.status,
        "created_at": db_interview.created_at,
        "updated_at": db_interview.updated_at,
        "company_name": application.company_name,
        "job_title": application.job_title,
    }

    return InterviewSchema(**interview_dict)


@router.get("/{interview_id}", response_model=InterviewSchema)
def get_interview(
    interview_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific interview."""
    interview = db.query(Interview).options(joinedload(Interview.application)).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    interview_dict = {
        "id": interview.id,
        "application_id": interview.application_id,
        "user_id": interview.user_id,
        "interview_date": interview.interview_date,
        "interview_type": interview.interview_type,
        "location": interview.location,
        "notes": interview.notes,
        "status": interview.status,
        "created_at": interview.created_at,
        "updated_at": interview.updated_at,
        "company_name": interview.application.company_name if interview.application else None,
        "job_title": interview.application.job_title if interview.application else None,
    }

    return InterviewSchema(**interview_dict)


@router.patch("/{interview_id}", response_model=InterviewSchema)
def update_interview(
    interview_id: str,
    interview_update: InterviewUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update an interview."""
    db_interview = db.query(Interview).options(joinedload(Interview.application)).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    # Update fields
    update_data = interview_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_interview, field, value)

    db.commit()
    db.refresh(db_interview)

    interview_dict = {
        "id": db_interview.id,
        "application_id": db_interview.application_id,
        "user_id": db_interview.user_id,
        "interview_date": db_interview.interview_date,
        "interview_type": db_interview.interview_type,
        "location": db_interview.location,
        "notes": db_interview.notes,
        "status": db_interview.status,
        "created_at": db_interview.created_at,
        "updated_at": db_interview.updated_at,
        "company_name": db_interview.application.company_name if db_interview.application else None,
        "job_title": db_interview.application.job_title if db_interview.application else None,
    }

    return InterviewSchema(**interview_dict)


@router.delete("/{interview_id}")
def delete_interview(
    interview_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete an interview."""
    db_interview = db.query(Interview).filter(
        Interview.id == interview_id,
        Interview.user_id == current_user.id
    ).first()

    if not db_interview:
        raise HTTPException(status_code=404, detail="Interview not found")

    db.delete(db_interview)
    db.commit()

    return {"message": "Interview deleted successfully"}
