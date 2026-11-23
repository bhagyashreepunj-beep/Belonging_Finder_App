import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  Folder,
  FolderOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  Box,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Theme } from '../../constants/theme';
import { useBelongings } from '../../context/BelongingsContext';
import { LocationItemData } from '../../services/storageService';

export const LocationsScreen: React.FC = () => {
  const { locations, items, addLocation } = useBelongings();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    loc_home: true,
    loc_bed: true,
  });

  const toggleExpand = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddLocationPrompt = () => {
    if (Platform.OS === 'web') {
      const name = window.prompt('Enter new location name (e.g. Farmhouse, Guest Bedroom, Garage Storage):');
      if (name && name.trim()) {
        addLocation(name.trim());
      }
    } else {
      // In mobile, we trigger add location with prompt
      const name = 'New Storage Unit';
      addLocation(name);
    }
  };

  // Compute live items count for any location node
  const getItemCountForNode = (name: string): number => {
    const locKeyword = name.toLowerCase().split(' ')[0];
    return items.filter((item) =>
      (item.locationPath || '').toLowerCase().includes(locKeyword)
    ).length;
  };

  const renderTree = (itemsList: LocationItemData[], depth = 0) => {
    return itemsList.map((loc) => {
      const hasChildren = Boolean(loc.children && loc.children.length > 0);
      const isExpanded = expanded[loc.id];
      const count = getItemCountForNode(loc.name);

      return (
        <View key={loc.id} style={{ marginLeft: depth * 14 }}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => (hasChildren ? toggleExpand(loc.id) : null)}
            style={[
              styles.locationNode,
              depth === 0 && styles.rootLocationNode,
            ]}
          >
            <View style={styles.nodeLeft}>
              {hasChildren ? (
                isExpanded ? (
                  <ChevronDown size={18} color={Theme.colors.textSecondary} />
                ) : (
                  <ChevronRight size={18} color={Theme.colors.textSecondary} />
                )
              ) : (
                <View style={{ width: 18 }} />
              )}

              {hasChildren ? (
                isExpanded ? (
                  <FolderOpen size={20} color={Theme.colors.primary} />
                ) : (
                  <Folder size={20} color={Theme.colors.primary} />
                )
              ) : (
                <Box size={18} color={Theme.colors.textMuted} />
              )}

              <Text
                style={[
                  styles.locationName,
                  depth === 0 && styles.rootLocationName,
                ]}
              >
                {loc.name}
              </Text>
            </View>

            <View style={styles.badge}>
              <Text style={styles.badgeText}>{count} items</Text>
            </View>
          </TouchableOpacity>

          {hasChildren && isExpanded && (
            <View style={styles.childrenContainer}>
              {renderTree(loc.children!, depth + 1)}
            </View>
          )}
        </View>
      );
    });
  };

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>Physical Locations</Text>
          <Text style={styles.subtitle}>
            Explore your physical storage tree and nested sub-locations.
          </Text>
        </View>
        <TouchableOpacity
          onPress={handleAddLocationPrompt}
          style={styles.addButton}
          activeOpacity={0.8}
        >
          <Plus size={20} color={Theme.colors.textInverse} />
        </TouchableOpacity>
      </View>

      <Card style={styles.treeCard}>
        {renderTree(locations)}
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Theme.spacing.md,
  },
  title: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
  },
  subtitle: {
    ...Theme.typography.subtext,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: Theme.colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.sm,
    marginLeft: Theme.spacing.md,
  },
  treeCard: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.xxxl,
  },
  locationNode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.sm + 2,
    paddingHorizontal: Theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.borderLight,
  },
  rootLocationNode: {
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.md,
    paddingHorizontal: Theme.spacing.sm,
    marginVertical: Theme.spacing.xs,
  },
  nodeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  locationName: {
    ...Theme.typography.body,
    color: Theme.colors.textPrimary,
  },
  rootLocationName: {
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  badge: {
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.full,
  },
  badgeText: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  childrenContainer: {
    borderLeftWidth: 1.5,
    borderLeftColor: Theme.colors.border,
    marginLeft: Theme.spacing.md,
    paddingLeft: 4,
  },
});
