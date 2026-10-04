param(
  [string]$ProjectId = "mobiliza-educa"
)

$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $Root

function Find-Java {
  $cmd = Get-Command java -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $bases = @("C:\Program Files\Eclipse Adoptium","C:\Program Files\Java")
  foreach ($base in $bases) {
    if (-not (Test-Path $base)) { continue }
    $java = Get-ChildItem $base -Recurse -Filter java.exe -ErrorAction SilentlyContinue |
      Where-Object { $_.FullName -match "\\bin\\java\.exe$" } |
      Sort-Object FullName -Descending | Select-Object -First 1
    if ($java) {
      $bin = Split-Path -Parent $java.FullName
      $home = Split-Path -Parent $bin
      $env:JAVA_HOME = $home
      $env:Path = "$bin;$env:Path"
      return $java.FullName
    }
  }
  throw "Java nao encontrado. Instale o Temurin JDK 21."
}

function Require-Command($name,$hint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) { throw "'$name' nao encontrado. $hint" }
}

function Test-TcpPort([int]$Port) {
  $client = New-Object System.Net.Sockets.TcpClient
  try {
    $task = $client.ConnectAsync("127.0.0.1",$Port)
    if (-not $task.Wait(350)) { return $false }
    return $client.Connected
  } catch { return $false } finally { $client.Dispose() }
}

function Test-Http([string]$Url) {
  try {
    $r = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
    return ($r.StatusCode -ge 200 -and $r.StatusCode -lt 500)
  } catch { return $false }
}

if ($env:OS -ne "Windows_NT") { throw "Este inicializador foi preparado para Windows." }
$FirebaseCmd = "firebase.cmd"
$NpmCmd = "npm.cmd"
Require-Command "node" "Instale o Node.js."
Require-Command $NpmCmd "O npm acompanha o Node.js."
Require-Command $FirebaseCmd "Instale com npm.cmd install -g firebase-tools."
$javaPath = Find-Java

$pidFile = Join-Path $Root "firebase\emulator-shell.pid"
$siteUrl = "http://127.0.0.1:5000/?emulator=1"
$uiUrl = "http://127.0.0.1:4000"
$requiredPorts = @(4000,5000,5001,8080,9099)

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " MOBILIZA EDUCA - INICIALIZADOR LOCAL" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host "Java: $javaPath" -ForegroundColor DarkGray
Write-Host ""

if ((Test-Http "http://127.0.0.1:5000/") -and (Test-TcpPort 5001) -and (Test-TcpPort 8080) -and (Test-TcpPort 9099)) {
  Write-Host "Ambiente Firebase local ja esta ativo." -ForegroundColor Green
  Start-Process $siteUrl
  exit 0
}

if (Test-Path $pidFile) {
  $oldPid = 0
  [void][int]::TryParse((Get-Content $pidFile -Raw).Trim(),[ref]$oldPid)
  if ($oldPid -gt 0) {
    $oldProc = Get-Process -Id $oldPid -ErrorAction SilentlyContinue
    if (-not $oldProc) { Remove-Item $pidFile -Force -ErrorAction SilentlyContinue }
  }
}

$busy = @($requiredPorts | Where-Object { Test-TcpPort $_ })
if ($busy.Count -gt 0) {
  Write-Host "Portas ocupadas: $($busy -join ', ')." -ForegroundColor Yellow
  $stopped = $false
  if (Test-Path $pidFile) {
    $shellPid = 0
    [void][int]::TryParse((Get-Content $pidFile -Raw).Trim(),[ref]$shellPid)
    if ($shellPid -gt 0 -and (Get-Process -Id $shellPid -ErrorAction SilentlyContinue)) {
      & taskkill.exe /PID $shellPid /T /F | Out-Null
      Start-Sleep -Seconds 2
      $stopped = $true
    }
    Remove-Item $pidFile -Force -ErrorAction SilentlyContinue
  }
  if (-not $stopped) {
    $details = @()
    foreach ($port in $busy) {
      try {
        $conn = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction Stop | Select-Object -First 1
        $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
        $details += "porta $port -> PID $($conn.OwningProcess) ($($proc.ProcessName))"
      } catch { $details += "porta $port -> processo nao identificado" }
    }
    throw "Portas necessarias ocupadas por outro processo: $($details -join '; '). Feche o programa indicado e execute novamente."
  }
}

$emulatorScript = Join-Path $Root "firebase\emulator-start.ps1"
if (-not (Test-Path $emulatorScript)) { throw "Arquivo nao encontrado: $emulatorScript" }

Write-Host "Iniciando Firebase Emulator Suite em uma janela separada..." -ForegroundColor Cyan
$args = @("-NoExit","-NoProfile","-ExecutionPolicy","Bypass","-File",$emulatorScript,"-ProjectId",$ProjectId)
$proc = Start-Process -FilePath "powershell.exe" -ArgumentList $args -WorkingDirectory $Root -PassThru
Set-Content -Path $pidFile -Value $proc.Id -Encoding ASCII

Write-Host "Aguardando os servicos ficarem prontos..." -ForegroundColor Cyan
$deadline = (Get-Date).AddSeconds(120)
$ready = $false
while ((Get-Date) -lt $deadline) {
  $siteReady = Test-Http "http://127.0.0.1:5000/"
  $functionsReady = Test-TcpPort 5001
  $firestoreReady = Test-TcpPort 8080
  $authReady = Test-TcpPort 9099
  $uiReady = Test-TcpPort 4000
  if ($siteReady -and $functionsReady -and $firestoreReady -and $authReady -and $uiReady) { $ready = $true; break }
  if ($proc.HasExited) { throw "A janela dos emuladores encerrou antes de concluir. Verifique a janela aberta." }
  Start-Sleep -Seconds 2
}
if (-not $ready) { throw "Os emuladores nao ficaram prontos em 120 segundos. Verifique a janela Firebase Emulator Suite." }

Write-Host ""
Write-Host "====================================================" -ForegroundColor Green
Write-Host " AMBIENTE LOCAL PRONTO" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host "Mobiliza Educa: $siteUrl"
Write-Host "Emulator UI:    $uiUrl"
Write-Host ""
Write-Host "Abrindo o Mobiliza Educa..." -ForegroundColor Green
Start-Process $siteUrl
