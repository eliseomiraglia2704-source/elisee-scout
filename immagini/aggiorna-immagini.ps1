# ELISEE SCOUT — aggiorna-immagini.ps1
# Quando l'utente mette file nuovi (anche con nome tipo "image (6).jpg"),
# questo script:
#  1) li rinomina al nome ufficiale della cartella
#  2) sincronizza corrente/
#  3) aggiorna i ?v= cache-bust in index.html, style.css, app.js
#
# Uso: dalla root del sito o da qui:
#   powershell -ExecutionPolicy Bypass -File "immagini\aggiorna-immagini.ps1"

$ErrorActionPreference = "Stop"

$SiteRoot = Split-Path $PSScriptRoot -Parent
if (-not (Test-Path (Join-Path $SiteRoot "index.html"))) {
  $SiteRoot = $PSScriptRoot
  if (-not (Test-Path (Join-Path $SiteRoot "index.html"))) {
    $SiteRoot = Split-Path $PSScriptRoot -Parent
  }
}
$ImgRoot = Join-Path $SiteRoot "immagini"
if (-not (Test-Path $ImgRoot)) { $ImgRoot = $PSScriptRoot }

# Nome ufficiale atteso per ogni cartella asset
$Canon = [ordered]@{
  "01-home-hero"            = "hero-workspace.jpg"
  "02-chi-siamo-ritratto"   = "about-portrait.jpg"
  "03-calciatore-ritratto"  = "footballer-portrait.svg"
  "04-workspace-scout"      = "scout-workspace.svg"
  "05-logo-scout"           = "logo-scout.svg"
  "06-placeholder-utente"   = "user-placeholder.svg"
  "07-auth-google"          = "google-logo.svg"
  "08-auth-apple"           = "apple-logo.svg"
  "09-auth-spid-logo"       = "spid-logo.svg"
  "10-auth-spid-posteid"    = "spid-posteid.svg"
  "11-auth-spid-intesa"     = "spid-intesa.svg"
  "12-auth-spid-aruba"      = "spid-aruba.svg"
  "13-auth-spid-tim"        = "spid-tim.svg"
  "14-auth-spid-namirial"   = "spid-namirial.svg"
  "15-auth-spid-infocert"   = "spid-infocert.svg"
}

$ImageExt = @(".jpg", ".jpeg", ".png", ".svg", ".webp", ".gif", ".JPG", ".JPEG", ".PNG", ".SVG", ".WEBP", ".GIF")
$Token = Get-Date -Format "yyyyMMdd_HHmmss"
$Report = New-Object System.Collections.Generic.List[string]

function Get-ImageFiles($dir) {
  Get-ChildItem -Path $dir -File -ErrorAction SilentlyContinue |
    Where-Object { $ImageExt -contains $_.Extension }
}

Write-Host "=== ELISEE SCOUT — aggiorna immagini ==="
Write-Host "Site: $SiteRoot"
Write-Host "Img:  $ImgRoot"
Write-Host "Token cache: $Token"
Write-Host ""

foreach ($folder in $Canon.Keys) {
  $dir = Join-Path $ImgRoot $folder
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
    foreach ($sub in @("corrente", "originali", "modifiche")) {
      New-Item -ItemType Directory -Path (Join-Path $dir $sub) -Force | Out-Null
    }
  }

  $expected = $Canon[$folder]
  $expectedBase = [System.IO.Path]::GetFileNameWithoutExtension($expected)
  $expectedExt = [System.IO.Path]::GetExtension($expected).ToLowerInvariant()

  # File immagine nella root della cartella (non in sottocartelle)
  $rootImgs = Get-ImageFiles $dir

  # Anche bozze in modifiche/ e corrente/ se più recenti
  $modImgs = @()
  $modDir = Join-Path $dir "modifiche"
  if (Test-Path $modDir) { $modImgs = @(Get-ImageFiles $modDir) }

  # Scegli il candidato "nuovo": il più recente tra root + modifiche
  $candidates = @($rootImgs) + @($modImgs)
  if ($candidates.Count -eq 0) {
    $Report.Add("SKIP  $folder — nessun file immagine")
    continue
  }

  $newest = $candidates | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  $destPath = Join-Path $dir $expected

  # Se l'estensione del nuovo file differisce (es. png al posto di jpg), adatta il nome canonico
  $newExt = $newest.Extension.ToLowerInvariant()
  $finalName = $expected
  if ($newExt -ne $expectedExt -and $newExt -in @(".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg")) {
    # Per foto: accetta jpg/png/webp al posto del default; per svg resta svg se possibile
    if ($expectedExt -eq ".svg" -and $newExt -ne ".svg") {
      # SVG sostituito da raster: usa estensione reale e aggiorneremo i riferimenti
      $finalName = $expectedBase + $newExt
    } elseif ($expectedExt -ne ".svg") {
      $finalName = $expectedBase + $(if ($newExt -eq ".jpeg") { ".jpg" } else { $newExt })
    }
    $destPath = Join-Path $dir $finalName
  }

  # Se il file più recente non è già al nome giusto, rinomina/copia
  if ($newest.FullName -ne $destPath) {
    if (Test-Path $destPath) {
      # Backup del precedente in originali/ se non esiste ancora un backup con timestamp
      $bakName = "{0}.prev-{1}{2}" -f $expectedBase, (Get-Date -Format "yyyyMMdd_HHmmss"), ([System.IO.Path]::GetExtension($destPath))
      $bakPath = Join-Path (Join-Path $dir "originali") $bakName
      if (-not (Test-Path (Join-Path $dir "originali"))) {
        New-Item -ItemType Directory -Path (Join-Path $dir "originali") -Force | Out-Null
      }
      Copy-Item $destPath $bakPath -Force
    }
    Copy-Item $newest.FullName $destPath -Force
    # Rimuovi file root "sporchi" (image (6).jpg ecc.) se diversi dal canonico
    foreach ($extra in $rootImgs) {
      if ($extra.FullName -ne $destPath -and $extra.Name -ne $finalName) {
        # sposta in modifiche/ come archivio
        $arch = Join-Path (Join-Path $dir "modifiche") $extra.Name
        if (-not (Test-Path (Join-Path $dir "modifiche"))) {
          New-Item -ItemType Directory -Path (Join-Path $dir "modifiche") -Force | Out-Null
        }
        if ($extra.FullName -ne $arch) {
          Move-Item $extra.FullName $arch -Force -ErrorAction SilentlyContinue
        }
      }
    }
    $Report.Add("OK    $folder : $($newest.Name)  →  $finalName")
  } else {
    $Report.Add("OK    $folder : $finalName (già corretto)")
  }

  # Sync corrente/
  $corrDir = Join-Path $dir "corrente"
  if (-not (Test-Path $corrDir)) { New-Item -ItemType Directory -Path $corrDir -Force | Out-Null }
  Copy-Item $destPath (Join-Path $corrDir $finalName) -Force

  # Se l'estensione è cambiata rispetto al default, registra per aggiornare i path nel codice
  if ($finalName -ne $expected) {
    $Report.Add("NOTE  $folder : estensione cambiata ($expected → $finalName) — aggiornare riferimenti codice se serve")
  }
}

# --- Cache-bust nei file del sito ---
function Update-CacheBust([string]$filePath, [string]$token) {
  if (-not (Test-Path $filePath)) { return $false }
  $content = Get-Content -Path $filePath -Raw -Encoding UTF8
  $orig = $content

  # Sostituisci ?v=... su path immagini/
  $content = [regex]::Replace($content, '(immagini/[^"''?\s]+)\?v=[^"''&\s]*', "`$1?v=$token")

  # Aggiungi ?v= se manca su path immagini noti (src/url)
  $content = [regex]::Replace(
    $content,
    '(src|href)=(["''])(immagini/[^"'']+\.(?:jpg|jpeg|png|svg|webp|gif))\2',
    { param($m)
      $attr = $m.Groups[1].Value
      $q = $m.Groups[2].Value
      $path = $m.Groups[3].Value
      if ($path -match '\?v=') { return $m.Value }
      return "$attr=$q$path`?v=$token$q"
    }
  )
  $content = [regex]::Replace(
    $content,
    "url\((['""]?)(immagini/[^)'""]+\.(?:jpg|jpeg|png|svg|webp|gif))(?:\?v=[^)'""]*)?\1\)",
    { param($m)
      $q = $m.Groups[1].Value
      $path = $m.Groups[2].Value
      return "url($q$path`?v=$token$q)"
    }
  )

  # Cache bust style.css / app.js / i18n.js in index
  $content = [regex]::Replace($content, '(style\.css|app\.js|i18n\.js)\?v=[^"''&]+', "`$1?v=$token")

  if ($content -ne $orig) {
    Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
    return $true
  }
  return $false
}

# Path canonici attesi nel codice (per fix estensione se needed)
# Forza i nomi standard nei riferimenti (jpg di default)
$replacements = @{
  "immagini/01-home-hero/hero-workspace." = "immagini/01-home-hero/hero-workspace.jpg"
  "immagini/02-chi-siamo-ritratto/about-portrait." = "immagini/02-chi-siamo-ritratto/about-portrait.jpg"
}

foreach ($rel in @("index.html", "style.css", "app.js")) {
  $fp = Join-Path $SiteRoot $rel
  if (Update-CacheBust $fp $Token) {
    $Report.Add("BUST  $rel → ?v=$Token")
  } else {
    # Forza almeno un bump su style.css link e immagini note
    if (Test-Path $fp) {
      $c = Get-Content $fp -Raw -Encoding UTF8
      $c2 = $c -replace '\?v=\d{8}_\d{6}', "?v=$Token"
      $c2 = $c2 -replace '\?v=\d+(?=["''])', "?v=$Token"
      if ($c2 -ne $c) {
        Set-Content -Path $fp -Value $c2 -Encoding UTF8 -NoNewline
        $Report.Add("BUST  $rel → ?v=$Token (fallback)")
      } else {
        $Report.Add("SKIP  $rel — nessuna modifica cache")
      }
    }
  }
}

# Scrivi token
Set-Content -Path (Join-Path $ImgRoot ".cache-bust") -Value $Token -Encoding ASCII

Write-Host ""
Write-Host "=== REPORT ==="
$Report | ForEach-Object { Write-Host $_ }
Write-Host ""
Write-Host "Fatto. Token: $Token"
Write-Host "Ricarica il browser con Ctrl+F5"
