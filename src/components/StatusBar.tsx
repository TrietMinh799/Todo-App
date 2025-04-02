import React from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface StatusBarProps {
  isDarkMode: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ isDarkMode }) => {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed bottom-0 left-0 right-0 h-8 flex items-center justify-between px-4 text-xs ${
        isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'
      } border-t ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <div className="flex items-center gap-2">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex items-center gap-1"
        >
          <CheckCircleIcon className="w-4 h-4" />
          <span>Ready</span>
        </motion.div>
      </div>

      <div className="flex items-center gap-4">
        <motion.div
          whileHover={{ scale: 1.1 }}
          className="flex items-center gap-1"
        >
          <ClockIcon className="w-4 h-4" />
          <span>{formatTime(time)}</span>
        </motion.div>
        <span>{formatDate(time)}</span>
      </div>
    </motion.div>
  );
};