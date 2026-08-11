@echo off
cd /d "%~dp0"
REM Avvia/riavvia il server tramite Task Scheduler (processo indipendente, non muore)
schtasks /Run /TN "EliseeScoutServer" >nul 2>&1
if errorlevel 1 (
  REM fallback se il task non esiste
  set "PY=C:\Users\Eliseo Miraglia\AppData\Local\Programs\Python\Python312-embed\python.exe"
  if not exist "%PY%" set "PY=python"
  start "" /B "%PY%" -u workers\server_watchdog.py
)
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:8080/"
exit /b 0
