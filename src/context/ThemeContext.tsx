import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'teal-mint' | 'saweria' | 'midnight';

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  isDark: boolean;
  toggleTheme: () => void;
}

const THEME_STORAGE_KEY = 'pockito_theme';

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
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
    } catch {
      // ignore
    }
  }, [theme]);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      if (prev === 'teal-mint') return 'saweria';
      if (prev === 'saweria') return 'midnight';
      return 'teal-mint';
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
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
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
