import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  lowEffects: boolean;
  toggleLowEffects: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('verseora_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  const [lowEffects, setLowEffects] = useState<boolean>(() => {
    const saved = localStorage.getItem('verseora_low_effects');
    if (saved !== null) return saved === 'true';
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
    localStorage.setItem('verseora_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('verseora_low_effects', String(lowEffects));
  }, [lowEffects]);

  const toggleTheme = () => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  const toggleLowEffects = () => setLowEffects(prev => !prev);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, lowEffects, toggleLowEffects }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within a ThemeProvider');
  return context;
};

