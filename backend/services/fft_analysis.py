import numpy as np
from typing import Dict, Any

def perform_fft(data: np.ndarray, sfreq: float) -> Dict[str, Any]:
    """Perform FFT on a single channel of data."""
    n = len(data)
    freq = np.fft.rfftfreq(n, d=1/sfreq)
    magnitude = np.abs(np.fft.rfft(data))
    
    return {
        "frequencies": freq.tolist(),
        "psd": magnitude.tolist()
    }
