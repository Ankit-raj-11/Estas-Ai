@echo off
REM Automated Security Scanner - Windows Batch Test Script
REM Simple Windows CMD version for quick testing

setlocal enabledelayedexpansion

REM Configuration
if "%BASE_URL%"=="" set BASE_URL=http://localhost:3000
if "%KESTRA_URL%"=="" set KESTRA_URL=http://localhost:8080
if "%TEST_REPO%"=="" set TEST_REPO=https://github.com/octocat/Hello-World
if "%TEST_BRANCH%"=="" set TEST_BRANCH=master

REM Counters
set PASSED=0
set FAILED=0

echo ============================================================
echo   Automated Security Scanner - API Test Suite
echo ============================================================
echo.
echo Backend URL: %BASE_URL%
echo Kestra URL: %KESTRA_URL%
echo Test Repository: %TEST_REPO%
echo Test Branch: %TEST_BRANCH%
echo.

REM Check if curl is available
where curl >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] curl is not installed or not in PATH
    echo Please install curl from https://curl.se/windows/
    exit /b 1
)

REM Health Checks
echo ============================================================
echo   Health Checks
echo ============================================================
echo.

echo [INFO] Testing: Backend Server Health
curl -s -o nul -w "%%{http_code}" %BASE_URL%/ > temp_status.txt
set /p STATUS=<temp_status.txt
if "%STATUS%"=="200" (
    echo [PASS] Backend Server Health ^(Status: %STATUS%^)
    set /a PASSED+=1
) else (
    echo [FAIL] Backend Server Health ^(Status: %STATUS%^)
    set /a FAILED+=1
)

echo [INFO] Testing: Health Endpoint
curl -s -o nul -w "%%{http_code}" %BASE_URL%/api/health > temp_status.txt
set /p STATUS=<temp_status.txt
if "%STATUS%"=="200" (
    echo [PASS] Health Endpoint ^(Status: %STATUS%^)
    set /a PASSED+=1
) else (
    echo [FAIL] Health Endpoint ^(Status: %STATUS%^)
    set /a FAILED+=1
)

echo [INFO] Testing: Kestra Health
curl -s -o nul -w "%%{http_code}" %KESTRA_URL%/api/v1/health > temp_status.txt
set /p STATUS=<temp_status.txt
if "%STATUS%"=="200" (
    echo [PASS] Kestra Health ^(Status: %STATUS%^)
    set /a PASSED+=1
) else (
    echo [FAIL] Kestra Health ^(Status: %STATUS%^)
    set /a FAILED+=1
)

REM Scan Endpoints
echo.
echo ============================================================
echo   Scan Endpoints
echo ============================================================
echo.

echo [INFO] Testing: Initiate Scan - Invalid Data
curl -s -o nul -w "%%{http_code}" -X POST %BASE_URL%/api/scan -H "Content-Type: application/json" -d "{}" > temp_status.txt
set /p STATUS=<temp_status.txt
if "%STATUS%"=="400" (
    echo [PASS] Initiate Scan - Invalid Data ^(Status: %STATUS%^)
    set /a PASSED+=1
) else (
    echo [FAIL] Initiate Scan - Invalid Data ^(Expected: 400, Got: %STATUS%^)
    set /a FAILED+=1
)

echo [INFO] Testing: Initiate Scan - Valid Data
curl -s -X POST %BASE_URL%/api/scan -H "Content-Type: application/json" -d "{\"repoUrl\":\"%TEST_REPO%\",\"branch\":\"%TEST_BRANCH%\"}" > temp_response.txt
findstr /C:"scanId" temp_response.txt >nul
if %errorlevel% equ 0 (
    echo [PASS] Initiate Scan - Valid Data
    set /a PASSED+=1
    REM Extract scanId if needed
    for /f "tokens=2 delims=:," %%a in ('findstr /C:"scanId" temp_response.txt') do set SCAN_ID=%%a
    echo Scan ID: !SCAN_ID!
) else (
    echo [FAIL] Initiate Scan - Valid Data
    set /a FAILED+=1
)

REM GitHub Endpoints
echo.
echo ============================================================
echo   GitHub Endpoints
echo ============================================================
echo.

echo [INFO] Testing: Create Branch - Invalid Data
curl -s -o nul -w "%%{http_code}" -X POST %BASE_URL%/api/github/create-branch -H "Content-Type: application/json" -d "{}" > temp_status.txt
set /p STATUS=<temp_status.txt
if "%STATUS%"=="400" (
    echo [PASS] Create Branch - Invalid Data ^(Status: %STATUS%^)
    set /a PASSED+=1
) else (
    echo [FAIL] Create Branch - Invalid Data ^(Expected: 400, Got: %STATUS%^)
    set /a FAILED+=1
)

echo [INFO] Testing: Create PR - Invalid Data
curl -s -o nul -w "%%{http_code}" -X POST %BASE_URL%/api/github/create-pr -H "Content-Type: application/json" -d "{}" > temp_status.txt
set /p STATUS=<temp_status.txt
if "%STATUS%"=="400" (
    echo [PASS] Create PR - Invalid Data ^(Status: %STATUS%^)
    set /a PASSED+=1
) else (
    echo [FAIL] Create PR - Invalid Data ^(Expected: 400, Got: %STATUS%^)
    set /a FAILED+=1
)

REM Fix Endpoint
echo.
echo ============================================================
echo   Fix Endpoint
echo ============================================================
echo.

echo [INFO] Testing: Fix Issue - Invalid Data
curl -s -o nul -w "%%{http_code}" -X POST %BASE_URL%/api/scan/fix -H "Content-Type: application/json" -d "{}" > temp_status.txt
set /p STATUS=<temp_status.txt
if "%STATUS%"=="400" (
    echo [PASS] Fix Issue - Invalid Data ^(Status: %STATUS%^)
    set /a PASSED+=1
) else (
    echo [FAIL] Fix Issue - Invalid Data ^(Expected: 400, Got: %STATUS%^)
    set /a FAILED+=1
)

REM Webhook Endpoint
echo.
echo ============================================================
echo   Webhook Endpoint
echo ============================================================
echo.

echo [INFO] Testing: Kestra Webhook - Valid Data
curl -s -o nul -w "%%{http_code}" -X POST %BASE_URL%/api/webhooks/kestra -H "Content-Type: application/json" -d "{\"executionId\":\"test-exec\",\"status\":\"success\",\"scanId\":\"test-scan\"}" > temp_status.txt
set /p STATUS=<temp_status.txt
if "%STATUS%"=="200" (
    echo [PASS] Kestra Webhook - Valid Data ^(Status: %STATUS%^)
    set /a PASSED+=1
) else (
    echo [FAIL] Kestra Webhook - Valid Data ^(Expected: 200, Got: %STATUS%^)
    set /a FAILED+=1
)

REM Error Handling
echo.
echo ============================================================
echo   Error Handling
echo ============================================================
echo.

echo [INFO] Testing: 404 Not Found
curl -s -o nul -w "%%{http_code}" %BASE_URL%/api/non-existent-endpoint > temp_status.txt
set /p STATUS=<temp_status.txt
if "%STATUS%"=="404" (
    echo [PASS] 404 Not Found ^(Status: %STATUS%^)
    set /a PASSED+=1
) else (
    echo [FAIL] 404 Not Found ^(Expected: 404, Got: %STATUS%^)
    set /a FAILED+=1
)

REM Cleanup
del temp_status.txt >nul 2>nul
del temp_response.txt >nul 2>nul

REM Summary
echo.
echo ============================================================
echo   Test Summary
echo ============================================================
echo.

set /a TOTAL=%PASSED%+%FAILED%
echo Total Tests: %TOTAL%
echo Passed: %PASSED%
echo Failed: %FAILED%

if %FAILED% equ 0 (
    echo.
    echo [SUCCESS] All tests passed!
    exit /b 0
) else (
    echo.
    echo [ERROR] Some tests failed. Please review the errors above.
    exit /b 1
)
