$port = 8000
$backendDir = Join-Path $PSScriptRoot "..\..\backend-xnamai"
$uvicorn = Join-Path $backendDir "venv\Scripts\uvicorn.exe"

$stopped = @()
$attempts = 0
do {
    $inUse = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    if (-not $inUse) { break }

    foreach ($processId in ($inUse | Select-Object -ExpandProperty OwningProcess -Unique)) {
        if ($stopped -contains $processId) { continue }
        Write-Host "Parando processo na porta $port (PID $processId)..." -ForegroundColor Yellow
        taskkill /PID $processId /T /F 2>$null | Out-Null
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        $stopped += $processId
    }
    $attempts++
    Start-Sleep -Seconds 1
} while ($attempts -lt 8 -and (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue))

if (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
    Write-Host "Nao foi possivel liberar a porta $port. Feche o processo manualmente e tente de novo." -ForegroundColor Red
    exit 1
}

Set-Location $backendDir
Write-Host "Reiniciando backend em http://localhost:$port ..." -ForegroundColor Green
& $uvicorn main:app --reload --port $port
