import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  Image,
} from 'react-native';
import {
  Edit3,
  Mic,
  Camera,
  MapPin,
  Sparkles,
  CheckCircle2,
  Check,
  ArrowRight,
  Upload,
  X,
  Image as ImageIcon,
} from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Theme } from '../../constants/theme';
import { DEFAULT_CATEGORIES } from '../../constants/categories';
import { useBelongings } from '../../context/BelongingsContext';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { AppTabParamList } from '../../types';

type EntryMode = 'manual' | 'voice' | 'camera';

export const AddScreen: React.FC = () => {
  const { addItem } = useBelongings();
  const navigation = useNavigation<BottomTabNavigationProp<AppTabParamList>>();
  const [mode, setMode] = useState<EntryMode>('manual');

  // Form States
  const [name, setName] = useState('');
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0].name);
  const [locationPath, setLocationPath] = useState('Home → Master Bedroom → Godrej Cupboard → Second Drawer');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [successItem, setSuccessItem] = useState<{ name: string; path: string } | null>(null);

  // Voice Simulation State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceParsed, setVoiceParsed] = useState<boolean>(false);

  // Camera & Image Picker Handlers
  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        if (Platform.OS === 'web') {
          window.alert('Camera permission is required to capture photos. If prompted, please allow camera access in your browser.');
        } else {
          Alert.alert('Permission Required', 'Camera permission is required to take photos.');
        }
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setPhotoUri(uri);
        if (!name.trim()) {
          setName('Captured Belonging Photo');
          setTags('photo-verified, personal-item');
        }
      }
    } catch (err: any) {
      console.warn('Camera capture error:', err);
      // Fallback to file picker if webcam fails
      handlePickImage();
    }
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const uri = result.assets[0].uri;
        setPhotoUri(uri);
        if (!name.trim()) {
          setName('Stored Belonging Photo');
          setTags('photo-verified, personal-item');
        }
      }
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert('Could not open file picker: ' + (err?.message || 'Error'));
      } else {
        Alert.alert('Error', err?.message || 'Failed to select image.');
      }
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please enter an item name (e.g. Passport, Car Keys, Laptop Charger).');
      } else {
        Alert.alert('Validation Error', 'Please enter the item name.');
      }
      return;
    }

    if (!locationPath.trim()) {
      if (Platform.OS === 'web') {
        window.alert('Please specify where this item is stored.');
      } else {
        Alert.alert('Validation Error', 'Please enter the storage location path.');
      }
      return;
    }

    setLoading(true);
    try {
      const parsedTags = tags
        .split(',')
        .map((t) => t.trim().toLowerCase())
        .filter((t) => t.length > 0);

      const savedItem = await addItem({
        name: name.trim(),
        category,
        locationPath: locationPath.trim(),
        description: description.trim(),
        tags: parsedTags,
        photos: photoUri ? [photoUri] : [],
      });

      setSuccessItem({ name: savedItem.name, path: savedItem.locationPath || '' });
      setName('');
      setDescription('');
      setTags('');
      setPhotoUri(null);
      setVoiceParsed(false);

      if (Platform.OS === 'web') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      if (Platform.OS === 'web') {
        window.alert(`Save Error: ${err?.message || 'Failed to save item.'}`);
      } else {
        Alert.alert('Save Error', err?.message || 'Failed to save item.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSimulateVoice = () => {
    setIsRecording(true);
    setSuccessItem(null);
    setTimeout(() => {
      setIsRecording(false);
      setVoiceParsed(true);
      setName('Car Registration Certificate (RC Book)');
      setCategory('Documents & Papers');
      setLocationPath('Home → Study Room → Main Desk → Top Left Drawer');
      setDescription('Original RC book in transparent plastic cover kept with insurance copy.');
      setTags('car, rc, vehicle, official, registration');
    }, 1500);
  };

  return (
    <ScreenContainer scrollable edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Belonging</Text>
        <Text style={styles.subtitle}>
          Record where you keep your physical belongings so you can find them anytime.
        </Text>
      </View>

      {/* Success Notification Banner */}
      {successItem && (
        <View style={styles.successCard}>
          <View style={styles.successIconWrapper}>
            <Check size={20} color={Theme.colors.success} strokeWidth={3} />
          </View>
          <View style={styles.successContent}>
            <Text style={styles.successTitle}>Memory Saved Successfully!</Text>
            <Text style={styles.successSubtext}>
              "{successItem.name}" recorded at "{successItem.path}"
            </Text>
            <View style={styles.successActions}>
              <TouchableOpacity
                style={styles.viewInSearchBtn}
                onPress={() => navigation.navigate('SearchTab')}
              >
                <Text style={styles.viewInSearchText}>View in Search</Text>
                <ArrowRight size={14} color={Theme.colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.viewInHomeBtn}
                onPress={() => navigation.navigate('HomeTab')}
              >
                <Text style={styles.viewInHomeText}>Go to Home</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {/* Mode Selector Tabs */}
      <View style={styles.modeTabs}>
        <TouchableOpacity
          onPress={() => setMode('manual')}
          style={[styles.modeTab, mode === 'manual' && styles.modeTabActive]}
        >
          <Edit3
            size={16}
            color={mode === 'manual' ? Theme.colors.primary : Theme.colors.textMuted}
          />
          <Text
            style={[
              styles.modeTabText,
              mode === 'manual' && styles.modeTabTextActive,
            ]}
          >
            Manual Form
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode('voice')}
          style={[styles.modeTab, mode === 'voice' && styles.modeTabActive]}
        >
          <Mic
            size={16}
            color={mode === 'voice' ? Theme.colors.primary : Theme.colors.textMuted}
          />
          <Text
            style={[
              styles.modeTabText,
              mode === 'voice' && styles.modeTabTextActive,
            ]}
          >
            Voice Note
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setMode('camera')}
          style={[styles.modeTab, mode === 'camera' && styles.modeTabActive]}
        >
          <Camera
            size={16}
            color={mode === 'camera' ? Theme.colors.primary : Theme.colors.textMuted}
          />
          <Text
            style={[
              styles.modeTabText,
              mode === 'camera' && styles.modeTabTextActive,
            ]}
          >
            Camera Snap
          </Text>
        </TouchableOpacity>
      </View>

      {/* Voice Mode Card */}
      {mode === 'voice' && (
        <Card style={styles.voiceCard}>
          <View style={styles.voiceHeader}>
            <Sparkles size={22} color={Theme.colors.primary} />
            <Text style={styles.voiceTitle}>Speech-to-Memory Assistant</Text>
          </View>
          <Text style={styles.voicePrompt}>
            Tap the mic to simulate speaking: "I put my car registration papers in the study desk, top left drawer."
          </Text>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleSimulateVoice}
            style={[
              styles.micBigButton,
              isRecording && styles.micBigButtonRecording,
            ]}
          >
            <Mic size={38} color={Theme.colors.textInverse} />
          </TouchableOpacity>

          <Text style={styles.recordingStatus}>
            {isRecording
              ? 'Listening & extracting physical location hierarchy...'
              : voiceParsed
              ? '✨ Information extracted! Review and tap "Save to Memory" below.'
              : 'Tap to speak'}
          </Text>
        </Card>
      )}

      {/* Camera Mode Card */}
      {mode === 'camera' && (
        <Card style={styles.cameraCard}>
          <View style={styles.cameraActionRow}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleTakePhoto}
              style={styles.cameraActionButton}
            >
              <View style={styles.cameraIconCircle}>
                <Camera size={26} color={Theme.colors.primary} />
              </View>
              <Text style={styles.cameraActionTitle}>
                {Platform.OS === 'web' ? 'Use Webcam' : 'Take Photo'}
              </Text>
              <Text style={styles.cameraActionSubtext}>
                {Platform.OS === 'web' ? 'Snap directly with laptop camera' : 'Open device camera'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handlePickImage}
              style={styles.cameraActionButton}
            >
              <View style={[styles.cameraIconCircle, { backgroundColor: '#F3E8FF' }]}>
                <Upload size={26} color="#7C3AED" />
              </View>
              <Text style={styles.cameraActionTitle}>Upload File</Text>
              <Text style={styles.cameraActionSubtext}>
                Select photo from your laptop or gallery
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}

      {/* Attached Photo Preview */}
      {photoUri && (
        <Card style={styles.photoPreviewCard}>
          <View style={styles.photoPreviewHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <ImageIcon size={18} color={Theme.colors.primary} />
              <Text style={styles.photoPreviewTitle}>Attached Photograph</Text>
            </View>
            <TouchableOpacity
              onPress={() => setPhotoUri(null)}
              style={styles.removePhotoBtn}
            >
              <X size={16} color={Theme.colors.danger} />
              <Text style={styles.removePhotoText}>Remove</Text>
            </TouchableOpacity>
          </View>
          <Image source={{ uri: photoUri }} style={styles.photoThumbnail} resizeMode="cover" />
        </Card>
      )}

      {/* Belonging Input Form */}
      <Card style={styles.formCard}>
        <Input
          label="Item Name *"
          placeholder="e.g. Passport, House Deed, Sony Headphones, Jewellery Box"
          value={name}
          onChangeText={setName}
        />

        <View style={styles.fieldGroup}>
          <Text style={styles.fieldLabel}>Category</Text>
          <View style={styles.categoryPills}>
            {DEFAULT_CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                onPress={() => setCategory(cat.name)}
                style={[
                  styles.pill,
                  category === cat.name && styles.pillSelected,
                ]}
              >
                <Text
                  style={[
                    styles.pillText,
                    category === cat.name && styles.pillTextSelected,
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <Input
          label="Storage Location Path *"
          placeholder="e.g. Home → Master Bedroom → Godrej Cupboard → Second Drawer"
          value={locationPath}
          onChangeText={setLocationPath}
          leftIcon={<MapPin size={18} color={Theme.colors.primary} />}
          helperText="Tip: Chain nested locations like Room → Cupboard → Shelf → Box"
        />

        <Input
          label="Description / Context Notes"
          placeholder="e.g. Kept inside the blue pouch alongside international travel cards"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
          style={{ height: 72 }}
        />

        <Input
          label="Keywords / Tags (comma separated)"
          placeholder="e.g. travel, id, urgent, government"
          value={tags}
          onChangeText={setTags}
          helperText="Helps you quickly find this item using multiple keywords"
        />

        <Button
          title="Save to Memory"
          onPress={handleSave}
          loading={loading}
          icon={<CheckCircle2 size={18} color={Theme.colors.textInverse} />}
          style={styles.saveButton}
        />
      </Card>
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
  subtitle: {
    ...Theme.typography.subtext,
    color: Theme.colors.textSecondary,
    marginTop: 2,
  },
  successCard: {
    flexDirection: 'row',
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: Theme.borderRadius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
    gap: Theme.spacing.md,
  },
  successIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  successContent: {
    flex: 1,
  },
  successTitle: {
    ...Theme.typography.bodyBold,
    color: '#065F46',
  },
  successSubtext: {
    ...Theme.typography.subtext,
    color: '#047857',
    marginTop: 2,
  },
  successActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Theme.spacing.md,
    marginTop: Theme.spacing.sm,
  },
  viewInSearchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: 6,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  viewInSearchText: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    fontWeight: '700',
  },
  viewInHomeBtn: {
    paddingHorizontal: Theme.spacing.sm,
    paddingVertical: 6,
  },
  viewInHomeText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '600',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.borderRadius.lg,
    padding: 4,
    marginBottom: Theme.spacing.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  modeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: Theme.spacing.sm + 2,
    borderRadius: Theme.borderRadius.md,
  },
  modeTabActive: {
    backgroundColor: Theme.colors.primaryLight,
  },
  modeTabText: {
    ...Theme.typography.subtext,
    color: Theme.colors.textMuted,
    fontWeight: '600',
  },
  modeTabTextActive: {
    color: Theme.colors.primary,
  },
  voiceCard: {
    alignItems: 'center',
    padding: Theme.spacing.xl,
    marginBottom: Theme.spacing.lg,
    backgroundColor: Theme.colors.primaryLight,
    borderColor: Theme.colors.primary + '30',
  },
  voiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: Theme.spacing.xs,
  },
  voiceTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.primaryDark,
  },
  voicePrompt: {
    ...Theme.typography.subtext,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.lg,
    paddingHorizontal: Theme.spacing.md,
  },
  micBigButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.md,
  },
  micBigButtonRecording: {
    backgroundColor: Theme.colors.danger,
  },
  recordingStatus: {
    ...Theme.typography.caption,
    color: Theme.colors.primaryDark,
    marginTop: Theme.spacing.md,
    fontWeight: '600',
    textAlign: 'center',
  },
  cameraCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.lg,
  },
  cameraActionRow: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
  },
  cameraActionButton: {
    flex: 1,
    alignItems: 'center',
    padding: Theme.spacing.md,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: Theme.colors.border,
  },
  cameraIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.sm,
  },
  cameraActionTitle: {
    ...Theme.typography.bodyBold,
    color: Theme.colors.textPrimary,
  },
  cameraActionSubtext: {
    ...Theme.typography.caption,
    color: Theme.colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
  },
  photoPreviewCard: {
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.lg,
  },
  photoPreviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  photoPreviewTitle: {
    ...Theme.typography.subtext,
    fontWeight: '700',
    color: Theme.colors.textPrimary,
  },
  removePhotoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
  },
  removePhotoText: {
    ...Theme.typography.caption,
    color: Theme.colors.danger,
    fontWeight: '600',
  },
  photoThumbnail: {
    width: '100%',
    height: 180,
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.borderLight,
  },
  formCard: {
    padding: Theme.spacing.lg,
    marginBottom: Theme.spacing.xxxl,
  },
  fieldGroup: {
    marginBottom: Theme.spacing.md,
  },
  fieldLabel: {
    ...Theme.typography.subtext,
    fontWeight: '600',
    color: Theme.colors.textPrimary,
    marginBottom: Theme.spacing.xs,
  },
  categoryPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.xs,
  },
  pill: {
    backgroundColor: Theme.colors.borderLight,
    paddingHorizontal: Theme.spacing.md,
    paddingVertical: Theme.spacing.xs + 2,
    borderRadius: Theme.borderRadius.full,
  },
  pillSelected: {
    backgroundColor: Theme.colors.primary,
  },
  pillText: {
    ...Theme.typography.caption,
    color: Theme.colors.textSecondary,
    fontWeight: '500',
  },
  pillTextSelected: {
    color: Theme.colors.textInverse,
    fontWeight: '700',
  },
  saveButton: {
    marginTop: Theme.spacing.md,
  },
});
