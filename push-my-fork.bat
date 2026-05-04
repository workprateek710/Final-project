@echo off
REM 1) Create this EMPTY repo on GitHub (same name): https://github.com/new?name=cpsc-597-final-project
REM    Use account: workprateek710 (the one your Git credential uses).
REM 2) Then run this file, or: git push -u origin main

cd /d "%~dp0"
where git >nul 2>&1
if errorlevel 1 (
  echo Git not found. Install Git for Windows, then re-run.
  exit /b 1
)
echo Opening GitHub "new repository" page...
start "" "https://github.com/new?name=cpsc-597-final-project"
echo.
echo After you click "Create repository" on GitHub, press any key to push...
pause >nul
git push -u origin main
if errorlevel 1 (
  echo Push failed. Check: repo name is exactly cpsc-597-final-project under work710, and you are logged in.
  exit /b 1
)
echo Done.
exit /b 0
