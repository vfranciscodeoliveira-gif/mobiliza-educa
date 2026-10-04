$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$pidFile = Join-Path $Root "firebase\emulator-shell.pid"
Write-Host ""
Write-Host "Encerrando ambiente local do Mobiliza Educa..." -ForegroundColor Cyan
if (-not (Test-Path $pidFile)) { Write-Host "Nenhuma sessao local registrada foi encontrada." -ForegroundColor Yellow; exit 0 }
$pidValue = 0
[void][int]::TryParse((Get-Content $pidFile -Raw).Trim(),[ref]$pidValue)
if ($pidValue -le 0) { Remove-Item $pidFile -Force -ErrorAction SilentlyContinue; Write-Host "PID invalido removido." -ForegroundColor Yellow; exit 0 }
$proc = Get-Process -Id $pidValue -ErrorAction SilentlyContinue
if (-not $proc) { Remove-Item $pidFile -Force -ErrorAction SilentlyContinue; Write-Host "A sessao ja estava encerrada." -ForegroundColor Yellow; exit 0 }
& taskkill.exe /PID $pidValue /T /F | Out-Null
Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
Write-Host "Ambiente local encerrado." -ForegroundColor Green
