import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, Battery0Icon } from '@heroicons/react/24/outline';

interface StatusBarProps {
  isDarkMode: boolean;
}

export const StatusBar = ({ isDarkMode }: StatusBarProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Get battery information if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level * 100);

        // Listen for battery changes
        battery.addEventListener('levelchange', () => {
          setBatteryLevel(battery.level * 100);
        });
      });
    }

    return () => {
      clearInterval(timer);
    };
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`fixed bottom-0 left-0 right-0 p-2 text-sm ${isDarkMode ? 'bg-gray-900/80 text-gray-300' : 'bg-white/80 text-gray-700'
        } backdrop-blur-lg border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-200'
        }`}
    >
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClockIcon className="w-4 h-4" />
          <span>{formatTime(currentTime)}</span>
        </div>
        {batteryLevel !== null && (
          <div className="flex items-center gap-2">
            <motion.div
              className="relative w-6 h-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {/* Battery outline */}
              <svg
                viewBox="0 0 24 12"
                className="absolute inset-0"
              >
                <path
                  d="M1,4 L1,8 A1,1 0 0,0 2,9 L20,9 A1,1 0 0,0 21,8 L21,4 A1,1 0 0,0 20,3 L2,3 A1,1 0 0,0 1,4 Z"
                  fill="none"
                  className={isDarkMode ? 'stroke-gray-300' : 'stroke-gray-700'}
                  strokeWidth="1"
                />
                <motion.rect
                  initial={{ width: 0 }}
                  animate={{
                    width: `${batteryLevel}%`,
                    transition: { duration: 0.5 }
                  }}
                  x="2"
                  y="2"
                  height="8"
                  className={
                    batteryLevel > 50 ? 'fill-green-500' :
                      batteryLevel > 20 ? 'fill-yellow-500' : 'fill-red-500'
                  }
                />
              </svg>
            </motion.div>
            <motion.span
              key={batteryLevel}
              initial={{ y: -5, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {Math.round(batteryLevel)}%
            </motion.span>
          </div>
        )}
      </div>
    </motion.div>
  );
};