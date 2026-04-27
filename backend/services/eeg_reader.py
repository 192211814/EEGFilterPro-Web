import mne
import os
import pandas as pd
import numpy as np
from typing import Dict, Any

def read_eeg_file(file_path: str) -> mne.io.Raw:
    """Read EEG file (.edf, .bdf, .set, .csv) using MNE with better error tolerance."""
    ext = os.path.splitext(file_path)[1].lower()
    
    try:
        if ext == '.edf':
            # Use stim_channel=None to avoid failures on files without stimulus channels
            return mne.io.read_raw_edf(file_path, preload=True, stim_channel=None)
        elif ext == '.bdf':
            return mne.io.read_raw_bdf(file_path, preload=True)
        elif ext == '.set':
            return mne.io.read_raw_eeglab(file_path, preload=True)
        elif ext == '.csv':
            # Load CSV and convert to MNE RawArray
            df = pd.read_csv(file_path)
            # Remove non-numeric columns if any (except header)
            df = df.select_dtypes(include=[np.number])
            
            data = df.values.T # MNE expects (n_channels, n_samples)
            ch_names = df.columns.tolist()
            sfreq = 256.0 # Default SFreq for CSV if not specified
            
            info = mne.create_info(ch_names=ch_names, sfreq=sfreq, ch_types='eeg')
            return mne.io.RawArray(data, info)
        elif ext in ['.txt', '.event']:
            return None 
        else:
            # Try generic load
            return mne.io.read_raw(file_path, preload=True)
    except Exception as e:
        print(f"Read Error on {file_path}: {e}")
        return None




def get_metadata(raw: mne.io.Raw) -> Dict[str, Any]:
    """Extract metadata from raw object, or return default."""
    if not raw:
        return {
            "sampling_rate": 0.0,
            "n_channels": 0,
            "channels": [],
            "duration": 0.0,
            "n_samples": 0
        }
    return {
        "sampling_rate": float(raw.info['sfreq']),
        "n_channels": int(len(raw.ch_names)),
        "channels": list(raw.ch_names),
        "duration": float(raw.n_times / raw.info['sfreq']),
        "n_samples": int(raw.n_times)
    }


