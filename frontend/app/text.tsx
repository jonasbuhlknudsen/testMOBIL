import React, { useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { useBleStore } from "../src/store/bleStore";
import { buildSOF, buildCHUNK, buildEOF, packPixels, PixelFormat } from "../src/utils/imageProtocol";

const colors = { bg: "#0b141b", card: "#0f2741", cardAlt: "#0d253d", text: "#e6f0ff", tint: "#3aa0ff" };

// Minimal 5x7 font (subset A-Z 0-9 space)
const FONT: Record<string, number[]> = {
  ' ': [0,0,0,0,0,0,0],
  'A': [0b01110,0b10001,0b10001,0b11111,0b10001,0b10001,0b10001],
  'B': [0b11110,0b10001,0b11110,0b10001,0b10001,0b10001,0b11110],
  'C': [0b01111,0b10000,0b10000,0b10000,0b10000,0b10000,0b01111],
  'D': [0b11110,0b10001,0b10001,0b10001,0b10001,0b10001,0b11110],
  'E': [0b11111,0b10000,0b11110,0b10000,0b10000,0b10000,0b11111],
  'F': [0b11111,0b10000,0b11110,0b10000,0b10000,0b10000,0b10000],
  'G': [0b01111,0b10000,0b10000,0b10011,0b10001,0b10001,0b01111],
  'H': [0b10001,0b10001,0b11111,0b10001,0b10001,0b10001,0b10001],
  'I': [0b01110,0b00100,0b00100,0b00100,0b00100,0b00100,0b01110],
  'J': [0b00111,0b00010,0b00010,0b00010,0b00010,0b10010,0b01100],
  'K': [0b10001,0b10010,0b11100,0b10010,0b10010,0b10010,0b10001],
  'L': [0b10000,0b10000,0b10000,0b10000,0b10000,0b10000,0b11111],
  'M': [0b10001,0b11011,0b10101,0b10101,0b10001,0b10001,0b10001],
  'N': [0b10001,0b11001,0b10101,0b10011,0b10001,0b10001,0b10001],
  'O': [0b01110,0b10001,0b10001,0b10001,0b10001,0b10001,0b01110],
  'P': [0b11110,0b10001,0b10001,0b11110,0b10000,0b10000,0b10000],
  'Q': [0b01110,0b10001,0b10001,0b10001,0b10101,0b10010,0b01101],
  'R': [0b11110,0b10001,0b10001,0b11110,0b10010,0b10010,0b10001],
  'S': [0b01111,0b10000,0b01110,0b00001,0b00001,0b00001,0b11110],
  'T': [0b11111,0b00100,0b00100,0b00100,0b00100,0b00100,0b00100],
  'U': [0b10001,0b10001,0b10001,0b10001,0b10001,0b10001,0b01110],
  'V': [0b10001,0b10001,0b10001,0b10001,0b10001,0b01010,0b00100],
  'W': [0b10001,0b10001,0b10101,0b10101,0b11011,0b10001,0b10001],
  'X': [0b10001,0b01010,0b00100,0b00100,0b01010,0b10001,0b10001],
  'Y': [0b10001,0b01010,0b00100,0b00100,0b00100,0b00100,0b00100],
  'Z': [0b11111,0b00001,0b00010,0b00100,0b01000,0b10000,0b11111],
  '0': [0b01110,0b10001,0b10011,0b10101,0b11001,0b10001,0b01110],
  '1': [0b00100,0b01100,0b00100,0b00100,0b00100,0b00100,0b01110],
  '2': [0b01110,0b10001,0b00001,0b00110,0b01000,0b10000,0b11111],
  '3': [0b11110,0b00001,0b00110,0b00001,0b00001,0b10001,0b01110],
  '4': [0b00010,0b00110,0b01010,0b10010,0b11111,0b00010,0b00010],
  '5': [0b11111,0b10000,0b11110,0b00001,0b00001,0b10001,0b01110],
  '6': [0b01110,0b10000,0b11110,0b10001,0b10001,0b10001,0b01110],
  '7': [0b11111,0b00010,0b00100,0b00100,0b01000,0b01000,0b01000],
  '8': [0b01110,0b10001,0b01110,0b10001,0b10001,0b10001,0b01110],
  '9': [0b01110,0b10001,0b10001,0b01111,0b00001,0b00001,0b01110],
};

function renderTextToRgba(text: string, width: number, height: number, fg:[number,number,number], bg:[number,number,number], scrollX:number): Uint8Array {
  const rgba = new Uint8Array(width*height*4);
  const set = (x:number,y:number,r:number,g:number,b:number)=>{
    if (x<0||y<0||x>=width||y>=height) return; const i=(y*width+x)*4; rgba[i]=r; rgba[i+1]=g; rgba[i+2]=b; rgba[i+3]=255;
  };
  // fill bg
  for (let y=0;y<height;y++) for (let x=0;x<width;x++) set(x,y, ...bg);
  const chars = text.toUpperCase().split("");
  const charW = 5, charH = 7, spacing=1;
  let curX = -scrollX;
  for (const ch of chars){
    const glyph = FONT[ch] || FONT[' '];
    for (let gy=0; gy<charH; gy++){
      const row = glyph[gy];
      for (let gx=0; gx<charW; gx++){
        const on = (row >> (charW-1-gx)) & 1;
        if (on) set(curX+gx, 1+gy, ...fg); // y offset 1 for lidt margin
      }
    }
    curX += charW + spacing;
  }
  return rgba;
}

export default function TextScreen(){
  const ble = useBleStore();
  const [value, setValue] = useState("NERDVÆRKET");
  const [w,setW] = useState(16); const [h,setH] = useState(16);
  const [speed,setSpeed] = useState(2); // pixels per frame
  const [fmt,setFmt] = useState<PixelFormat>('RGB565LE');
  const [fg,setFg] = useState<[number,number,number]>([255,255,255]);
  const [bg,setBg] = useState<[number,number,number]>([8,12,18]);
  const [running,setRunning] = useState(false);
  const scrollRef = useRef(0);

  const sendFrame = async (rgba: Uint8Array) => {
    const pixels = packPixels(rgba, fmt);
    const bpp = fmt==='RGB565LE'?2:3; const rowSize = w*bpp;
    const chunks: Uint8Array[] = []; let rowStart=0; const chunkPayload=232; const frameId = Math.floor(Math.random()*255);
    while (rowStart < h) {
      let payloadBytes=0, rowsInChunk=0; const payload=new Uint8Array(chunkPayload); let p=0;
      while (rowStart+rowsInChunk < h) {
        if (payloadBytes + rowSize > chunkPayload) break;
        const start=(rowStart+rowsInChunk)*rowSize; const end=start+rowSize;
        payload.set(pixels.subarray(start,end), p); p+=rowSize; payloadBytes+=rowSize; rowsInChunk++;
      }
      const actual = payload.subarray(0,payloadBytes);
      chunks.push(buildCHUNK(frameId, rowStart, rowsInChunk, actual));
      rowStart+=rowsInChunk;
    }
    const sof = buildSOF(frameId, w, h, fmt, chunks.length);
    const eof = buildEOF(frameId, chunks.length);
    let ok=false; let attempts=0; while(!ok && attempts<=ble.retriesSOF){ attempts++; try{ await ble.sendChunks([sof],{withoutResponse:false}); await ble.waitForAck(ble.ackTimeoutMs); ok=true;}catch{}}
    if(!ok) return;
    for(const c of chunks){ await ble.sendChunks([c],{withoutResponse:true}); if(ble.chunkAckEnabled){ try{ await ble.waitForAck(ble.chunkAckTimeoutMs);}catch{}} }
    ok=false; attempts=0; while(!ok && attempts<=ble.retriesEOF){ attempts++; try{ await ble.sendChunks([eof],{withoutResponse:false}); await ble.waitForAck(ble.ackTimeoutMs); ok=true;}catch{}};
  };

  const start = async () => {
    if (running) return; setRunning(true); scrollRef.current = 0;
    const totalWidth = value.length*(5+1); // approx
    const maxScroll = totalWidth + w;
    const loop = async () => {
      if (!running) return;
      const rgba = renderTextToRgba(value, w, h, fg, bg, scrollRef.current);
      try{ await sendFrame(rgba); }catch{}
      scrollRef.current += speed; if (scrollRef.current > maxScroll) scrollRef.current = 0;
      setTimeout(loop, 140);
    };
    loop();
  };
  const stop = () => setRunning(false);

  return (
    <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
      <View style={styles.container}>
        <Text style={styles.title}>Tekst-scroller</Text>
        <Text style={styles.hint}>Vælg en kort tekst. Default opløsning {w}×{h}. Brug Indstillinger for ACK/retries.</Text>
        <TextInput value={value} onChangeText={setValue} placeholder="NERDVÆRKET" placeholderTextColor="#7f93b1" style={styles.input} />
        <View style={styles.row}><Text style={styles.label}>Bredde</Text><TextInput keyboardType='numeric' style={styles.num} value={String(w)} onChangeText={(t)=> setW(Number(t)||0)} /><Text style={styles.label}>Højde</Text><TextInput keyboardType='numeric' style={styles.num} value={String(h)} onChangeText={(t)=> setH(Number(t)||0)} /></View>
        <View style={styles.row}><Text style={styles.label}>Fart</Text><TextInput keyboardType='numeric' style={styles.num} value={String(speed)} onChangeText={(t)=> setSpeed(Number(t)||0)} /></View>
        <View style={styles.row}><TouchableOpacity style={styles.primary} onPress={start}><Text style={styles.primaryText}>Start</Text></TouchableOpacity><TouchableOpacity style={styles.secondary} onPress={stop}><Text style={styles.secondaryText}>Stop</Text></TouchableOpacity></View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor: colors.bg, padding: 16 },
  title:{ color: colors.text, fontSize: 22, fontWeight:'700', marginBottom: 6 },
  hint:{ color: '#b7c6dd', marginBottom: 8 },
  input:{ backgroundColor: '#142539', color: colors.text, paddingHorizontal: 10, paddingVertical: 12, borderRadius: 10, marginBottom: 12 },
  row:{ flexDirection:'row', alignItems:'center', gap: 10, marginBottom: 10 },
  label:{ color: colors.text },
  num:{ backgroundColor:'#142539', color: colors.text, paddingHorizontal:10, paddingVertical:8, borderRadius:8, minWidth:80 },
  primary:{ backgroundColor: colors.tint, paddingVertical: 12, borderRadius: 12, alignItems:'center', paddingHorizontal: 16 },
  primaryText:{ color:'#001123', fontWeight:'700' },
  secondary:{ backgroundColor: colors.card, paddingVertical: 12, borderRadius: 12, alignItems:'center', paddingHorizontal: 16 },
  secondaryText:{ color: colors.text, fontWeight:'700' }
});