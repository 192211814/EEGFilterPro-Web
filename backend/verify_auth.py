
import requests
import json
import time

BASE_URL = "http://127.0.0.1:8000"

def test_register():
    print("Testing Registration...")
    payload = {
        "name": "Test User",
        "email": f"test{int(time.time())}@example.com",
        "password": "password123"
    }
    try:
        response = requests.post(f"{BASE_URL}/register", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        if response.status_code == 200 and response.json().get("status") == "success":
            print("[OK] Registration Successful")
            return payload["email"], payload["password"]
        else:
            print("[FAIL] Registration Failed")
            return None, None
    except Exception as e:
        print(f"[ERROR] Connection Error: {e}")
        return None, None

def test_login(email, password):
    print("\nTesting Login...")
    if not email:
        print("Skipping login test due to registration failure")
        return

    payload = {
        "email": email,
        "password": password
    }
    try:
        response = requests.post(f"{BASE_URL}/login", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        if response.status_code == 200 and response.json().get("status") == "success":
            print("[OK] Login Successful")
        else:
            print("[FAIL] Login Failed")
    except Exception as e:
        print(f"[ERROR] Connection Error: {e}")

if __name__ == "__main__":
    email, password = test_register()
    if email:
        test_login(email, password)
