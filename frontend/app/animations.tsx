import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, FlatList, TouchableOpacity } from 'react-native';
import { ThemedBackground, Card, InputField } from '../src/ui/components';
import { AnimationCard } from '../src/ui/AnimationCard';
import { HeroSection } from '../src/ui/HeroSection';
import { EmptyState } from '../src/ui/EmptyState';
import { palette, spacing, radius } from '../src/ui/theme';
import { Ionicons } from '@expo/vector-icons';
import { 
  animationCategories, 
  getAnimationsByCategory, 
  searchAnimations,
  getAnimationStats,
  AnimationItem 
} from '../src/data/animationsLibrary';
import { useBleStore } from '../src/store/bleStore';
import * as Haptics from 'expo-haptics';

export default function AnimationsLibrary() {
  const { detectedScreenSize, deviceInfo } = useBleStore();
  const [selectedCategory, setSelectedCategory] = useState('farver');
  const [searchQuery, setSearchQuery] = useState('');
  const [animations, setAnimations] = useState<AnimationItem[]>(
    getAnimationsByCategory('farver', detectedScreenSize || '16x16')
  );

  // Opdater animations når screen size ændres
  useEffect(() => {
    const screenSize = detectedScreenSize || '16x16';
    setAnimations(getAnimationsByCategory(selectedCategory, screenSize));
  }, [detectedScreenSize, selectedCategory]);

  const handleCategoryPress = (categoryId: string) => {
    setSelectedCategory(categoryId);
    const screenSize = detectedScreenSize || '16x16';
    setAnimations(getAnimationsByCategory(categoryId, screenSize));
    setSearchQuery('');
    Haptics.selectionAsync();
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const screenSize = detectedScreenSize || '16x16';
    if (query.trim()) {
      setAnimations(searchAnimations(query, screenSize));
    } else {
      setAnimations(getAnimationsByCategory(selectedCategory, screenSize));
    }
  };

  const handleAnimationPress = (animation: AnimationItem) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    console.log('Selected animation:', animation.name, 'for', detectedScreenSize);
  };

  const handleToggleLike = (animationId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Implementer like funktionalitet
    console.log('Toggle like for:', animationId);
  };

  const handleDownload = (animation: AnimationItem) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    // TODO: Implementer download funktionalitet
    console.log('Download animation:', animation.name);
  };

  const renderAnimationCard = ({ item }: { item: AnimationItem }) => (
    <AnimationCard
      animation={item}
      onPress={() => handleAnimationPress(item)}
      onToggleLike={() => handleToggleLike(item.id)}
      onDownload={() => handleDownload(item)}
    />
  );

  // Get animation stats for device
  const stats = getAnimationStats(detectedScreenSize || '16x16');

  return (
    <ThemedBackground>
      <ScrollView style={styles.container}>
        {/* Enhanced Hero Section with device info */}
        <View style={styles.heroContainer}>
          <HeroSection
            title="Animations Bibliotek"
            subtitle={`${stats.total} animationer til ${deviceInfo?.model || 'din iDot enhed'}`}
            accent={true}
          />
          
          {/* Device compatibility info */}
          {detectedScreenSize && (
            <Card style={styles.deviceInfoCard}>
              <View style={styles.deviceInfo}>
                <Ionicons name="tv" size={20} color={palette.tint} />
                <View style={styles.deviceInfoText}>
                  <Text style={styles.deviceInfoTitle}>
                    Optimeret til {detectedScreenSize}
                  </Text>
                  <Text style={styles.deviceInfoSubtitle}>
                    {stats.total} kompatible animationer fundet
                  </Text>
                </View>
                <View style={styles.qualityBadge}>
                  <Text style={styles.qualityText}>
                    {detectedScreenSize === '16x16' ? 'BASIC' : 
                     detectedScreenSize === '32x32' ? 'STANDARD' : 'HD'}
                  </Text>
                </View>
              </View>
            </Card>
          )}
        </View>

        {/* Search Bar */}
        <InputField
          value={searchQuery}
          onChangeText={handleSearch}
          placeholder="Søg animationer..."
          icon="search"
          clearable={true}
          style={styles.searchInput}
        />

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
          {animationCategories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => handleCategoryPress(category.id)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={category.icon as any}
                size={20}
                color={selectedCategory === category.id ? '#001a2e' : palette.muted}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && styles.categoryTextActive
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Results Header */}
        <View style={styles.resultsHeader}>
          <Text style={styles.resultsTitle}>
            {searchQuery ? 
              `Søgeresultater (${animations.length})` : 
              `${animationCategories.find(c => c.id === selectedCategory)?.name} (${animations.length})`
            }
          </Text>
          
          {/* Screen size indicator */}
          <View style={styles.screenSizeIndicator}>
            <Text style={styles.screenSizeText}>
              {detectedScreenSize || '16x16'}
            </Text>
          </View>
        </View>

        {/* Animations Grid */}
        <View style={styles.gridContainer}>
          {animations.length > 0 ? (
            <FlatList
              data={animations}
              renderItem={renderAnimationCard}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.row}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <EmptyState
              icon="search-outline"
              title="Ingen animationer fundet"
              description="Prøv at søge efter noget andet eller vælg en anden kategori."
            />
          )}
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </ThemedBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    marginBottom: spacing.lg,
  },
  deviceInfoCard: {
    marginTop: spacing.md,
  },
  deviceInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  deviceInfoText: {
    flex: 1,
  },
  deviceInfoTitle: {
    color: palette.text,
    fontSize: 14,
    fontWeight: '600',
  },
  deviceInfoSubtitle: {
    color: palette.muted,
    fontSize: 12,
    marginTop: 2,
  },
  qualityBadge: {
    backgroundColor: palette.tint,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  qualityText: {
    color: '#001a2e',
    fontSize: 10,
    fontWeight: '700',
  },
  searchInput: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  categoriesContainer: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    backgroundColor: palette.cardBackground,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  categoryButtonActive: {
    backgroundColor: palette.primary,
  },
  categoryText: {
    color: palette.muted,
    fontSize: 13,
    fontWeight: '500',
  },
  categoryTextActive: {
    color: '#001a2e',
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  resultsTitle: {
    color: palette.text,
    fontSize: 16,
    fontWeight: '600',
  },
  screenSizeIndicator: {
    backgroundColor: palette.cardBackground,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  screenSizeText: {
    color: palette.tint,
    fontSize: 11,
    fontWeight: '600',
  },
  gridContainer: {
    paddingHorizontal: spacing.md,
  },
  row: {
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
});