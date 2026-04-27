import uvicorn
import os
import sys

if __name__ == "__main__":
    # Ensure we are running from the script's directory
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    # Add current directory to python path for this process
    sys.path.append(script_dir)
    
    # Add to PYTHONPATH environment variable so subprocesses (reloader) inherit it
    # This fixes the "Could not import module 'main'" error when using reload=True
    current_path = os.environ.get("PYTHONPATH", "")
    os.environ["PYTHONPATH"] = script_dir + os.pathsep + current_path
    
    print(f"Starting server from {os.getcwd()}...")
    try:
        uvicorn.run("main:app", host="0.0.0.0", port=8155, reload=True)
    except Exception as e:
        print(f"Failed to start server: {e}")
        input("Press Enter to exit...")
