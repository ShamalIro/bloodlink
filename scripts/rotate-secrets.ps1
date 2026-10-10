# Rotates JWT_SECRET, INTERNAL_API_KEY and QR_SECRET in every service .env,
# and removes DEV_AUTO_VERIFY. Secrets are never printed.
# Run from the repo root:  .\scripts\rotate-secrets.ps1

$root = Split-Path -Parent $PSScriptRoot

function New-Secret {
  $bytes = New-Object byte[] 32
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  ($bytes | ForEach-Object { $_.ToString('x2') }) -join ''
}

$new = @{
  JWT_SECRET       = New-Secret
  INTERNAL_API_KEY = New-Secret
  QR_SECRET        = New-Secret
}

$utf8 = New-Object System.Text.UTF8Encoding($false)   # no BOM, so dotenv parses line 1 correctly
$files = Get-ChildItem (Join-Path $root 'services\*\.env')

foreach ($f in $files) {
  $changed = @()
  $lines = Get-Content $f.FullName | ForEach-Object {
    if ($_ -match '^\s*DEV_AUTO_VERIFY\s*=') { $changed += 'DEV_AUTO_VERIFY removed'; return }
    foreach ($k in $new.Keys) {
      if ($_ -match "^\s*$k\s*=") { $changed += "$k rotated"; return "$k=$($new[$k])" }
    }
    $_
  }
  [System.IO.File]::WriteAllLines($f.FullName, [string[]]$lines, $utf8)
  Write-Host ("{0}: {1}" -f $f.Directory.Name, ($changed -join ', '))
}

Write-Host "`nDone. Recreate the containers and log in again for new tokens."
