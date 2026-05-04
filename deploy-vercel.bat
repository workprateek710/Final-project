@echo off
REM Deploy Next.js app from ecommerce-nextjs-main (Vercel CLI).
REM First time: complete browser login when "vercel login" opens.
cd /d "%~dp0ecommerce-nextjs-main"
where npx >nul 2>&1
if errorlevel 1 (
  echo Node.js / npm not found. Install Node 18+, then re-run.
  exit /b 1
)
echo.
echo [1/2] Vercel login (skip if already logged in; Ctrl+C to cancel)...
call npx vercel login
if errorlevel 1 exit /b 1
echo.
echo [2/2] Production deploy...
call npx vercel --prod
if errorlevel 1 (
  echo.
  echo If this failed, use the dashboard instead: import GitHub repo and set Root Directory to ecommerce-nextjs-main
  exit /b 1
)
echo.
echo Done. Set env vars in Vercel: Project - Settings - Environment Variables (see VERCEL-DEPLOY.md).
exit /b 0
