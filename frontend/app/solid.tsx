import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { commandBus } from "../src/protocol/commandBus";
import { ThemedBackground, Card, PrimaryButton, SecondaryButton } from "../src/ui/components";
import { palette, spacing } from "../src/ui/theme";
import * as Haptics from 'expo-haptics';

function clamp(n: number) { return Math.max(0, Math.min(255, n)); }
function toHex(n: number) { return clamp(n).toString(16).toUpperCase().padStart(2, "0"); }

export default function SolidColor() {
  const [r, setR] = useState(0);
  const [g, setG] = useState(0);
  const [b, setB] = useState(255);

  const adjustR = (delta: number) => () => { 
    Haptics.selectionAsync(); 
    setR(v => clamp(v + delta)); 
  };
  const adjustG = (delta: number) => () => { 
    Haptics.selectionAsync(); 
    setG(v => clamp(v + delta)); 
  };
  const adjustB = (delta: number) => () => { 
    Haptics.selectionAsync(); 
    setB(v => clamp(v + delta)); 
  };

  return (
    <ThemedBackground>
      <View style={styles.container}>
        <Card>
          <Text style={styles.title}>Hel farve</Text>
          <View style={styles.previewWrapper}>
            <View style={[styles.preview, { backgroundColor: `rgb(${r},${g},${b})` }]} />
            <Text style={styles.previewText}>#{toHex(r)}{toHex(g)}{toHex(b)}</Text>
          </View>
          {[
            {label:'R',value:r,adjust:adjustR},
            {label:'G',value:g,adjust:adjustG},
            {label:'B',value:b,adjust:adjustB}
          ].map((c)=> (
            <View key={c.label} style={styles.row}> 
              <Text style={styles.label}>{c.label}</Text>
              <SecondaryButton title="-10" onPress={c.adjust(-10)} />
              <SecondaryButton title="-1" onPress={c.adjust(-1)} />
              <View style={styles.valueBox}><Text style={styles.valueText}>{c.value}</Text></View>
              <SecondaryButton title="+1" onPress={c.adjust(+1)} />
              <SecondaryButton title="+10" onPress={c.adjust(+10)} />
            </View>
          ))}
          <View style={{ height: spacing.sm }} />
          <PrimaryButton title="Send farve" onPress={()=> { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); commandBus.setColorRGB(r,g,b); }} />
        </Card>
      </View>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.md },
  title: { color: palette.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  label: { color: palette.text, width: 18 },
  valueBox: { minWidth: 56, alignItems: 'center', paddingVertical: 8, backgroundColor: '#142539', borderRadius: 8 },
  valueText: { color: palette.text, fontWeight: '700' },
  previewWrapper: { alignItems: 'center', marginVertical: 12 },
  preview: { width: 180, height: 100, borderRadius: 16, borderWidth: 1, borderColor: '#203248' },
  previewText: { color: palette.text, marginTop: 6 },
});