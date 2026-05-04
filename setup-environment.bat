@echo off
echo Setting up E-commerce Application Environment...
echo.

echo Step 1: Installing Node.js dependencies...
cd ecommerce-nextjs-main
call npm install
echo.

echo Step 2: Installing Python dependencies...
cd ..
call pip install -r ecommerce-nextjs-main\requirements.txt
echo.

echo Step 3: Creating environment configuration...
echo # MongoDB Configuration > ecommerce-nextjs-main\.env.local
echo MONGODB_URI=mongodb://localhost:27017/ecommerce-nextjs >> ecommerce-nextjs-main\.env.local
echo. >> ecommerce-nextjs-main\.env.local
echo # NextAuth Configuration >> ecommerce-nextjs-main\.env.local
echo NEXTAUTH_URL=http://localhost:3000 >> ecommerce-nextjs-main\.env.local
echo NEXTAUTH_SECRET=your-nextauth-secret-key-here-change-in-production >> ecommerce-nextjs-main\.env.local
echo. >> ecommerce-nextjs-main\.env.local
echo # Python Recommendation Server >> ecommerce-nextjs-main\.env.local
echo RECOMMENDATION_SERVER_URL=http://127.0.0.1:5000 >> ecommerce-nextjs-main\.env.local
echo.

echo Step 4: Starting Python Recommendation Server...
start "Python Server" cmd /k "cd ecommerce-nextjs-main && python app.py"
echo.

echo Step 5: Starting Next.js Application...
start "Next.js App" cmd /k "cd ecommerce-nextjs-main && npm run dev"
echo.

echo Setup complete! The application should be running on:
echo - Next.js Frontend: http://localhost:3000
echo - Python Recommendation API: http://localhost:5000
echo.
echo Note: Make sure MongoDB is running on your system.
pause
