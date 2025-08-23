@echo off
echo ================================================
echo     Android SDK Setup for Windows
echo ================================================
echo.

echo Dette script hjælper dig med at finde og konfigurere Android SDK
echo.

echo [1/4] Søger efter eksisterende Android SDK...
echo.

:: Check common Android SDK locations
set "SDK_FOUND=0"
set "SDK_PATH="

:: Check default Android Studio location
if exist "%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe" (
    set "SDK_PATH=%LOCALAPPDATA%\Android\Sdk"
    set "SDK_FOUND=1"
    echo ✅ Fundet Android SDK i: %SDK_PATH%
)

:: Check alternative location
if "%SDK_FOUND%"=="0" (
    if exist "%USERPROFILE%\AppData\Local\Android\Sdk\platform-tools\adb.exe" (
        set "SDK_PATH=%USERPROFILE%\AppData\Local\Android\Sdk"
        set "SDK_FOUND=1"
        echo ✅ Fundet Android SDK i: %SDK_PATH%
    )
)

:: Check Program Files
if "%SDK_FOUND%"=="0" (
    if exist "C:\Android\Sdk\platform-tools\adb.exe" (
        set "SDK_PATH=C:\Android\Sdk"
        set "SDK_FOUND=1"
        echo ✅ Fundet Android SDK i: %SDK_PATH%
    )
)

if "%SDK_FOUND%"=="0" (
    echo ❌ Android SDK ikke fundet automatisk
    echo.
    echo Du skal installere Android Studio og SDK:
    echo 1. Download Android Studio fra: https://developer.android.com/studio
    echo 2. Installer Android Studio
    echo 3. Åbn Android Studio og gå til SDK Manager
    echo 4. Installer Android SDK Platform 34 og Build Tools
    echo 5. Kør dette script igen
    echo.
    pause
    exit /b 1
)

echo.
echo [2/4] Tjekker SDK komponenter...

if not exist "%SDK_PATH%\platform-tools\adb.exe" (
    echo ❌ Platform tools mangler
    echo Installer via Android Studio SDK Manager
    pause
    exit /b 1
)

if not exist "%SDK_PATH%\build-tools" (
    echo ❌ Build tools mangler  
    echo Installer via Android Studio SDK Manager
    pause
    exit /b 1
)

echo ✅ SDK komponenter fundet

echo.
echo [3/4] Konfigurerer environment variabler...

:: Set ANDROID_HOME for current session
set "ANDROID_HOME=%SDK_PATH%"
echo Current session: ANDROID_HOME=%ANDROID_HOME%

:: Check if permanently set
echo.
echo Tjekker permanent ANDROID_HOME...
for /f "tokens=2*" %%a in ('reg query "HKCU\Environment" /v ANDROID_HOME 2^>nul') do set "CURRENT_ANDROID_HOME=%%b"

if "%CURRENT_ANDROID_HOME%"=="%SDK_PATH%" (
    echo ✅ ANDROID_HOME allerede korrekt sat permanent
) else (
    echo.
    echo Indstiller ANDROID_HOME permanent...
    
    :: Set permanent environment variable
    setx ANDROID_HOME "%SDK_PATH%" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ ANDROID_HOME sat permanent til: %SDK_PATH%
    ) else (
        echo ⚠️ Kunne ikke sætte ANDROID_HOME permanent (mangler rettigheder?)
        echo Du kan sætte det manuelt:
        echo 1. Højreklik på "This PC" → Properties
        echo 2. Advanced system settings → Environment Variables
        echo 3. Tilføj: ANDROID_HOME = %SDK_PATH%
    )
)

echo.
echo [4/4] Tjekker PATH...

:: Check if SDK paths are in PATH
echo %PATH% | findstr /i "platform-tools" >nul
if %errorlevel% neq 0 (
    echo.
    echo Tilføjer SDK paths til PATH...
    
    :: Try to add to PATH
    setx PATH "%PATH%;%SDK_PATH%\platform-tools;%SDK_PATH%\tools" >nul 2>&1
    if %errorlevel% equ 0 (
        echo ✅ SDK paths tilføjet til PATH
    ) else (
        echo ⚠️ Kunne ikke tilføje til PATH automatisk
        echo Tilføj disse manuelt til din PATH:
        echo - %SDK_PATH%\platform-tools
        echo - %SDK_PATH%\tools
    )
) else (
    echo ✅ SDK paths allerede i PATH
)

echo.
echo ================================================
echo           ANDROID SDK SETUP FÆRDIG!
echo ================================================
echo.
echo SDK Location: %SDK_PATH%
echo ANDROID_HOME: %ANDROID_HOME%
echo.
echo VIGTIGT: Genstart din command prompt eller IDE for at
echo         få adgang til de nye environment variabler!
echo.
echo Test installationen:
echo   adb version
echo   echo %%ANDROID_HOME%%
echo.
echo Nu kan du køre: build-windows-static.bat
echo.
pause