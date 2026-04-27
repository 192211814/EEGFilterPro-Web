
import uvicorn
import os
import sys

if __name__ == "__main__":
    # Ensure we are running from the script's directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Add current directory to python path
    sys.path.append(os.getcwd())
    
    print(f"Starting server from {os.getcwd()}...")
    try:
        # reload=False to test if reloader is the issue
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=False)
    except Exception as e:
        print(f"Failed to start server: {e}")
