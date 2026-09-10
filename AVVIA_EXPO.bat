@echo off
title Elisee Scout Mobile - Expo Go
chcp 65001 >nul
echo =====================================================================
echo          ELISEE SCOUT MOBILE - AVVIO EXPO GO PER SMARTPHONE
echo =====================================================================
echo.

REM Rileva automaticamente l'IP reale della scheda Wi-Fi (evita che Expo scelga Tailscale 100.x.x.x)
for /f "tokens=*" %%a in ('powershell -NoProfile -Command "(Get-NetIPAddress -InterfaceAlias 'Wi-Fi' -AddressFamily IPv4 -ErrorAction SilentlyContinue).IPAddress"') do set WIFI_IP=%%a

if "%WIFI_IP%"=="" (
    set WIFI_IP=192.168.1.101
)

set REACT_NATIVE_PACKAGER_HOSTNAME=%WIFI_IP%

echo  [Info Rete] IP Wi-Fi locale impostato su: %WIFI_IP%
echo.
echo  Come vuoi avviare Expo?
echo.
echo  [1] Modalità TUNNEL (CONSIGLIATA AL 100%%: Bypassa Tailscale e Firewall, funziona subito!)
echo  [2] Modalità WI-FI DIRETTO (Usa l'IP reale %WIFI_IP% al posto di Tailscale)
echo.
set /p SCELTA="Seleziona [1 o 2, oppure premi solo INVIO per TUNNEL]: "
if "%SCELTA%"=="" set SCELTA=1

REM Libera automaticamente la porta 8081 da vecchi processi bloccati
for /f "tokens=5" %%p in ('netstat -ano ^| findstr :8081 ^| findstr LISTENING') do (
    taskkill /F /PID %%p >nul 2>&1
)

cd /d "%~dp0eliseo2704"

if "%SCELTA%"=="2" (
    echo.
    echo  [OK] Avvio su rete Wi-Fi locale con IP %WIFI_IP%...
    echo.
    npx expo start
) else (
    echo.
    echo  [OK] Avvio in modalita' TUNNEL protetta (bypassa Tailscale e Firewall)...
    echo.
    npx expo start --tunnel
)
pause
