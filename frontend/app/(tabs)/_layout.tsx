import React from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { palette } from '../../src/ui/theme';
import { StatusHeader } from '../../src/ui/StatusHeader';
import { HeaderLogo } from '../../src/ui/HeaderLogo';

export default function TabsLayout(){
  return (
    <Tabs screenOptions={{
      tabBarStyle: { 
        backgroundColor: palette.card, 
        borderTopColor: 'rgba(0,212,255,0.2)',
        borderTopWidth: 1,
        paddingTop: 8,
        height: 88,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 8,
      },
      tabBarActiveTintColor: palette.tint,
      tabBarInactiveTintColor: palette.muted,
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '600',
        marginBottom: 8,
      },
      headerStyle: { 
        backgroundColor: palette.card,
        borderBottomColor: 'rgba(0,212,255,0.2)',
        borderBottomWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
      },
      headerTintColor: palette.text,
      headerTitleStyle: {
        fontSize: 18,
        fontWeight: '700',
      },
      headerTitle: () => <HeaderLogo />,
      headerRight: () => <StatusHeader />,
    }}>
      <Tabs.Screen name="connect" options={{ title: 'Forbind', tabBarIcon: ({color,size})=> <Ionicons name="bluetooth" color={color} size={size} /> }} />
      <Tabs.Screen name="visuals" options={{ title: 'Visuelt', tabBarIcon: ({color,size})=> <Ionicons name="color-palette" color={color} size={size} /> }} />
      <Tabs.Screen name="media" options={{ title: 'Media', tabBarIcon: ({color,size})=> <Ionicons name="image" color={color} size={size} /> }} />
      <Tabs.Screen name="games" options={{ title: 'Spil', tabBarIcon: ({color,size})=> <Ionicons name="game-controller" color={color} size={size} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Indstillinger', tabBarIcon: ({color,size})=> <Ionicons name="settings" color={color} size={size} /> }} />
    </Tabs>
  );
}
