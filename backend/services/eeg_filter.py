import mne
from scipy.signal import iirfilter, lfilter, firwin, butter, cheby1, iirnotch, freqz
import numpy as np

def apply_fir_filter(raw: mne.io.Raw, l_freq: float, h_freq: float, window: str = 'hamming', taps: int = 151) -> mne.io.Raw:
    """Apply FIR filter using MNE with specific window and length."""
    if l_freq is None and h_freq is None:
        return raw
    # MNE's filter uses firwin internally
    return raw.filter(l_freq=l_freq, h_freq=h_freq, method='fir', 
                      fir_window=window, fir_design='firwin')

def apply_iir_filter(raw: mne.io.Raw, l_freq: float, h_freq: float, order: int = 4, 
                     topology: str = 'butter', ripple: float = 1.0, atten: float = 40.0) -> mne.io.Raw:
    """Apply IIR filter using Scipy/MNE (Butterworth or Chebyshev)."""
    if l_freq is None and h_freq is None:
        return raw
    
    iir_params = {
        'order': order,
        'ftype': 'butter' if topology.lower() == 'butterworth' else 'cheby1'
    }
    if iir_params['ftype'] == 'cheby1':
        iir_params['rp'] = ripple

    return raw.filter(l_freq=l_freq, h_freq=h_freq, method='iir', iir_params=iir_params)

def apply_notch_filter(raw: mne.io.Raw, freq: float = 50.0, q: float = 30.0) -> mne.io.Raw:
    """Apply Notch filter using Scipy/MNE."""
    # MNE notch_filter uses iirnotch for IIR
    return raw.notch_filter(freqs=freq, method='iir', iir_params=dict(order=2, ftype='butter'))

def compute_frequency_response(filter_type: str, implementation: str, l_freq: float, h_freq: float, 
                               fs: float, order: int = 4, **kwargs):
    """Generate frequency and phase response data using freqz."""
    nyq = 0.5 * fs
    b, a = None, [1.0]

    if implementation.upper() == 'FIR':
        window = kwargs.get('window', 'hamming')
        taps = int(kwargs.get('taps', 151))
        if filter_type == 'bandpass':
            b = firwin(taps, [l_freq, h_freq], pass_zero=False, fs=fs, window=window)
        elif filter_type == 'highpass':
            b = firwin(taps, l_freq, pass_zero=False, fs=fs, window=window)
        elif filter_type == 'lowpass':
            b = firwin(taps, h_freq or l_freq, fs=fs, window=window)
    elif implementation.upper() == 'IIR':
        ftype = 'butter' if kwargs.get('topology', 'butterworth').lower() == 'butterworth' else 'cheby1'
        rp = kwargs.get('ripple', 1.0)
        if filter_type == 'bandpass':
            b, a = iirfilter(order, [l_freq, h_freq], btype='bandpass', ftype=ftype, fs=fs, rp=rp)
        elif filter_type == 'highpass':
            b, a = iirfilter(order, l_freq, btype='highpass', ftype=ftype, fs=fs, rp=rp)
        elif filter_type == 'lowpass':
            b, a = iirfilter(order, h_freq or l_freq, btype='lowpass', ftype=ftype, fs=fs, rp=rp)
    elif filter_type == 'notch':
        b, a = iirnotch(l_freq, kwargs.get('q', 30.0), fs=fs)

    if b is not None:
        w, h = freqz(b, a, worN=512)
        freqs = (fs * w / (2 * np.pi)).tolist()
        magnitude = (20 * np.log10(np.abs(h))).tolist()
        phase = (np.unwrap(np.angle(h))).tolist()
        return freqs, magnitude, phase
    
    return [], [], []

