# ELISEE SCOUT — Avvio stack completo (HTTPS + AutoPilot backend)
# Uso: .\avvia-tutto.ps1
$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " ELISEE SCOUT — Stack completo" -ForegroundColor Cyan
Write-Host " HTTPS + AutoPilot Backend 24/7" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Directory: $Root"
Write-Host " URL:       https://127.0.0.1:8443/"
Write-Host " API:       https://127.0.0.1:8443/api/autopilot/status"
Write-Host " (Ctrl+C per arrestare tutto)"
Write-Host ""

# Quick engine smoke (import)
python -c "import sys; sys.path.insert(0,'workers'); from autopilot_engine import get_engine; e=get_engine(); print('AutoPilot engine:', 'ONLINE' if e.status().get('running') else 'OFF', 'cycles', e.status().get('cycles'))"

# Start HTTPS server (embeds AutoPilot)
python https_server.py --port 8443 --http-port 8765
