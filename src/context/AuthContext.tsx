import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { DataService } from '../services/dataService';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isCloudMode: boolean;
  login: (email: string, password?: string) => Promise<{ error?: string }>;
  register: (fullName: string, email: string, password?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isCloudMode = isSupabaseConfigured();

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isCloudMode && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await DataService.getProfile();
            setUser(profile);
          } else {
            // Check local fallback
            const localProfile = await DataService.getProfile();
            setUser(localProfile);
          }
        } else {
          // Local offline mode
          const localProfile = await DataService.getProfile();
          setUser(localProfile);
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isCloudMode]);

  const login = async (email: string, password?: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      if (isCloudMode && supabase && password) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return { error: error.message };
      }
      const profile = await DataService.getProfile();
      setUser({ ...profile, email });
      return {};
    } catch (err: unknown) {
      return { error: (err as Error).message || 'Gagal masuk akun' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (fullName: string, email: string, password?: string): Promise<{ error?: string }> => {
    setIsLoading(true);
    try {
      if (isCloudMode && supabase && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) return { error: error.message };
        if (data.user) {
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
          setUser(newProfile);
        }
      } else {
        // Local mode register
        const newProfile: UserProfile = {
          id: 'user-' + Date.now(),
          full_name: fullName,
          email,
          currency: 'IDR',
          timezone: 'Asia/Jakarta',
          monthly_income: 0,
          onboarding_completed: false,
        };
        await DataService.updateProfile(newProfile);
        setUser(newProfile);
      }
      return {};
    } catch (err: unknown) {
      return { error: (err as Error).message || 'Gagal mendaftar' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    if (isCloudMode && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const updateUser = async (updates: Partial<UserProfile>) => {
    const updated = await DataService.updateProfile(updates);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isCloudMode,
        login,
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
