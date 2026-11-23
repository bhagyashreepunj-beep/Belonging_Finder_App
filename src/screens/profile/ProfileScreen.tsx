import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import {
  User,
  ShieldCheck,
  Globe,
  Database,
  Lock,
  LogOut,
  ChevronRight,
  Info,
} from 'lucide-react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { isSupabaseConfigured } from '../../config/supabase';

export const ProfileScreen: React.FC = () => {
  const { profile, user, signOut, isDemoMode } = useAuth();
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [biometricsEnabled, setBiometricsEnabled] = useState(true);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Log Out', style: 'destructive', onPress: signOut },
    ]);
  };

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Account & Settings</Text>
      </View>

      {/* User Info Card */}
      <Card style={styles.profileCard}>
        <View style={styles.avatar}>
          <User size={32} color={Theme.colors.primary} />
        </View>
        <View style={styles.profileDetails}>
          <Text style={styles.name}>
            {profile?.fullName || 'Belongings Owner'}
          </Text>
          <Text style={styles.email}>
            {profile?.email || user?.email || 'alex.demo@example.com'}
          </Text>
          <View style={styles.badgeRow}>
            {isDemoMode ? (
              <View style={styles.demoBadge}>
                <Text style={styles.demoBadgeText}>Demo Local Mode</Text>
              </View>
            ) : isSupabaseConfigured ? (
              <View style={styles.liveBadge}>
                <Text style={styles.liveBadgeText}>Supabase Cloud Vault Active</Text>
              </View>
            ) : null}
          </View>
        </View>
      </Card>

      {/* Security & Vault Section */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Security & Privacy</Text>
      </View>
      <Card style={styles.cardGroup}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <ShieldCheck size={20} color={Theme.colors.success} />
            <View>
              <Text style={styles.settingLabel}>Row Level Security (RLS)</Text>
              <Text style={styles.settingSubtext}>Your data is isolated and encrypted</Text>
            </View>
          </View>
          <Text style={styles.statusActive}>Enabled</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Lock size={20} color={Theme.colors.primary} />
            <View>
              <Text style={styles.settingLabel}>Biometric Unlock</Text>
              <Text style={styles.settingSubtext}>Require Face ID / Fingerprint</Text>
            </View>
          </View>
          <Switch
            value={biometricsEnabled}
            onValueChange={setBiometricsEnabled}
            trackColor={{ false: Theme.colors.border, true: Theme.colors.primary }}
          />
        </View>
      </Card>

      {/* Localization Section */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Language & Voice Input</Text>
      </View>
      <Card style={styles.cardGroup}>
        <TouchableOpacity
          style={styles.settingRow}
          onPress={() => setLanguage(language === 'en' ? 'hi' : 'en')}
        >
          <View style={styles.settingLeft}>
            <Globe size={20} color={Theme.colors.accentIndigo} />
            <View>
              <Text style={styles.settingLabel}>Primary Language</Text>
              <Text style={styles.settingSubtext}>
                {language === 'en' ? 'English (India/Global)' : 'हिन्दी (Hindi)'}
              </Text>
            </View>
          </View>
          <View style={styles.languageSwitch}>
            <Text style={styles.switchText}>Tap to switch</Text>
            <ChevronRight size={16} color={Theme.colors.textMuted} />
          </View>
        </TouchableOpacity>
      </Card>

      {/* Database Connection Info */}
      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Backend Architecture</Text>
      </View>
      <Card style={styles.cardGroup}>
        <View style={styles.settingRow}>
          <View style={styles.settingLeft}>
            <Database size={20} color={Theme.colors.textSecondary} />
            <View>
              <Text style={styles.settingLabel}>Database Provider</Text>
              <Text style={styles.settingSubtext}>
                {isSupabaseConfigured ? 'Supabase PostgreSQL (Connected)' : 'Local Offline Mode (.env ready)'}
              </Text>
            </View>
          </View>
        </View>
      </Card>

      {/* Sign Out Button */}
      <Button
        title="Sign Out"
        variant="outline"
        icon={<LogOut size={18} color={Theme.colors.danger} />}
        onPress={handleSignOut}
        style={styles.signOutButton}
        textStyle={{ color: Theme.colors.danger }}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingVertical: Theme.spacing.md,
  },
  title: {
    ...Theme.typography.h2,
    color: Theme.colors.textPrimary,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileDetails: {
    flex: 1,
  },
  name: {
    ...Theme.typography.bodyBold,
    fontSize: 17,
    color: Theme.colors.textPrimary,
  },
  email: {
    ...Theme.typography.subtext,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  badgeRow: {
    marginTop: 6,
  },
  demoBadge: {
    backgroundColor: Theme.colors.warningLight,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  demoBadgeText: {
    ...Theme.typography.caption,
    color: Theme.colors.warning,
    fontWeight: '700',
  },
  liveBadge: {
    backgroundColor: Theme.colors.successLight,
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: Theme.borderRadius.full,
    alignSelf: 'flex-start',
  },
  liveBadgeText: {
    ...Theme.typography.caption,
    color: Theme.colors.success,
    fontWeight: '700',
  },
  sectionTitleRow: {
    marginBottom: Theme.spacing.xs,
    marginTop: Theme.spacing.md,
  },
  sectionTitle: {
    ...Theme.typography.caption,
    color: Theme.colors.textMuted,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  cardGroup: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Theme.spacing.xs,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    flex: 1,
  },
  settingLabel: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
  },
  settingSubtext: {
    ...Theme.typography.caption,
    color: Theme.colors.textMuted,
    marginTop: 2,
  },
  statusActive: {
    ...Theme.typography.caption,
    color: Theme.colors.success,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.borderLight,
    marginVertical: Theme.spacing.sm,
  },
  languageSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  switchText: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    fontWeight: '600',
  },
  signOutButton: {
    borderColor: Theme.colors.danger,
    marginTop: Theme.spacing.lg,
    marginBottom: Theme.spacing.xxxl,
  },
});
