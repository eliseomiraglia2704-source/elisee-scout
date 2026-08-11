# Installa il certificato self-signed Elisee Scout nel magazzino
# "Autorita di certificazione radice attendibili" dell'utente corrente.
# Dopo l'installazione, riavvia Chrome e riapri https://127.0.0.1:8443/

$ErrorActionPreference = "Stop"
$certPath = Join-Path $PSScriptRoot "cert.pem"

if (-not (Test-Path $certPath)) {
    Write-Host "Certificato non trovato: $certPath" -ForegroundColor Red
    Write-Host "Esegui prima: python ssl\generate_certs.py"
    exit 1
}

Write-Host "Installazione certificato di sviluppo Elisee Scout..." -ForegroundColor Cyan
Write-Host "  File: $certPath"
Write-Host ""

try {
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2((Resolve-Path $certPath))
} catch {
    # Fallback: Import-Certificate gestisce spesso i PEM
    $imported = Import-Certificate -FilePath $certPath -CertStoreLocation Cert:\CurrentUser\Root
    Write-Host "OK  Certificato importato (Import-Certificate)." -ForegroundColor Green
    Write-Host "    Soggetto: $($imported.Subject)"
    Write-Host "    Scadenza: $($imported.NotAfter)"
    Write-Host ""
    Write-Host "Chiudi COMPLETAMENTE Chrome (anche dalla tray) e riapri:" -ForegroundColor Yellow
    Write-Host "  https://127.0.0.1:8443/" -ForegroundColor White
    exit 0
}

$store = New-Object System.Security.Cryptography.X509Certificates.X509Store(
    [System.Security.Cryptography.X509Certificates.StoreName]::Root,
    [System.Security.Cryptography.X509Certificates.StoreLocation]::CurrentUser
)
$store.Open([System.Security.Cryptography.X509Certificates.OpenFlags]::ReadWrite)

# Rimuovi eventuali vecchi cert Elisee Scout con stesso soggetto
$existing = $store.Certificates | Where-Object {
    $_.Subject -like "*Elisee Scout*" -or $_.Subject -eq $cert.Subject
}
foreach ($old in $existing) {
    try { $store.Remove($old) } catch { }
}

$store.Add($cert)
$store.Close()

Write-Host "OK  Certificato aggiunto a: Cert:\CurrentUser\Root" -ForegroundColor Green
Write-Host "    Soggetto : $($cert.Subject)"
Write-Host "    Impronta : $($cert.Thumbprint)"
Write-Host "    Scadenza : $($cert.NotAfter)"
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Yellow
Write-Host "  1. Chiudi TUTTE le finestre di Chrome (e Controlla Gestione attivita se resta aperto)."
Write-Host "  2. Riapri Chrome e vai a: https://127.0.0.1:8443/"
Write-Host "  3. L'avviso NET::ERR_CERT_AUTHORITY_INVALID non dovrebbe piu apparire."
Write-Host ""
Write-Host "Per rimuovere il trust in seguito:" -ForegroundColor DarkGray
Write-Host "  certmgr.msc → Autorita di certificazione radice attendibili → Certificati → elimina Elisee Scout Dev"
