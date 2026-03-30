#!/usr/bin/env pwsh

Write-Host "Starting Traccar Demo Environment..." -ForegroundColor Green
Write-Host ""

# Start mock server as a job
$mockJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node mock-server.js
}

# Wait for server to be ready
Write-Host "Waiting for mock server to start..." -ForegroundColor Yellow
$retries = 0
$maxRetries = 30
$started = $false

while ($retries -lt $maxRetries -and -not $started) {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:8082/api/server" -Method GET -ErrorAction Stop
        $started = $true
    } catch {
        Start-Sleep -Milliseconds 500
        $retries++
    }
}

if (-not $started) {
    Write-Host "Failed to start mock server" -ForegroundColor Red
    exit 1
}

Write-Host "Mock server running on http://localhost:8082" -ForegroundColor Green
Write-Host ""
Write-Host "   Demo Credentials:" -ForegroundColor Cyan
Write-Host "   Email: admin@example.com"
Write-Host "   Password: admin"
Write-Host ""
Write-Host "   Starting frontend..." -ForegroundColor Yellow
Write-Host ""

# Start frontend
npm run start

# Cleanup
Stop-Job $mockJob
Remove-Job $mockJob
