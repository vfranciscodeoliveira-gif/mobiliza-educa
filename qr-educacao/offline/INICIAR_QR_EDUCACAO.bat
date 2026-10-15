@echo off
setlocal
chcp 65001 >nul
cd /d "%~dp0"
title Mobiliza Educa - QR Educacao 360

echo ====================================================
echo    MOBILIZA EDUCA - QR EDUCACAO 360 OFFLINE
echo ====================================================
echo.

if not exist "server.mjs" (
  echo ERRO: server.mjs nao encontrado nesta pasta.
  echo Copie este .bat para a pasta qr-educacao\offline.
  pause
  exit /b 1
)

where node >nul 2>&1
if errorlevel 1 (
  if exist "C:\Program Files\nodejs\node.exe" (
    set "PATH=C:\Program Files\nodejs;%PATH%"
  ) else (
    echo ERRO: Node.js nao encontrado. Instale a versao LTS.
    pause
    exit /b 1
  )
)

powershell.exe -NoProfile -Command ^
 "$ErrorActionPreference='Stop'; $env:HOST='0.0.0.0'; $env:PORT='8080'; $secret=Read-Host 'Digite a senha administrativa (ADMIN_TOKEN)' -AsSecureString; $ptr=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($secret); try { $env:ADMIN_TOKEN=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr) } finally { [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr) }; if ([string]::IsNullOrWhiteSpace($env:ADMIN_TOKEN)) { Write-Host 'ERRO: a senha nao pode estar vazia.'; exit 1 }; Write-Host ''; Write-Host 'Servidor iniciando. Mantenha esta janela aberta.'; Start-Process 'http://localhost:8080/admin'; & node '.\server.mjs'; exit $LASTEXITCODE"

if errorlevel 1 (
  echo.
  echo O servidor foi encerrado com erro. Confira as mensagens acima.
  pause
)
endlocal
