param(
  [string]$ProjectId = "mobiliza-educa"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$IsWindowsHost = ($env:OS -eq "Windows_NT")
$NpmCmd = if ($IsWindowsHost) { "npm.cmd" } else { "npm" }
$FirebaseCmd = if ($IsWindowsHost) { "firebase.cmd" } else { "firebase" }

function Require-Command($name, $hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: '$name' nao foi encontrado." -ForegroundColor Red
    Write-Host $hint -ForegroundColor Yellow
    exit 1
  }
}

Require-Command "node" "Instale o Node.js."
Require-Command $NpmCmd "O npm e instalado junto com o Node.js."
Require-Command $FirebaseCmd "Instale o Firebase CLI."
Require-Command "java" "O Firestore Emulator precisa de Java. No Windows, instale um JDK LTS, por exemplo: winget install EclipseAdoptium.Temurin.21.JDK"

if (-not (Test-Path "firebase/functions/node_modules")) {
  Write-Host "Instalando dependencias das Functions..." -ForegroundColor Cyan
  & $NpmCmd ci --prefix "firebase/functions"
  if ($LASTEXITCODE -ne 0) { throw "Falha ao instalar dependencias." }
}

$keyFile = Join-Path $Root "firebase\emulator-bootstrap-key.local.txt"
$secretLocal = Join-Path $Root "firebase\functions\.secret.local"

if (Test-Path $keyFile) {
  $BootstrapKey = (Get-Content $keyFile -Raw).Trim()
  if ([string]::IsNullOrWhiteSpace($BootstrapKey)) {
    throw "A chave local do emulator esta vazia."
  }
} else {
  $bytes = New-Object byte[] 36
  [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
  $BootstrapKey = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
  [System.IO.File]::WriteAllText($keyFile, $BootstrapKey, [System.Text.Encoding]::UTF8)
}

[System.IO.File]::WriteAllText(
  $secretLocal,
  "PLATFORM_BOOTSTRAP_KEY=$BootstrapKey",
  [System.Text.Encoding]::UTF8
)

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " MOBILIZA EDUCA - FIREBASE EMULATOR SUITE" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Projeto local: $ProjectId"
Write-Host "Site local:       http://127.0.0.1:5000/?emulator=1"
Write-Host "Emulator UI:      http://127.0.0.1:4000"
Write-Host "Authentication:   http://127.0.0.1:9099"
Write-Host "Firestore:        http://127.0.0.1:8080"
Write-Host "Cloud Functions:  http://127.0.0.1:5001"
Write-Host ""
Write-Host "A chave de bootstrap local foi preparada sem ser exibida." -ForegroundColor Green
Write-Host "Mantenha esta janela aberta enquanto estiver testando." -ForegroundColor Yellow
Write-Host "Para encerrar os emuladores, pressione Ctrl+C." -ForegroundColor Yellow
Write-Host ""

& $FirebaseCmd emulators:start --config firebase.emulator.json --only auth,firestore,functions,hosting --project $ProjectId
if ($LASTEXITCODE -ne 0) {
  throw "Firebase Emulator Suite encerrou com erro (codigo $LASTEXITCODE)."
}
