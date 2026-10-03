param(
  [string]$ProjectId = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host ""
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host " MOBILIZA EDUCA - ATIVACAO FIREBASE / PUSH" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""

function Require-Command($name, $installHint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: '$name' nao foi encontrado." -ForegroundColor Red
    Write-Host $installHint -ForegroundColor Yellow
    exit 1
  }
}

Require-Command "node" "Instale o Node.js LTS antes de continuar: https://nodejs.org/"
Require-Command "npm"  "O npm e instalado junto com o Node.js."

if (-not (Get-Command "firebase" -ErrorAction SilentlyContinue)) {
  Write-Host "Firebase CLI nao encontrado. Instalando..." -ForegroundColor Yellow
  npm install -g firebase-tools
}

if ([string]::IsNullOrWhiteSpace($ProjectId)) {
  $ProjectId = Read-Host "Informe o Project ID criado no Firebase (ex.: mobiliza-educa-pp)"
}
if ([string]::IsNullOrWhiteSpace($ProjectId)) {
  throw "Project ID obrigatorio."
}

Write-Host ""
Write-Host "1/5 - Login no Firebase" -ForegroundColor Cyan
firebase login

Write-Host ""
Write-Host "2/5 - Gravando projeto local" -ForegroundColor Cyan
@"
{
  "projects": {
    "default": "$ProjectId"
  }
}
"@ | Set-Content -Path ".firebaserc" -Encoding UTF8

Write-Host ""
Write-Host "3/5 - Instalando dependencias das Cloud Functions" -ForegroundColor Cyan
npm install --prefix "firebase/functions"

Write-Host ""
Write-Host "4/5 - Criando chave privada do gestor" -ForegroundColor Cyan
$bytes = New-Object byte[] 36
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$GestorKey = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
$tempSecret = Join-Path $env:TEMP "mobiliza-gestor-key.txt"
[System.IO.File]::WriteAllText($tempSecret, $GestorKey, [System.Text.Encoding]::UTF8)

try {
  firebase functions:secrets:set GESTOR_PUSH_KEY --project $ProjectId --data-file $tempSecret
} finally {
  Remove-Item $tempSecret -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "5/5 - Deploy de Functions e regras do Firestore" -ForegroundColor Cyan
Write-Host "Se o Firestore ainda nao existir, crie-o no Console Firebase em modo Producao" -ForegroundColor Yellow
Write-Host "e escolha uma regiao do Brasil antes de repetir este passo." -ForegroundColor Yellow
firebase deploy --only functions,firestore:rules --project $ProjectId

$baseUrl = "https://southamerica-east1-$ProjectId.cloudfunctions.net"

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host " BACKEND DEPLOYADO" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host "Project ID: $ProjectId"
Write-Host "Functions base URL: $baseUrl"
Write-Host ""
Write-Host "CHAVE DO GESTOR (guarde em local seguro):" -ForegroundColor Yellow
Write-Host $GestorKey -ForegroundColor White
Write-Host ""
Write-Host "PROXIMO PASSO:" -ForegroundColor Cyan
Write-Host "Execute: powershell -ExecutionPolicy Bypass -File .\firebase\configurar-web-push.ps1"
Write-Host ""
