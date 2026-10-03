$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " MOBILIZA EDUCA - CONFIGURACAO WEB + FCM" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "No Console Firebase:" -ForegroundColor Yellow
Write-Host "1. Configuracoes do projeto > Geral > Seus apps > Web."
Write-Host "2. Copie os campos do firebaseConfig."
Write-Host "3. Cloud Messaging > Certificados de push da Web > gerar par de chaves."
Write-Host ""

$apiKey = Read-Host "apiKey"
$authDomain = Read-Host "authDomain"
$projectId = Read-Host "projectId"
$storageBucket = Read-Host "storageBucket"
$messagingSenderId = Read-Host "messagingSenderId"
$appId = Read-Host "appId"
$vapidKey = Read-Host "VAPID public key"

if ([string]::IsNullOrWhiteSpace($projectId)) { throw "projectId obrigatorio." }
if ([string]::IsNullOrWhiteSpace($apiKey)) { throw "apiKey obrigatoria." }
if ([string]::IsNullOrWhiteSpace($messagingSenderId)) { throw "messagingSenderId obrigatorio." }
if ([string]::IsNullOrWhiteSpace($appId)) { throw "appId obrigatorio." }
if ([string]::IsNullOrWhiteSpace($vapidKey)) { throw "VAPID key obrigatoria." }

$functionsBaseUrl = "https://southamerica-east1-$projectId.cloudfunctions.net"
$target = Join-Path $Root "js\cloudConfig.js"

$content = @"
// Configuracao publica do Mobiliza Educa Cloud.
// Estes valores identificam o app Web e nao incluem segredos privados.
// NUNCA coloque aqui GESTOR_PUSH_KEY ou chave de conta de servico.
export const cloudConfig=Object.freeze({
  enabled:true,
  functionsBaseUrl:'$functionsBaseUrl',
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

Write-Host ""
Write-Host "cloudConfig.js atualizado com sucesso." -ForegroundColor Green
Write-Host "Functions base URL: $functionsBaseUrl"
Write-Host ""
Write-Host "Agora publique js/cloudConfig.js no GitHub e aguarde o GitHub Pages." -ForegroundColor Cyan
Write-Host "Depois, no celular do gestor: abra o site > entre na Gestao > informe a chave do gestor > Ativar push."
