@echo off
set "mysqlDir=C:\xampp\mysql"

if not exist "%mysqlDir%" (
    echo [ERROR] XAMPP MySQL directory not found at %mysqlDir%
    pause
    exit /b 1
)

echo [INFO] Backing up and restoring MySQL data...
set "timestamp=%date:~10,4%%date:~4,2%%date:~7,2%_%time:~0,2%%time:~3,2%"
set "timestamp=%timestamp: =0%"
set "dataOld=%mysqlDir%\data_old_%timestamp%"

if exist "%mysqlDir%\data" (
    echo [INFO] Renaming existing 'data' folder to '%dataOld%'...
    rename "%mysqlDir%\data" "data_old_%timestamp%"
)

if exist "%mysqlDir%\backup" (
    echo [INFO] Copying fresh 'backup' folder to 'data'...
    xcopy /E /I "%mysqlDir%\backup" "%mysqlDir%\data"
    
    echo [INFO] Restoring your databases and ibdata1 file...
    xcopy /E /I "%dataOld%\eeg_filter_pro" "%mysqlDir%\data\eeg_filter_pro"
    copy /Y "%dataOld%\ibdata1" "%mysqlDir%\data\ibdata1"
    
    echo.
    echo [SUCCESS] MySQL structure has been restored!
    echo [ACTION] Please try starting MySQL from the XAMPP Control Panel now.
) else (
    echo [ERROR] Backup folder not found! Manual repair required.
)

pause
