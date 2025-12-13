@echo off
REM Restart Kestra with GitHub Token
REM This script restarts Kestra to apply the new environment variable configuration

echo ================================================================
echo          Restarting Kestra with GitHub Token
echo ================================================================
echo.

REM Check if docker-compose is available
where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] docker-compose not found
    echo Please install docker-compose first
    exit /b 1
)

REM Navigate to docker directory
cd /d "%~dp0"

echo [INFO] Current directory: %CD%
echo.

REM Stop containers
echo [STOP] Stopping Kestra containers...
docker-compose down

if %errorlevel% neq 0 (
    echo [ERROR] Failed to stop containers
    exit /b 1
)

echo [OK] Containers stopped
echo.

REM Start containers
echo [START] Starting Kestra with new configuration...
docker-compose up -d

if %errorlevel% neq 0 (
    echo [ERROR] Failed to start containers
    exit /b 1
)

echo [OK] Containers started
echo.

REM Wait for Kestra to be ready
echo [WAIT] Waiting for Kestra to be ready...
timeout /t 5 /nobreak >nul

REM Check if Kestra is responding
set READY=0
for /L %%i in (1,1,30) do (
    curl -s http://localhost:8080/api/v1/health >nul 2>nul
    if !errorlevel! equ 0 (
        echo [OK] Kestra is ready!
        set READY=1
        goto :ready
    )
    echo    Waiting... (%%i/30)
    timeout /t 2 /nobreak >nul
)

:ready
if %READY% equ 0 (
    echo [WARN] Kestra may not be ready yet, but continuing...
)

echo.
echo ================================================================
echo                    Setup Complete!
echo ================================================================
echo.
echo Next steps:
echo 1. Open Kestra UI: http://localhost:8080/ui
echo 2. Update workflow: Flows -^> company.team -^> security-scan-flow
echo 3. Copy content from: backend\workflows\security-scan-workflow.yml
echo 4. Save the workflow
echo 5. Test: cd ..\backend ^&^& npm run test:api
echo.
echo View logs: docker-compose logs -f kestra
echo.

pause
