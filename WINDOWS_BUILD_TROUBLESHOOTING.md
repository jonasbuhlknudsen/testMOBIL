# 🪟 Windows Android Build Troubleshooting Guide

## 🔥 IMMEDIATE FIX FOR NODE COMMAND ERRORS

### **The Issue**
Error: `Process 'command 'node'' finished with non-zero exit value 1` in `settings.gradle` line 3.

### **🎯 SOLUTION 1: Use Windows-Compatible Settings**

**Quick Fix:**
```bash
cd C:\dev\Mobil-app-main\frontend\android
copy settings-windows.gradle settings.gradle
```

This replaces the problematic `settings.gradle` with a Windows-compatible version that bypasses Node.js command execution issues.

### **🎯 SOLUTION 2: Use the Automated Test Script**

```bash
cd C:\dev\Mobil-app-main\frontend
test-android-build.bat
```

This script will:
- ✅ Check all prerequisites
- ✅ Test Node.js package resolution
- ✅ Automatically switch to Windows-compatible settings if needed
- ✅ Build the APK with proper error handling

---

## 🐛 **Root Cause Analysis**

### **Why Node Commands Fail on Windows:**

1. **Path Separators**: Windows uses `\` while Gradle expects `/`
2. **Command Execution**: Windows needs `cmd /c` for proper command execution  
3. **Line Endings**: Windows `\r\n` vs Unix `\n` in command outputs
4. **Environment Variables**: Different PATH resolution

### **Our Fixes Applied:**

**1. Windows Command Detection:**
```gradle
if (System.properties['os.name'].toLowerCase().contains('windows')) {
    commandLine("cmd", "/c", "node --print \"...\"")
} else {
    commandLine("node", "--print", "...")
}
```

**2. Path Cleaning:**
```gradle
.standardOutput.asText.get().trim().replace('\r', '').replace('\n', '')
```

**3. Fallback Configuration:**
```gradle
try {
    // Node command execution
} catch (Exception e) {
    // Direct path fallback
    def path = new File(rootDir, "../node_modules/@react-native/gradle-plugin").absolutePath
}
```

---

## 🚀 **Build Methods (In Order of Preference)**

### **Method 1: Automated Script (Recommended)**
```bash
cd C:\dev\Mobil-app-main\frontend
test-android-build.bat
```

### **Method 2: Manual with Windows Settings**
```bash
cd C:\dev\Mobil-app-main\frontend\android
copy settings-windows.gradle settings.gradle
gradlew clean
gradlew assembleDebug
```

### **Method 3: React Native CLI**
```bash
cd C:\dev\Mobil-app-main\frontend
npx react-native run-android
```

### **Method 4: Expo Development Build**
```bash
cd C:\dev\Mobil-app-main\frontend
npx expo run:android
```

---

## ⚙️ **Prerequisites Checklist**

### **Required Software:**
- ✅ **Node.js 18+** - Download from nodejs.org
- ✅ **Java JDK 17** - Download from Oracle or OpenJDK
- ✅ **Android Studio** - Download from developer.android.com
- ✅ **Android SDK 34** - Install through Android Studio SDK Manager

### **Environment Variables:**
```bash
ANDROID_HOME=C:\Users\%USERNAME%\AppData\Local\Android\Sdk
JAVA_HOME=C:\Program Files\Java\jdk-17
```

### **PATH Variables:**
```bash
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%ANDROID_HOME%\build-tools\34.0.0
%JAVA_HOME%\bin
```

---

## 🔍 **Detailed Error Solutions**

### **Error: `Process 'command 'node'' finished with non-zero exit value 1`**

**Solution:**
```bash
cd C:\dev\Mobil-app-main\frontend\android
copy settings-windows.gradle settings.gradle
```

### **Error: `ANDROID_HOME not set`**

**Solution:**
1. Open Android Studio
2. Go to File → Settings → Appearance & Behavior → System Settings → Android SDK
3. Copy the SDK path (e.g., `C:\Users\USERNAME\AppData\Local\Android\Sdk`)
4. Add to System Environment Variables:
   ```
   ANDROID_HOME=C:\Users\USERNAME\AppData\Local\Android\Sdk
   ```

### **Error: `Java not found`**

**Solution:**
1. Download JDK 17 from oracle.com
2. Install and note installation path
3. Add to System Environment Variables:
   ```
   JAVA_HOME=C:\Program Files\Java\jdk-17
   ```

### **Error: `SDK location not found`**

**Solution:**
Create `C:\dev\Mobil-app-main\frontend\android\local.properties`:
```properties
sdk.dir=C\:\\Users\\USERNAME\\AppData\\Local\\Android\\Sdk
```

---

## 🧪 **Testing Your Build**

### **1. Verify APK Creation:**
```bash
dir android\app\build\outputs\apk\debug\app-debug.apk
```

### **2. Install on Device:**
```bash
adb devices
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### **3. Test App Features:**
- ✅ App launches without crashing
- ✅ Bluetooth permissions granted
- ✅ BLE scanning works
- ✅ Connection to iDot-3 device
- ✅ LED control functions work

---

## 🛠️ **Advanced Troubleshooting**

### **If Build Still Fails:**

**1. Complete Clean:**
```bash
cd C:\dev\Mobil-app-main\frontend
rmdir /s node_modules
npm install
cd android
gradlew clean
gradlew assembleDebug --info
```

**2. Check Gradle Daemon:**
```bash
gradlew --stop
gradlew assembleDebug
```

**3. Enable Long Paths (Windows 10/11):**
- Run `gpedit.msc` as Administrator
- Navigate to: Computer Configuration → Administrative Templates → System → Filesystem
- Enable "Enable Win32 long paths"

**4. Antivirus Exclusions:**
Add these folders to Windows Defender exclusions:
- `C:\dev\Mobil-app-main`
- `%ANDROID_HOME%`
- `C:\Users\%USERNAME%\.gradle`

---

## ✅ **Success Indicators**

You'll know the build worked when you see:
```
BUILD SUCCESSFUL in Xs
```

And the APK file exists at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

The file should be around 50-100MB and ready for installation on Android devices.

---

## 🎯 **Final Notes**

- **Windows Compatibility**: All fixes are now Windows-specific and should work on Windows 10/11
- **Fallback Systems**: Multiple backup methods if Node commands fail
- **Path Handling**: Proper Windows path separator handling
- **Error Recovery**: Graceful fallbacks for common Windows issues

Your Nerdværket app should now build successfully on Windows! 🚀

If you still encounter issues, run the automated test script (`test-android-build.bat`) which will diagnose and fix most common problems automatically.