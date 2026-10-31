import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthStatus, UserProfile } from '../types';
import { DataService, generateUUID } from '../services/dataService';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isCloudMode: boolean;
  isDemo: boolean;
  authStatus: AuthStatus;
  login: (email: string, password?: string) => Promise<{ error?: string }>;
  enterDemoMode: () => Promise<void>;
  register: (fullName: string, email: string, password?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>('initializing');
  const [isDemo, setIsDemo] = useState<boolean>(false);
  const isCloudMode = isSupabaseConfigured();

  const enterDemoMode = async (): Promise<void> => {
    setIsDemo(true);
    setAuthStatus('demo');
    DataService.setMode('demo', 'demo-user');

    // Populate demo data into isolated demo namespace if empty
    const demoAccounts = await DataService.getAccounts();
    if (demoAccounts.length === 0) {
      DataService.resetToDefaults();
    }

    const demoProfile = await DataService.getProfile();
    setUser(demoProfile);
    try {
      sessionStorage.setItem('pockito_active_mode', 'demo');
    } catch {
      // ignore storage error
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Check if user previously opened demo session in this browser tab
        let isSessionDemo = false;
        try {
          isSessionDemo = sessionStorage.getItem('pockito_active_mode') === 'demo';
        } catch {
          // ignore
        }

        if (isSessionDemo) {
          await enterDemoMode();
          return;
        }

        // 2. Cloud Mode Initialization
        if (isCloudMode && supabase) {
          const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
          if (sessionErr || !session?.user) {
            // Strictly unauthenticated. Do NOT silently fallback to local data!
            DataService.setMode('local', null);
            setUser(null);
            setIsDemo(false);
            setAuthStatus('unauthenticated');
            return;
          }

          // Active valid session found
          DataService.setMode('cloud', session.user.id);
          try {
            const profile = await DataService.getProfile();
            setUser(profile);
            setIsDemo(false);
            setAuthStatus('authenticated');
          } catch (profileErr) {
            console.warn('Profile not found in cloud, creating default profile:', profileErr);
            const initialProfile: UserProfile = {
              id: session.user.id,
              full_name: session.user.user_metadata?.full_name || 'Pengguna Pockito',
              email: session.user.email || '',
              currency: 'IDR',
              timezone: 'Asia/Jakarta',
              monthly_income: 0,
              onboarding_completed: false,
            };
            const created = await DataService.updateProfile(initialProfile);
            setUser(created);
            setIsDemo(false);
            setAuthStatus('authenticated');
          }
          return;
        }

        // 3. Pure Local Offline Mode (Supabase not configured)
        DataService.setMode('local', null);
        const localAccounts = await DataService.getAccounts();
        if (localAccounts.length > 0) {
          const localProfile = await DataService.getProfile();
          setUser(localProfile);
          setIsDemo(false);
          setAuthStatus('authenticated');
        } else {
          setUser(null);
          setIsDemo(false);
          setAuthStatus('unauthenticated');
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setAuthStatus('error');
        setUser(null);
      }
    };

    initializeAuth();
  }, [isCloudMode]);

  const login = async (email: string, password?: string): Promise<{ error?: string }> => {
    try {
      if (isCloudMode && supabase) {
        if (!password) {
          return { error: 'Password wajib diisi untuk login akun cloud.' };
        }
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
        if (!data.user) return { error: 'Autentikasi gagal' };

        DataService.setMode('cloud', data.user.id);
        const profile = await DataService.getProfile();
        setUser(profile);
        setIsDemo(false);
        setAuthStatus('authenticated');
        try {
          sessionStorage.removeItem('pockito_active_mode');
        } catch {
          // ignore
        }
        return {};
      }

      // Local offline mode login
      const userId = 'user-local-' + email.replace(/[^a-zA-Z0-9]/g, '_');
      DataService.setMode('local', userId);
      const profile = await DataService.getProfile();
      setUser({ ...profile, email });
      setIsDemo(false);
      setAuthStatus('authenticated');
      return {};
    } catch (err: unknown) {
      return { error: (err as Error).message || 'Gagal masuk akun' };
    }
  };

  const register = async (fullName: string, email: string, password?: string): Promise<{ error?: string }> => {
    try {
      if (isCloudMode && supabase) {
        if (!password) {
          return { error: 'Password wajib diisi untuk mendaftar.' };
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) return { error: error.message };
        if (data.user) {
          DataService.setMode('cloud', data.user.id);
          const newProfile: UserProfile = {
            id: data.user.id,
            full_name: fullName,
            email,
            currency: 'IDR',
            timezone: 'Asia/Jakarta',
            monthly_income: 0,
            onboarding_completed: false,
          };
          await DataService.updateProfile(newProfile);
          DataService.initializeCleanUserData(newProfile.id);
          setUser(newProfile);
          setIsDemo(false);
          setAuthStatus('authenticated');
        }
        return {};
      }

      // Local mode register
      const newId = generateUUID();
      DataService.setMode('local', newId);
      const newProfile: UserProfile = {
        id: newId,
        full_name: fullName,
        email,
        currency: 'IDR',
        timezone: 'Asia/Jakarta',
        monthly_income: 0,
        onboarding_completed: false,
      };
      await DataService.updateProfile(newProfile);
      DataService.initializeCleanUserData(newProfile.id);
      setUser(newProfile);
      setIsDemo(false);
      setAuthStatus('authenticated');
      return {};
    } catch (err: unknown) {
      return { error: (err as Error).message || 'Gagal mendaftar' };
    }
  };

  const logout = async () => {
    try {
      if (isCloudMode && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('SignOut warning:', err);
    } finally {
      try {
        sessionStorage.removeItem('pockito_active_mode');
      } catch {
        // ignore
      }
      DataService.setMode('local', null);
      setUser(null);
      setIsDemo(false);
      setAuthStatus('unauthenticated');
    }
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    const updated = await DataService.updateProfile(updates);
    setUser(updated);
  };

  const isLoading = authStatus === 'initializing';

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isCloudMode,
        isDemo,
        authStatus,
        login,
        enterDemoMode,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
