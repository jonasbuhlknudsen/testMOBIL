import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, Alert, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { useBleStore } from "../src/store/bleStore";
import { decodePngBase64ToRgba, packPixels, buildSOF, buildCHUNK, buildEOF, PixelFormat } from "../src/utils/imageProtocol";
import { ThemedBackground, Card, PrimaryButton } from "../src/ui/components";
import { palette, spacing } from "../src/ui/theme";

export default function ImageTransfer(){
  const ble = useBleStore();
  const [img, setImg] = useState<string | null>(null); // base64 PNG
  const [w,setW]=useState(32); const [h,setH]=useState(32);
  const [chunkPayload,setChunkPayload]=useState(232);
  const [fmt,setFmt] = useState<PixelFormat>('RGB565LE');
  const [busy,setBusy]=useState(false);
  const [progress, setProgress] = useState(0);

  const pick = async ()=>{
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted){ Alert.alert('Tilladelse kræves','Giv adgang til billeder'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 1 });
    if (!res.canceled && res.assets && res.assets[0]){
      const manipulated = await ImageManipulator.manipulateAsync(res.assets[0].uri, [{ resize: { width: w, height: h } }], { compress: 1, format: ImageManipulator.SaveFormat.PNG, base64: true });
      setImg(manipulated.base64 ?? null);
    }
  };

  const send = async ()=>{
    if (!img){ Alert.alert('Ingen billede','Vælg et billede først'); return; }
    try{
      setBusy(true); setProgress(0);
      const { width, height, rgba } = decodePngBase64ToRgba(img);
      const pixels = packPixels(rgba, fmt);

      let frameId = Math.floor(Math.random()*255);
      const bytesPerPixel = fmt==='RGB565LE'?2:3;
      const rowSize = width * bytesPerPixel;
      const chunks: Uint8Array[] = [];

      let rowStart = 0;
      while (rowStart < height){
        let payloadBytes = 0; let rowsInChunk = 0; const payload = new Uint8Array(chunkPayload); let p=0;
        while (rowStart + rowsInChunk < height) {
          if (payloadBytes + rowSize > chunkPayload) break;
          const start = (rowStart + rowsInChunk)*rowSize; const end = start + rowSize;
          payload.set(pixels.subarray(start,end), p); p += rowSize; payloadBytes += rowSize; rowsInChunk++;
        }
        const actualPayload = payload.subarray(0, payloadBytes);
        const pkt = buildCHUNK(frameId, rowStart, rowsInChunk, actualPayload);
        chunks.push(pkt); rowStart += rowsInChunk;
      }

      const sof = buildSOF(frameId, width, height, fmt, chunks.length);
      const eof = buildEOF(frameId, chunks.length);

      // SOF med retry/ACK
      let ok = false; let attempts = 0;
      while (!ok && attempts <= ble.retriesSOF) { attempts++; try { await ble.sendChunks([sof], { withoutResponse: false }); await ble.waitForAck(ble.ackTimeoutMs); ok = true; } catch {} }
      if (!ok) throw new Error('SOF ACK timeout');

      let sent = 0;
      for (const c of chunks) {
        await ble.sendChunks([c], { withoutResponse: true });
        sent++; setProgress(Math.round(100*sent/chunks.length));
        if (ble.chunkAckEnabled) { try { await ble.waitForAck(ble.chunkAckTimeoutMs); } catch { throw new Error('CHUNK ACK timeout'); } }
      }

      // EOF med retry/ACK
      ok = false; attempts = 0;
      while (!ok && attempts <= ble.retriesEOF) { attempts++; try { await ble.sendChunks([eof], { withoutResponse: false }); await ble.waitForAck(ble.ackTimeoutMs); ok = true; } catch {} }
      if (!ok) throw new Error('EOF ACK timeout');

      Alert.alert('Sendt', `Billede ${width}x${height} sendt i ${chunks.length} chunke(s)`);
    }catch(e:any){ Alert.alert('Fejl', e?.message??String(e)); }
    finally{ setBusy(false); }
  };

  const ProgressBar = useMemo(()=> (
    <View style={styles.progressOuter}><View style={[styles.progressInner, { width: `${progress}%` }]} /></View>
  ),[progress]);

  return (
    <ThemedBackground>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={{flex:1}} contentContainerStyle={styles.container}>
          <Card>
            <Text style={styles.title}>Billede → LED</Text>
            <Text style={styles.hint}>PNG → {fmt}. SOF/CHUNK/EOF med CRC16-CCITT. Payload≈{chunkPayload} (MTU≈247). ACK timeout: {ble.ackTimeoutMs}ms</Text>
            <View style={styles.row}><PrimaryButton title="Vælg billede" onPress={pick} /></View>
            <View style={styles.row}><Text style={styles.label}>Bredde</Text><TextInput keyboardType='numeric' style={styles.input} value={String(w)} onChangeText={(t)=> setW(Number(t)||0)} /><Text style={styles.label}>Højde</Text><TextInput keyboardType='numeric' style={styles.input} value={String(h)} onChangeText={(t)=> setH(Number(t)||0)} /></View>
            <View style={styles.row}><Text style={styles.label}>Payload bytes/chunk</Text><TextInput keyboardType='numeric' style={styles.input} value={String(chunkPayload)} onChangeText={(t)=> setChunkPayload(Number(t)||0)} /></View>
            <View style={{marginVertical:8}}>{ProgressBar}</View>
            <View style={styles.rowWrap}>
              <PrimaryButton title={`Format: ${fmt}`} onPress={()=> setFmt(fmt==='RGB565LE'?'RGB888':fmt==='RGB888'?'GRB888':'RGB565LE')} />
              <PrimaryButton title={busy? 'Sender...' : 'Send billede'} onPress={send} />
            </View>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container:{ padding: spacing.md },
  title:{ color: palette.text, fontSize: 18, fontWeight:'700', marginBottom: 6 },
  hint:{ color: palette.muted, marginBottom: 8 },
  row:{ flexDirection:'row', alignItems:'center', gap: 10, marginBottom: 10 },
  rowWrap:{ flexDirection:'row', alignItems:'center', gap: 10, flexWrap:'wrap' },
  label:{ color: palette.text },
  input:{ backgroundColor:'#142539', color: palette.text, paddingHorizontal:10, paddingVertical:8, borderRadius:8, minWidth:80 },
  progressOuter:{ height: 8, backgroundColor:'#142539', borderRadius: 6, overflow:'hidden' },
  progressInner:{ height: '100%', backgroundColor:'#3aa0ff' }
});