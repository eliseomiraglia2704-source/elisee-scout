# Pubblica il sito sul link fisso dei collaboratori.
# https://elisee-scout.vercel.app
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
Write-Host "Deploy produzione Elisee Scout..."
vercel --prod
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host "Online: https://elisee-scout.vercel.app"
