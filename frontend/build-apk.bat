@echo off
echo ========================================
echo    🚀 NERDVAERKET APK BUILDER 🚀
echo ========================================
echo.
echo Hej! Jeg hjælper dig med at bygge din app! 😊
echo.
pause

echo ⚙️  Tjekker om Node.js er installeret...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ FEJL: Node.js er ikke installeret!
    echo.
    echo 📥 Download Node.js her: https://nodejs.org/
    echo    Vælg "LTS" versionen og installer den.
    echo    Genstart denne fil bagefter!
    pause
    exit /b 1
)
echo ✅ Node.js er installeret!

echo.
echo 📦 Installerer Expo CLI...
npm install -g @expo/cli
if %errorlevel% neq 0 (
    echo ❌ Kunne ikke installere Expo CLI
    pause
    exit /b 1
)
echo ✅ Expo CLI installeret!

echo.
echo 📂 Går til app mappe...
if not exist "frontend" (
    echo ❌ FEJL: 'frontend' mappe ikke fundet!
    echo    Sørg for at denne .bat fil er i samme mappe som 'frontend' mappen.
    pause
    exit /b 1
)
cd frontend

echo.
echo 📦 Installerer app dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Kunne ikke installere dependencies
    pause
    exit /b 1
)
echo ✅ Dependencies installeret!

echo.
echo 🔨 Starter APK bygning...
echo    Dette kan tage 10-15 minutter ⏰
echo    Gå i mellemtiden og få en kop kaffe! ☕
echo.

npx eas build --platform android --profile production --local
if %errorlevel% neq 0 (
    echo.
    echo ❌ FEJL: APK bygning fejlede!
    echo.
    echo 🔧 Prøv denne alternative metode:
    echo    1. Kør: npx expo install --fix
    echo    2. Kør: npx eas build --platform android --profile development --local
    pause
    exit /b 1
)

echo.
echo 🎉 SUCCESS! Din APK er klar!
echo.
echo 📁 Find din APK fil i mappen du er i nu.
echo    Den hedder noget med "nerdvaerket-*.apk"
echo.
echo 📱 Overføre til telefon:
echo    1. Kopiér APK filen til din telefon
echo    2. Åbn filen på telefonen
echo    3. Tillad "Unknown Sources" hvis den spørger
echo    4. Installer appen!
echo.
echo ✅ Din Nerdværket app er nu klar til test! 🚀
echo.
pause