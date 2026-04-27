from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
try:
    from ..database import get_db
    from .. import models
except ImportError:
    from database import get_db
    import models
from pydantic import BaseModel
from typing import Optional

import os
import sys
# Ensure we can import from parent dir
try:
    from auth import get_current_user
except ImportError:
    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from auth import get_current_user

router = APIRouter(prefix="/projects", tags=["projects"])

class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    subject_id: Optional[str] = ""
    session: Optional[str] = ""

@router.post("")
@router.post("/")
async def create_project(
    project: ProjectCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    try:
        db_project = models.Project(
            name=project.name,
            description=project.description,
            subject_id=project.subject_id,
            session=project.session,
            user_id=user_id
        )
        db.add(db_project)
        db.commit()
        db.refresh(db_project)
        
        return {
            "status": "success",
            "message": "Project created successfully",
            "project_id": db_project.id
        }
    except Exception as e:
        db.rollback()
        print(f"Error creating project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("")
@router.get("/")
async def list_projects(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    if user_id is None:
        return {"projects": []}
    projects = db.query(models.Project)\
        .filter(models.Project.user_id == user_id)\
        .order_by(models.Project.created_at.desc())\
        .all()
    return {"projects": projects}

@router.delete("/{project_id}")
async def delete_project(
    project_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    try:
        db_project = db.query(models.Project).filter(
            models.Project.id == project_id,
            models.Project.user_id == user_id
        ).first()
        
        if not db_project:
            raise HTTPException(status_code=404, detail="Project not found or unauthorized")
        
        db.delete(db_project)
        db.commit()
        return {"status": "success", "message": f"Project {project_id} deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Error deleting project: {e}")
        raise HTTPException(status_code=500, detail=str(e))

