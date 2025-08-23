/**
 * Farve & Scene kontrolskærm til LOY PLAY-paritet
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { ThemedBackground } from '../src/ui/components';
import { ColorControls } from '../src/ui/ColorControls';
import { SceneControls } from '../src/ui/SceneControls';
import { HeroSection } from '../src/ui/HeroSection';
import { spacing } from '../src/ui/theme';

export default function ColorControlScreen() {
  const [activeTab, setActiveTab] = useState<'color' | 'scene'>('color');

  return (
    <ThemedBackground>
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <HeroSection
          title="Farve & Scene Control"
          subtitle="Professionel LED kontrol med LOY PLAY-paritet"
          icon="color-palette"
        />

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <View style={styles.tabButtons}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'color' && styles.tabButtonActive]}
              onPress={() => setActiveTab('color')}
            >
              <Text style={[styles.tabText, activeTab === 'color' && styles.tabTextActive]}>
                Farve Controls
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'scene' && styles.tabButtonActive]}
              onPress={() => setActiveTab('scene')}
            >
              <Text style={[styles.tabText, activeTab === 'scene' && styles.tabTextActive]}>
                Scener & Effekter
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {activeTab === 'color' ? <ColorControls /> : <SceneControls />}
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  tabButtons: {
    flexDirection: 'row',
    backgroundColor: 'rgba(122,140,160,0.1)',
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#00d4ff',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#001a2e',
  },
});