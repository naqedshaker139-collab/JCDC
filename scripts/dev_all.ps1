Param(
    [switch] $Install
)

$ErrorActionPreference = "Stop"
$SCRIPT_DIR = $PSScriptRoot

Write-Host "=== Step 1: Build and copy frontend ===" -ForegroundColor Cyan
& (Join-Path $SCRIPT_DIR "rebuild_frontend.ps1") @PSBoundParameters

Write-Host "`n=== Step 2: Start backend ===" -ForegroundColor Cyan
& (Join-Path $SCRIPT_DIR "serve_backend.ps1")
