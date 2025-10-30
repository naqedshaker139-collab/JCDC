Param(
    [switch] $Install
)

$ErrorActionPreference = "Stop"

$ROOT = (Get-Item "..").FullName
$FRONTEND = Join-Path $ROOT "equipment-management-frontend"
$STATIC = Join-Path $ROOT "static"

Write-Host "Project root: $ROOT"
Write-Host "Frontend: $FRONTEND"
Write-Host "Static: $STATIC"

if (-not (Test-Path $FRONTEND)) {
    throw "Frontend directory not found: $FRONTEND"
}

if (-not (Get-Command pnpm -ErrorAction SilentlyContinue)) {
    throw "pnpm is not installed or not on PATH. Install with: npm install -g pnpm"
}

if ($Install) {
    Write-Host "`n==> Installing frontend dependencies (pnpm install)"
    Push-Location $FRONTEND
    pnpm install
    Pop-Location
}

Write-Host "`n==> Building frontend (pnpm build)"
Push-Location $FRONTEND
pnpm build
Pop-Location

$DIST = Join-Path $FRONTEND "dist"
if (-not (Test-Path $DIST)) {
    throw "Build output not found: $DIST"
}

Write-Host "`n==> Cleaning static folder: $STATIC"
if (-not (Test-Path $STATIC)) {
    New-Item -ItemType Directory -Path $STATIC | Out-Null
}
Get-ChildItem $STATIC -Force -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue

Write-Host "==> Copying build output to static"
Copy-Item -Path (Join-Path $DIST "*") -Destination $STATIC -Recurse -Force

Write-Host "`n✅ Frontend built and copied to static." -ForegroundColor Green
