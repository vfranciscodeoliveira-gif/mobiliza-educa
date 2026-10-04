param(
  [string]$ProjectId = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " MOBILIZA EDUCA - PREPARACAO FIREBASE SAAS" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

function Require-Command($name, $hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: '$name' nao foi encontrado." -ForegroundColor Red
    Write-Host $hint -ForegroundColor Yellow
    exit 1
  }
}

$IsWindowsHost = ($env:OS -eq "Windows_NT")
$NpmCmd = if ($IsWindowsHost) { "npm.cmd" } else { "npm" }
$FirebaseCmd = if ($IsWindowsHost) { "firebase.cmd" } else { "firebase" }

Require-Command "node" "Instale o Node.js LTS: https://nodejs.org/"
Require-Command $NpmCmd "O npm e instalado junto com o Node.js."

if (-not (Get-Command $FirebaseCmd -ErrorAction SilentlyContinue)) {
  Write-Host "Firebase CLI nao encontrado. Instalando..." -ForegroundColor Yellow
  & $NpmCmd install -g firebase-tools
}
Require-Command $FirebaseCmd "Instale o Firebase CLI com npm install -g firebase-tools."

if ([string]::IsNullOrWhiteSpace($ProjectId)) {
  $ProjectId = Read-Host "Project ID do Firebase"
}
if ([string]::IsNullOrWhiteSpace($ProjectId)) { throw "Project ID obrigatorio." }

Write-Host ""
Write-Host "1/5 - Login no Firebase" -ForegroundColor Cyan
& $FirebaseCmd login

Write-Host ""
Write-Host "2/5 - Gravando .firebaserc local" -ForegroundColor Cyan
@"
{
  "projects": {
    "default": "$ProjectId"
  }
}
"@ | Set-Content -Path ".firebaserc" -Encoding UTF8

Write-Host ""
Write-Host "3/5 - Instalando dependencias das Functions" -ForegroundColor Cyan
if (Test-Path "firebase/functions/package-lock.json") {
  & $NpmCmd ci --prefix "firebase/functions"
} else {
  & $NpmCmd install --prefix "firebase/functions"
}

Write-Host ""
Write-Host "4/5 - Validando backend localmente" -ForegroundColor Cyan
& $NpmCmd --prefix "firebase/functions" run check
node -e "require('./firebase/functions/index.js'); console.log('BACKEND FIREBASE CARREGADO OK')"

Write-Host ""
Write-Host "5/5 - Publicando regras/indices do Firestore" -ForegroundColor Cyan
& $FirebaseCmd deploy --only firestore --project $ProjectId

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host " PREPARACAO CONCLUIDA" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host "Project ID: $ProjectId"
Write-Host ""
Write-Host "Nenhuma Cloud Function foi publicada por este script." -ForegroundColor Yellow
Write-Host "Nenhuma chave secreta foi enviada ao Firebase." -ForegroundColor Yellow
Write-Host ""
Write-Host "PROXIMO PASSO:" -ForegroundColor Cyan
Write-Host "Quando o faturamento para Cloud Functions estiver conscientemente habilitado,"
Write-Host "execute .\firebase\deploy-functions.ps1 -ProjectId $ProjectId"
