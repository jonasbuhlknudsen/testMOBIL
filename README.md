# Android release setup

1. Replace your app/frontend/app.json with the app.json in this repo root.
2. Run PowerShell from your project root and execute:
   - npm install
   - npx expo prebuild -p android --clean
3. Copy android-setup/android/app/build.gradle into your project at android/app/build.gradle (overwrite)
4. Copy android-setup/android/keystore.properties.example to android/keystore.properties and fill passwords
5. Build:
   - cd android
   - ./gradlew clean && ./gradlew assembleRelease
6. APK path: android/app/build/outputs/apk/release/app-release.apk