
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
    # This is crucial for Windows/spawned processes
    current_path = os.environ.get("PYTHONPATH", "")
    os.environ["PYTHONPATH"] = script_dir + os.pathsep + current_path
    
    print(f"Starting server from {os.getcwd()}...")
    print(f"PYTHONPATH set to: {os.environ['PYTHONPATH']}")
    
    try:
        # reload=True should now work because PYTHONPATH is set in env
        uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
    except Exception as e:
        print(f"Failed to start server: {e}")
