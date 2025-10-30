$ErrorActionPreference = "Stop"

$ROOT = (Get-Item "..").FullName
$VENV = Join-Path $ROOT ".venv"
$PYTHON = Join-Path $VENV "Scripts\python.exe"
$MAIN = Join-Path $ROOT "main.py"

Write-Host "Project root: $ROOT"
Write-Host "Virtual env: $VENV"
Write-Host "Python executable: $PYTHON"

if (-not (Test-Path $PYTHON)) {
    throw "Python from venv not found at $PYTHON. Create venv first: python -m venv .venv"
}
if (-not (Test-Path $MAIN)) {
    throw "main.py not found at $MAIN"
}

Write-Host "`n==> Starting Flask backend (Ctrl+C to stop)"
& $PYTHON $MAIN
