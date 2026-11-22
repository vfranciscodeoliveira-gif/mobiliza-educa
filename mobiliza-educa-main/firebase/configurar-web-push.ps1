$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " MOBILIZA EDUCA - CONFIGURACAO WEB / AUTH / FCM" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "No Console Firebase:" -ForegroundColor Yellow
Write-Host "1. Configuracoes do projeto > Geral > Seus apps > Web."
Write-Host "2. Copie os campos do firebaseConfig."
Write-Host "3. Cloud Messaging > Certificados de push da Web > gere a VAPID key (pode deixar em branco por enquanto)."
Write-Host ""

$apiKey = Read-Host "apiKey"
$authDomain = Read-Host "authDomain"
$projectId = Read-Host "projectId"
$storageBucket = Read-Host "storageBucket"
$messagingSenderId = Read-Host "messagingSenderId"
$appId = Read-Host "appId"
$vapidKey = Read-Host "VAPID public key (opcional nesta etapa)"

if ([string]::IsNullOrWhiteSpace($projectId)) { throw "projectId obrigatorio." }
if ([string]::IsNullOrWhiteSpace($apiKey)) { throw "apiKey obrigatoria." }
if ([string]::IsNullOrWhiteSpace($authDomain)) { throw "authDomain obrigatorio." }
if ([string]::IsNullOrWhiteSpace($messagingSenderId)) { throw "messagingSenderId obrigatorio." }
if ([string]::IsNullOrWhiteSpace($appId)) { throw "appId obrigatorio." }

$functionsBaseUrl = "https://southamerica-east1-$projectId.cloudfunctions.net"
$target = Join-Path $Root "js\cloudConfig.js"
$localConfig = Join-Path $Root "firebase\web-config.local.json"

$content = @"
// Configuracao publica do Mobiliza Educa Cloud.
// Estes valores identificam o App Web Firebase e NAO sao segredos privados.
export const cloudConfig=Object.freeze({
  enabled:true,
  functionsBaseUrl:'$functionsBaseUrl',
  publicTenantSlug:'',
  firebaseWebConfig:{
    apiKey:'$apiKey',
    authDomain:'$authDomain',
    projectId:'$projectId',
    storageBucket:'$storageBucket',
    messagingSenderId:'$messagingSenderId',
    appId:'$appId'
  },
  vapidKey:'$vapidKey'
});
"@

$content | Set-Content -Path $target -Encoding UTF8

@{
  apiKey = $apiKey
  authDomain = $authDomain
  projectId = $projectId
  storageBucket = $storageBucket
  messagingSenderId = $messagingSenderId
  appId = $appId
  vapidKey = $vapidKey
  functionsBaseUrl = $functionsBaseUrl
} | ConvertTo-Json | Set-Content -Path $localConfig -Encoding UTF8

Write-Host ""
Write-Host "cloudConfig.js atualizado." -ForegroundColor Green
Write-Host "Configuracao local auxiliar gravada em firebase\web-config.local.json (ignorada pelo Git)." -ForegroundColor Green
Write-Host ""
Write-Host "PROXIMO PASSO:" -ForegroundColor Cyan
Write-Host "Execute .\firebase\bootstrap-owner.ps1"
