@echo off
echo ================================================
echo    Windows Static Build for Nerdværket App
echo         (INGEN Node.js kommandoer)
echo ================================================
echo.

echo [1/6] Checking prerequisites...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js not found. Please install Node.js
    pause
    exit /b 1
)

java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Java not found. Please install JDK 11 or 17
    pause
    exit /b 1
)

if not exist "%ANDROID_HOME%\platform-tools\adb.exe" (
    echo ERROR: Android SDK not found. Please set ANDROID_HOME
    echo Expected: %ANDROID_HOME%\platform-tools\adb.exe
    pause
    exit /b 1
)

echo ✅ All prerequisites found

echo [2/6] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo [3/6] Creating index.js entry file...
if not exist "index.js" (
    echo import {registerRootComponent} from 'expo'; > index.js
    echo import App from './App'; >> index.js
    echo registerRootComponent(App); >> index.js
)

echo [4/6] Using corrected static Gradle configuration (NO Node.js commands)...
cd android
echo Copying corrected settings-static.gradle...
copy settings-static.gradle settings.gradle
if %errorlevel% neq 0 (
    echo ERROR: Could not copy settings file
    pause
    exit /b 1
)
copy app\build-static.gradle app\build.gradle
if %errorlevel% neq 0 (
    echo ERROR: Could not copy build file
    pause
    exit /b 1
)
echo ✅ Static Gradle files applied (FIXED syntax)

echo [5/6] Cleaning previous builds...
call gradlew clean

echo [6/6] Building APK with static configuration...
call gradlew assembleDebug --stacktrace --info
if %errorlevel% neq 0 (
    echo.
    echo ❌ BUILD FAILED - Analyzing error...
    echo.
    echo The build failed even with static configuration.
    echo This might be due to:
    echo 1. Missing Android SDK components
    echo 2. Incorrect ANDROID_HOME path
    echo 3. Missing dependencies in node_modules
    echo 4. Java version incompatibility
    echo.
    echo Try these solutions:
    echo 1. Open Android Studio and install all recommended components
    echo 2. Check that ANDROID_HOME points to correct SDK folder
    echo 3. Run: npm install again
    echo 4. Install JDK 17 if using different version
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
echo File size:
dir android\app\build\outputs\apk\debug\app-debug.apk | find "app-debug.apk"
echo.
echo To install on device:
echo adb devices
echo adb install android\app\build\outputs\apk\debug\app-debug.apk
echo.
echo 🎉 Your Nerdværket app is ready for Android!
echo.
pause