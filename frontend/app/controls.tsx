import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform } from "react-native";
import { commandBus } from "../src/protocol/commandBus";

const colors = { bg: "#0b141b", card: "#0f2741", cardAlt: "#0d253d", text: "#e6f0ff", tint: "#3aa0ff" };

export default function Controls(){
  const [pct, setPct] = useState('80');

  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
      <View style={styles.container}>
        <Text style={styles.title}>Power & Lysstyrke</Text>

        <View style={styles.row}>
          <TouchableOpacity style={styles.primary} onPress={()=> commandBus.powerOn()}><Text style={styles.primaryText}>Tænd</Text></TouchableOpacity>
          <TouchableOpacity style={styles.secondary} onPress={()=> commandBus.powerOff()}><Text style={styles.secondaryText}>Sluk</Text></TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.small}>Lysstyrke (%)</Text>
          <TextInput value={pct} onChangeText={setPct} keyboardType='numeric' style={styles.input} />
          <TouchableOpacity style={styles.primary} onPress={()=> commandBus.setBrightness(Number(pct)||0)}>
            <Text style={styles.primaryText}>Send lysstyrke</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor: colors.bg, padding: 16 },
  title:{ color: colors.text, fontSize: 22, fontWeight:'700', marginBottom: 8 },
  row:{ flexDirection:'row', gap: 10, marginBottom: 12 },
  card:{ backgroundColor: colors.card, padding: 12, borderRadius: 12, marginBottom: 12 },
  small:{ color: '#b7c6dd', marginBottom: 6 },
  input:{ backgroundColor: '#142539', borderRadius: 8, color: colors.text, paddingHorizontal: 10, paddingVertical: 8, marginBottom: 8 },
  primary:{ backgroundColor: colors.tint, paddingVertical: 12, borderRadius: 12, alignItems: 'center', paddingHorizontal: 16 },
  primaryText:{ color: '#001123', fontWeight: '700' },
  secondary:{ backgroundColor: colors.card, paddingVertical: 12, borderRadius: 12, alignItems: 'center', paddingHorizontal: 16 },
  secondaryText:{ color: colors.text, fontWeight: '700' }
});