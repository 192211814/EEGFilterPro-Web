@echo off
cd /d "%~dp0"
echo Installing dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo.
    echo Error installing dependencies. Please check your internet connection or python installation.
    echo You can try installing manually: pip install fastapi uvicorn python-multipart numpy requests
    pause
    exit /b %errorlevel%
)

echo.
echo Starting EEGFilterPro Backend...
echo Access Swagger UI at http://127.0.0.1:8000/docs
echo.
python -m uvicorn main:app --host 0.0.0.0 --port 8062 --reload
pause
