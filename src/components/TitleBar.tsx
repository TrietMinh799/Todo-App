import React from 'react';
import { motion } from 'framer-motion';
import { 
  XMarkIcon, 
  MinusIcon, 
  ArrowsPointingOutIcon,
  ArrowsPointingInIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

// Update the window.electron type to match preload.js
declare global {
  interface Window {
    electron?: {
      onWindowStateChange: (callback: (maximized: boolean) => void) => void;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
    };
  }
}

interface TitleBarProps {
  isMaximized: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({ isMaximized }) => {
  const { isDarkMode, currentTheme } = useTheme();

  const handleMinimize = () => {
    window.electron?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electron?.maximizeWindow();
  };

  const handleClose = () => {
    window.electron?.closeWindow();
  };

  return (
    <div 
      className={`h-10 flex items-center justify-between px-4 select-none ${
        isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
      }`}
      style={{
        backgroundColor: isDarkMode ? currentTheme.colors.surface : '#f3f4f6',
      }}
    >
      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-3 h-3 rounded-full bg-red-500 cursor-pointer"
          onClick={handleClose}
          style={{ backgroundColor: currentTheme.colors.error }}
        />
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer"
          onClick={handleMinimize}
          style={{ backgroundColor: currentTheme.colors.warning }}
        />
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="w-3 h-3 rounded-full bg-green-500 cursor-pointer"
          onClick={handleMaximize}
          style={{ backgroundColor: currentTheme.colors.success }}
        />
      </div>

      <div className="flex items-center gap-4">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleMinimize}
          className={`p-1 rounded-lg ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
          }`}
          style={{
            color: isDarkMode ? currentTheme.colors.textSecondary : '#4b5563',
          }}
        >
          <MinusIcon className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleMaximize}
          className={`p-1 rounded-lg ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'
          }`}
          style={{
            color: isDarkMode ? currentTheme.colors.textSecondary : '#4b5563',
          }}
        >
          {isMaximized ? (
            <ArrowsPointingInIcon className="w-4 h-4" />
          ) : (
            <ArrowsPointingOutIcon className="w-4 h-4" />
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleClose}
          className={`p-1 rounded-lg ${
            isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-500'
          }`}
          style={{
            color: isDarkMode ? currentTheme.colors.error : '#ef4444',
          }}
        >
          <XMarkIcon className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};