import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, themes, getThemeById } from '../themes';

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

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem('theme') || 'dark';
  });
  
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  const currentTheme = getThemeById(themeId);

  useEffect(() => {
    localStorage.setItem('theme', themeId);
    document.documentElement.classList.toggle('dark', isDarkMode);
    
    // Apply theme colors to CSS variables
    const root = document.documentElement;
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
  };

  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
    localStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, setTheme, isDarkMode, toggleDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
}; 