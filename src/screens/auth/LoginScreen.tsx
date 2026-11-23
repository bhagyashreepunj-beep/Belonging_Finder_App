import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Mail, Lock, ShieldCheck, Sparkles, AlertCircle } from 'lucide-react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export const LoginScreen: React.FC<Props> = ({ navigation }) => {
  const { signIn, enableDemoMode } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const validate = () => {
    setErrorMessage(null);
    const errs: { email?: string; password?: string } = {};
    if (!email.trim()) {
      errs.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrorMessage(null);

    const { error } = await signIn(email.trim(), password);
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      if (Platform.OS === 'web') {
        window.alert(`Sign In Notice: ${error.message}`);
      } else {
        Alert.alert('Sign In Failed', error.message);
      }
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    await enableDemoMode();
    setLoading(false);
  };

  return (
    <ScreenContainer scrollable>
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <ShieldCheck size={36} color={Theme.colors.primary} />
        </View>
        <Text style={styles.title}>Belongings Finder</Text>
        <Text style={styles.subtitle}>
          Your intelligent memory assistant. Never lose track of where you kept anything.
        </Text>
      </View>

      {errorMessage && (
        <View style={styles.errorBanner}>
          <AlertCircle size={18} color={Theme.colors.danger} />
          <Text style={styles.errorBannerText}>{errorMessage}</Text>
        </View>
      )}

      <Card style={styles.formCard}>
        <Input
          label="Email Address"
          placeholder="name@example.com"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          leftIcon={<Mail size={20} color={Theme.colors.textMuted} />}
        />

        <Input
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          secureTextEntry
          error={errors.password}
          leftIcon={<Lock size={20} color={Theme.colors.textMuted} />}
        />

        <Button
          title="Sign In"
          onPress={handleLogin}
          loading={loading}
          style={styles.signInButton}
        />

        <View style={styles.registerPrompt}>
          <Text style={styles.registerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.registerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      </Card>

      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR QUICK TEST</Text>
        <View style={styles.dividerLine} />
      </View>

      <Button
        title="Explore with Demo Account"
        variant="outline"
        icon={<Sparkles size={18} color={Theme.colors.primary} />}
        onPress={handleDemo}
        loading={loading}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    marginTop: Theme.spacing.xxl,
    marginBottom: Theme.spacing.xl,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Theme.spacing.md,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...Theme.typography.subtext,
    color: Theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: Theme.spacing.xs,
    paddingHorizontal: Theme.spacing.md,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Theme.colors.dangerLight,
    padding: Theme.spacing.md,
    borderRadius: Theme.borderRadius.md,
    marginBottom: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.danger + '30',
  },
  errorBannerText: {
    ...Theme.typography.caption,
    color: Theme.colors.danger,
    fontWeight: '600',
    flex: 1,
  },
  formCard: {
    marginBottom: Theme.spacing.lg,
  },
  signInButton: {
    marginTop: Theme.spacing.sm,
  },
  registerPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Theme.spacing.lg,
  },
  registerText: {
    ...Theme.typography.subtext,
    color: Theme.colors.textSecondary,
  },
  registerLink: {
    ...Theme.typography.subtext,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Theme.spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Theme.colors.border,
  },
  dividerText: {
    ...Theme.typography.caption,
    color: Theme.colors.textMuted,
    paddingHorizontal: Theme.spacing.md,
    fontWeight: '600',
  },
});
