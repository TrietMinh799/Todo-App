import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SwatchIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import { themes } from '../themes';

export const ThemeSelector: React.FC = () => {
  const { currentTheme, setTheme, isDarkMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleDropdown}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${
          isDarkMode ? 'bg-gray-800 text-gray-200' : 'bg-white text-gray-800'
        } shadow-sm border ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <SwatchIcon className="w-5 h-5" />
        <span>{currentTheme.name}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className={`absolute right-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden z-50 ${
              isDarkMode ? 'bg-gray-800' : 'bg-white'
            } border ${
              isDarkMode ? 'border-gray-700' : 'border-gray-200'
            }`}
          >
            <div className="py-1">
              {themes.map((theme) => (
                <motion.button
                  key={theme.id}
                  whileHover={{ backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }}
                  onClick={() => handleThemeSelect(theme.id)}
                  className={`w-full text-left px-4 py-2 flex items-center gap-2 ${
                    currentTheme.id === theme.id
                      ? isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900'
                      : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <span>{theme.name}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}; 