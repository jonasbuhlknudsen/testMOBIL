# PowerShell script to build release APK for Expo RN project
$ErrorActionPreference = "Stop"

Write-Host "Step 1/6: npm install"
npm install

Write-Host "Step 2/6: expo prebuild (android --clean)"
npx expo prebuild -p android --clean

Write-Host "Step 3/6: ensure android/app/build.gradle content"
# This script assumes you copy android-setup/android/app/build.gradle into your project after prebuild

Write-Host "Step 4/6: ensure keystore.properties exists (use .example as template)"
if (!(Test-Path ".\android\keystore.properties")) {
  Copy-Item ".\android-setup\android\keystore.properties.example" ".\android\keystore.properties"
  Write-Host "Created android/keystore.properties from template. Edit passwords as needed."
}

Write-Host "Step 5/6: gradle build"
Set-Location ".\android"
./gradlew clean
./gradlew assembleRelease

Write-Host "Step 6/6: Done"
Write-Host "APK: $(Resolve-Path .\app\build\outputs\apk\release\app-release.apk)"