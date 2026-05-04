@echo off
echo Starting E-commerce Application...
echo.

echo Starting Python Recommendation Server...
start "Python Server" cmd /k "cd ecommerce-nextjs-main && python app.py"
timeout /t 3 /nobreak > nul

echo Starting Next.js Application...
start "Next.js App" cmd /k "cd ecommerce-nextjs-main && npm run dev"
timeout /t 3 /nobreak > nul

echo.
echo All services are starting up...
echo.
echo Services will be available at:
echo - Next.js Frontend: http://localhost:3000
echo - Python Recommendation API: http://localhost:5000
echo.
echo Note: Make sure MongoDB is running on your system.
echo.
echo Press any key to exit...
pause > nul
