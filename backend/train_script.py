import pandas as pd
import sys
import os

# Add current directory to path so we can import processing if running from backend dir
sys.path.append(os.getcwd())

try:
    import processing
except ImportError:
    # If running from root
    from backend import processing

def main():
    file_path = os.path.join("uploads", "features_raw.csv")
    if not os.path.exists(file_path):
        # Try relative to backend if running from root
        file_path = os.path.join("backend", "uploads", "features_raw.csv")
    
    if not os.path.exists(file_path):
        print(f"Error: Dataset not found at {file_path}")
        return

    print(f"Loading dataset from {file_path}...")
    df = pd.read_csv(file_path)
    
    # Drop empty column if exists
    if "Unnamed: 32" in df.columns:
        df = df.drop(columns=["Unnamed: 32"])
        
    print(f"Dataset shape: {df.shape}")
    print("Columns:", df.columns.tolist())
    
    target = "O2"
    if target not in df.columns:
        print(f"Error: Target '{target}' not found in columns.")
        return

    print(f"\nTraining Random Forest Regressor to predict '{target}'...")
    try:
        result = processing.train_model(df, target)
        print("\n--- Training Result ---")
        for k, v in result.items():
            if k == "features":
                print(f"{k}: {v[:5]}... ({len(v)} features total)")
            else:
                print(f"{k}: {v}")
                
    except Exception as e:
        print(f"Training failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    main()
