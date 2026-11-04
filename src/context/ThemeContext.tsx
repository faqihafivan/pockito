import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ThemeMode = 'teal-mint' | 'saweria' | 'midnight';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode, targetUserId?: string) => void;
  loadUserTheme: (userId: string, preferredTheme?: ThemeMode) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'pockito_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeUser, setActiveUser] = useState<string | null>(() => {
    try {
      return localStorage.getItem('pockito_active_local_user_id') || null;
    } catch {
      return null;
    }
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const activeId = localStorage.getItem('pockito_active_local_user_id');
      if (activeId) {
        const userSaved = localStorage.getItem(`${THEME_STORAGE_KEY}_${activeId}`) as ThemeMode | null;
        if (userSaved && ['teal-mint', 'saweria', 'midnight'].includes(userSaved)) {
          return userSaved;
        }
      }
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (saved && ['teal-mint', 'saweria', 'midnight'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'teal-mint'; // Fresh Soft Neobrutalism as default
  });

  const applyTheme = (mode: ThemeMode) => {
    const root = document.documentElement;
    root.setAttribute('data-theme', mode);

    if (mode === 'midnight') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      if (activeUser) {
        localStorage.setItem(`${THEME_STORAGE_KEY}_${activeUser}`, theme);
      }
    } catch {
      // ignore
    }
  }, [theme, activeUser]);

  const setTheme = (mode: ThemeMode, targetUserId?: string) => {
    const uid = targetUserId || activeUser;
    if (uid) {
      setActiveUser(uid);
      try {
        localStorage.setItem(`${THEME_STORAGE_KEY}_${uid}`, mode);
      } catch {
        // ignore
      }
    }
    setThemeState(mode);
  };

  const loadUserTheme = useCallback((userId: string, preferredTheme?: ThemeMode) => {
    setActiveUser(userId);
    try {
      if (preferredTheme && ['teal-mint', 'saweria', 'midnight'].includes(preferredTheme)) {
        setThemeState(preferredTheme);
        localStorage.setItem(`${THEME_STORAGE_KEY}_${userId}`, preferredTheme);
        return;
      }
      const userSaved = localStorage.getItem(`${THEME_STORAGE_KEY}_${userId}`) as ThemeMode | null;
      if (userSaved && ['teal-mint', 'saweria', 'midnight'].includes(userSaved)) {
        setThemeState(userSaved);
      }
    } catch {
      // ignore
    }
  }, []);

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = prev === 'teal-mint' ? 'saweria' : prev === 'saweria' ? 'midnight' : 'teal-mint';
      if (activeUser) {
        try {
          localStorage.setItem(`${THEME_STORAGE_KEY}_${activeUser}`, next);
        } catch {
          // ignore
        }
      }
      return next;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        loadUserTheme,
        isDark: theme === 'midnight',
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    // Safe fallback for isolated unit tests or tree components outside ThemeProvider
    return {
      theme: 'teal-mint',
      setTheme: () => {},
      loadUserTheme: () => {},
      isDark: false,
      toggleTheme: () => {},
    };
  }
  return context;
};
