param(
  [string]$ProjectId = "mobiliza-educa"
)

$ErrorActionPreference = "Stop"
$base = "http://127.0.0.1:5001/$ProjectId/southamerica-east1"

Write-Host ""
Write-Host "Testando Functions + Firestore locais..." -ForegroundColor Cyan

try {
  $result = Invoke-RestMethod -Method Post -Uri "$base/planCatalog" -ContentType "application/json" -Body "{}"
} catch {
  Write-Host "Falha ao acessar o Emulator Suite." -ForegroundColor Red
  Write-Host "Confirme que .\firebase\emulator-start.ps1 esta aberto em outra janela." -ForegroundColor Yellow
  throw
}

if (-not $result.ok) {
  throw "planCatalog respondeu sem ok=true."
}

$count = @($result.plans).Count
if ($count -lt 4) {
  throw "Catalogo de planos incompleto. Recebidos: $count."
}

Write-Host "OK - Cloud Functions responderam." -ForegroundColor Green
Write-Host "OK - Firestore Emulator respondeu." -ForegroundColor Green
Write-Host "OK - $count planos SaaS foram carregados." -ForegroundColor Green
Write-Host ""
Write-Host "Smoke test local concluido com sucesso." -ForegroundColor Green
