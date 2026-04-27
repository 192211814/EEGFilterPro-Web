import numpy as np
import io
import csv
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.metrics import accuracy_score, mean_squared_error

# Try importing scipy, set flag if missing
try:
    from scipy import signal
    SCIPY_AVAILABLE = True
except ImportError:
    SCIPY_AVAILABLE = False
    print("Warning: Scipy not available. Filtering will be disabled.")

def load_data(file_content: bytes):
    """Loads EEG data from CSV bytes using standard csv module + numpy."""
    # Kept for backward compatibility if needed, but endpoints now prefer pandas
    try:
        # Decode bytes to string
        content_str = file_content.decode('utf-8')
        f = io.StringIO(content_str)
        reader = csv.reader(f)
        
        headers = next(reader)
        data = []
        for row in reader:
            if row: # Skip empty lines
                # Convert valid values to float, skipping errors
                clean_row = []
                for x in row:
                    try:
                        clean_row.append(float(x))
                    except ValueError:
                        clean_row.append(0.0) 
                data.append(clean_row)
        
        # Convert to numpy array
        np_data = np.array(data)
        
        # Create a simple dict-like object or just return dict of arrays
        result = {}
        if np_data.size > 0:
            for i, h in enumerate(headers):
                if i < np_data.shape[1]:
                    result[h] = np_data[:, i]
        
        return result, headers
        
    except Exception as e:
        raise ValueError(f"Error loading data: {e}")

def calculate_quality(data: np.ndarray, fs: float = 256.0) -> str:
    """Estimates signal quality."""
    try:
        # Check for flatlining (very low variance)
        variance = np.var(data)
        if variance < 0.1:
            return "BAD (Flatline)"

        # Check for excessive noise (very high amplitude)
        max_amp = np.max(np.abs(data))
        if max_amp > 500: # Threshold for artifact/noise
             return "POOR (High Amplitude/Artifact)"
        
        return "GOOD"
    except Exception as e:
        return f"Error: {e}"

def perform_analysis(df: pd.DataFrame) -> dict:
    """Performs statistical analysis on the dataframe."""
    summary = df.describe().to_dict()
    
    # Check for missing values
    missing_values = df.isnull().sum().to_dict()
    
    # Correlation matrix (only numeric columns)
    numeric_df = df.select_dtypes(include=[np.number])
    correlation = numeric_df.corr().to_dict()
    
    return {
        "summary_statistics": summary,
        "missing_values": missing_values,
        "correlation_matrix": correlation,
        "columns": list(df.columns),
        "rows": len(df)
    }

def train_model(df: pd.DataFrame, target_col: str) -> dict:
    """Trains a Random Forest model on the dataframe."""
    
    # clean data: drop rows with NaNs for simplicity in this demo
    df_clean = df.dropna()
    
    X = df_clean.drop(columns=[target_col])
    y = df_clean[target_col]
    
    # simple heuristic to decide classification vs regression
    # if target has few unique values (<20) and is integer/object -> classification
    unique_vals = y.nunique()
    is_classification = unique_vals < 20 or y.dtype == 'object'
    
    # If object type, encode it (simple label encoding for demo)
    if y.dtype == 'object':
        y = y.astype('category').cat.codes
        
    # Handle non-numeric features in X (get_dummies)
    X = pd.get_dummies(X)
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    if is_classification:
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        acc = accuracy_score(y_test, predictions)
        return {
            "model_type": "Classification (Random Forest)",
            "accuracy": acc,
            "target": target_col,
            "features": list(X.columns)
        }
    else:
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        predictions = model.predict(X_test)
        mse = mean_squared_error(y_test, predictions)
        return {
            "model_type": "Regression (Random Forest)",
            "mean_squared_error": mse,
            "target": target_col,
            "features": list(X.columns)
        }

def apply_filter(data: np.ndarray, filter_type: str, fs: float = 256.0) -> np.ndarray:
    """Applies digital filters to the EEG data."""
    if not SCIPY_AVAILABLE:
        return data # Pass-through if scipy is missing
        
    try:
        # Design filter
        nyq = 0.5 * fs
        
        if filter_type == "lowpass":
            cutoff = 30.0 # Hz
            normal_cutoff = cutoff / nyq
            b, a = signal.butter(4, normal_cutoff, btype='low', analog=False)
        elif filter_type == "highpass":
            cutoff = 1.0 # Hz
            normal_cutoff = cutoff / nyq
            b, a = signal.butter(4, normal_cutoff, btype='high', analog=False)
        elif filter_type == "notch":
            notch_freq = 50.0  # Hz (Mains hum)
            quality_factor = 30.0
            b, a = signal.iirnotch(notch_freq, quality_factor, fs)
        else:
            return data # Return original if unknown filter

        # Apply filter
        filtered_data = signal.filtfilt(b, a, data)
        return filtered_data
    except Exception as e:
        print(f"Filter error: {e}")
        return data
