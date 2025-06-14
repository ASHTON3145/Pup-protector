@echo off
REM Start Python HTTP server in a new window
start "" cmd /c "python serve.py"
REM Wait for the server to start (adjust if needed)
timeout /t 2 >nul

REM Launch index.html in Google Chrome
setlocal
set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"
if not exist %CHROME_PATH% set CHROME_PATH="C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
if not exist %CHROME_PATH% (
    echo Chrome not found in default locations.
    exit /b 1
)
start "" %CHROME_PATH% "http://localhost:8080/"
endlocal
