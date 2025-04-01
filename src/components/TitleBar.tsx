import React from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, MinusIcon, ArrowsPointingOutIcon, ArrowsPointingInIcon } from '@heroicons/react/24/outline';

interface TitleBarProps {
  isDarkMode: boolean;
  isMaximized: boolean;
}

export const TitleBar: React.FC<TitleBarProps> = ({ isDarkMode, isMaximized }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed top-0 left-0 right-0 h-12 flex items-center justify-between px-4 backdrop-blur-md bg-opacity-80 z-50 ${
        isDarkMode ? 'bg-gray-900/80' : 'bg-white/80'
      } border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-200'}`}
    >
      <div className="flex items-center space-x-2">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
          className={`w-3 h-3 rounded-full ${isDarkMode ? 'bg-blue-500' : 'bg-blue-600'}`}
        />
        <span className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
          Todo App
        </span>
      </div>
      <div className="flex items-center space-x-1">
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: isDarkMode ? 'rgb(55, 65, 81)' : 'rgb(243, 244, 246)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.electron?.minimizeWindow()}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          <MinusIcon className="w-4 h-4" />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: isDarkMode ? 'rgb(55, 65, 81)' : 'rgb(243, 244, 246)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.electron?.maximizeWindow()}
          className={`p-2 rounded-lg transition-colors ${
            isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
          }`}
        >
          {isMaximized ? (
            <ArrowsPointingInIcon className="w-4 h-4" />
          ) : (
            <ArrowsPointingOutIcon className="w-4 h-4" />
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1, backgroundColor: 'rgb(239, 68, 68)' }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.electron?.closeWindow()}
          className="p-2 rounded-lg text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
        >
          <XMarkIcon className="w-4 h-4" />
        </motion.button>
      </div>
    </motion.div>
  );
};