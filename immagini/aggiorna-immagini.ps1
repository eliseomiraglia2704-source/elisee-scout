# ELISEE SCOUT - aggiorna-immagini.ps1
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

function Check-JSFiles {
    param([string]$RootPath)
    Write-Host "=== Controllo sintassi JavaScript ==="
    $jsFiles = Get-ChildItem -Path $RootPath -Recurse -Include *.js -File -ErrorAction SilentlyContinue
    foreach ($file in $jsFiles) {
        try {
            node --check $file.FullName
            Write-Host ("OK    " + $file.FullName)
        } catch {
            Write-Host ("ERR   " + $file.FullName + " - " + $_.Exception.Message)
        }
    }
}

Write-Host "=== ELISEE SCOUT - aggiorna immagini ==="
Write-Host ("Site: " + $SiteRoot)
Write-Host ("Img:  " + $ImgRoot)
Write-Host ("Token cache: " + $Token)
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

  $rootImgs = Get-ImageFiles $dir

  $modImgs = @()
  $modDir = Join-Path $dir "modifiche"
  if (Test-Path $modDir) { $modImgs = @(Get-ImageFiles $modDir) }

  $candidates = @($rootImgs) + @($modImgs)
  if ($candidates.Count -eq 0) {
    $Report.Add("SKIP  " + $folder + " - nessun file immagine")
    continue
  }

  $newest = $candidates | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  $destPath = Join-Path $dir $expected

  $newExt = $newest.Extension.ToLowerInvariant()
  $finalName = $expected
  if ($newExt -ne $expectedExt -and $newExt -in @(".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg")) {
    if ($expectedExt -eq ".svg" -and $newExt -ne ".svg") {
      $finalName = $expectedBase + $newExt
    } elseif ($expectedExt -ne ".svg") {
      $finalName = $expectedBase + $(if ($newExt -eq ".jpeg") { ".jpg" } else { $newExt })
    }
    $destPath = Join-Path $dir $finalName
  }

  if ($newest.FullName -ne $destPath) {
    if (Test-Path $destPath) {
      $bakName = "{0}.prev-{1}{2}" -f $expectedBase, (Get-Date -Format "yyyyMMdd_HHmmss"), ([System.IO.Path]::GetExtension($destPath))
      $bakPath = Join-Path (Join-Path $dir "originali") $bakName
      if (-not (Test-Path (Join-Path $dir "originali"))) {
        New-Item -ItemType Directory -Path (Join-Path $dir "originali") -Force | Out-Null
      }
      Copy-Item $destPath $bakPath -Force
    }
    Copy-Item $newest.FullName $destPath -Force
    foreach ($extra in $rootImgs) {
      if ($extra.FullName -ne $destPath -and $extra.Name -ne $finalName) {
        $arch = Join-Path (Join-Path $dir "modifiche") $extra.Name
        if (-not (Test-Path (Join-Path $dir "modifiche"))) {
          New-Item -ItemType Directory -Path (Join-Path $dir "modifiche") -Force | Out-Null
        }
        if ($extra.FullName -ne $arch) {
          Move-Item $extra.FullName $arch -Force -ErrorAction SilentlyContinue
        }
      }
    }
    $Report.Add("OK    " + $folder + " : " + $newest.Name + " -> " + $finalName)
  } else {
    $Report.Add("OK    " + $folder + " : " + $finalName + " (gia corretto)")
  }

  $corrDir = Join-Path $dir "corrente"
  if (-not (Test-Path $corrDir)) { New-Item -ItemType Directory -Path $corrDir -Force | Out-Null }
  try {
    Copy-Item $destPath (Join-Path $corrDir $finalName) -Force
  } catch {
    # File in uso dal server o non sovrascrivibile al momento
  }

  if ($finalName -ne $expected) {
    $Report.Add("NOTE  " + $folder + " : estensione cambiata da " + $expected + " a " + $finalName)
  }
}

Check-JSFiles -RootPath $SiteRoot

# --- Cache-bust nei file del sito ---
function Update-CacheBust([string]$filePath, [string]$token) {
    if (-not (Test-Path $filePath)) { return $false }
    $content = Get-Content -Path $filePath -Raw -Encoding UTF8
    $orig = $content

    $content = $content -replace '(?<=immagini/[a-zA-Z0-9_\-\./]+)\?v=[a-zA-Z0-9_]+', "?v=$token"
    $content = $content -replace '(?<=(style\.css|app\.js|i18n\.js))\?v=[a-zA-Z0-9_]+', "?v=$token"

    if ($content -ne $orig) {
        Set-Content -Path $filePath -Value $content -Encoding UTF8 -NoNewline
        return $true
    }
    return $false
}

$replacements = @{
  "immagini/01-home-hero/hero-workspace." = "immagini/01-home-hero/hero-workspace.jpg"
  "immagini/02-chi-siamo-ritratto/about-portrait." = "immagini/02-chi-siamo-ritratto/about-portrait.jpg"
}

foreach ($rel in @("index.html", "style.css", "app.js")) {
  $fp = Join-Path $SiteRoot $rel
  if (Update-CacheBust $fp $Token) {
    $Report.Add("BUST  " + $rel + " -> ?v=" + $Token)
  } else {
    if (Test-Path $fp) {
      $c = Get-Content -Path $fp -Raw -Encoding UTF8
      $c2 = $c -replace '\?v=[a-zA-Z0-9_]+', "?v=$Token"
      if ($c2 -ne $c) {
        Set-Content -Path $fp -Value $c2 -Encoding UTF8 -NoNewline
        $Report.Add("BUST  " + $rel + " -> ?v=" + $Token + " (fallback)")
      } else {
        $Report.Add("SKIP  " + $rel + " - nessuna modifica cache")
      }
    }
  }
}

Set-Content -Path (Join-Path $ImgRoot ".cache-bust") -Value $Token -Encoding ASCII

Write-Host ""
Write-Host "=== REPORT ==="
foreach ($r in $Report) { Write-Host $r }
Write-Host ""
Write-Host ("Fatto. Token: " + $Token)
Write-Host "Ricarica il browser con Ctrl+F5"
