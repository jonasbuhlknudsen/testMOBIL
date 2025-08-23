const { withAndroidManifest, withInfoPlist, createRunOncePlugin } = require("@expo/config-plugins");

// Minimal config plugin to ensure runtime permissions entries for BLE exist in native manifests
const withBlePlxPermissions = (config) => {
  config = withAndroidManifest(config, (c) => {
    const manifest = c.modResults.manifest;
    if (!manifest["uses-permission"]) manifest["uses-permission"] = [];
    const ensure = (name) => {
      if (!manifest["uses-permission"].some((p) => p.$ && p.$["android:name"] === name)) {
        manifest["uses-permission"].push({ $: { "android:name": name } });
      }
    };
    [
      "android.permission.BLUETOOTH",
      "android.permission.BLUETOOTH_ADMIN",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.BLUETOOTH_SCAN",
      "android.permission.BLUETOOTH_CONNECT",
    ].forEach(ensure);
    return c;
  });

  config = withInfoPlist(config, (c) => {
    c.modResults.NSBluetoothAlwaysUsageDescription =
      c.modResults.NSBluetoothAlwaysUsageDescription ||
      "Appen bruger Bluetooth til at forbinde til iDot-3 LED skærmen.";
    c.modResults.NSLocationWhenInUseUsageDescription =
      c.modResults.NSLocationWhenInUseUsageDescription ||
      "Placering kræves for Bluetooth scanning på iOS.";
    return c;
  });
  return config;
};

module.exports = createRunOncePlugin(withBlePlxPermissions, "withBlePlxPermissions", "1.0.0");