import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Search,
  Mic,
  Camera,
  PlusCircle,
  MapPin,
  Clock,
  Trash2,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { useBelongings } from '../../context/BelongingsContext';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from '../../types';

export const HomeScreen: React.FC = () => {
  const { profile } = useAuth();
  const { items, deleteItem } = useBelongings();
  const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();

  // Format relative time
  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = Date.now() - new Date(isoString).getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMins < 5) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    } catch {
      return 'Recently';
    }
  };

  // Compute live location counts
  const homeCount = items.filter((i) => (i.locationPath || '').toLowerCase().includes('home')).length;
  const officeCount = items.filter((i) => (i.locationPath || '').toLowerCase().includes('office')).length;
  const carCount = items.filter((i) => (i.locationPath || '').toLowerCase().includes('car')).length;
  const otherCount = items.length - (homeCount + officeCount + carCount);

  const quickLocations = [
    { name: 'Home', count: homeCount, icon: '🏠' },
    { name: 'Office', count: officeCount, icon: '💼' },
    { name: 'Car / Vehicle', count: carCount, icon: '🚗' },
    { name: 'Other Storage', count: Math.max(0, otherCount), icon: '📦' },
  ];

  return (
    <ScreenContainer scrollable>
      {/* Top Welcome Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>
            {profile?.fullName || profile?.email?.split('@')[0] || 'Friend'}
          </Text>
        </View>
        <View style={styles.badgeRow}>
          <View style={styles.countPill}>
            <Text style={styles.countPillText}>{items.length} Belongings</Text>
          </View>
        </View>
      </View>

      {/* Prominent Search Bar */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate('SearchTab')}
        style={styles.searchBar}
      >
        <Search size={20} color={Theme.colors.textMuted} />
        <Text style={styles.searchPlaceholder}>Where did I keep my...</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('SearchTab')}
          style={styles.micButton}
        >
          <Mic size={18} color={Theme.colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* Quick Action Buttons */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: Theme.colors.primaryLight }]}
          onPress={() => navigation.navigate('AddTab')}
        >
          <PlusCircle size={22} color={Theme.colors.primary} />
          <Text style={[styles.actionButtonText, { color: Theme.colors.primary }]}>
            Manual Add
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#F3E8FF' }]}
          onPress={() => navigation.navigate('AddTab')}
        >
          <Mic size={22} color="#7C3AED" />
          <Text style={[styles.actionButtonText, { color: '#7C3AED' }]}>
            Voice Note
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#ECFDF5' }]}
          onPress={() => navigation.navigate('AddTab')}
        >
          <Camera size={22} color="#059669" />
          <Text style={[styles.actionButtonText, { color: '#059669' }]}>
            Snap Photo
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recently Stored Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recently Stored</Text>
        <TouchableOpacity onPress={() => navigation.navigate('SearchTab')}>
          <Text style={styles.seeAllText}>See all ({items.length})</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.itemsList}>
        {items.slice(0, 5).map((item) => (
          <Card key={item.id} style={styles.itemCard}>
            <View style={styles.cardRow}>
              {item.photos && item.photos.length > 0 && (
                <Image
                  source={{ uri: item.photos[0] }}
                  style={styles.itemThumbnail}
                  resizeMode="cover"
                />
              )}
              <View style={styles.cardContent}>
                <View style={styles.itemHeader}>
                  <View style={styles.categoryTag}>
                    <Text style={styles.categoryTagText}>{item.category}</Text>
                  </View>
                  <View style={styles.timeWrapper}>
                    <Clock size={12} color={Theme.colors.textMuted} />
                    <Text style={styles.timeText}>{getRelativeTime(item.createdAt)}</Text>
                    <TouchableOpacity
                      onPress={() => deleteItem(item.id)}
                      style={{ marginLeft: 6 }}
                    >
                      <Trash2 size={13} color={Theme.colors.textMuted} />
                    </TouchableOpacity>
                  </View>
                </View>

                <Text style={styles.itemName}>{item.name}</Text>

                <View style={styles.locationWrapper}>
                  <MapPin size={14} color={Theme.colors.primary} />
                  <Text style={styles.locationPath} numberOfLines={1}>
                    {item.locationPath || 'Location not specified'}
                  </Text>
                </View>
              </View>
            </View>
          </Card>
        ))}
      </View>

      {/* Explore By Location Section */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Locations Overview</Text>
        <TouchableOpacity onPress={() => navigation.navigate('LocationsTab')}>
          <Text style={styles.seeAllText}>Manage Tree</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.locationsGrid}>
        {quickLocations.map((loc, index) => (
          <TouchableOpacity
            key={index}
            style={styles.locationGridCard}
            onPress={() => navigation.navigate('LocationsTab')}
          >
            <Text style={styles.locationIcon}>{loc.icon}</Text>
            <Text style={styles.locationGridName}>{loc.name}</Text>
            <Text style={styles.locationItemCount}>{loc.count} belongings</Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  greeting: {
    ...Theme.typography.subtext,
    color: Theme.colors.textSecondary,
  },
  userName: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  countPill: {
    backgroundColor: Theme.colors.primaryLight,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.full,
  },
  countPillText: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    fontWeight: '700',
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
    marginBottom: Theme.spacing.xl,
    ...Theme.shadows.sm,
  },
  searchPlaceholder: {
    flex: 1,
    marginLeft: Theme.spacing.md,
    color: Theme.colors.textMuted,
    fontSize: 15,
  },
  micButton: {
    padding: Theme.spacing.xs,
    backgroundColor: Theme.colors.primaryLight,
    borderRadius: Theme.borderRadius.full,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Theme.spacing.xxl,
    gap: Theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Theme.spacing.md,
    borderRadius: Theme.borderRadius.lg,
    gap: Theme.spacing.xs,
  },
  actionButtonText: {
    ...Theme.typography.caption,
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  sectionTitle: {
    ...Theme.typography.h3,
    color: Theme.colors.textPrimary,
  },
  seeAllText: {
    ...Theme.typography.subtext,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  itemsList: {
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xxxl,
  },
  itemCard: {
    padding: Theme.spacing.md,
  },
  cardRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    alignItems: 'center',
  },
  itemThumbnail: {
    width: 64,
    height: 64,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.borderLight,
  },
  cardContent: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xs,
  },
  categoryTag: {
    backgroundColor: Theme.colors.borderLight,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.sm,
  },
  categoryTagText: {
    fontSize: 12,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
  },
  timeWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    ...Theme.typography.caption,
    color: Theme.colors.textMuted,
  },
  itemName: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  locationWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Theme.colors.borderLight,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: Theme.spacing.xs,
    borderRadius: Theme.borderRadius.md,
  },
  locationPath: {
    ...Theme.typography.subtext,
    color: Theme.colors.textSecondary,
    flex: 1,
  },
  locationsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xxxl,
  },
  locationGridCard: {
    width: '47%',
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.borderLight,
    ...Theme.shadows.sm,
  },
  locationIcon: {
    fontSize: 26,
    marginBottom: Theme.spacing.xs,
  },
  locationGridName: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
  },
  locationItemCount: {
    ...Theme.typography.caption,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
});
