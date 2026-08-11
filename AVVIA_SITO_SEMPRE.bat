@echo off
cd /d "%~dp0"
wscript.exe "%~dp0workers\start_elisee_server_hidden.vbs"
exit /b 0
