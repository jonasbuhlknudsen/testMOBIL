import { create } from "zustand";
import { getBleManager, FEE7_SERVICE_UUID, findWritableCharacteristic, findNotifyCharacteristic } from "../ble/bleManager";
import { Buffer } from "buffer";
import { saveString, loadString } from "../storage/persist";
import { DeviceInfo, parseDeviceInfo, simulateDeviceDetection, DEVICE_COMMANDS, ScreenSize } from "../ble/deviceDetection";

export type Discovered = { id: string; name: string | null; rssi: number | null };
export type AckRule = { prefixHex?: string; minLength?: number };

type State = {
  manager: any;
  scanning: boolean;
  discovered: Record<string, Discovered>;
  connectedDevice?: any | null;
  serviceUUID?: string | null;
  writeChar?: any | null;
  notifyChar?: any | null;
  useWithoutResponse: boolean;
  log: string[];
  lastNotify?: Uint8Array | null;
  notifyCounter: number;
  lastDeviceId?: string | null;
  // Device detection state
  deviceInfo: DeviceInfo | null;
  detectedScreenSize: ScreenSize | null;
  isDetectingDevice: boolean;
  // ACK settings
  ackRule: AckRule;
  ackTimeoutMs: number;
  retriesSOF: number;
  retriesEOF: number;
  chunkAckEnabled: boolean;
  chunkAckTimeoutMs: number;
  // helpers
  matchesAck: (bytes: Uint8Array) => boolean;
  waitForNotifyOnce: (timeoutMs?: number, predicate?: (bytes: Uint8Array)=>boolean) => Promise<Uint8Array>;
  waitForAck: (timeoutMs?: number) => Promise<Uint8Array>;
  // actions
  hydrate: () => Promise<void>;
  startScan: () => Promise<void>;
  stopScan: () => void;
  connect: (id: string) => Promise<void>;
  quickReconnect: () => Promise<void>;
  disconnect: () => Promise<void>;
  setWriteMode: (withoutResp: boolean) => void;
  setAckRule: (rule: AckRule) => void;
  setAckTimeout: (ms: number) => void;
  setRetries: (sof: number, eof: number) => void;
  setChunkAck: (enabled: boolean, timeoutMs?: number) => void;
  sendHex: (hex: string) => Promise<void>;
  sendChunks: (chunks: (number[]|Uint8Array)[], opts?: { withoutResponse?: boolean }) => Promise<void>;
  // Device detection actions
  detectDevice: () => Promise<void>;
  setDeviceInfo: (info: DeviceInfo | null) => void;
  getCompatibleContent: () => ScreenSize[];
};

function notifyHex(bytes: Uint8Array){
  return Array.from(bytes).map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join(' ');
}

function parseHexToBytes(hex?: string): Uint8Array | null {
  if (!hex) return null;
  const clean = hex.replace(/\s+/g, "").replace(/^0x/i, "");
  if (clean.length % 2 !== 0) return null;
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) out[i/2] = parseInt(clean.substr(i,2), 16);
  return out;
}

// Simple waiter registry to await a single notify packet
type Waiter = { id: number; predicate: (b: Uint8Array)=>boolean; resolve: (b: Uint8Array)=>void; reject: (e: any)=>void; timer: any };
let waiterId = 1;
const waiters: Waiter[] = [];

export const useBleStore = create<State>((set, get) => ({
  manager: getBleManager(),
  scanning: false,
  discovered: {},
  connectedDevice: null,
  serviceUUID: FEE7_SERVICE_UUID,
  writeChar: null,
  notifyChar: null,
  useWithoutResponse: false,
  log: [],
  lastNotify: null,
  notifyCounter: 0,
  lastDeviceId: null,
  // Device detection state
  deviceInfo: null,
  detectedScreenSize: null,
  isDetectingDevice: false,
  // defaults
  ackRule: { prefixHex: undefined, minLength: 1 },
  ackTimeoutMs: 2000,
  retriesSOF: 2,
  retriesEOF: 2,
  chunkAckEnabled: false,
  chunkAckTimeoutMs: 800,
  matchesAck: (bytes: Uint8Array) => {
    const { ackRule } = get();
    const prefix = parseHexToBytes(ackRule.prefixHex);
    const minLen = ackRule.minLength ?? 1;
    if (bytes.length < minLen) return false;
    if (prefix) {
      if (bytes.length < prefix.length) return false;
      for (let i=0;i<prefix.length;i++) if (bytes[i] !== prefix[i]) return false;
    }
    return true;
  },
  hydrate: async () => {
    const id = await loadString('lastDeviceId');
    set({ lastDeviceId: id });
  },
  startScan: async () => {
    const { manager } = get();
    set({ scanning: true, discovered: {} });
    try {
      manager.startDeviceScan([FEE7_SERVICE_UUID], { allowDuplicates: false }, (error: any, device: any) => {
        if (error) { set((s) => ({ log: ["Scan error: " + error.message, ...s.log] })); set({ scanning: false }); return; }
        if (device) {
          set((s) => ({ discovered: { ...s.discovered, [device.id]: { id: device.id, name: device.name ?? device.localName ?? "Ukendt", rssi: device.rssi } } }));
        }
      });
    } catch (e:any) {
      set((s)=> ({ log: ["Scan start fejlede (web?): "+(e?.message??String(e)), ...s.log] }));
      set({ scanning: false });
    }
  },
  stopScan: () => { const { manager } = get(); try { manager.stopDeviceScan(); } catch {} set({ scanning: false }); },
  connect: async (id: string) => {
    const { manager, stopScan } = get();
    try {
      stopScan();
      let device = await manager.connectToDevice(id, { autoConnect: false });
      device = await device.discoverAllServicesAndCharacteristics();
      const [writeChar, notifyChar] = await Promise.all([
        findWritableCharacteristic(device, FEE7_SERVICE_UUID),
        findNotifyCharacteristic(device, FEE7_SERVICE_UUID),
      ]);
      set({ connectedDevice: device, writeChar, notifyChar, lastDeviceId: id });
      await saveString('lastDeviceId', id);
      set((s) => ({ log: [ `Forbundet til ${device.name ?? device.id}. Write: ${writeChar?.uuid ?? "?"} Notify: ${notifyChar?.uuid ?? "?"}`, ...s.log ] }));

      if (notifyChar) {
        device.monitorCharacteristicForService(FEE7_SERVICE_UUID, notifyChar.uuid, (error: any, characteristic: any) => {
          if (error) { set((s)=>({ log:["Notify error: "+error.message, ...s.log] })); return; }
          const base64 = characteristic?.value; if (!base64) return;
          const bytes = Buffer.from(base64, 'base64');
          set((s)=>({ lastNotify: bytes, notifyCounter: s.notifyCounter+1, log:[`Notify(${s.notifyCounter+1}): `+Array.from(bytes).map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join(' '), ...s.log] }));
          for (let i = waiters.length - 1; i >= 0; i--) {
            const w = waiters[i];
            try { if (w.predicate(bytes)) { clearTimeout(w.timer); waiters.splice(i,1); w.resolve(bytes); } } catch {}
          }
        });
      }
      
      // Automatisk detect device når der forbindes
      setTimeout(() => get().detectDevice(), 1000);
    } catch (e: any) { set((s) => ({ log: ["Connect error: " + (e?.message ?? e), ...s.log] })); }
  },
  quickReconnect: async () => {
    const { lastDeviceId } = get();
    if (!lastDeviceId) return;
    try { await get().connect(lastDeviceId); } catch {}
  },
  disconnect: async () => {
    const { connectedDevice, manager } = get();
    if (connectedDevice) { try { await manager.cancelDeviceConnection(connectedDevice.id); } catch {} }
    set({ connectedDevice: null, writeChar: null, notifyChar: null, deviceInfo: null, detectedScreenSize: null });
  },
  setWriteMode: (withoutResp: boolean) => set({ useWithoutResponse: withoutResp }),
  setAckRule: (rule: AckRule) => set({ ackRule: rule }),
  setAckTimeout: (ms: number) => set({ ackTimeoutMs: ms }),
  setRetries: (sof: number, eof: number) => set({ retriesSOF: sof, retriesEOF: eof }),
  setChunkAck: (enabled: boolean, timeoutMs?: number) => set((s)=>({ chunkAckEnabled: enabled, chunkAckTimeoutMs: timeoutMs ?? s.chunkAckTimeoutMs })),
  waitForNotifyOnce: (timeoutMs = 1500, predicate = (_:Uint8Array)=> true) => {
    return new Promise<Uint8Array>((resolve, reject) => {
      const id = waiterId++;
      const timer = setTimeout(() => {
        const idx = waiters.findIndex(w=>w.id===id); if (idx>=0) waiters.splice(idx,1);
        reject(new Error('Notify timeout'));
      }, timeoutMs);
      waiters.push({ id, predicate, resolve, reject, timer });
    });
  },
  waitForAck: async (timeoutMs?: number) => {
    const { matchesAck, ackTimeoutMs } = get();
    return await get().waitForNotifyOnce(timeoutMs ?? ackTimeoutMs, matchesAck);
  },
  sendHex: async (hex: string) => {
    const { connectedDevice, writeChar, serviceUUID, useWithoutResponse } = get();
    if (!connectedDevice || !writeChar || !serviceUUID) throw new Error("Ikke forbundet eller ingen write characteristic");
    const base64 = Buffer.from(hex.replace(/\s+/g, '').replace(/^0x/i,''), 'hex').toString('base64');
    const write = useWithoutResponse
      ? connectedDevice.writeCharacteristicWithoutResponseForService.bind(connectedDevice)
      : connectedDevice.writeCharacteristicWithResponseForService.bind(connectedDevice);
    await write(serviceUUID, writeChar.uuid, base64);
    set((s) => ({ log: ["Sendt: " + hex, ...s.log] }));
  },
  sendChunks: async (chunks, opts={}) => {
    const { connectedDevice, writeChar, serviceUUID, useWithoutResponse } = get();
    if (!connectedDevice || !writeChar || !serviceUUID) throw new Error("Ikke forbundet eller ingen write characteristic");
    const without = opts.withoutResponse ?? useWithoutResponse;
    const write = without
      ? connectedDevice.writeCharacteristicWithoutResponseForService.bind(connectedDevice)
      : connectedDevice.writeCharacteristicWithResponseForService.bind(connectedDevice);
    for (const chunk of chunks) {
      const buf = chunk instanceof Uint8Array ? chunk : Uint8Array.from(chunk);
      const base64 = Buffer.from(buf).toString("base64");
      await write(serviceUUID, writeChar.uuid, base64);
    }
    set((s) => ({ log: ["Sendte "+chunks.length+" chunk(s)", ...s.log] }));
  },
  
  // Device detection functions
  detectDevice: async () => {
    const { connectedDevice, sendHex } = get();
    
    // Check if we're in browser/web environment
    const isBrowser = typeof window !== 'undefined' && !(window as any).ReactNativeWebView;
    
    if (isBrowser || !connectedDevice) {
      // Simulation i browser/preview
      set({ isDetectingDevice: true });
      setTimeout(() => {
        const simulatedDevice = simulateDeviceDetection();
        set({ 
          deviceInfo: simulatedDevice,
          detectedScreenSize: simulatedDevice.screenSize,
          isDetectingDevice: false 
        });
        set((s) => ({ log: ['🔍 Simuleret device detection: ' + simulatedDevice.model, ...s.log] }));
      }, 2000);
      return;
    }

    set({ isDetectingDevice: true });
    
    try {
      // Send BLE kommando for at få device info
      await sendHex(DEVICE_COMMANDS.GET_DEVICE_INFO);
      
      // Vent på response via notify
      const response = await get().waitForNotifyOnce(
        5000, // 5 sekunder timeout
        (bytes) => {
          const hex = Array.from(bytes).map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join('');
          return hex.startsWith('A501'); // Device info response
        }
      );
      
      // Parse response
      const hexResponse = Array.from(response).map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join('');
      const deviceInfo = parseDeviceInfo(hexResponse);
      if (deviceInfo) {
        set({ 
          deviceInfo,
          detectedScreenSize: deviceInfo.screenSize,
          isDetectingDevice: false 
        });
        set((s) => ({ log: ['🔍 Device detected: ' + deviceInfo.model, ...s.log] }));
      } else {
        throw new Error('Could not parse device info');
      }
      
    } catch (error) {
      set((s) => ({ log: ['Device detection failed: ' + (error as Error).message, ...s.log] }));
      // Fallback til 16x16 hvis detection fejler
      const fallbackInfo: DeviceInfo = {
        screenSize: '16x16',
        model: 'iDot-3 (Ukendt)',
        maxColors: 256,
        refreshRate: 30,
        capabilities: []
      };
      set({ 
        deviceInfo: fallbackInfo,
        detectedScreenSize: '16x16',
        isDetectingDevice: false 
      });
    }
  },
  
  setDeviceInfo: (info) => set({ 
    deviceInfo: info,
    detectedScreenSize: info?.screenSize || null 
  }),
  
  getCompatibleContent: () => {
    const { detectedScreenSize } = get();
    if (!detectedScreenSize) return ['16x16'];
    
    switch (detectedScreenSize) {
      case '16x16': return ['16x16'];
      case '32x32': return ['16x16', '32x32'];
      case '64x64': return ['16x16', '32x32', '64x64'];
      default: return ['16x16'];
    }
  },
}));