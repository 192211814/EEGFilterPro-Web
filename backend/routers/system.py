from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
import os
import models

router = APIRouter(tags=["system"])

UPLOAD_DIR = "uploads"

def get_dir_size(path):
    total_size = 0
    if os.path.exists(path):
        for dirpath, dirnames, filenames in os.walk(path):
            for f in filenames:
                fp = os.path.join(dirpath, f)
                total_size += os.path.getsize(fp)
    return total_size

@router.get("/system/status")
async def get_system_status(db: Session = Depends(get_db)):
    # Calculate storage
    storage_bytes = get_dir_size(UPLOAD_DIR)
    storage_mb = round(storage_bytes / (1024 * 1024), 2)
    storage_gb = round(storage_mb / 1024, 2)
    
    # Get counts
    project_count = db.query(models.Project).count()
    file_count = db.query(models.EEGFile).count()
    
    return {
        "storage": {
            "used_bytes": storage_bytes,
            "used_mb": storage_mb,
            "used_gb": storage_gb,
            "total_gb": 5.0,
            "percent": round((storage_gb / 5.0) * 100, 1) if storage_gb > 0 else 0
        },
        "counts": {
            "projects": project_count,
            "files": file_count
        },
        "engine": {
            "version": "2.4.0",
            "status": "Active"
        },
        "processing": {
            "status": "Operational"
        }
    }
