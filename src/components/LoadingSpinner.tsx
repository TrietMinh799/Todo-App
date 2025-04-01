import React from 'react';
import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  isDarkMode: boolean;
}

export const LoadingSpinner = ({ isDarkMode }: LoadingSpinnerProps) => {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <motion.div
        className={`w-12 h-12 rounded-full border-4 border-t-transparent ${
          isDarkMode ? 'border-gray-700' : 'border-gray-200'
        }`}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
}; 