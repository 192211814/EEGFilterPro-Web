from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from typing import List, Optional
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models
import os
import shutil
from services.eeg_reader import read_eeg_file, get_metadata

router = APIRouter(tags=["upload"])

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.post("/upload")
async def upload_eeg(
    project_id: Optional[int] = None, 
    file: UploadFile = File(...), 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user) # Require auth
):
    user_id = current_user.get("user_id")
    
    # Validate project if provided
    if project_id:
        project = db.query(models.Project).filter(
            models.Project.id == project_id,
            models.Project.user_id == user_id
        ).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found or unauthorized")


    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    allowed_extensions = ['.edf', '.bdf', '.set', '.event', '.csv', '.cnt']
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"Unsupported file format {ext}. Use .edf, .bdf, or .set")

    prefix = f"{project_id}_" if project_id else "unassigned_"
    file_path = os.path.join(UPLOAD_DIR, f"{prefix}{file.filename}")
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # Extract metadata immediately
        raw = read_eeg_file(file_path)
        meta = get_metadata(raw)
        
        # Save to database
        eeg_file = models.EEGFile(
            project_id=project_id,
            user_id=user_id, # Link to owner
            file_path=file_path,
            original_filename=file.filename,
            file_type=ext,
            sampling_rate=meta['sampling_rate'],
            duration=meta['duration'],
            channels=meta['channels']
        )
        db.add(eeg_file)
        db.commit()
        db.refresh(eeg_file)
        
        return {
            "message": "File uploaded and validated",
            "file_id": eeg_file.id,
            "filename": eeg_file.original_filename,
            "metadata": meta
        }
    except Exception as e:
        import traceback
        traceback.print_exc() # Still print to console for dev
        if os.path.exists(file_path):
            os.remove(file_path)
        # Return the actual error message for debugging
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/files")
async def list_files(
    project_id: Optional[int] = None, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    if user_id is None:
        return {"files": [], "count": 0}
    
    # Filter by user_id directly
    query = db.query(models.EEGFile).filter(models.EEGFile.user_id == user_id)
    
    if project_id:
        query = query.filter(models.EEGFile.project_id == project_id)
    
    files = query.order_by(models.EEGFile.uploaded_at.desc()).all()
    
    file_list = []
    for f in files:
        # Get actual file size if possible
        size_mb = 0
        if os.path.exists(f.file_path):
            size_mb = round(os.path.getsize(f.file_path) / (1024 * 1024), 2)
            
        file_list.append({
            "id": f.id,
            "filename": f.original_filename,
            "size_mb": size_mb,
            "uploaded_at": f.uploaded_at.isoformat() if f.uploaded_at else None,
            "project_id": f.project_id
        })
    
    return {"files": file_list, "count": len(file_list)}

