$port = 8000
$backendDir = Join-Path $PSScriptRoot "..\..\backend-xnamai"
$uvicorn = Join-Path $backendDir "venv\Scripts\uvicorn.exe"

if (-not (Test-Path $uvicorn)) {
    Write-Host "Backend nao encontrado em: $backendDir" -ForegroundColor Red
    Write-Host "Crie o venv: cd backend-xnamai; python -m venv venv; pip install -r requirements.txt"
    exit 1
}

$inUse = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($inUse) {
    $processId = $inUse[0].OwningProcess
    $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
    Write-Host ""
    Write-Host "Backend JA ESTA RODANDO na porta $port." -ForegroundColor Green
    Write-Host "  http://localhost:$port" -ForegroundColor Green
    if ($proc) { Write-Host "  Processo: $($proc.ProcessName) (PID $processId)" -ForegroundColor DarkGray }
    Write-Host ""
    Write-Host "Nao precisa rodar npm run backend de novo." -ForegroundColor Yellow
    Write-Host "Para reiniciar: npm run backend:restart" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

Set-Location $backendDir
Write-Host "Iniciando backend em http://localhost:$port ..." -ForegroundColor Green
& $uvicorn main:app --reload --port $port
