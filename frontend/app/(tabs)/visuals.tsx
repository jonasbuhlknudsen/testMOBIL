import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Text, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { ThemedBackground } from '../../src/ui/components';
import { EnhancedCard, SectionHeader, EnhancedButton } from '../../src/ui/EnhancedComponents';
import { HeroSection } from '../../src/ui/HeroSection';
import { spacing, palette, radius } from '../../src/ui/theme';
import { Ionicons } from '@expo/vector-icons';
import { useBleStore } from '../../src/store/bleStore';

export default function VisualsScreen() {
  const { connectedDevice } = useBleStore();
  const [quickActions, setQuickActions] = useState({
    lastColor: { r: 255, g: 100, b: 50 },
    lastBrightness: 80,
    isOn: false
  });

  const visualFeatures = [
    {
      title: "Graffiti & Tegn",
      description: "Tegn dine egne designs og send til LED skærmen",
      icon: "brush",
      route: "/graffiti-draw",
      accent: true,
      features: ["32x32 Canvas", "Farvepalette", "Brush Sizes", "Quick Templates"]
    },
    {
      title: "Farve & Scene Control",
      description: "Avanceret farvehjul, CCT kontrol og scene presets",
      icon: "color-palette",
      route: "/color-control",
      accent: false,
      features: ["HSV Farvehjul", "CCT Kontrol", "Scene Presets", "Gamma Korrektion"]
    },
    {
      title: "Animations Bibliotek",
      description: "Hundredvis af professionelle LED animationer",
      icon: "library-outline", 
      route: "/animations",
      accent: false,
      features: ["100+ Animationer", "Speed Kontrol", "Fade Transitions", "Loop Indstillinger"]
    },
    {
      title: "Solid Farver",
      description: "Enkelt statisk farvevalg med præcision",
      icon: "radio-button-on",
      route: "/solid", 
      accent: false,
      features: ["RGB Præcision", "Hue/Sat Kontrol", "Brightness", "Instant Preview"]
    }
  ];

  const quickColorPresets = [
    { name: "Hvid", color: { r: 255, g: 255, b: 255 }, temp: 5000 },
    { name: "Varm Hvid", color: { r: 255, g: 230, b: 180 }, temp: 3000 },
    { name: "Rød", color: { r: 255, g: 0, b: 0 }, temp: null },
    { name: "Grøn", color: { r: 0, g: 255, b: 0 }, temp: null },
    { name: "Blå", color: { r: 0, g: 0, b: 255 }, temp: null },
    { name: "Lilla", color: { r: 128, g: 0, b: 128 }, temp: null },
    { name: "Cyan", color: { r: 0, g: 255, b: 255 }, temp: null },
    { name: "Orange", color: { r: 255, g: 165, b: 0 }, temp: null }
  ];

  return (
    <ThemedBackground>
      <ScrollView style={styles.container}>
        <HeroSection
          title="Visuelt"
          subtitle="Farver, animationer og effekter til din iDot-3"
        />

        {/* Quick Actions */}
        {connectedDevice && (
          <EnhancedCard elevated>
            <SectionHeader
              icon="flash"
              title="Hurtig Kontrol"
              subtitle="Øjeblikkelig adgang til almindelige funktioner"
            />
            
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity style={styles.powerButton}>
                <Ionicons 
                  name={quickActions.isOn ? "power" : "power-outline"} 
                  size={24} 
                  color={quickActions.isOn ? "#34C759" : palette.muted} 
                />
                <Text style={styles.quickActionLabel}>
                  {quickActions.isOn ? "Tændt" : "Slukket"}
                </Text>
              </TouchableOpacity>
              
              <View style={styles.brightnessControl}>
                <Ionicons name="sunny" size={20} color={palette.text} />
                <Text style={styles.brightnessText}>{quickActions.lastBrightness}%</Text>
              </View>
              
              <View style={styles.lastColorPreview}>
                <View style={[
                  styles.colorSwatch,
                  { backgroundColor: `rgb(${quickActions.lastColor.r}, ${quickActions.lastColor.g}, ${quickActions.lastColor.b})` }
                ]} />
                <Text style={styles.quickActionLabel}>Sidste Farve</Text>
              </View>
            </View>
          </EnhancedCard>
        )}

        {/* Color Presets */}
        <EnhancedCard elevated>
          <SectionHeader
            icon="color-filter"
            title="Hurtige Farvevalg"
            subtitle="Ét-tryk farveændringer"
          />
          
          <View style={styles.colorPresets}>
            {quickColorPresets.map((preset, index) => (
              <TouchableOpacity
                key={index}
                style={styles.colorPreset}
                activeOpacity={0.8}
              >
                <View style={[
                  styles.presetColor,
                  { backgroundColor: `rgb(${preset.color.r}, ${preset.color.g}, ${preset.color.b})` }
                ]} />
                <Text style={styles.presetName}>{preset.name}</Text>
                {preset.temp && (
                  <Text style={styles.presetTemp}>{preset.temp}K</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </EnhancedCard>

        {/* Main Features */}
        <SectionHeader
          icon="apps"
          title="Visueller"
          subtitle="Alle dine LED kontrol funktioner"
        />

        {visualFeatures.map((feature, index) => (
          <Link key={index} href={feature.route} asChild>
            <TouchableOpacity>
              <EnhancedCard 
                elevated 
                gradient={feature.accent}
                style={styles.featureCard}
              >
                <View style={styles.featureHeader}>
                  <View style={styles.featureIconContainer}>
                    <Ionicons 
                      name={feature.icon as any} 
                      size={28} 
                      color={feature.accent ? "#FFFFFF" : palette.tint} 
                    />
                  </View>
                  
                  <View style={styles.featureContent}>
                    <Text style={[
                      styles.featureTitle,
                      feature.accent && styles.featureTitleAccent
                    ]}>
                      {feature.title}
                    </Text>
                    <Text style={[
                      styles.featureDescription,
                      feature.accent && styles.featureDescriptionAccent
                    ]}>
                      {feature.description}
                    </Text>
                  </View>
                  
                  <View style={styles.featureArrow}>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={feature.accent ? "rgba(255,255,255,0.7)" : palette.muted} 
                    />
                  </View>
                </View>
                
                <View style={styles.featureList}>
                  {feature.features.map((feat, idx) => (
                    <View key={idx} style={styles.featureItem}>
                      <Ionicons 
                        name="checkmark-circle" 
                        size={16} 
                        color={feature.accent ? "rgba(255,255,255,0.8)" : "#34C759"} 
                      />
                      <Text style={[
                        styles.featureItemText,
                        feature.accent && styles.featureItemTextAccent
                      ]}>
                        {feat}
                      </Text>
                    </View>
                  ))}
                </View>
              </EnhancedCard>
            </TouchableOpacity>
          </Link>
        ))}

        {/* Status Info */}
        <EnhancedCard style={styles.statusCard}>
          <View style={styles.statusRow}>
            <View style={styles.statusItem}>
              <Ionicons 
                name={connectedDevice ? "checkmark-circle" : "close-circle"} 
                size={20} 
                color={connectedDevice ? "#34C759" : "#FF3B30"} 
              />
              <Text style={styles.statusText}>
                {connectedDevice ? "Forbundet" : "Ikke forbundet"}
              </Text>
            </View>
            
            <View style={styles.statusItem}>
              <Ionicons name="bulb" size={20} color={palette.tint} />
              <Text style={styles.statusText}>iDot-3 Ready</Text>
            </View>
          </View>
          
          {!connectedDevice && (
            <View style={styles.connectPrompt}>
              <Text style={styles.connectPromptText}>
                Forbind til din iDot-3 for at kontrollere LED funktioner
              </Text>
              <Link href="/(tabs)/connect" asChild>
                <EnhancedButton
                  title="Gå til Forbindelse"
                  variant="outline"
                  icon="bluetooth"
                  size="medium"
                  onPress={() => {}}
                />
              </Link>
            </View>
          )}
        </EnhancedCard>
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1 
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: spacing.md,
    marginTop: spacing.sm,
  },
  powerButton: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  quickActionLabel: {
    fontSize: 12,
    color: palette.text,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  brightnessControl: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  brightnessText: {
    fontSize: 12,
    color: palette.text,
    marginTop: spacing.xs,
  },
  lastColorPreview: {
    alignItems: 'center',
    padding: spacing.sm,
  },
  colorSwatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: palette.border,
  },
  colorPresets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  colorPreset: {
    alignItems: 'center',
    width: '22%',
    marginBottom: spacing.md,
  },
  presetColor: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: palette.border,
    marginBottom: spacing.xs,
  },
  presetName: {
    fontSize: 11,
    color: palette.text,
    textAlign: 'center',
  },
  presetTemp: {
    fontSize: 9,
    color: palette.muted,
    textAlign: 'center',
  },
  featureCard: {
    marginBottom: spacing.md,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: palette.text,
    marginBottom: spacing.xs,
  },
  featureTitleAccent: {
    color: '#FFFFFF',
  },
  featureDescription: {
    fontSize: 14,
    color: palette.muted,
    lineHeight: 20,
  },
  featureDescriptionAccent: {
    color: 'rgba(255,255,255,0.8)',
  },
  featureArrow: {
    marginLeft: spacing.sm,
  },
  featureList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: spacing.xs,
  },
  featureItemText: {
    fontSize: 12,
    color: palette.muted,
    marginLeft: spacing.xs,
  },
  featureItemTextAccent: {
    color: 'rgba(255,255,255,0.7)',
  },
  statusCard: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 14,
    color: palette.text,
    marginLeft: spacing.xs,
  },
  connectPrompt: {
    alignItems: 'center',
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: palette.border,
  },
  connectPromptText: {
    fontSize: 14,
    color: palette.muted,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
});
