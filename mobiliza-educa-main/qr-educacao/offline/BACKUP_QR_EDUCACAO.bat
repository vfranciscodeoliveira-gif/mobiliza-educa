@echo off
setlocal EnableExtensions
chcp 65001 >nul
cd /d "%~dp0"
title Backup - QR Educacao 360
echo ======================================
echo  BACKUP LOCAL QR EDUCACAO 360
echo ======================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -Command ^
 "$ErrorActionPreference='Stop'; $root=(Get-Location).Path; $destination=Join-Path $root ('backups\QR-'+(Get-Date -Format 'yyyyMMdd-HHmmss')); New-Item -ItemType Directory -Force -Path $destination|Out-Null; foreach($folder in @('actions','data')) { $source=Join-Path $root $folder; if(Test-Path $source) { Copy-Item -LiteralPath $source -Destination (Join-Path $destination $folder) -Recurse -Force } }; $files=Get-ChildItem -LiteralPath $destination -Recurse -File; if(-not $files) { throw 'Nenhum arquivo foi copiado' }; Write-Host ('Backup confirmado: '+$destination); Write-Host ('Arquivos copiados: '+$files.Count)"
if errorlevel 1 (
 echo.
 echo FALHA: confira as mensagens acima. Nenhum dado original foi excluido.
) else (
 echo.
 echo Backup concluido. Guarde tambem uma copia em pendrive ou HD externo.
)
pause
endlocal
