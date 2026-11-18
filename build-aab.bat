@echo off
echo ========================================================
echo   SWEET BLAST 3D - Automated Android AAB Builder
echo ========================================================
echo.

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 exit /b %errorlevel%

echo [2/4] Building production game bundle (dist/)...
call npm run build:android
if %errorlevel% neq 0 exit /b %errorlevel%

echo [3/4] Setting up Capacitor Android platform...
call npm install @capacitor/core @capacitor/cli @capacitor/android --no-save
if not exist "android" (
  call npx cap add android
)
call npx cap sync android

echo [4/4] Building Android App Bundle (.aab)...
cd android
call gradlew.bat bundleRelease
cd ..

echo.
echo ========================================================
echo   SUCCESS! Your AAB file is ready at:
echo   android\app\build\outputs\bundle\release\app-release.aab
echo ========================================================
pause
