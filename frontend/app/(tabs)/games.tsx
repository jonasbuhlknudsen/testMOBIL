import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { ThemedBackground, Tile } from '../../src/ui/components';
import { HeroSection } from '../../src/ui/HeroSection';
import { Link } from 'expo-router';
import { spacing } from '../../src/ui/theme';

export default function Games(){
  return (
    <ThemedBackground>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <HeroSection 
          title="Spil til iDot-3"
          subtitle="Klassiske spil som streamer til LED-skærmen"
        />
        <Link href="/games/snake" asChild><Tile icon="fish" title="Snake" subtitle="Klassisk" onPress={()=>{}} /></Link>
        <Link href="/games/tetris" asChild><Tile icon="grid" title="Tetris" subtitle="Faldende klodser" onPress={()=>{}} /></Link>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: spacing.md },
});