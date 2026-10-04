param(
  [string]$ProjectId = "mobiliza-educa",
  [string]$OrganizationName = "Mobiliza Educa",
  [string]$Slug = "mobiliza-educa",
  [string]$Email = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$keyFile = Join-Path $Root "firebase\emulator-bootstrap-key.local.txt"
if (-not (Test-Path $keyFile)) {
  throw "Execute primeiro .\firebase\emulator-start.ps1"
}

$bootstrapKey = (Get-Content $keyFile -Raw).Trim()
if ([string]::IsNullOrWhiteSpace($bootstrapKey)) {
  throw "Chave de bootstrap local ausente."
}

if ([string]::IsNullOrWhiteSpace($Email)) {
  $Email = Read-Host "E-mail do proprietario LOCAL"
}
if ([string]::IsNullOrWhiteSpace($Email)) { throw "E-mail obrigatorio." }

$securePassword = Read-Host "Senha LOCAL para o Firebase Auth Emulator" -AsSecureString
$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
  $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
}

$authBase = "http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts"
$signInUrl = "$($authBase):signInWithPassword?key=fake-api-key"
$signUpUrl = "$($authBase):signUp?key=fake-api-key"

$authBody = @{
  email = $Email
  password = $password
  returnSecureToken = $true
} | ConvertTo-Json

try {
  try {
    $auth = Invoke-RestMethod -Method Post -Uri $signInUrl -ContentType "application/json" -Body $authBody
    Write-Host "Usuario local existente autenticado." -ForegroundColor Green
  } catch {
    $auth = Invoke-RestMethod -Method Post -Uri $signUpUrl -ContentType "application/json" -Body $authBody
    Write-Host "Usuario local criado no Auth Emulator." -ForegroundColor Green
  }
} finally {
  $password = $null
}

if ([string]::IsNullOrWhiteSpace($auth.idToken)) {
  throw "Nao foi possivel obter token local do Firebase Authentication."
}

$functionsBase = "http://127.0.0.1:5001/$ProjectId/southamerica-east1"
$headers = @{
  Authorization = "Bearer $($auth.idToken)"
  "x-bootstrap-key" = $bootstrapKey
}
$payload = @{
  name = $Email
  organizationName = $OrganizationName
  slug = $Slug
} | ConvertTo-Json

$alreadyConfigured = $false
$result = $null

try {
  $result = Invoke-RestMethod -Method Post -Uri "$functionsBase/bootstrapPlatformOwner" -Headers $headers -ContentType "application/json" -Body $payload
} catch {
  $details = $_.ErrorDetails.Message
  if ($details -match "propriet.rio da plataforma j. foi configurado") {
    $alreadyConfigured = $true
    Write-Host "O proprietario local ja estava configurado nesta sessao. Validando o contexto existente..." -ForegroundColor Yellow
  } else {
    Write-Host "Nao foi possivel concluir o bootstrap local." -ForegroundColor Red
    throw
  }
}

if ($result -and -not $result.ok) { throw "Bootstrap local nao concluido." }

$me = Invoke-RestMethod -Method Post -Uri "$functionsBase/me" -Headers @{ Authorization = "Bearer $($auth.idToken)" } -ContentType "application/json" -Body "{}"

if ($alreadyConfigured -and -not $me.user.platformOwner) {
  throw "Ja existe um proprietario local, mas o usuario autenticado nao e o proprietario desta sessao."
}

$tenantId = if ($result) { $result.tenantId } elseif (@($me.memberships).Count -gt 0) { $me.memberships[0].tenantId } else { "" }
$tenantSlug = if ($result) { $result.slug } elseif (@($me.memberships).Count -gt 0) { $me.memberships[0].tenant.slug } else { "" }
$userEmail = if ($result) { $result.email } else { $me.user.email }

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host $(if ($alreadyConfigured) { " PROPRIETARIO LOCAL JA CONFIGURADO" } else { " BOOTSTRAP LOCAL CONCLUIDO" }) -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host "Tenant ID: $tenantId"
Write-Host "Slug:      $tenantSlug"
Write-Host "Usuario:   $userEmail"
Write-Host "Owner:     $($me.user.platformOwner)"
Write-Host "Tenants:   $(@($me.memberships).Count)"
Write-Host ""
Write-Host "Tudo ocorreu apenas nos emuladores locais; nenhum dado foi enviado ao Firebase de producao." -ForegroundColor Yellow
