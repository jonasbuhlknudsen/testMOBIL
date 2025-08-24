import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Animations() {
  const [selectedAnimation, setSelectedAnimation] = useState('rainbow');

  const animations = [
    { id: 'rainbow', name: 'Regnbue', icon: 'color-palette', description: 'Glidende regnbue farver' },
    { id: 'fire', name: 'Ild', icon: 'flame', description: 'Flakkende ild effekt' },
    { id: 'wave', name: 'Bølge', icon: 'pulse', description: 'Bølgende lys effekt' },
    { id: 'sparkle', name: 'Glimmer', icon: 'sparkles', description: 'Tilfældige glimmer' },
    { id: 'matrix', name: 'Matrix', icon: 'grid', description: 'Matrix regneffekt' },
    { id: 'heartbeat', name: 'Hjerteslag', icon: 'heart', description: 'Pulserende hjerte' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView>
        <Text style={styles.title}>Animationer</Text>
        <Text style={styles.subtitle}>Dynamiske LED effekter</Text>

        {animations.map((animation) => (
          <TouchableOpacity
            key={animation.id}
            style={[
              styles.animationCard,
              selectedAnimation === animation.id && styles.selectedCard
            ]}
            onPress={() => setSelectedAnimation(animation.id)}
          >
            <Ionicons 
              name={animation.icon as any} 
              size={24} 
              color={selectedAnimation === animation.id ? '#001a2e' : '#00d4ff'} 
            />
            <View style={styles.animationInfo}>
              <Text style={[
                styles.animationName,
                selectedAnimation === animation.id && styles.selectedText
              ]}>
                {animation.name}
              </Text>
              <Text style={[
                styles.animationDescription,
                selectedAnimation === animation.id && styles.selectedDescription
              ]}>
                {animation.description}
              </Text>
            </View>
            {selectedAnimation === animation.id && (
              <Ionicons name="checkmark-circle" size={24} color="#001a2e" />
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.playButton}>
          <Ionicons name="play" size={20} color="#001a2e" />
          <Text style={styles.buttonText}>Start Animation</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b141b',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#e6f0ff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#7a8ca0',
    marginBottom: 32,
  },
  animationCard: {
    backgroundColor: '#1a2332',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectedCard: {
    backgroundColor: '#00d4ff',
  },
  animationInfo: {
    flex: 1,
    marginLeft: 16,
  },
  animationName: {
    color: '#e6f0ff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  animationDescription: {
    color: '#7a8ca0',
    fontSize: 14,
    marginTop: 4,
  },
  selectedText: {
    color: '#001a2e',
  },
  selectedDescription: {
    color: 'rgba(0, 26, 46, 0.7)',
  },
  playButton: {
    backgroundColor: '#00d4ff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#001a2e',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});