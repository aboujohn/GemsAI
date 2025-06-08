# GemsAI Development Server with Memory Optimization
# This script runs the Next.js development server with optimized Node.js memory settings

Write-Host "Starting GemsAI Development Server with memory optimization..." -ForegroundColor Green

# Set Node.js memory options to prevent RangeError issues
$env:NODE_OPTIONS = "--max-old-space-size=4096 --max-semi-space-size=256"

# Clear any existing cache
Write-Host "Clearing cache..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force .next
    Write-Host "Cleared .next cache" -ForegroundColor Yellow
}

# Start the development server
Write-Host "Starting development server..." -ForegroundColor Green
npm run dev 