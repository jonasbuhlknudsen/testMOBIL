import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useBleStore } from "../../src/store/bleStore";
import { packPixels, buildSOF, buildCHUNK, buildEOF, PixelFormat } from "../../src/utils/imageProtocol";

const colors = { bg: "#0b141b", card: "#0f2741", cardAlt: "#0d253d", text: "#e6f0ff", tint: "#3aa0ff" };

const W = 16, H = 16; // matrix
const fmt: PixelFormat = 'RGB565LE';
const SPEED_MS = 180;

function rgbaBuffer(width: number, height: number, draw: (set:(x:number,y:number,r:number,g:number,b:number)=>void)=>void){
  const rgba = new Uint8Array(width*height*4);
  const set = (x:number,y:number,r:number,g:number,b:number)=>{
    if (x<0||y<0||x>=width||y>=height) return;
    const i = (y*width+x)*4; rgba[i]=r; rgba[i+1]=g; rgba[i+2]=b; rgba[i+3]=255;
  };
  // background
  for(let y=0;y<height;y++) for(let x=0;x<width;x++) set(x,y,8,12,18);
  draw(set); return rgba;
}

type P = {x:number;y:number};

export default function Snake(){
  const ble = useBleStore();
  const [dir,setDir] = useState<P>({x:1,y:0});
  const [snake,setSnake] = useState<P[]>([{x:4,y:8},{x:3,y:8},{x:2,y:8}]);
  const [apple,setApple] = useState<P>({x:10,y:8});
  const running = useRef(true);

  const step = useCallback(async ()=>{
    if (!running.current) return;
    const head = snake[0];
    const next = { x: (head.x+dir.x+W)%W, y: (head.y+dir.y+H)%H };
    let newSnake = [next, ...snake];
    let ate = (next.x===apple.x && next.y===apple.y);
    if (!ate) newSnake.pop(); else setApple({ x: Math.floor(Math.random()*W), y: Math.floor(Math.random()*H) });
    // collision with self
    if (newSnake.slice(1).some(p=> p.x===next.x && p.y===next.y)) {
      running.current = false; Alert.alert('Game over','Slangen ramte sig selv'); return; }
    setSnake(newSnake);

    // build frame
    const rgba = rgbaBuffer(W,H,(set)=>{
      // apple
      set(apple.x, apple.y, 255, 0, 0);
      // snake
      newSnake.forEach((p,i)=> set(p.x,p.y, 0, i===0?255:160, 80));
    });

    // send frame via BLE (som i Image)
    try {
      const pixels = packPixels(rgba, fmt);
      const bpp = fmt==='RGB565LE'?2:3; const rowSize = W*bpp;
      const chunks: Uint8Array[] = []; let rowStart=0; const chunkPayload=232; const frameId = Math.floor(Math.random()*255);
      while (rowStart < H) {
        let payloadBytes=0, rowsInChunk=0; const payload=new Uint8Array(chunkPayload); let p=0;
        while (rowStart+rowsInChunk < H) {
          if (payloadBytes + rowSize > chunkPayload) break;
          const start=(rowStart+rowsInChunk)*rowSize; const end=start+rowSize;
          payload.set(pixels.subarray(start,end), p); p+=rowSize; payloadBytes+=rowSize; rowsInChunk++;
        }
        const actual = payload.subarray(0,payloadBytes);
        chunks.push(buildCHUNK(frameId, rowStart, rowsInChunk, actual));
        rowStart+=rowsInChunk;
      }
      const sof = buildSOF(frameId, W, H, fmt, chunks.length);
      const eof = buildEOF(frameId, chunks.length);

      // streng ACK som i image
      let attempts=0; let ok=false; while(!ok && attempts<=ble.retriesSOF){ attempts++; try{ await ble.sendChunks([sof],{withoutResponse:false}); await ble.waitForAck(ble.ackTimeoutMs); ok=true;}catch{}}
      if(!ok) return;
      for(const c of chunks){ await ble.sendChunks([c],{withoutResponse:true}); if(ble.chunkAckEnabled){ try{ await ble.waitForAck(ble.chunkAckTimeoutMs);}catch{}} }
      attempts=0; ok=false; while(!ok && attempts<=ble.retriesEOF){ attempts++; try{ await ble.sendChunks([eof],{withoutResponse:false}); await ble.waitForAck(ble.ackTimeoutMs); ok=true;}catch{}};
    } catch (e:any) { /* ignore one frame error */ }
  }, [snake, dir, apple]);

  useEffect(()=>{
    running.current = true;
    const t = setInterval(step, SPEED_MS);
    return ()=> { running.current=false; clearInterval(t); };
  }, [step]);

  const turn = (dx:number,dy:number) => () => {
    // forhindre direkte 180° vending
    if (snake.length>1 && snake[0].x+dx===snake[1].x && snake[0].y+dy===snake[1].y) return;
    setDir({x:dx,y:dy});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Snake ({W}×{H})</Text>
      <View style={styles.pad}> 
        <View style={styles.row}><TouchableOpacity style={styles.btn} onPress={turn(0,-1)}><Text style={styles.btnText}>↑</Text></TouchableOpacity></View>
        <View style={styles.row}><TouchableOpacity style={styles.btn} onPress={turn(-1,0)}><Text style={styles.btnText}>←</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={turn(1,0)}><Text style={styles.btnText}>→</Text></TouchableOpacity></View>
        <View style={styles.row}><TouchableOpacity style={styles.btn} onPress={turn(0,1)}><Text style={styles.btnText}>↓</Text></TouchableOpacity></View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor: colors.bg, padding:16 },
  title:{ color: colors.text, fontSize: 18, fontWeight:'700', marginBottom: 8 },
  pad:{ alignItems:'center', marginTop: 12 },
  row:{ flexDirection:'row', gap: 16, marginVertical: 6 },
  btn:{ backgroundColor: colors.card, width:64, height:64, borderRadius:16, alignItems:'center', justifyContent:'center' },
  btnText:{ color: colors.text, fontSize: 24, fontWeight:'700' },
});