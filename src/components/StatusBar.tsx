import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface StatusBarProps {
  isDarkMode: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ isDarkMode }) => {
  const { currentTheme } = useTheme();
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 h-8 flex items-center justify-between px-4 text-xs backdrop-blur-md ${
        isDarkMode ? 'bg-gray-900/80 text-gray-400' : 'bg-white/80 text-gray-600'
      } border-t ${
        isDarkMode ? 'border-gray-800' : 'border-gray-200'
      }`}
      style={{
        backgroundColor: isDarkMode 
          ? `${currentTheme.colors.surface}cc` 
          : `${currentTheme.colors.surface}cc`,
        borderColor: isDarkMode 
          ? currentTheme.colors.border 
          : currentTheme.colors.border,
        color: isDarkMode 
          ? currentTheme.colors.textSecondary 
          : currentTheme.colors.textSecondary,
      }}
    >
      <div>{formattedDate}</div>
      <div>Todo App v0.1.0</div>
    </div>
  );
};