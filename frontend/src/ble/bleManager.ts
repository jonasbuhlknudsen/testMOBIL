import { Platform, PermissionsAndroid } from "react-native";
// react-native-permissions removed - not compatible with Expo Go
// import { request, PERMISSIONS, RESULTS } from "react-native-permissions";
import { BLE_PROFILES, BleProfile, DetectedProfile, matchesDeviceFilter, SCAN_FILTERS } from "./profiles";
import { gattQueue, queueConnect, queueDiscover } from "./gattQueue";

export const FEE7_SERVICE_UUID = "0000fee7-0000-1000-8000-00805f9b34fb";

let _manager: any | null = null;

function createBleManager() {
  if (Platform.OS === 'web') {
    // Web shim to avoid crashes in preview
    return {
      startDeviceScan: () => {},
      stopDeviceScan: () => {},
      connectToDevice: async () => { throw new Error('BLE ikke understøttet på web preview'); },
      requestMTU: async () => 23,
    };
  }
  // Dynamisk require kun på native
  const { BleManager } = require('react-native-ble-plx');
  return new BleManager();
}

export const getBleManager = () => {
  if (!_manager) _manager = createBleManager();
  return _manager;
};

export async function ensureBlePermissions(): Promise<boolean> {
  try {
    // For Expo Go, permissions are handled differently
    // In production build, this would use proper permission requests
    if (Platform.OS === "android") {
      const sdkInt = Platform.Version as number;
      if (sdkInt >= 31) {
        // For Expo Go demo, always return true
        // In production APK, this would request BLUETOOTH_SCAN, BLUETOOTH_CONNECT
        console.log("BLE permissions simulated for Expo Go");
        return true;
      } else {
        const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        return res === PermissionsAndroid.RESULTS.GRANTED;
      }
    } else if (Platform.OS === 'ios') {
      // For Expo Go demo, always return true  
      // In production build, this would use proper iOS BLE permissions
      console.log("iOS BLE permissions simulated for Expo Go");
      return true;
    } else {
      // web/others
      return true;
    }
  } catch { return false; }
}

/**
 * Enhanced device filtering som specificeret
 */
export function matchesDeviceFilters(device: any): boolean {
  const name = device.name || device.localName || '';
  
  // Filter på navn der starter med YS
  if (matchesDeviceFilter(name)) {
    return true;
  }
  
  // Filter på advertised service 0xFEE7
  if (device.serviceUUIDs?.includes(FEE7_SERVICE_UUID)) {
    return true;
  }
  
  return false;
}

/**
 * Detect hvilken BLE profil enheden understøtter
 */
export async function detectDeviceProfile(device: any): Promise<DetectedProfile | null> {
  if (Platform.OS === 'web') return null;
  
  try {
    const services = await device.services();
    
    for (const profile of BLE_PROFILES) {
      const service = services.find((s: any) => 
        s.uuid.toLowerCase() === profile.serviceUUID.toLowerCase()
      );
      
      if (service) {
        const characteristics = await service.characteristics();
        const availableChars = {
          notify: [] as string[],
          notifyWrite: [] as string[],
          write: [] as string[],
          writeNoResponse: [] as string[]
        };
        
        // Check hvilke characteristics der er tilgængelige
        for (const char of characteristics) {
          const uuid = char.uuid.toLowerCase();
          
          if (profile.characteristics.notify?.some(u => u.toLowerCase() === uuid)) {
            availableChars.notify.push(char.uuid);
          }
          if (profile.characteristics.notifyWrite?.some(u => u.toLowerCase() === uuid)) {
            availableChars.notifyWrite.push(char.uuid);
          }
          if (profile.characteristics.write?.some(u => u.toLowerCase() === uuid)) {
            availableChars.write.push(char.uuid);
          }
          if (profile.characteristics.writeNoResponse?.some(u => u.toLowerCase() === uuid)) {
            availableChars.writeNoResponse.push(char.uuid);
          }
        }
        
        return {
          profile,
          availableCharacteristics: availableChars
        };
      }
    }
    
    return null;
  } catch (error) {
    console.log('Error detecting device profile:', error);
    return null;
  }
}

/**
 * Request MTU som specificeret (247 bytes)
 */
export async function requestMTU(device: any, mtu: number = 247): Promise<number> {
  if (Platform.OS === 'web') return 23;
  
  try {
    const result = await device.requestMTU(mtu);
    console.log(`[BLE] MTU requested: ${mtu}, granted: ${result}`);
    return result;
  } catch (error) {
    console.log('[BLE] MTU request failed:', error);
    return 23; // Default MTU
  }
}

/**
 * Enable notify på alle notify characteristics
 */
export async function enableNotifications(device: any, profile: DetectedProfile): Promise<void> {
  if (Platform.OS === 'web') return;
  
  const serviceId = profile.profile.serviceUUID;
  
  // Enable på alle notify chars
  for (const charId of [...profile.availableCharacteristics.notify, ...profile.availableCharacteristics.notifyWrite]) {
    try {
      await queueDiscover(async () => {
        const char = await device.readCharacteristicForService(serviceId, charId);
        if (char.isNotifiable) {
          console.log(`[BLE] Enabling notifications on ${charId}`);
          device.monitorCharacteristicForService(serviceId, charId, (error: any, characteristic: any) => {
            if (error) {
              console.log(`[BLE] Notify error on ${charId}:`, error);
            } else if (characteristic?.value) {
              // Dette håndteres af bleStore's notify handler
            }
          });
        }
      });
    } catch (error) {
      console.log(`[BLE] Failed to enable notifications on ${charId}:`, error);
    }
  }
}

/**
 * Legacy helper functions til bagudkompatibilitet
 */
export async function findWritableCharacteristic(device: any, serviceUUID: string): Promise<any | null> {
  if (Platform.OS === 'web') return null;
  const services = await device.services();
  const svc = services.find((s: any) => s.uuid.toUpperCase() === serviceUUID.toUpperCase());
  if (!svc) return null;
  const chars = await svc.characteristics();
  // Returnér første writable characteristic
  return chars.find((c: any) => c.isWritableWithResponse || c.isWritableWithoutResponse) ?? null;
}

export async function findNotifyCharacteristic(device: any, serviceUUID: string): Promise<any | null> {
  if (Platform.OS === 'web') return null;
  const services = await device.services();
  const svc = services.find((s: any) => s.uuid.toUpperCase() === serviceUUID.toUpperCase());
  if (!svc) return null;
  const chars = await svc.characteristics();
  return chars.find((c: any) => c.isNotifiable) ?? null;
}