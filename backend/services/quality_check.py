import numpy as np
import mne
from typing import Dict, Any

def check_signal_quality(raw: mne.io.Raw) -> Dict[str, Any]:
    """Basic signal quality check based on variance and peak-to-peak amplitude."""
    data, _ = raw[:]
    quality_per_channel = {}
    
    for i, ch_name in enumerate(raw.ch_names):
        ch_data = data[i]
        v = np.var(ch_data)
        p2p = np.max(ch_data) - np.min(ch_data)
        
        # Heuristic: Extremely high variance or P2P might indicate bad electrode contact/artifact
        if p2p > 1000e-6 or v < 1e-12: # Example thresholds in Volts
            status = "Bad"
        elif p2p > 500e-6:
            status = "Noisy"
        else:
            status = "Good"
            
        quality_per_channel[ch_name] = {
            "status": status,
            "variance": float(v),
            "p2p": float(p2p)
        }
        
    avg_score = sum(1 for q in quality_per_channel.values() if q["status"] == "Good") / len(raw.ch_names)
    
    return {
        "average_score": avg_score * 100,
        "channels": quality_per_channel
    }

def detect_interference(raw: mne.io.Raw) -> Dict[str, bool]:
    """Detect 50Hz and 60Hz powerline interference."""
    data, _ = raw[:]
    sfreq = raw.info['sfreq']
    n = data.shape[1]
    
    # Check average spectrum across channels
    avg_data = np.mean(data, axis=0)
    freqs = np.fft.rfftfreq(n, d=1/sfreq)
    mags = np.abs(np.fft.rfft(avg_data))
    
    def get_mag_at(f_target):
        idx = np.argmin(np.abs(freqs - f_target))
        # Look in a small window
        return np.max(mags[max(0, idx-2):min(len(mags), idx+3)])

    mag_50 = get_mag_at(50.0)
    mag_60 = get_mag_at(60.0)
    
    # Simple thresholding relative to baseline
    baseline = np.mean(mags)
    
    return {
        "50Hz": bool(mag_50 > baseline * 5),
        "60Hz": bool(mag_60 > baseline * 5)
    }
