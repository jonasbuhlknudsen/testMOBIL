/**
 * Phase 4 Features skærm til LOY PLAY-paritet
 * IC/Pixel Setup + Timers & Schedules + Groups & Sync
 */

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { ThemedBackground } from '../src/ui/components';
import { ICPixelSetup } from '../src/ui/ICPixelSetup';
import { TimersSchedules } from '../src/ui/TimersSchedules';
import { GroupsSync } from '../src/ui/GroupsSync';
import { HeroSection } from '../src/ui/HeroSection';
import { spacing } from '../src/ui/theme';

export default function Phase4FeaturesScreen() {
  const [activeTab, setActiveTab] = useState<'setup' | 'timers' | 'groups'>('setup');

  return (
    <ThemedBackground>
      <ScrollView style={styles.container}>
        {/* Hero Section */}
        <HeroSection
          title="Phase 4 Features"
          subtitle="IC/Pixel Setup, Timers & Schedules, Groups & Sync"
        />

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <View style={styles.tabButtons}>
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'setup' && styles.tabButtonActive]}
              onPress={() => setActiveTab('setup')}
            >
              <Text style={[styles.tabText, activeTab === 'setup' && styles.tabTextActive]}>
                IC/Pixel Setup
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'timers' && styles.tabButtonActive]}
              onPress={() => setActiveTab('timers')}
            >
              <Text style={[styles.tabText, activeTab === 'timers' && styles.tabTextActive]}>
                Timers & Schedules
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.tabButton, activeTab === 'groups' && styles.tabButtonActive]}
              onPress={() => setActiveTab('groups')}
            >
              <Text style={[styles.tabText, activeTab === 'groups' && styles.tabTextActive]}>
                Groups & Sync
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Content */}
        {activeTab === 'setup' && <ICPixelSetup />}
        {activeTab === 'timers' && <TimersSchedules />}
        {activeTab === 'groups' && <GroupsSync />}
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
    paddingHorizontal: spacing.xs,
    borderRadius: 6,
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#00d4ff',
  },
  tabText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  tabTextActive: {
    color: '#001a2e',
  },
});