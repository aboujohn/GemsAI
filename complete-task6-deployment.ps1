#!/usr/bin/env pwsh

Write-Host "🚀 GemsAI Task 6 - Database Schema Deployment" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (!(Test-Path ".taskmaster") -or !(Test-Path "docs/supabase")) {
    Write-Host "❌ Error: Please run this script from the GemsAI root directory" -ForegroundColor Red
    Write-Host "Current directory: $(Get-Location)" -ForegroundColor Yellow
    exit 1
}

# Check if Node.js is available
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js not found. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if @supabase/supabase-js is installed
if (!(Test-Path "node_modules/@supabase/supabase-js")) {
    Write-Host "📦 Installing @supabase/supabase-js..." -ForegroundColor Yellow
    npm install @supabase/supabase-js
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install @supabase/supabase-js" -ForegroundColor Red
        exit 1
    }
}

Write-Host "🔑 Supabase Service Role Key Setup" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "To deploy the database schema, you need your Supabase Service Role Key." -ForegroundColor White
Write-Host ""
Write-Host "📋 Steps to get your Service Role Key:" -ForegroundColor Yellow
Write-Host "1. Go to: https://supabase.com/dashboard/project/lpyyznmdheipnenrytte/settings/api" -ForegroundColor White
Write-Host "2. Find the 'Service Role' section" -ForegroundColor White
Write-Host "3. Copy the 'service_role' key (starts with 'eyJ...')" -ForegroundColor White
Write-Host "4. Paste it below when prompted" -ForegroundColor White
Write-Host ""

# Prompt for service role key
do {
    $serviceRoleKey = Read-Host "📝 Please enter your Supabase Service Role Key"
    
    if ([string]::IsNullOrWhiteSpace($serviceRoleKey)) {
        Write-Host "⚠️  Service Role Key cannot be empty. Please try again." -ForegroundColor Yellow
    }
    elseif (!$serviceRoleKey.StartsWith("eyJ")) {
        Write-Host "⚠️  Service Role Key should start with 'eyJ'. Please check and try again." -ForegroundColor Yellow
        $serviceRoleKey = $null
    }
} while ([string]::IsNullOrWhiteSpace($serviceRoleKey))

# Create .env file with the service role key
Write-Host ""
Write-Host "📄 Creating environment configuration..." -ForegroundColor Yellow

$envContent = @"
# Supabase Configuration for Deployment
SUPABASE_URL=https://lpyyznmdheipnenrytte.supabase.co
SUPABASE_SERVICE_ROLE_KEY=$serviceRoleKey
"@

$envContent | Out-File -FilePath ".env" -Encoding UTF8
Write-Host "✅ Environment file created" -ForegroundColor Green

# Test the deployment script
Write-Host ""
Write-Host "🧪 Testing Supabase connection..." -ForegroundColor Yellow

try {
    $testResult = node -e "
        require('dotenv').config();
        const { createClient } = require('@supabase/supabase-js');
        const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
        
        supabase.from('information_schema.tables').select('table_name').limit(1)
            .then(({ data, error }) => {
                if (error) {
                    console.log('CONNECTION_ERROR: ' + error.message);
                } else {
                    console.log('CONNECTION_SUCCESS');
                }
            })
            .catch(err => console.log('CONNECTION_ERROR: ' + err.message));
    " 2>&1

    if ($testResult -match "CONNECTION_SUCCESS") {
        Write-Host "✅ Supabase connection successful!" -ForegroundColor Green
    } else {
        Write-Host "❌ Connection failed: $testResult" -ForegroundColor Red
        Write-Host "Please check your Service Role Key and try again." -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Error testing connection: $_" -ForegroundColor Red
    exit 1
}

# Install dotenv if needed
if (!(Test-Path "node_modules/dotenv")) {
    Write-Host "📦 Installing dotenv..." -ForegroundColor Yellow
    npm install dotenv
}

Write-Host ""
Write-Host "🚀 Starting Database Schema Deployment" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Run the deployment
try {
    Write-Host "📁 Deploying SQL files in order..." -ForegroundColor Yellow
    
    # Update the deployment script to use dotenv
    $deployContent = Get-Content "deploy-final.js" -Raw
    $deployContent = "require('dotenv').config();`n" + $deployContent
    $deployContent | Out-File -FilePath "deploy-final-with-env.js" -Encoding UTF8
    
    node deploy-final-with-env.js
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "🎉 Database Schema Deployment Completed!" -ForegroundColor Green
        Write-Host "=======================================" -ForegroundColor Green
        Write-Host ""
        Write-Host "✅ Task 6 is now complete!" -ForegroundColor Green
        Write-Host "📊 Your GemsAI database schema has been deployed to Supabase" -ForegroundColor White
        Write-Host ""
        Write-Host "🔗 Next Steps:" -ForegroundColor Cyan
        Write-Host "1. Check your Supabase dashboard to see the tables" -ForegroundColor White
        Write-Host "2. Test the database connections in your application" -ForegroundColor White
        Write-Host "3. Review the seed data that was added" -ForegroundColor White
        Write-Host ""
        Write-Host "🎯 You can now proceed to the next task in your project!" -ForegroundColor Green
    } else {
        Write-Host "❌ Deployment failed. Check the output above for details." -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Error during deployment: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clean up temporary files
    if (Test-Path "deploy-final-with-env.js") {
        Remove-Item "deploy-final-with-env.js" -Force
    }
}

Write-Host ""
Write-Host "🧹 Cleaning up temporary files..." -ForegroundColor Yellow

# Update task status using TaskMaster
Write-Host ""
Write-Host "📝 Updating TaskMaster status..." -ForegroundColor Yellow

try {
    npx task-master-ai set-status --id=6 --status=done
    Write-Host "✅ Task 6 marked as complete in TaskMaster!" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not update TaskMaster status automatically" -ForegroundColor Yellow
    Write-Host "You can manually mark Task 6 as done later" -ForegroundColor White
}

Write-Host ""
Write-Host "🎊 All done! Task 6 completed successfully." -ForegroundColor Green 