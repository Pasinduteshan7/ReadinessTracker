# GitHub Readiness Tracker - Complete Shutdown Script (PowerShell)
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Stopping All GitHub Readiness Tracker Services" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$ports = @(8080, 5173, 5174, 8000, 8001)
$serviceNames = @{
    8080 = "Spring Boot Backend"
    5173 = "Main Frontend (React)"
    5174 = "Employability Frontend (React)"
    8000 = "AI Engine (FastAPI)"
    8001 = "Employability Backend (FastAPI)"
}

Write-Host "Checking and stopping active network services..." -ForegroundColor Yellow

foreach ($port in $ports) {
    try {
        $conns = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
        if ($conns) {
            $pids = $conns.OwningProcess | Select-Object -Unique | Where-Object { $_ -gt 0 -and $_ -ne $PID }
            foreach ($p in $pids) {
                try {
                    Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
                    Write-Host "  [OK] Stopped $($serviceNames[$port]) (Port $port, PID $p)" -ForegroundColor Green
                } catch {
                    Write-Host "  [!] Could not stop PID $p on Port $port" -ForegroundColor Red
                }
            }
        } else {
            Write-Host "  [--] No running service on Port $port ($($serviceNames[$port]))" -ForegroundColor DarkGray
        }
    } catch {
        # Fallback if Get-NetTCPConnection encounters unexpected issue
    }
}

Write-Host ""
Write-Host "Closing service console windows..." -ForegroundColor Yellow

$titles = @(
    "AI Engine",
    "Backend",
    "Frontend",
    "Employability Backend",
    "Employability Frontend",
    "Industry Demand Scraper"
)

foreach ($title in $titles) {
    try {
        $matching = Get-Process | Where-Object { $_.MainWindowTitle -match $title }
        if ($matching) {
            foreach ($m in $matching) {
                try {
                    Stop-Process -Id $m.Id -Force -ErrorAction SilentlyContinue
                    Write-Host "  [OK] Closed console window: '$title'" -ForegroundColor Green
                } catch {}
            }
        }
    } catch {}
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  All services have been stopped successfully." -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
