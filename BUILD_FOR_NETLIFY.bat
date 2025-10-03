@echo off
echo ============================================
echo INFERA - Netlify Deployment Build Script
echo ============================================
echo.

cd frontend

echo [1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Error: npm install failed
    pause
    exit /b %errorlevel%
)

echo.
echo [2/3] Building production bundle...
call npm run build
if %errorlevel% neq 0 (
    echo Error: Build failed
    pause
    exit /b %errorlevel%
)

echo.
echo [3/3] Build completed successfully!
echo.
echo ============================================
echo Your production build is ready in: frontend\dist
echo ============================================
echo.
echo Next steps:
echo 1. Deploy to Netlify using one of these methods:
echo    - Drag and drop 'frontend\dist' folder to netlify.com
echo    - Run: netlify deploy --prod
echo    - Connect GitHub repo to Netlify
echo.
echo 2. Read NETLIFY_DEPLOY.md for detailed instructions
echo.
pause
