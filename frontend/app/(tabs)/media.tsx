import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedBackground, Tile } from '../../src/ui/components';
import { HeroSection } from '../../src/ui/HeroSection';
import { Link } from 'expo-router';
import { spacing } from '../../src/ui/theme';

export default function Media(){
  return (
    <ThemedBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <HeroSection 
          title="Media & indhold"
          subtitle="Billeder, tekst og diagnostik for din iDot-3"
        />
        <Link href="/music-visualizer" asChild><Tile icon="musical-notes" title="Music Visualizer" subtitle="Lyd-reaktive LED displays" onPress={()=>{}} accent={true} /></Link>
        <Link href="/advanced-features" asChild><Tile icon="construct" title="Advanced Features" subtitle="DIY Editor og Musik/Mikrofon" onPress={()=>{}} /></Link>
        <Link href="/media-library" asChild><Tile icon="albums-outline" title="Media Bibliotek" subtitle="Billeder, GIF'er og templates" onPress={()=>{}} /></Link>
        <Link href="/image" asChild><Tile icon="camera" title="Kamera/Upload" subtitle="Tag billede eller upload fil" onPress={()=>{}} /></Link>
        <Link href="/text" asChild><Tile icon="text" title="Tekst Scroller" subtitle="Scrollende tekst meddelelser" onPress={()=>{}} /></Link>
        <Link href="/status" asChild><Tile icon="information-circle" title="Status & Diagnostik" subtitle="Device info og BLE status" onPress={()=>{}} /></Link>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
});