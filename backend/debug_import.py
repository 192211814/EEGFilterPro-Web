
import sys
import os
import traceback

# Add current directory to path
sys.path.append(os.getcwd())

print(f"Current directory: {os.getcwd()}")
print(f"Path: {sys.path}")

try:
    import main
    print("Successfully imported main.")
except Exception:
    print("Failed to import main:")
    traceback.print_exc()
