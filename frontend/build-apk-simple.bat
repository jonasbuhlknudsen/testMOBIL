@echo off
echo ========================================
echo    🚀 NERDVAERKET SIMPLE BUILDER 🚀
echo ========================================
echo.
echo Dette er den simple version! 😊
echo.

echo 📂 Går til app mappe...
cd frontend

echo.
echo 📦 Installerer packages...
call npm install

echo.
echo 🔧 Installerer EAS CLI...
call npm install -g eas-cli

echo.
echo 🏗️  Bygger APK (dette tager tid!)...
call npx eas build --platform android --profile development --local --non-interactive

echo.
echo 🎉 Færdig! Se efter .apk filen i denne mappe!
pause