import os
import shutil
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
import io
import numpy as np
import pandas as pd

try:
    from .processing import load_data, calculate_quality, apply_filter, perform_analysis, train_model
except ImportError:
    from processing import load_data, calculate_quality, apply_filter, perform_analysis, train_model

router = APIRouter()

DATA_DIR = "backend/uploads"
os.makedirs(DATA_DIR, exist_ok=True)

class FilterRequest(BaseModel):
    data: List[float]
    filter_type: str # "lowpass", "highpass", "notch"

class TrainRequest(BaseModel):
    target_column: str
    model_type: str = "random_forest"

@router.post("/upload")
async def upload_data(file: UploadFile = File(...)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported")
    
    file_location = os.path.join(DATA_DIR, file.filename)
    
    try:
        with open(file_location, "wb+") as file_object:
            shutil.copyfileobj(file.file, file_object)
            
        # Quick validation
        df = pd.read_csv(file_location)
        
        return {
            "filename": file.filename,
            "rows": len(df),
            "columns": list(df.columns),
            "message": f"File uploaded and saved to {file_location}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")

@router.get("/analyze/{filename}")
async def analyze_file(filename: str):
    file_path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        df = pd.read_csv(file_path)
        analysis_result = perform_analysis(df)
        return analysis_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/train/{filename}")
async def train_model_endpoint(filename: str, request: TrainRequest):
    file_path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        df = pd.read_csv(file_path)
        if request.target_column not in df.columns:
             raise HTTPException(status_code=400, detail=f"Target column '{request.target_column}' not found in dataset")
             
        training_result = train_model(df, request.target_column)
        return training_result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/filter")
async def filter_signal(request: FilterRequest):
    """Applies a filter to a list of signal values."""
    try:
        data_array = np.array(request.data)
        filtered_data = apply_filter(data_array, request.filter_type)
        return {"filtered_data": filtered_data.tolist()}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/files")
async def list_files():
    """Lists all uploaded CSV files."""
    try:
        files = [f for f in os.listdir(DATA_DIR) if f.endswith('.csv')]
        file_info = []
        for f in files:
            file_path = os.path.join(DATA_DIR, f)
            size = os.path.getsize(file_path)
            file_info.append({
                "filename": f,
                "size_bytes": size,
                "size_mb": round(size / (1024 * 1024), 2)
            })
        return {"files": file_info, "count": len(file_info)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/file-info/{filename}")
async def get_file_info(filename: str):
    """Gets detailed information about a specific file."""
    file_path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        df = pd.read_csv(file_path)
        return {
            "filename": filename,
            "rows": len(df),
            "columns": list(df.columns),
            "column_count": len(df.columns),
            "memory_usage_mb": round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2),
            "dtypes": {col: str(dtype) for col, dtype in df.dtypes.items()}
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/delete/{filename}")
async def delete_file(filename: str):
    """Deletes an uploaded file."""
    file_path = os.path.join(DATA_DIR, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    
    try:
        os.remove(file_path)
        return {"message": f"File {filename} deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

class QualityCheckRequest(BaseModel):
    data: List[float]
    sampling_rate: Optional[float] = 256.0

@router.post("/quality-check")
async def check_quality(request: QualityCheckRequest):
    """Checks the quality of EEG signal data."""
    try:
        data_array = np.array(request.data)
        quality = calculate_quality(data_array, request.sampling_rate)
        return {
            "quality": quality,
            "data_points": len(data_array),
            "mean": float(np.mean(data_array)),
            "std": float(np.std(data_array)),
            "min": float(np.min(data_array)),
            "max": float(np.max(data_array))
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
