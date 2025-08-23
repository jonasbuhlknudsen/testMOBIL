import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";
import { useBleStore } from "../src/store/bleStore";

const colors = { bg: "#0b141b", card: "#0f2741", cardAlt: "#0d253d", text: "#e6f0ff", tint: "#3aa0ff" };

export default function Status(){
  const state = useBleStore();
  const hex = state.lastNotify ? Array.from(state.lastNotify).map(b=>b.toString(16).toUpperCase().padStart(2,'0')).join(' ') : '-';

  return (
    <ScrollView style={{ flex:1, backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.title}>Status</Text>
      <View style={styles.card}><Text style={styles.label}>Device</Text><Text style={styles.value}>{state.connectedDevice ? (state.connectedDevice.name ?? state.connectedDevice.id) : 'Ikke forbundet'}</Text></View>
      <View style={styles.card}><Text style={styles.label}>Service</Text><Text style={styles.value}>{state.serviceUUID}</Text></View>
      <View style={styles.card}><Text style={styles.label}>Write Char</Text><Text style={styles.value}>{state.writeChar?.uuid ?? '-'}</Text></View>
      <View style={styles.card}><Text style={styles.label}>Notify Char</Text><Text style={styles.value}>{state.notifyChar?.uuid ?? '-'}</Text></View>
      <View style={styles.card}><Text style={styles.label}>Sidste Notify</Text><Text style={styles.valueMonospace}>{hex}</Text></View>
      <View style={styles.card}><Text style={styles.label}>ACK-regel</Text><Text style={styles.value}>{state.ackRule.prefixHex ?? '(alle)'}, len≥{state.ackRule.minLength ?? 1}</Text></View>
      <View style={styles.card}><Text style={styles.label}>Notify count</Text><Text style={styles.value}>{state.notifyCounter}</Text></View>
      <View style={styles.card}><Text style={styles.label}>Write mode</Text><Text style={styles.value}>{state.useWithoutResponse ? 'writeWithoutResponse' : 'writeWithResponse'}</Text></View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  title:{ color: colors.text, fontSize: 22, fontWeight:'700', marginBottom: 8 },
  card:{ backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 10 },
  label:{ color: '#b7c6dd', marginBottom: 4 },
  value:{ color: colors.text, fontWeight:'700' },
  valueMonospace:{ color: colors.text, fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }) }
});