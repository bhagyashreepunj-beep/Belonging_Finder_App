import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { UserProfile } from '../types';

interface StoredAccount {
  email: string;
  passwordHash: string;
  fullName: string;
  id: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  enableDemoMode: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_USER_KEY = '@belongings_active_user';
const LOCAL_ACCOUNTS_KEY = '@belongings_local_accounts';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check for active local or demo session
        const storedActive = await AsyncStorage.getItem(ACTIVE_USER_KEY);
        if (storedActive) {
          const parsed = JSON.parse(storedActive);
          if (mounted) {
            setUser(parsed.user);
            setProfile(parsed.profile);
            setIsDemoMode(parsed.isDemo || false);
            setLoading(false);
          }
          return;
        }

        // If Supabase is configured, check live session
        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.getSession();
          if (error) {
            console.warn('Error fetching Supabase session:', error.message);
          }
          if (mounted && data.session) {
            setSession(data.session);
            setUser(data.session.user ?? null);
            setProfile({
              id: data.session.user.id,
              email: data.session.user.email ?? '',
              fullName: data.session.user.user_metadata?.full_name,
            });
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen to live Supabase Auth state changes if configured
    let authListener: { subscription: { unsubscribe: () => void } } | null = null;
    if (isSupabaseConfigured) {
      const { data } = supabase.auth.onAuthStateChange((_event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          setProfile({
            id: currentSession.user.id,
            email: currentSession.user.email ?? '',
            fullName: currentSession.user.user_metadata?.full_name,
          });
        }
        setLoading(false);
      });
      authListener = data;
    }

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // 1. If Supabase is configured, try Supabase first
    if (isSupabaseConfigured) {
      const { error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
      if (!error) return { error: null };
    }

    // 2. Fallback to local accounts storage
    try {
      const accountsJson = await AsyncStorage.getItem(LOCAL_ACCOUNTS_KEY);
      const accounts: StoredAccount[] = accountsJson ? JSON.parse(accountsJson) : [];
      const account = accounts.find((a) => a.email.toLowerCase() === cleanEmail);

      if (!account) {
        return { error: new Error('Account not found with this email address.') };
      }

      if (account.passwordHash !== password) {
        return { error: new Error('Incorrect password. Please try again.') };
      }

      const localUser: User = {
        id: account.id,
        app_metadata: {},
        user_metadata: { full_name: account.fullName },
        aud: 'authenticated',
        created_at: account.createdAt,
        email: account.email,
      } as User;

      const localProfile: UserProfile = {
        id: account.id,
        email: account.email,
        fullName: account.fullName,
        preferredLanguage: 'en',
        createdAt: account.createdAt,
      };

      await AsyncStorage.setItem(
        ACTIVE_USER_KEY,
        JSON.stringify({ user: localUser, profile: localProfile, isDemo: false })
      );

      setUser(localUser);
      setProfile(localProfile);
      setIsDemoMode(false);
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Failed to sign in.') };
    }
  };

  const signUp = async (email: string, password: string, fullName?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const displayName = fullName?.trim() || cleanEmail.split('@')[0];

    // 1. If Supabase is configured, register via Supabase
    if (isSupabaseConfigured) {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { full_name: displayName },
        },
      });
      if (error) {
        return { error: new Error(error.message) };
      }
      if (data.session) {
        return { error: null };
      }
    }

    // 2. Fallback: Save local account and log in immediately
    try {
      const accountsJson = await AsyncStorage.getItem(LOCAL_ACCOUNTS_KEY);
      const accounts: StoredAccount[] = accountsJson ? JSON.parse(accountsJson) : [];

      if (accounts.some((a) => a.email.toLowerCase() === cleanEmail)) {
        return { error: new Error('An account with this email already exists. Please Sign In.') };
      }

      const newAccount: StoredAccount = {
        id: 'user_' + Date.now().toString(),
        email: cleanEmail,
        passwordHash: password,
        fullName: displayName,
        createdAt: new Date().toISOString(),
      };

      accounts.push(newAccount);
      await AsyncStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));

      const localUser: User = {
        id: newAccount.id,
        app_metadata: {},
        user_metadata: { full_name: newAccount.fullName },
        aud: 'authenticated',
        created_at: newAccount.createdAt,
        email: newAccount.email,
      } as User;

      const localProfile: UserProfile = {
        id: newAccount.id,
        email: newAccount.email,
        fullName: newAccount.fullName,
        preferredLanguage: 'en',
        createdAt: newAccount.createdAt,
      };

      await AsyncStorage.setItem(
        ACTIVE_USER_KEY,
        JSON.stringify({ user: localUser, profile: localProfile, isDemo: false })
      );

      setUser(localUser);
      setProfile(localProfile);
      setIsDemoMode(false);
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err?.message || 'Failed to create account.') };
    }
  };

  const enableDemoMode = async () => {
    const mockUser: User = {
      id: 'demo-user-1234',
      app_metadata: {},
      user_metadata: { full_name: 'Alex Johnson' },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: 'alex.demo@example.com',
    } as User;

    const mockProfile: UserProfile = {
      id: 'demo-user-1234',
      email: 'alex.demo@example.com',
      fullName: 'Alex Johnson',
      preferredLanguage: 'en',
      createdAt: new Date().toISOString(),
    };

    await AsyncStorage.setItem(
      ACTIVE_USER_KEY,
      JSON.stringify({ user: mockUser, profile: mockProfile, isDemo: true })
    );

    setUser(mockUser);
    setProfile(mockProfile);
    setIsDemoMode(true);
  };

  const signOut = async () => {
    await AsyncStorage.removeItem(ACTIVE_USER_KEY);
    setIsDemoMode(false);
    setUser(null);
    setProfile(null);
    setSession(null);

    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        session,
        loading,
        isDemoMode,
        signIn,
        signUp,
        signOut,
        enableDemoMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
