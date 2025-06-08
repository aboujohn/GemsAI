# GemsAI Supabase Database Deployment Script
# This script helps deploy the database schema with minimal manual work

param(
    [switch]$InstallCLI,
    [switch]$DeploySchema,
    [switch]$Help
)

function Show-Help {
    Write-Host "GemsAI Supabase Deployment Helper" -ForegroundColor Green
    Write-Host ""
    Write-Host "Usage:"
    Write-Host "  .\deploy-supabase.ps1 -InstallCLI    # Install Supabase CLI"
    Write-Host "  .\deploy-supabase.ps1 -DeploySchema  # Deploy database schema"
    Write-Host "  .\deploy-supabase.ps1 -Help          # Show this help"
    Write-Host ""
    Write-Host "Prerequisites:"
    Write-Host "  - .env.local file configured with Supabase credentials"
    Write-Host "  - Active internet connection"
    Write-Host ""
}

function Install-SupabaseCLI {
    Write-Host "Installing Supabase CLI..." -ForegroundColor Yellow
    
    # Check if scoop is installed
    if (!(Get-Command scoop -ErrorAction SilentlyContinue)) {
        Write-Host "Installing Scoop package manager first..." -ForegroundColor Yellow
        Set-ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
        Invoke-RestMethod get.scoop.sh | Invoke-Expression
        
        # Refresh PATH
        $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
    }
    
    # Install Supabase CLI
    scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
    scoop install supabase
    
    Write-Host "Supabase CLI installed successfully!" -ForegroundColor Green
    Write-Host "You can now run: .\deploy-supabase.ps1 -DeploySchema" -ForegroundColor Cyan
}

function Test-Environment {
    Write-Host "Checking environment configuration..." -ForegroundColor Yellow
    
    if (!(Test-Path ".env.local")) {
        Write-Host "ERROR: .env.local file not found!" -ForegroundColor Red
        Write-Host "Please create .env.local with your Supabase credentials." -ForegroundColor Red
        return $false
    }
    
    # Read env file and check for required variables
    $envContent = Get-Content ".env.local" -Raw
    $hasUrl = $envContent -match "NEXT_PUBLIC_SUPABASE_URL=https://"
    $hasKey = $envContent -match "NEXT_PUBLIC_SUPABASE_ANON_KEY="
    
    if (!$hasUrl -or !$hasKey) {
        Write-Host "ERROR: Missing required Supabase environment variables!" -ForegroundColor Red
        Write-Host "Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set." -ForegroundColor Red
        return $false
    }
    
    Write-Host "Environment configuration looks good!" -ForegroundColor Green
    return $true
}

function Deploy-DatabaseSchema {
    Write-Host "Starting database schema deployment..." -ForegroundColor Green
    
    if (!(Test-Environment)) {
        return
    }
    
    Write-Host ""
    Write-Host "Database DEPLOYMENT OPTIONS:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Option 1: Manual Deployment (Recommended for first time)"
    Write-Host "  1. Open: https://supabase.com/dashboard/project/lpyyznmdheipnenrytte"
    Write-Host "  2. Go to SQL Editor"
    Write-Host "  3. Follow the step-by-step guide in deploy-database.md"
    Write-Host ""
    Write-Host "Option 2: Command Line Deployment (Advanced)"
    Write-Host "  - Requires Supabase CLI authentication"
    Write-Host "  - Run: .\deploy-supabase.ps1 -InstallCLI first"
    Write-Host ""
    
    $choice = Read-Host "Choose deployment method (1 for Manual, 2 for CLI, Q to quit)"
    
    switch ($choice.ToLower()) {
        "1" {
            Write-Host ""
            Write-Host "MANUAL DEPLOYMENT STEPS:" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "1. Open your Supabase dashboard:"
            Write-Host "   https://supabase.com/dashboard/project/lpyyznmdheipnenrytte" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "2. Click 'SQL Editor' in the sidebar"
            Write-Host ""
            Write-Host "3. Copy and run these files in order:"
            Write-Host ""
            
            $files = @(
                "Extensions (see deploy-database.md)",
                "docs/supabase/001_create_i18n_schema.sql",
                "docs/supabase/002_create_core_tables.sql", 
                "docs/supabase/003_create_relationships_constraints.sql",
                "docs/supabase/004_create_security_policies.sql",
                "docs/supabase/005_performance_optimization.sql",
                "docs/supabase/008_seed_data.sql"
            )
            
            for ($i = 0; $i -lt $files.Length; $i++) {
                Write-Host "   Step $($i+1): $($files[$i])" -ForegroundColor White
            }
            
            Write-Host ""
            Write-Host "4. Verify deployment with:"
            Write-Host "   SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';" -ForegroundColor Gray
            Write-Host ""
            Write-Host "For detailed instructions, see: deploy-database.md" -ForegroundColor Green
        }
        
        "2" {
            if (!(Get-Command supabase -ErrorAction SilentlyContinue)) {
                Write-Host "Supabase CLI not found. Installing..." -ForegroundColor Yellow
                Install-SupabaseCLI
                return
            }
            
            Write-Host "Setting up CLI deployment..." -ForegroundColor Yellow
            Write-Host "You will need to authenticate with Supabase first:"
            Write-Host "supabase login" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Then link your project:"
            Write-Host "supabase link --project-ref lpyyznmdheipnenrytte" -ForegroundColor Cyan
        }
        
        default {
            Write-Host "Deployment cancelled." -ForegroundColor Yellow
        }
    }
}

function Show-Status {
    Write-Host "GemsAI Database Deployment Status" -ForegroundColor Green
    Write-Host ""
    
    # Check environment
    if (Test-Path ".env.local") {
        Write-Host "Environment file exists" -ForegroundColor Green
    } else {
        Write-Host "Environment file missing" -ForegroundColor Red
    }
    
    # Check SQL files
    $sqlFiles = @(
        "docs/supabase/001_create_i18n_schema.sql",
        "docs/supabase/002_create_core_tables.sql",
        "docs/supabase/003_create_relationships_constraints.sql",
        "docs/supabase/004_create_security_policies.sql",
        "docs/supabase/005_performance_optimization.sql",
        "docs/supabase/008_seed_data.sql"
    )
    
    $allFilesExist = $true
    foreach ($file in $sqlFiles) {
        if (Test-Path $file) {
            Write-Host "OK: $file" -ForegroundColor Green
        } else {
            Write-Host "MISSING: $file" -ForegroundColor Red
            $allFilesExist = $false
        }
    }
    
    if ($allFilesExist) {
        Write-Host ""
        Write-Host "Ready for deployment!" -ForegroundColor Cyan
        Write-Host "Run: .\deploy-supabase.ps1 -DeploySchema" -ForegroundColor White
    }
}

# Main execution
if ($Help) {
    Show-Help
} elseif ($InstallCLI) {
    Install-SupabaseCLI
} elseif ($DeploySchema) {
    Deploy-DatabaseSchema
} else {
    Show-Status
    Write-Host ""
    Write-Host "Run with -Help for usage information" -ForegroundColor Gray
} 