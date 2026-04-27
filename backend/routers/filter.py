from fastapi import APIRouter, Depends, HTTPException
from auth import get_current_user
from sqlalchemy.orm import Session
from database import get_db
import models
import os
import numpy as np
from services.eeg_reader import read_eeg_file
from services.eeg_filter import apply_fir_filter, apply_iir_filter, apply_notch_filter, compute_frequency_response
from pydantic import BaseModel
from typing import Optional

router = APIRouter(tags=["filter"])

class FilterParams(BaseModel):
    file_id: int
    filter_type: str   # 'bandpass', 'highpass', 'notch'
    implementation: Optional[str] = "IIR" # "FIR" or "IIR"
    l_freq: Optional[float] = None
    h_freq: Optional[float] = None
    order: Optional[int] = 4
    notch_freq: Optional[float] = 50.0
    q_factor: Optional[float] = 30.0
    window_type: Optional[str] = 'hamming'
    taps: Optional[int] = 151
    topology: Optional[str] = 'butterworth'
    passband_ripple: Optional[float] = 1.0
    stopband_atten: Optional[float] = 40.0

# In-memory store for the last filtered raw (per file_id)
_filtered_cache = {}

@router.post("/apply-filter")
async def apply_filter_endpoint(
    params: FilterParams, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    eeg_file = db.query(models.EEGFile).filter(
        models.EEGFile.id == params.file_id,
        models.EEGFile.user_id == user_id
    ).first()
    if not eeg_file:
        raise HTTPException(status_code=404, detail="File not found or unauthorized")

    try:
        raw = read_eeg_file(eeg_file.file_path)
        if raw is None:
            raise HTTPException(status_code=500, detail="Could not read EEG file")

        ft = params.filter_type.lower()
        impl = (params.implementation or "IIR").upper()
        
        # Sanitize frequencies for MNE (bandpass needs both, highpass needs l_freq, lowpass needs h_freq)
        l_freq = params.l_freq
        h_freq = params.h_freq
        
        if ft == 'highpass':
            h_freq = None
        elif ft == 'lowpass':
            l_freq = None
            h_freq = h_freq if h_freq is not None else params.l_freq # fallback if UI only sent l_freq
        elif ft == 'notch':
            l_freq = None
            h_freq = None
        
        if ft == 'notch':
            filtered = apply_notch_filter(raw.copy(), params.notch_freq, params.q_factor)
        elif impl == 'FIR':
            filtered = apply_fir_filter(raw.copy(), l_freq, h_freq, 
                                        params.window_type, params.taps)
        else: # IIR
            filtered = apply_iir_filter(raw.copy(), l_freq, h_freq, params.order,
                                        params.topology, params.passband_ripple, params.stopband_atten)

        _filtered_cache[params.file_id] = filtered
        
        n_samples = min(500, filtered.n_times)
        data, times = filtered[0, :n_samples]

        # Get frequency response for preview
        fs = raw.info['sfreq']
        freqs, mag, phase = compute_frequency_response(
            ft, impl, params.l_freq or params.notch_freq, params.h_freq or 0, 
            fs, params.order, window=params.window_type, taps=params.taps,
            topology=params.topology, ripple=params.passband_ripple, q=params.q_factor
        )

        return {
            "message": f"Applied {params.filter_type} ({impl}) filter successfully",
            "preview": {
                "times": times.tolist(),
                "data": data[0].tolist(),
                "freq_response": {
                    "freqs": freqs,
                    "magnitude": mag,
                    "phase": phase
                }
            },
            "filtered_data": data[0].tolist()
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/filter-preview-params")
async def get_filter_preview_params(
    file_id: int, 
    filter_type: str, 
    implementation: str, 
    l_freq: float, 
    h_freq: float, 
    order: int = 4, 
    window_type: str = 'hamming', 
    taps: int = 151,
    topology: str = 'butterworth', 
    ripple: float = 1.0, 
    q: float = 30.0, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """API to get ONLY the frequency response for the graph UI."""
    user_id = current_user.get("user_id")
    eeg_file = db.query(models.EEGFile).filter(
        models.EEGFile.id == file_id,
        models.EEGFile.user_id == user_id
    ).first()
    if not eeg_file:
        raise HTTPException(status_code=404, detail="File not found or unauthorized")
    
    # Ideally we'd just get fs from metadata, but let's read info
    raw = read_eeg_file(eeg_file.file_path)
    fs = raw.info['sfreq'] if raw else 256.0
    
    freqs, mag, phase = compute_frequency_response(
        filter_type, implementation, l_freq, h_freq, fs, order,
        window=window_type, taps=taps, topology=topology, ripple=ripple, q=q
    )
    
    return {
        "freqs": freqs,
        "magnitude": mag,
        "phase": phase
    }



@router.get("/filtered-preview")
async def filtered_preview(
    file_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    eeg_file = db.query(models.EEGFile).filter(
        models.EEGFile.id == file_id,
        models.EEGFile.user_id == user_id
    ).first()
    if not eeg_file:
        raise HTTPException(status_code=404, detail="File not found or unauthorized")

    raw = read_eeg_file(eeg_file.file_path)
    if raw is None:
        raise HTTPException(status_code=500, detail="Could not read file")

    n_samples = min(500, raw.n_times)
    data, times = raw[0, :n_samples]
    raw_data = data[0]

    # Try to get from cache
    if file_id in _filtered_cache:
        filtered_raw = _filtered_cache[file_id]
        fdata, _ = filtered_raw[0, :n_samples]
        filtered_data = fdata[0]
    else:
        # Fallback: simple smoothing
        filtered_data = np.convolve(raw_data, np.ones(5)/5, mode='same')

    return {
        "message": "Filtered preview retrieved",
        "preview": {
            "times": times.tolist(),
            "data": filtered_data.tolist()
        },
        "data": filtered_data.tolist()
    }


def get_filtered_cache():
    """Return the filtered cache dict (used by analysis router)."""
    return _filtered_cache
