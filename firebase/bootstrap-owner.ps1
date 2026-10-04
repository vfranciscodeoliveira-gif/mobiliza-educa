param(
  [string]$OrganizationName = "Mobiliza Educa",
  [string]$Slug = ""
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

$localConfig = Join-Path $Root "firebase\web-config.local.json"
if (-not (Test-Path $localConfig)) {
  throw "Execute primeiro .\firebase\configurar-web-push.ps1"
}

$cfg = Get-Content $localConfig -Raw | ConvertFrom-Json
if ([string]::IsNullOrWhiteSpace($cfg.apiKey)) { throw "apiKey ausente na configuracao local." }
if ([string]::IsNullOrWhiteSpace($cfg.functionsBaseUrl)) { throw "functionsBaseUrl ausente." }

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " MOBILIZA EDUCA - BOOTSTRAP DO PROPRIETARIO" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Antes de continuar, crie o primeiro usuario em:" -ForegroundColor Yellow
Write-Host "Firebase Console > Authentication > Users > Add user"
Write-Host ""

$email = Read-Host "E-mail do proprietario"
$securePassword = Read-Host "Senha desse usuario" -AsSecureString
$bootstrapKey = Read-Host "Chave de bootstrap exibida pelo setup-mobiliza.ps1"

if ([string]::IsNullOrWhiteSpace($email)) { throw "E-mail obrigatorio." }
if ([string]::IsNullOrWhiteSpace($bootstrapKey)) { throw "Chave de bootstrap obrigatoria." }

$ptr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
  $password = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
} finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)
}

$authUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$($cfg.apiKey)"
$authBody = @{
  email = $email
  password = $password
  returnSecureToken = $true
} | ConvertTo-Json

try {
  $auth = Invoke-RestMethod -Method Post -Uri $authUrl -ContentType "application/json" -Body $authBody
} finally {
  $password = $null
}

if ([string]::IsNullOrWhiteSpace($auth.idToken)) {
  throw "Nao foi possivel obter o token do Firebase Authentication."
}

if ([string]::IsNullOrWhiteSpace($Slug)) {
  $Slug = ($OrganizationName.ToLowerInvariant() -replace '[^a-z0-9]+','-').Trim('-')
}

$bootstrapUrl = "$($cfg.functionsBaseUrl)/bootstrapPlatformOwner"
$headers = @{
  Authorization = "Bearer $($auth.idToken)"
  "x-bootstrap-key" = $bootstrapKey
}
$payload = @{
  name = $auth.email
  organizationName = $OrganizationName
  slug = $Slug
} | ConvertTo-Json

$result = Invoke-RestMethod -Method Post -Uri $bootstrapUrl -Headers $headers -ContentType "application/json" -Body $payload

if (-not $result.ok) { throw "Bootstrap nao concluido." }

Write-Host ""
Write-Host "PROPRIETARIO CRIADO COM SUCESSO" -ForegroundColor Green
Write-Host "Tenant ID: $($result.tenantId)"
Write-Host "Slug: $($result.slug)"
Write-Host "Usuario: $($result.email)"
Write-Host ""

$cloudFile = Join-Path $Root "js\cloudConfig.js"
if (Test-Path $cloudFile) {
  $txt = Get-Content $cloudFile -Raw
  $txt = [regex]::Replace($txt, "publicTenantSlug:'[^']*'", "publicTenantSlug:'$($result.slug)'")
  $txt | Set-Content -Path $cloudFile -Encoding UTF8
  Write-Host "cloudConfig.js atualizado com publicTenantSlug='$($result.slug)'." -ForegroundColor Green
}

Write-Host ""
Write-Host "Agora publique js/cloudConfig.js no GitHub." -ForegroundColor Cyan
Write-Host "A chave de bootstrap nao precisa mais ser usada no dia a dia." -ForegroundColor Yellow
