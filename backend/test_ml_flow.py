import os
import io
import pandas as pd
import numpy as np
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def create_dummy_csv():
    # Create a simple synthetic dataset
    data = {
        'feature1': np.random.rand(100),
        'feature2': np.random.rand(100),
        'feature3': np.random.rand(100) * 100,
        'label': np.random.randint(0, 2, 100) # Binary classification
    }
    df = pd.DataFrame(data)
    csv_content = df.to_csv(index=False)
    return csv_content

def test_flow():
    print("1. Creating dummy CSV...")
    csv_content = create_dummy_csv()
    filename = "test_dataset.csv"
    
    print("2. Uploading file...")
    files = {'file': (filename, io.BytesIO(csv_content.encode('utf-8')), 'text/csv')}
    response = client.post("/upload", files=files)
    print("Upload Response:", response.json())
    assert response.status_code == 200
    
    print("3. Analyzing file...")
    response = client.get(f"/analyze/{filename}")
    print("Analyze Response Keys:", response.json().keys())
    assert response.status_code == 200
    assert "summary_statistics" in response.json()
    assert "correlation_matrix" in response.json()
    
    print("4. Training model...")
    train_payload = {"target_column": "label", "model_type": "random_forest"}
    response = client.post(f"/train/{filename}", json=train_payload)
    print("Train Response:", response.json())
    assert response.status_code == 200
    assert "accuracy" in response.json()
    
    print("\n✅ Verification Successful!")

if __name__ == "__main__":
    test_flow()
