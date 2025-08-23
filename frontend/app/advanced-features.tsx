/**
 * Advanced Features skærm til LOY PLAY-paritet
 * DIY Editor + Musik/Mikrofon controls
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { ThemedBackground } from '../src/ui/components';
import { DIYEditor } from '../src/ui/DIYEditor';
import { MusicControls } from '../src/ui/MusicControls';
import { HeroSection } from '../src/ui/HeroSection';
import { spacing } from '../src/ui/theme';

export default function AdvancedFeaturesScreen() {
  const [activeTab, setActiveTab] = useState<'diy' | 'music'>('diy');

  return (
    <ThemedBackground>
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <HeroSection
          title="Advanced Features"
          subtitle="DIY Editor og Musik/Mikrofon reaktion"
        />

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <View style={styles.tabButtons}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'diy' && styles.tabButtonActive]}
              onPress={() => setActiveTab('diy')}
            >
              <Text style={[styles.tabText, activeTab === 'diy' && styles.tabTextActive]}>
                DIY Editor
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'music' && styles.tabButtonActive]}
              onPress={() => setActiveTab('music')}
            >
              <Text style={[styles.tabText, activeTab === 'music' && styles.tabTextActive]}>
                Musik & Mikrofon
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {activeTab === 'diy' ? <DIYEditor /> : <MusicControls />}
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