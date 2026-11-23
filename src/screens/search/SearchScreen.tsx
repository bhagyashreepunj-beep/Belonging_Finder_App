import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { Search, Mic, MapPin, Tag, X, Trash2 } from 'lucide-react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Theme } from '../../constants/theme';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { useBelongings } from '../../context/BelongingsContext';

export const SearchScreen: React.FC = () => {
  const { items, deleteItem } = useBelongings();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredResults = items.filter((item) => {
    const q = query.trim().toLowerCase();
    const matchesQuery =
      q === '' ||
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      (item.locationPath && item.locationPath.toLowerCase().includes(q)) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));

    const matchesCategory =
      !selectedCategory || item.category === selectedCategory;

    return matchesQuery && matchesCategory;
  });

  const handleDelete = (id: string, name: string) => {
    if (Platform.OS === 'web') {
      if (window.confirm(`Are you sure you want to remove "${name}" from your belongings?`)) {
        deleteItem(id);
      }
    } else {
      Alert.alert(
        'Delete Item',
        `Are you sure you want to remove "${name}" from your belongings?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Delete', style: 'destructive', onPress: () => deleteItem(id) },
        ]
      );
    }
  };

  return (
    <ScreenContainer edges={['top', 'left', 'right']}>
      {/* Search Header */}
      <View style={styles.header}>
        <Text style={styles.screenTitle}>Search Belongings</Text>
        <Text style={styles.screenSubtitle}>
          {filteredResults.length} of {items.length} items matching
        </Text>
      </View>

      {/* Search Input Box */}
      <View style={styles.searchBar}>
        <Search size={20} color={Theme.colors.textMuted} />
        <TextInput
          placeholder="Search by name, room, container, or tag..."
          placeholderTextColor={Theme.colors.textMuted}
          value={query}
          onChangeText={setQuery}
          style={styles.searchInput}
          autoCapitalize="none"
          returnKeyType="search"
        />
        {query.length > 0 ? (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
            <X size={16} color={Theme.colors.textSecondary} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.micBtn}>
            <Mic size={18} color={Theme.colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Category Filter Chips */}
      <View style={styles.categoriesSection}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', name: 'All Categories' }, ...DEFAULT_CATEGORIES]}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.categoryList}
          renderItem={({ item }) => {
            const isSelected =
              (item.id === 'all' && selectedCategory === null) ||
              selectedCategory === item.name;
            return (
              <TouchableOpacity
                onPress={() => {
                  setSelectedCategory(item.id === 'all' ? null : item.name);
                }}
                style={[
                  styles.categoryChip,
                  isSelected && styles.categoryChipSelected,
                ]}
              >
                <Text
                  style={[
                    styles.categoryChipText,
                    isSelected && styles.categoryChipTextSelected,
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Search Results List */}
      <FlatList
        data={filteredResults}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.resultsList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No matching belongings found</Text>
            <Text style={styles.emptySubtitle}>
              Try checking your spelling, removing filters, or searching for a room name.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <Card style={styles.resultCard}>
            <View style={styles.cardRow}>
              {item.photos && item.photos.length > 0 && (
                <Image
                  source={{ uri: item.photos[0] }}
                  style={styles.thumbnail}
                  resizeMode="cover"
                />
              )}
              <View style={styles.cardMain}>
                <View style={styles.cardHeader}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <View style={styles.headerRight}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{item.category}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(item.id, item.name)}
                      style={styles.deleteBtn}
                    >
                      <Trash2 size={16} color={Theme.colors.danger} />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.locationContainer}>
                  <MapPin size={15} color={Theme.colors.primary} />
                  <Text style={styles.locationPath}>
                    {item.locationPath || 'Location not specified'}
                  </Text>
                </View>

                {item.description ? (
                  <Text style={styles.description}>{item.description}</Text>
                ) : null}

                {item.tags && item.tags.length > 0 && (
                  <View style={styles.tagContainer}>
                    {item.tags.map((tag, idx) => (
                      <View key={idx} style={styles.tagBadge}>
                        <Tag size={10} color={Theme.colors.textMuted} />
                        <Text style={styles.tagText}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </Card>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: Theme.spacing.sm,
  },
  screenTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
  },
  screenSubtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textMuted,
    marginTop: 2,
    marginBottom: Theme.spacing.xs,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: Theme.borderRadius.xl,
    paddingHorizontal: Theme.spacing.lg,
    height: 52,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    marginLeft: Theme.spacing.md,
    color: Theme.colors.textPrimary,
    fontSize: 15,
  },
  clearBtn: {
    padding: Theme.spacing.xs,
  },
  micBtn: {
    padding: Theme.spacing.xs,
    backgroundColor: Theme.colors.primaryLight,
    borderRadius: Theme.borderRadius.full,
  },
  categoriesSection: {
    marginBottom: Theme.spacing.md,
  },
  categoryList: {
    gap: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
  },
  categoryChip: {
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.sm,
    borderRadius: Theme.borderRadius.full,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  categoryChipSelected: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  categoryChipText: {
    ...Theme.typography.subtext,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  categoryChipTextSelected: {
    color: Theme.colors.textInverse,
    fontWeight: '600',
  },
  resultsList: {
    paddingBottom: Theme.spacing.xxxl,
    gap: Theme.spacing.md,
  },
  resultCard: {
    padding: Theme.spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    alignItems: 'flex-start',
  },
  thumbnail: {
    width: 68,
    height: 68,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.borderLight,
    marginTop: 2,
  },
  cardMain: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Theme.spacing.xs,
    gap: Theme.spacing.sm,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.sm,
  },
  deleteBtn: {
    padding: 4,
  },
  itemName: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: Theme.colors.borderLight,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: Theme.borderRadius.sm,
  },
  categoryBadgeText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.sm,
  },
  locationPath: {
    ...Theme.typography.subtext,
    color: Theme.colors.primaryDark,
    fontWeight: '600',
    flex: 1,
  },
  description: {
    ...Theme.typography.subtext,
    color: Theme.colors.textSecondary,
    marginBottom: Theme.spacing.sm,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
  },
  tagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.colors.borderLight,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.full,
  },
  tagText: {
    ...Theme.typography.caption,
    color: Theme.colors.textMuted,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.xxxl,
    paddingHorizontal: Theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Theme.spacing.md,
  },
  emptyTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  emptySubtitle: {
    ...Theme.typography.subtext,
    color: Theme.colors.textMuted,
    textAlign: 'center',
  },
});
