@echo off
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0firebase\iniciar-local.ps1"
if errorlevel 1 (
  echo.
  echo O ambiente nao iniciou corretamente. Veja a mensagem acima.
  pause
)
