# Restart Spring Boot Backend (Port 8080)
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Restarting Spring Boot Backend (Port 8080)" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Stopping existing process on port 8080..." -ForegroundColor Yellow
$conns = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($conns) {
    $pids = $conns.OwningProcess | Select-Object -Unique | Where-Object { $_ -gt 0 -and $_ -ne $PID }
    foreach ($p in $pids) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
        Write-Host "  [OK] Killed process PID $p on port 8080" -ForegroundColor Green
    }
} else {
    Write-Host "  [--] Port 8080 is already clear." -ForegroundColor Gray
}

Write-Host "[2/3] Loading .env from readiness-tracker-backend..." -ForegroundColor Yellow
$backendDir = Join-Path $PSScriptRoot "readiness-tracker-backend"
Set-Location $backendDir

if (Test-Path ".env") {
    Get-Content ".env" | ForEach-Object {
        $line = $_.Trim()
        if ($line -and -not $line.StartsWith("#") -and $line -match '^([^=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [System.Environment]::SetEnvironmentVariable($name, $value, [System.EnvironmentVariableTarget]::Process)
        }
    }
    Write-Host "  [OK] Loaded database credentials from .env" -ForegroundColor Green
}

Write-Host "[3/3] Starting Spring Boot (bootRun)..." -ForegroundColor Yellow
Write-Host ""
.\gradlew.bat bootRun
