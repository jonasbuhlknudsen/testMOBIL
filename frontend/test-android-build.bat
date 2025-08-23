@echo off
echo ================================================
echo    Testing Android Build for Nerdværket App
echo ================================================
echo.

echo [1/7] Checking Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js
    pause
    exit /b 1
)

echo [2/7] Checking Java...
java -version
if %errorlevel% neq 0 (
    echo ERROR: Java not found. Please install JDK 11 or 17
    pause
    exit /b 1
)

echo [3/7] Checking Android SDK...
if not exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    echo ERROR: Android SDK not found. Please set ANDROID_HOME
    echo Expected: %ANDROID_HOME%\platform-tools\adb.exe
    pause
    exit /b 1
)

echo [4/7] Testing Node package resolution...
echo Testing React Native gradle plugin resolution...
node --print "require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json')] })"
if %errorlevel% neq 0 (
    echo WARNING: Node command resolution failing - will use alternative settings.gradle
    echo Copying Windows-compatible settings.gradle...
    copy android\settings-windows.gradle android\settings.gradle
    if %errorlevel% neq 0 (
        echo ERROR: Failed to copy Windows settings file
        pause
        exit /b 1
    )
    echo ✅ Windows-compatible settings.gradle activated
)

echo [5/7] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [6/7] Cleaning previous builds...
cd android
call gradlew clean
if %errorlevel% neq 0 (
    echo WARNING: Clean failed, continuing anyway...
)

echo [7/7] Building Android APK...
call gradlew assembleDebug --stacktrace
if %errorlevel% neq 0 (
    echo ERROR: Android build failed - see stacktrace above
    echo.
    echo TROUBLESHOOTING OPTIONS:
    echo 1. Try: gradlew assembleDebug --info
    echo 2. Check that all paths are correct
    echo 3. Ensure Android SDK 34 is installed
    echo 4. Try building with Android Studio
    echo.
    pause
    exit /b 1
)

echo.
echo ================================================
echo           BUILD SUCCESSFUL! ✅
echo ================================================
echo.
echo APK Location: android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo To install: adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo You can now:
echo 1. Install the APK on your Android device
echo 2. Test BLE functionality with iDot-3
echo 3. Use all LOY PLAY-paritet features
echo.
pause