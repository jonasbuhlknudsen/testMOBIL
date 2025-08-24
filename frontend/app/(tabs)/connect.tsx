import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Connect() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bluetooth Forbindelse</Text>
      <Text style={styles.subtitle}>Forbind til din iDot-3 skærm</Text>
      
      <View style={styles.statusCard}>
        <Ionicons name="bluetooth" size={32} color="#00d4ff" />
        <Text style={styles.statusText}>Status: Demo Mode</Text>
        <Text style={styles.demoText}>BLE ikke tilgængelig i Expo Go</Text>
      </View>

      <TouchableOpacity style={styles.connectButton}>
        <Text style={styles.buttonText}>Søg efter enheder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b141b',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e6f0ff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7a8ca0',
    marginBottom: 32,
  },
  statusCard: {
    backgroundColor: '#1a2332',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    color: '#e6f0ff',
    fontSize: 16,
    marginTop: 8,
  },
  demoText: {
    color: '#7a8ca0',
    fontSize: 14,
    marginTop: 4,
  },
  connectButton: {
    backgroundColor: '#00d4ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#001a2e',
    fontSize: 16,
    fontWeight: 'bold',
  },
});