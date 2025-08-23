import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { useBleStore } from "../../src/store/bleStore";
import { packPixels, buildSOF, buildCHUNK, buildEOF, PixelFormat } from "../../src/utils/imageProtocol";

const colors = { bg: "#0b141b", card: "#0f2741", cardAlt: "#0d253d", text: "#e6f0ff", tint: "#3aa0ff" };

const W = 16, H = 24; // Tetris matrix (højere for bedre spil)
const fmt: PixelFormat = 'RGB565LE';
const TICK_MS = 280;

type Cell = 0 | 1; // 1 = blok

type Piece = { shape: number[][]; color: [number, number, number] };
const PIECES: Piece[] = [
  { shape: [[1,1,1,1]], color: [0, 220, 255] }, // I
  { shape: [[1,1,1],[0,1,0]], color: [180, 0, 255] }, // T
  { shape: [[1,1,0],[0,1,1]], color: [255, 200, 0] }, // Z
  { shape: [[0,1,1],[1,1,0]], color: [0, 255, 120] }, // S
  { shape: [[1,1],[1,1]], color: [255, 160, 0] }, // O
  { shape: [[1,0,0],[1,1,1]], color: [255, 80, 80] }, // L
  { shape: [[0,0,1],[1,1,1]], color: [80, 160, 255] }, // J
];

function rotate(shape: number[][]): number[][] { // 90°
  const h = shape.length, w = shape[0].length;
  const out: number[][] = Array.from({ length: w }, () => Array(h).fill(0));
  for (let y=0;y<h;y++) for (let x=0;x<w;x++) out[x][h-1-y] = shape[y][x];
  return out;
}

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

export default function Tetris(){
  const ble = useBleStore();
  const [grid, setGrid] = useState<Cell[][]>(()=> Array.from({length:H}, () => Array(W).fill(0 as Cell)));
  const [piece, setPiece] = useState<Piece>(()=> PIECES[Math.floor(Math.random()*PIECES.length)]);
  const [pos, setPos] = useState<P>({ x: Math.floor(W/2)-1, y: 0 });
  const [shape, setShape] = useState<number[][]>(piece.shape);
  const running = useRef(true);
  const [score, setScore] = useState(0);

  const collide = useCallback((s: number[][], p: P) => {
    for (let y=0;y<s.length;y++) for (let x=0;x<s[0].length;x++) if (s[y][x]){
      const gx = p.x + x, gy = p.y + y;
      if (gx<0 || gx>=W || gy>=H) return true;
      if (gy>=0 && grid[gy][gx]) return true;
    }
    return false;
  }, [grid]);

  const lockPiece = useCallback(()=>{
    const g = grid.map(r=> r.slice());
    for (let y=0;y<shape.length;y++) for (let x=0;x<shape[0].length;x++) if (shape[y][x]){
      const gx = pos.x + x, gy = pos.y + y; if (gy>=0 && gy<H && gx>=0 && gx<W) g[gy][gx]=1 as Cell;
    }
    // clear lines
    let cleared=0;
    for (let y=H-1;y>=0;y--) {
      if (g[y].every(v=> v===1)) { g.splice(y,1); g.unshift(Array(W).fill(0 as Cell)); cleared++; y++; }
    }
    if (cleared>0) setScore(s=> s + cleared*100);
    setGrid(g);
    // new piece
    const np = PIECES[Math.floor(Math.random()*PIECES.length)];
    setPiece(np); setShape(np.shape); setPos({ x: Math.floor(W/2)-1, y: 0 });
    if (collide(np.shape, { x: Math.floor(W/2)-1, y: 0 })) { running.current=false; Alert.alert('Game over','Ingen plads til ny brik'); }
  }, [grid, shape, pos, collide]);

  const tick = useCallback(()=>{
    const next = { x: pos.x, y: pos.y + 1 };
    if (!collide(shape, next)) setPos(next); else lockPiece();
  }, [pos, shape, collide, lockPiece]);

  const move = (dx:number) => ()=> {
    const next = { x: pos.x + dx, y: pos.y };
    if (!collide(shape, next)) setPos(next);
  };
  const rot = () => {
    const rs = rotate(shape);
    if (!collide(rs, pos)) setShape(rs);
  };
  const drop = () => {
    let p = { ...pos };
    while (!collide(shape, { x: p.x, y: p.y + 1 })) p.y++;
    setPos(p); lockPiece();
  };

  const drawAndSend = useCallback(async()=>{
    const rgba = rgbaBuffer(W,H,(set)=>{
      // draw settled blocks
      for (let y=0;y<H;y++) for (let x=0;x<W;x++) if (grid[y][x]) set(x,y, 60,200,255);
      // draw current piece
      for (let y=0;y<shape.length;y++) for (let x=0;x<shape[0].length;x++) if (shape[y][x]){
        const gx = pos.x + x, gy = pos.y + y; set(gx, gy, ...piece.color);
      }
    });
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

      let attempts=0; let ok=false; while(!ok && attempts<=ble.retriesSOF){ attempts++; try{ await ble.sendChunks([sof],{withoutResponse:false}); await ble.waitForAck(ble.ackTimeoutMs); ok=true;}catch{}}
      if(!ok) return;
      for(const c of chunks){ await ble.sendChunks([c],{withoutResponse:true}); if(ble.chunkAckEnabled){ try{ await ble.waitForAck(ble.chunkAckTimeoutMs);}catch{}} }
      attempts=0; ok=false; while(!ok && attempts<=ble.retriesEOF){ attempts++; try{ await ble.sendChunks([eof],{withoutResponse:false}); await ble.waitForAck(ble.ackTimeoutMs); ok=true;}catch{}};
    } catch {}
  }, [grid, shape, pos, piece, fmt, ble]);

  useEffect(()=>{ running.current = true; const t = setInterval(()=>{ tick(); drawAndSend(); }, TICK_MS); return ()=>{ running.current=false; clearInterval(t);} }, [tick, drawAndSend]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tetris ({W}×{H}) — {score}p</Text>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={move(-1)}><Text style={styles.btnText}>◀</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={rot}><Text style={styles.btnText}>⟳</Text></TouchableOpacity>
        <TouchableOpacity style={styles.btn} onPress={move(1)}><Text style={styles.btnText}>▶</Text></TouchableOpacity>
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.btn} onPress={drop}><Text style={styles.btnText}>▼</Text></TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor: colors.bg, padding:16 },
  title:{ color: colors.text, fontSize: 18, fontWeight:'700', marginBottom: 8 },
  row:{ flexDirection:'row', gap: 16, marginVertical: 6 },
  btn:{ backgroundColor: colors.card, minWidth:64, height:64, borderRadius:16, alignItems:'center', justifyContent:'center', paddingHorizontal: 16 },
  btnText:{ color: colors.text, fontSize: 22, fontWeight:'700' },
});