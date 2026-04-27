@echo off
cd /d "%~dp0"

echo Setting up environment...
set PYTHONPATH=%~dp0;%PYTHONPATH%

echo Starting EEG Filter Pro Backend...
python -m uvicorn main:app --host 0.0.0.0 --port 8062 --reload

if %errorlevel% neq 0 (
    echo.
    echo Server failed to start.
    echo Press any key to exit...
    pause
)
