import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Mail, Lock, User, ArrowLeft, AlertCircle } from 'lucide-react-native';
import { ScreenContainer } from '../../components/layout/ScreenContainer';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { Theme } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { AuthStackParamList } from '../../types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { signUp } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    setErrorMessage(null);
    const errs: {
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    } = {};

    if (!fullName.trim()) {
      errs.fullName = 'Full name is required';
    }
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
    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setLoading(true);
    setErrorMessage(null);

    const { error } = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      if (Platform.OS === 'web') {
        window.alert(`Registration Notice: ${error.message}`);
      } else {
        Alert.alert('Registration Failed', error.message);
      }
    }
  };

  return (
    <ScreenContainer scrollable>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <ArrowLeft size={22} color={Theme.colors.textPrimary} />
      </TouchableOpacity>

      <View style={styles.header}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>
          Set up your secure, private personal inventory vault.
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
          label="Full Name"
          placeholder="e.g. Rahul Sharma"
          value={fullName}
          onChangeText={(text) => {
            setFullName(text);
            if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: undefined }));
          }}
          leftIcon={<User size={20} color={Theme.colors.textMuted} />}
          error={errors.fullName}
        />

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
          placeholder="At least 6 characters"
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
          }}
          secureTextEntry
          error={errors.password}
          leftIcon={<Lock size={20} color={Theme.colors.textMuted} />}
        />

        <Input
          label="Confirm Password"
          placeholder="Repeat your password"
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            if (errors.confirmPassword)
              setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
          }}
          secureTextEntry
          error={errors.confirmPassword}
          leftIcon={<Lock size={20} color={Theme.colors.textMuted} />}
        />

        <Button
          title="Create Account & Enter"
          onPress={handleRegister}
          loading={loading}
          style={styles.registerButton}
        />

        <View style={styles.loginPrompt}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.loginLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  backButton: {
    paddingVertical: Theme.spacing.md,
    alignSelf: 'flex-start',
  },
  header: {
    marginBottom: Theme.spacing.xl,
  },
  title: {
    ...Theme.typography.h1,
    color: Theme.colors.textPrimary,
  },
  subtitle: {
    ...Theme.typography.subtext,
    color: Theme.colors.textSecondary,
    marginTop: Theme.spacing.xs,
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
    marginBottom: Theme.spacing.xl,
  },
  registerButton: {
    marginTop: Theme.spacing.sm,
  },
  loginPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Theme.spacing.lg,
  },
  loginText: {
    ...Theme.typography.subtext,
    color: Theme.colors.textSecondary,
  },
  loginLink: {
    ...Theme.typography.subtext,
    fontWeight: '700',
    color: Theme.colors.primary,
  },
});
