import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, getThemeById } from '../themes';

interface ThemeContextType {
  currentTheme: Theme;
  setTheme: (themeId: string) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

// Define which themes are “dark”
const darkThemes = new Set(['dark', 'tokyo-night', 'dracula', 'nord']);

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const currentTheme = getThemeById(themeId);
  const isDarkMode = darkThemes.has(themeId);

  useEffect(() => {
    localStorage.setItem('theme', themeId);
    document.documentElement.classList.toggle('dark', isDarkMode);

    // Apply theme colors to CSS variables
    const root = document.documentElement;

    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ?
        `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}` :
        '0, 0, 0';
    };

    const primaryRgb = hexToRgb(currentTheme.colors.primary);
    for (let i = 1; i <= 9; i++) {
      root.style.setProperty(`--color-primary-${i}00`, primaryRgb);
    }

    root.style.setProperty('--color-primary', currentTheme.colors.primary);
    root.style.setProperty('--color-secondary', currentTheme.colors.secondary);
    root.style.setProperty('--color-background', currentTheme.colors.background);
    root.style.setProperty('--color-surface', currentTheme.colors.surface);
    root.style.setProperty('--color-text', currentTheme.colors.text);
    root.style.setProperty('--color-text-secondary', currentTheme.colors.textSecondary);
    root.style.setProperty('--color-border', currentTheme.colors.border);
    root.style.setProperty('--color-success', currentTheme.colors.success);
    root.style.setProperty('--color-warning', currentTheme.colors.warning);
    root.style.setProperty('--color-error', currentTheme.colors.error);
    root.style.setProperty('--color-info', currentTheme.colors.info);
  }, [themeId, isDarkMode, currentTheme]);

  const setTheme = (id: string) => {
    setThemeId(id);
    // Optionally update dark mode if toggled via dropdown
    localStorage.setItem('theme', id);
  };

  // Toggle between default light and dark themes only
  const toggleDarkMode = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    setThemeId(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};