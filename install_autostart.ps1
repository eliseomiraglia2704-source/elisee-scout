$ErrorActionPreference = "Continue"
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$TaskName = "EliseeScoutServer"
$Vbs = Join-Path $Root "workers\start_elisee_server_hidden.vbs"

# Watchdog su 8080 (elisee_up) — path con spazi OK
$vbsContent = @"
Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "$Root"
WshShell.Run "pythonw workers\server_watchdog.py", 0, False
"@
[System.IO.File]::WriteAllText($Vbs, $vbsContent)

cmd /c "schtasks /Delete /TN $TaskName /F" 2>$null
try {
  $Action = New-ScheduledTaskAction -Execute "wscript.exe" -Argument "`"$Vbs`"" -WorkingDirectory $Root
  $Trigger = New-ScheduledTaskTrigger -AtLogOn
  $Settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -ExecutionTimeLimit ([TimeSpan]::Zero) -MultipleInstances IgnoreNew -RestartCount 3 -RestartInterval (New-TimeSpan -Minutes 1)
  Register-ScheduledTask -TaskName $TaskName -Action $Action -Trigger $Trigger -Settings $Settings -Description "ELISEE SCOUT always-on http://127.0.0.1:8080" -Force | Out-Null
  Write-Host "Task: OK"
} catch {
  Write-Host "Task: skip" $_.Exception.Message
}

$Startup = [Environment]::GetFolderPath('Startup')
$Lnk = Join-Path $Startup "EliseeScoutServer.lnk"
$W = New-Object -ComObject WScript.Shell
$S = $W.CreateShortcut($Lnk)
$S.TargetPath = "wscript.exe"
$S.Arguments = "`"$Vbs`""
$S.WorkingDirectory = $Root
$S.WindowStyle = 7
$S.Save()
Write-Host "Startup: OK"

# Avvio immediato watchdog (se porta gia su, monitor only)
Start-Process wscript.exe -ArgumentList "`"$Vbs`"" -WorkingDirectory $Root -WindowStyle Hidden
Start-Sleep 4
try {
  $ok = (Test-NetConnection 127.0.0.1 -Port 8080 -WarningAction SilentlyContinue).TcpTestSucceeded
  Write-Host "Porta 8080:" $ok
} catch {
  Write-Host "Porta 8080: check skip"
}
Write-Host "URL: http://127.0.0.1:8080/"
