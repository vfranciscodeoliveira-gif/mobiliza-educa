param(
  [string]$ProjectId = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " MOBILIZA EDUCA - BACKEND FIREBASE SAAS" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

function Require-Command($name, $hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Host "ERRO: '$name' nao foi encontrado." -ForegroundColor Red
    Write-Host $hint -ForegroundColor Yellow
    exit 1
  }
}

Require-Command "node" "Instale o Node.js LTS: https://nodejs.org/"
Require-Command "npm"  "O npm e instalado junto com o Node.js."

if (-not (Get-Command "firebase" -ErrorAction SilentlyContinue)) {
  Write-Host "Firebase CLI nao encontrado. Instalando..." -ForegroundColor Yellow
  npm install -g firebase-tools
}

if ([string]::IsNullOrWhiteSpace($ProjectId)) {
  $ProjectId = Read-Host "Project ID do Firebase"
}
if ([string]::IsNullOrWhiteSpace($ProjectId)) { throw "Project ID obrigatorio." }

Write-Host ""
Write-Host "1/6 - Login no Firebase" -ForegroundColor Cyan
firebase login

Write-Host ""
Write-Host "2/6 - Gravando .firebaserc local" -ForegroundColor Cyan
@"
{
  "projects": {
    "default": "$ProjectId"
  }
}
"@ | Set-Content -Path ".firebaserc" -Encoding UTF8

Write-Host ""
Write-Host "3/6 - Instalando dependencias das Functions" -ForegroundColor Cyan
npm install --prefix "firebase/functions"

Write-Host ""
Write-Host "4/6 - Gerando chave de bootstrap da plataforma" -ForegroundColor Cyan
$bytes = New-Object byte[] 36
[System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$BootstrapKey = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
$tempSecret = Join-Path $env:TEMP "mobiliza-bootstrap-key.txt"
[System.IO.File]::WriteAllText($tempSecret, $BootstrapKey, [System.Text.Encoding]::UTF8)

try {
  firebase functions:secrets:set PLATFORM_BOOTSTRAP_KEY --project $ProjectId --data-file $tempSecret
} finally {
  Remove-Item $tempSecret -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "5/6 - Publicando regras/indices do Firestore" -ForegroundColor Cyan
firebase deploy --only firestore --project $ProjectId

Write-Host ""
Write-Host "6/6 - Publicando Cloud Functions" -ForegroundColor Cyan
Write-Host "OBS.: o deploy de Functions pode exigir conta de faturamento habilitada no Firebase/Google Cloud." -ForegroundColor Yellow
firebase deploy --only functions --project $ProjectId

$baseUrl = "https://southamerica-east1-$ProjectId.cloudfunctions.net"

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host " BACKEND BASE PUBLICADO" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host "Project ID: $ProjectId"
Write-Host "Functions URL: $baseUrl"
Write-Host ""
Write-Host "CHAVE DE BOOTSTRAP (use somente na configuracao inicial):" -ForegroundColor Yellow
Write-Host $BootstrapKey -ForegroundColor White
Write-Host ""
Write-Host "NAO coloque essa chave no GitHub." -ForegroundColor Red
Write-Host ""
Write-Host "PROXIMOS PASSOS:" -ForegroundColor Cyan
Write-Host "1. Console Firebase > Authentication > Sign-in method > habilitar Email/Senha."
Write-Host "2. Authentication > Users > criar o primeiro usuario proprietario."
Write-Host "3. Criar um App Web no Firebase."
Write-Host "4. Executar .\firebase\configurar-web-push.ps1"
Write-Host "5. Executar .\firebase\bootstrap-owner.ps1"
Write-Host ""
Write-Host "Cloud Storage pode ser ativado/deployado depois, quando formos migrar evidencias." -ForegroundColor Yellow
