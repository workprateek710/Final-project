@echo off
echo Checking E-commerce Application Status...
echo.

echo Testing Python Recommendation Server (Port 5000)...
curl -s http://localhost:5000 > nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Python Server is running on http://localhost:5000
) else (
    echo ✗ Python Server is not responding on port 5000
)

echo.
echo Testing Next.js Application (Port 3000)...
curl -s http://localhost:3000 > nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Next.js App is running on http://localhost:3000
) else (
    echo ✗ Next.js App is not responding on port 3000
)

echo.
echo Testing Next.js API (GET /api/get_products)...
curl -s http://localhost:3000/api/get_products > nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Next.js API is responding
) else (
    echo ✗ Next.js API is not responding
)

echo.
echo Checking running processes...
tasklist | findstr /i "python.exe"
tasklist | findstr /i "node.exe"

echo.
echo Press any key to exit...
pause > nul
