# RESILIHEALTH AI - One-Click Demonstration Launch Script
# Starts FastAPI Backend (Port 8000) and Vite React Frontend (Port 5173)

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  RESILIHEALTH AI: Federated Healthcare Decision Platform   " -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Starting Backend on http://localhost:8000..." -ForegroundColor Green
$BackendJob = Start-Job -ScriptBlock {
    Set-Location -Path $using:PWD\backend
    $env:PYTHONPATH = "backend"
    python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
}

Write-Host "Starting Frontend on http://localhost:5173..." -ForegroundColor Green
$FrontendJob = Start-Job -ScriptBlock {
    Set-Location -Path $using:PWD\frontend
    npm run dev -- --host
}

Start-Sleep -Seconds 3

Write-Host "`nResiliHealth AI Services Running:" -ForegroundColor Green
Write-Host "  - Frontend Command Center: http://localhost:5173" -ForegroundColor White
Write-Host "  - Backend REST API:        http://localhost:8000" -ForegroundColor White
Write-Host "  - OpenAPI Interactive Docs:http://localhost:8000/docs" -ForegroundColor White
Write-Host "`nPress Ctrl+C or run 'Stop-Job *; Remove-Job *' to terminate demo processes.`n" -ForegroundColor Yellow

try {
    # Keep alive loop and monitor process health
    while ($true) {
        if ($BackendJob.State -ne 'Running') {
            Write-Host "`nBackend process terminated." -ForegroundColor Red
            Receive-Job -Job $BackendJob
            break
        }
        if ($FrontendJob.State -ne 'Running') {
            Write-Host "`nFrontend process terminated." -ForegroundColor Red
            Receive-Job -Job $FrontendJob
            break
        }
        Start-Sleep -Seconds 3
    }
}
finally {
    Write-Host "`nCleaning up background processes..." -ForegroundColor Yellow
    Stop-Job $BackendJob, $FrontendJob -ErrorAction SilentlyContinue
    Remove-Job $BackendJob, $FrontendJob -ErrorAction SilentlyContinue
    Write-Host "ResiliHealth demo background processes stopped.`n" -ForegroundColor Green
}
