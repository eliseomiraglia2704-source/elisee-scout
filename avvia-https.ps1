# Elisee Scout — avvio server HTTPS (SSL/TLS)
$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot

$python = (Get-Command python -ErrorAction SilentlyContinue)?.Source
if (-not $python) {
    Write-Host "Python non trovato nel PATH." -ForegroundColor Red
    exit 1
}

# Genera certificati se mancanti
$cert = Join-Path $PSScriptRoot "ssl\cert.pem"
$key  = Join-Path $PSScriptRoot "ssl\key.pem"
if (-not (Test-Path $cert) -or -not (Test-Path $key)) {
    Write-Host "Generazione certificati SSL self-signed..." -ForegroundColor Cyan
    & $python (Join-Path $PSScriptRoot "ssl\generate_certs.py")
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host ""
Write-Host "Avvio Elisee Scout su HTTPS..." -ForegroundColor Green
Write-Host "  https://127.0.0.1:8443/" -ForegroundColor Yellow
Write-Host "  https://localhost:8443/" -ForegroundColor Yellow
Write-Host "  (Ctrl+C per arrestare)" -ForegroundColor DarkGray
Write-Host ""

& $python (Join-Path $PSScriptRoot "https_server.py") @args
