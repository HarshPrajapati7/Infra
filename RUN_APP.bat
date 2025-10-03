@echo off
echo Starting NLP Query Engine...
echo.

REM Start backend in new window
start "Backend Server" cmd /k "cd /d "%~dp0" && .venv\Scripts\activate && set PYTHONPATH=backend && uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000"

REM Wait a bit for backend to start
timeout /t 5 /nobreak > nul

REM Start frontend in new window
start "Frontend Server" cmd /k "cd /d "%~dp0" && npm run dev"

echo.
echo Both servers are starting in separate windows...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo.
echo Press any key to close this window (servers will keep running)
pause > nul
