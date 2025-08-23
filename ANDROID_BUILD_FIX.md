# 🔧 Android Build Fix for Nerdværket App

## ✅ Issues Fixed

### 1. **Gradle Path Issues (Windows)**
- **Problem**: `Syntaksen i filnavnet, mappen eller diskenhedsnavnet er forkert` (Danish error for invalid file path syntax)
- **Root Cause**: Windows line endings (`\r\n`) in command outputs causing invalid paths
- **Fix Applied**: Added `.replace('\r', '').replace('\n', '')` to all command executions in Gradle files

### 2. **Package Version Compatibility**  
- **Problem**: `@react-native-community/slider@5.0.1 - expected version: 4.5.6`
- **Fix Applied**: Downgraded slider package to compatible version
- **Result**: Automatic dependency reinstallation

### 3. **React Native Gradle Plugin Configuration**
- **Problem**: Failed to apply plugin 'com.facebook.react.rootproject'
- **Fix Applied**: Fixed path resolution in build.gradle files

---

## 🎯 **Files Modified:**

### `/app/frontend/android/build.gradle`
```gradle
def reactNativeAndroidDir = new File(
  providers.exec {
    workingDir(rootDir)
    commandLine("node", "--print", "require.resolve('react-native/package.json')")
  }.standardOutput.asText.get().trim().replace('\r', '').replace('\n', ''), // ← FIXED
  "../android"
)
```

### `/app/frontend/android/app/build.gradle`
```gradle
react {
    entryFile = file(["node", "-e", "require('expo/scripts/resolveAppEntry')", projectRoot, "android", "absolute"].execute(null, rootDir).text.trim().replace('\r', '').replace('\n', '')) // ← FIXED
    reactNativeDir = new File(["node", "--print", "require.resolve('react-native/package.json')"].execute(null, rootDir).text.trim().replace('\r', '').replace('\n', '')).getParentFile().getAbsoluteFile() // ← FIXED
    // ... other fixed lines
}
```

### `/app/frontend/android/settings.gradle`
```gradle
def reactNativeGradlePlugin = new File(
  providers.exec {
    workingDir(rootDir)
    commandLine("node", "--print", "require.resolve('@react-native/gradle-plugin/package.json', { paths: [require.resolve('react-native/package.json')] })")
  }.standardOutput.asText.get().trim().replace('\r', '').replace('\n', '') // ← FIXED
).getParentFile().absolutePath
```

### `/app/frontend/package.json` 
```json
{
  "dependencies": {
    "@react-native-community/slider": "4.5.6" // ← FIXED (was 5.0.1)
  }
}
```

---

## 🚀 **How to Build Now (Windows)**

### **Option 1: Direct Gradle Build**
```bash
cd C:\dev\Mobil-app-main\frontend\android
.\gradlew assembleDebug
```

### **Option 2: React Native CLI**
```bash
cd C:\dev\Mobil-app-main\frontend
npx react-native run-android
```

### **Option 3: Expo Development Build**
```bash
cd C:\dev\Mobil-app-main\frontend
npx expo run:android
```

---

## 🛠️ **Prerequisites (Windows)**

### **Required Software:**
- ✅ **Node.js** (v16+)
- ✅ **Android Studio** with SDK
- ✅ **Java Development Kit (JDK 11 or 17)**
- ✅ **Android SDK Build Tools**

### **Environment Variables:**
```bash
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Android\Android Studio\jre
```

### **Add to PATH:**
```bash
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\build-tools\34.0.0
```

---

## 🐛 **Additional Troubleshooting**

### **If Build Still Fails:**

1. **Clean Project:**
   ```bash
   cd C:\dev\Mobil-app-main\frontend
   npx react-native clean
   cd android
   .\gradlew clean
   ```

2. **Clear Metro Cache:**
   ```bash
   npx expo r -c
   ```

3. **Reinstall Dependencies:**
   ```bash
   rmdir /s node_modules
   npm install
   ```

4. **Check Android SDK:**
   - Open Android Studio
   - Go to SDK Manager
   - Install Android SDK 34 (API Level 34)
   - Install Build Tools 34.0.0

### **Common Windows Issues:**

1. **Long Path Names:**
   - Move project to `C:\dev\` instead of deep folders
   - Enable long paths: `gpedit.msc` → Computer Config → Admin Templates → System → Filesystem

2. **Antivirus Interference:**
   - Add project folder to Windows Defender exclusions
   - Temporarily disable real-time protection during build

3. **Permissions:**
   - Run command prompt as Administrator
   - Check that Android SDK has proper permissions

---

## ✅ **Expected Result**

After these fixes, the build should succeed and generate:
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📱 **APK Installation**

```bash
# Install on connected device
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or install directly from Android Studio
```

---

## 🎉 **Verification**

To verify the fix worked:
1. Build completes without the Danish path error
2. APK file is generated
3. App installs and runs on Android device/emulator
4. BLE functionality works (requires physical Android device)

The Nerdværket app should now build successfully on Windows! 🚀