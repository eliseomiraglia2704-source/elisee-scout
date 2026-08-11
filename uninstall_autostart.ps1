$TaskName = "EliseeScoutServer"
schtasks /Delete /TN $TaskName /F 2>$null
$Startup = [Environment]::GetFolderPath('Startup')
Remove-Item (Join-Path $Startup "EliseeScoutServer.lnk") -Force -ErrorAction SilentlyContinue
Write-Host "Removed autostart"
