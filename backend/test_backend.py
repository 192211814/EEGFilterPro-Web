import requests
import numpy as np
import time
import sys

BASE_URL = "http://127.0.0.1:8000"

def create_dummy_csv():
    """Creates a dummy EEG CSV file in memory without pandas."""
    # Create 10 seconds of dummy data for 4 channels
    fs = 256
    t = np.linspace(0, 10, 10 * fs)
    
    # Channel 1: Clean sine wave
    ch1 = np.sin(2 * np.pi * 10 * t) * 10 
    # Channel 2: Noise
    ch2 = np.random.normal(0, 5, len(t))
    # Channel 3: Flatline
    ch3 = np.zeros(len(t))
    
    # Create CSV string manually
    header = "Ch1,Ch2,Ch3\n"
    lines = []
    for i in range(len(t)):
        lines.append(f"{ch1[i]},{ch2[i]},{ch3[i]}")
    
    return header + "\n".join(lines)

def test_root():
    try:
        resp = requests.get(f"{BASE_URL}/")
        print(f"Root endpoint: {resp.status_code} - {resp.json()}")
    except Exception as e:
        print(f"Root endpoint failed: {e}")

def test_upload():
    print("\nTesting Upload...")
    csv_content = create_dummy_csv()
    files = {'file': ('test.csv', csv_content, 'text/csv')}
    try:
        resp = requests.post(f"{BASE_URL}/upload", files=files)
        print(f"Upload: {resp.status_code} - {resp.json()}")
    except Exception as e:
        print(f"Upload failed: {e}")

def test_analyze():
    print("\nTesting Analyze...")
    csv_content = create_dummy_csv()
    files = {'file': ('test.csv', csv_content, 'text/csv')}
    try:
        resp = requests.post(f"{BASE_URL}/analyze", files=files)
        print(f"Analyze: {resp.status_code} - {resp.json()}")
    except Exception as e:
        print(f"Analyze failed: {e}")

def test_filter():
    print("\nTesting Filter...")
    # Send a small signal to filter
    data = list(np.sin(2 * np.pi * 10 * np.linspace(0, 1, 100))) # 10Hz sine
    payload = {
        "data": data,
        "filter_type": "lowpass"
    }
    try:
        resp = requests.post(f"{BASE_URL}/filter", json=payload)
        if resp.status_code == 200:
            print("Filter: Success (data received)")
        else:
            print(f"Filter: {resp.status_code} - {resp.text}")
    except Exception as e:
        print(f"Filter failed: {e}")

if __name__ == "__main__":
    # Wait a bit for server to start if running immediately after
    print("Waiting for server to be ready...")
    for i in range(5):
        try:
            requests.get(f"{BASE_URL}/")
            break
        except:
            time.sleep(1)
            
    test_root()
    test_upload()
    test_analyze()
    test_filter()
