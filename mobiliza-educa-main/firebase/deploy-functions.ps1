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

function Invoke-Native {
  param(
    [Parameter(Mandatory=$true)][string]$Command,
    [Parameter(Mandatory=$true)][string[]]$Arguments
  )
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Comando externo falhou (codigo $LASTEXITCODE): $Command $($Arguments -join ' ')"
  }
}

Require-Command "node" "Instale o Node.js."
Require-Command $NpmCmd "O npm e instalado junto com o Node.js."
Require-Command $FirebaseCmd "Instale o Firebase CLI."

if ([string]::IsNullOrWhiteSpace($ProjectId)) { throw "Project ID obrigatorio." }

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " MOBILIZA EDUCA - DEPLOY CLOUD FUNCTIONS" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "ATENCAO: Cloud Functions pode exigir o plano Blaze/faturamento habilitado." -ForegroundColor Yellow
Write-Host "Este script nao altera o plano automaticamente." -ForegroundColor Yellow
Write-Host ""

try {
  Write-Host "1/5 - Dependencias reproduziveis" -ForegroundColor Cyan
  if (Test-Path "firebase/functions/package-lock.json") {
    Invoke-Native $NpmCmd @("ci","--prefix","firebase/functions")
  } else {
    Invoke-Native $NpmCmd @("install","--prefix","firebase/functions")
  }

  Write-Host ""
  Write-Host "2/5 - Validacao sintatica" -ForegroundColor Cyan
  Invoke-Native $NpmCmd @("--prefix","firebase/functions","run","check")

  Write-Host ""
  Write-Host "3/5 - Teste de carregamento" -ForegroundColor Cyan
  Invoke-Native "node" @("-e","require('./firebase/functions/index.js'); console.log('BACKEND FIREBASE CARREGADO OK')")

  Write-Host ""
  Write-Host "4/5 - Preparando segredo de bootstrap" -ForegroundColor Cyan
  $keyFile = Join-Path $Root "firebase\bootstrap-key.local.txt"
  if (Test-Path $keyFile) {
    $BootstrapKey = (Get-Content $keyFile -Raw).Trim()
    if ([string]::IsNullOrWhiteSpace($BootstrapKey)) {
      throw "Arquivo de bootstrap existente esta vazio."
    }
    Write-Host "Chave local existente reutilizada (valor nao exibido)." -ForegroundColor Green
  } else {
    $bytes = New-Object byte[] 36
    [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
    $BootstrapKey = [Convert]::ToBase64String($bytes).TrimEnd('=').Replace('+','-').Replace('/','_')
    [System.IO.File]::WriteAllText($keyFile, $BootstrapKey, [System.Text.Encoding]::UTF8)
    Write-Host "Nova chave criada em firebase\bootstrap-key.local.txt (ignorada pelo Git)." -ForegroundColor Green
  }

  Write-Host "Enviando PLATFORM_BOOTSTRAP_KEY ao Secret Manager..." -ForegroundColor Cyan
  Invoke-Native $FirebaseCmd @("functions:secrets:set","PLATFORM_BOOTSTRAP_KEY","--project",$ProjectId,"--data-file",$keyFile)

  Write-Host ""
  Write-Host "5/5 - Publicando Cloud Functions" -ForegroundColor Cyan
  Invoke-Native $FirebaseCmd @("deploy","--only","functions","--project",$ProjectId)

  $baseUrl = "https://southamerica-east1-$ProjectId.cloudfunctions.net"

  Write-Host ""
  Write-Host "====================================================" -ForegroundColor Green
  Write-Host " CLOUD FUNCTIONS PUBLICADAS" -ForegroundColor Green
  Write-Host "====================================================" -ForegroundColor Green
  Write-Host "Functions URL: $baseUrl"
  Write-Host "A chave de bootstrap permanece somente no arquivo local ignorado pelo Git." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "PROXIMO PASSO:" -ForegroundColor Cyan
  Write-Host "Execute .\firebase\configurar-web-push.ps1 e depois .\firebase\bootstrap-owner.ps1"
}
catch {
  Write-Host ""
  Write-Host "====================================================" -ForegroundColor Red
  Write-Host " DEPLOY DE FUNCTIONS NAO CONCLUIDO" -ForegroundColor Red
  Write-Host "====================================================" -ForegroundColor Red
  Write-Host $_.Exception.Message -ForegroundColor Yellow
  Write-Host ""
  Write-Host "Nenhuma mensagem de sucesso deve ser considerada valida enquanto este erro existir." -ForegroundColor Yellow
  exit 1
}
