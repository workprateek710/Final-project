@echo off
echo Starting E-commerce Application Services...
echo.

echo Stopping any existing processes...
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo Starting Python Recommendation Server...
start "Python Server" cmd /k "cd /d %~dp0ecommerce-nextjs-main && python app.py"
timeout /t 5 /nobreak >nul

echo Starting Next.js Application...
start "Next.js App" cmd /k "cd /d %~dp0ecommerce-nextjs-main && npm run dev"
timeout /t 10 /nobreak >nul

echo.
echo All services are starting up...
echo.
echo Services will be available at:
echo - Next.js Frontend: http://localhost:3000
echo - Python Recommendation API: http://localhost:5000
echo.
echo Press any key to exit...
pause >nul
