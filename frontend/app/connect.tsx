import React, { useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Animated } from "react-native";
import { useBleStore } from "../src/store/bleStore";
import { ensureBlePermissions } from "../src/ble/bleManager";
import { ThemedBackground } from "../src/ui/components";
import { EnhancedCard, EnhancedButton, StatusBadge, SectionHeader, EnhancedEmptyState, DeviceStatus, ProgressBar } from "../src/ui/EnhancedComponents";
import { palette, radius, spacing } from "../src/ui/theme";
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

export default function Connect() {
  const { 
    scanning, 
    discovered, 
    startScan, 
    stopScan, 
    connect, 
    connectedDevice, 
    lastDeviceId, 
    quickReconnect,
    hydrate 
  } = useBleStore();
  
  const list = useMemo(() => 
    Object.values(discovered).sort((a,b)=> (b.rssi ?? -999) - (a.rssi ?? -999)), 
    [discovered]
  );
  
  const [scanProgress, setScanProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'failed'>('idle');

  useEffect(() => {
    (async () => {
      const ok = await ensureBlePermissions();
      await hydrate();
      if (!ok) {
        Alert.alert(
          "Bluetooth Tilladelser Påkrævet", 
          "For at kunne scanne efter og forbinde til iDot-3 enheder skal appen have adgang til Bluetooth.",
          [
            { text: "OK", style: "default" }
          ]
        );
      }
    })();
    return () => stopScan();
  }, []);

  // Simulate scan progress
  useEffect(() => {
    if (scanning) {
      setScanProgress(0);
      const interval = setInterval(() => {
        setScanProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 2;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setScanProgress(0);
    }
  }, [scanning]);

  const onScanPress = async () => {
    Haptics.selectionAsync();
    if (scanning) {
      stopScan();
    } else {
      await startScan();
    }
  };

  const onConnectDevice = async (deviceId: string) => {
    setConnectionStatus('connecting');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    try {
      await connect(deviceId);
      setConnectionStatus('connected');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setConnectionStatus('failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Forbindelsesfejl", "Kunne ikke forbinde til enheden. Prøv igen.");
    }
    
    setTimeout(() => setConnectionStatus('idle'), 2000);
  };

  const onQuickReconnect = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setConnectionStatus('connecting');
    
    try {
      await quickReconnect();
      setConnectionStatus('connected');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      setConnectionStatus('failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    
    setTimeout(() => setConnectionStatus('idle'), 2000);
  };

  const getSignalStrength = (rssi?: number) => {
    if (!rssi) return 0;
    // Convert RSSI to percentage (rough approximation)
    return Math.max(0, Math.min(100, (rssi + 100) * 2));
  };

  const getSignalColor = (rssi?: number) => {
    if (!rssi) return palette.muted;
    if (rssi > -60) return '#34C759'; // Strong
    if (rssi > -80) return '#FF9500'; // Medium
    return '#FF3B30'; // Weak
  };

  return (
    <ThemedBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Connection Status */}
        {connectedDevice && (
          <EnhancedCard elevated gradient>
            <DeviceStatus
              name={connectedDevice.name || 'iDot-3 Enhed'}
              status="connected"
              signalStrength={connectedDevice.rssi}
              batteryLevel={85} // Mock battery level
            />
          </EnhancedCard>
        )}

        {/* Scan Controls */}
        <EnhancedCard elevated>
          <SectionHeader
            icon="bluetooth"
            title="Bluetooth Scanner"
            subtitle={scanning ? "Scanner efter iDot-3 enheder..." : "Find og forbind til din iDot-3"}
          />
          
          <View style={styles.scanControls}>
            <EnhancedButton
              title={scanning ? "Stop Scanning" : "Start Scanning"}
              onPress={onScanPress}
              variant={scanning ? "secondary" : "primary"}
              icon={scanning ? "stop" : "scan"}
              size="large"
              fullWidth={!lastDeviceId || !!connectedDevice}
            />
            
            {lastDeviceId && !connectedDevice && (
              <EnhancedButton
                title="Hurtig Genforbind"
                onPress={onQuickReconnect}
                variant="outline"
                icon="flash"
                size="large"
                loading={connectionStatus === 'connecting'}
              />
            )}
          </View>
          
          {scanning && (
            <View style={styles.scanProgress}>
              <ProgressBar 
                progress={scanProgress} 
                animated 
                showLabel 
                height={6}
              />
              <Text style={styles.scanText}>
                {list.length} enheder fundet
              </Text>
            </View>
          )}
        </EnhancedCard>

        {/* Device List */}
        <SectionHeader
          icon="radio"
          title="Nærliggende Enheder"
          subtitle={`${list.length} enheder tilgængelige`}
          action={list.length > 0 ? {
            title: "Opdater",
            onPress: onScanPress,
            icon: "refresh"
          } : undefined}
        />

        {list.length === 0 ? (
          <EnhancedCard>
            <EnhancedEmptyState
              icon="bluetooth-searching"
              title="Ingen Enheder Fundet"
              description="Sørg for at din iDot-3 er tændt og i Bluetooth-parring mode. Tryk på scanner knappen for at søge igen."
              action={{
                title: "Start Scanning",
                onPress: onScanPress
              }}
            />
          </EnhancedCard>
        ) : (
          list.map((device, index) => (
            <EnhancedCard key={device.id} style={styles.deviceCard}>
              <View style={styles.deviceHeader}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>
                    {device.name || 'iDot-3 Enhed'}
                  </Text>
                  <Text style={styles.deviceId}>
                    {device.id.substring(0, 8)}...
                  </Text>
                </View>
                
                <View style={styles.deviceMetrics}>
                  <View style={styles.signalContainer}>
                    <Ionicons 
                      name="wifi" 
                      size={16} 
                      color={getSignalColor(device.rssi)} 
                    />
                    <View style={styles.signalBars}>
                      {[1, 2, 3, 4].map((bar) => (
                        <View
                          key={bar}
                          style={[
                            styles.signalBar,
                            {
                              backgroundColor: getSignalStrength(device.rssi) >= bar * 25 
                                ? getSignalColor(device.rssi) 
                                : 'rgba(122,140,160,0.3)',
                              height: 4 + bar * 2
                            }
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                  
                  <Text style={styles.rssiText}>
                    {device.rssi ? `${device.rssi}dBm` : 'N/A'}
                  </Text>
                </View>
              </View>
              
              <View style={styles.deviceActions}>
                <EnhancedButton
                  title="Forbind"
                  onPress={() => onConnectDevice(device.id)}
                  variant="primary"
                  icon="link"
                  size="medium"
                  loading={connectionStatus === 'connecting'}
                  disabled={!!connectedDevice}
                  fullWidth
                />
              </View>
              
              {device.rssi && device.rssi < -80 && (
                <View style={styles.warningContainer}>
                  <Ionicons name="warning" size={14} color="#FF9500" />
                  <Text style={styles.warningText}>
                    Svagt signal - kom tættere på enheden
                  </Text>
                </View>
              )}
            </EnhancedCard>
          ))
        )}

        {/* Connection Tips */}
        <EnhancedCard style={styles.tipsCard}>
          <SectionHeader
            icon="information-circle"
            title="Forbindelsestips"
            subtitle="Få den bedste oplevelse"
          />
          
          <View style={styles.tipsList}>
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.tipText}>
                Hold enheden inden for 2 meters afstand
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.tipText}>
                Sørg for at iDot-3 er tændt og klar til parring
              </Text>
            </View>
            
            <View style={styles.tipItem}>
              <Ionicons name="checkmark-circle" size={20} color="#34C759" />
              <Text style={styles.tipText}>
                Genstart appen hvis forbindelsen fejler
              </Text>
            </View>
          </View>
        </EnhancedCard>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl * 2,
  },
  scanControls: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  scanProgress: {
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  scanText: {
    color: palette.muted,
    fontSize: 14,
    textAlign: 'center',
  },
  deviceCard: {
    marginBottom: spacing.md,
  },
  deviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    color: palette.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  deviceId: {
    color: palette.muted,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  deviceMetrics: {
    alignItems: 'flex-end',
    gap: spacing.xs,
  },
  signalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  signalBars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  signalBar: {
    width: 3,
    borderRadius: 1.5,
  },
  rssiText: {
    color: palette.muted,
    fontSize: 11,
    fontWeight: '600',
  },
  deviceActions: {
    marginTop: spacing.sm,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: 'rgba(255,149,0,0.1)',
    borderRadius: radius.sm,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  warningText: {
    color: '#FF9500',
    fontSize: 12,
    flex: 1,
  },
  tipsCard: {
    marginTop: spacing.lg,
  },
  tipsList: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  tipText: {
    color: palette.text,
    fontSize: 14,
    flex: 1,
    lineHeight: 20,
  },
});