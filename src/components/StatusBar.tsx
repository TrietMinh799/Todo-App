import React, { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { BoltIcon, Battery0Icon } from '@heroicons/react/24/outline';

interface StatusBarProps {
  isDarkMode: boolean;
}

export const StatusBar: React.FC<StatusBarProps> = ({ isDarkMode }) => {
  const { currentTheme } = useTheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);

  useEffect(() => {
    // Update time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    // Get battery status if available
    if ('getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(battery.level * 100);
        setIsCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setBatteryLevel(battery.level * 100);
        });

        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      });
    }

    return () => clearInterval(timer);
  }, []);

  return (
    <div
      className={`
        fixed bottom-0 left-0 right-0 
        py-2 px-4
        backdrop-blur-md
        ${isDarkMode
          ? 'bg-gray-900/70 border-t border-gray-800'
          : 'bg-white/70 border-t border-gray-200'
        }
        flex items-center justify-between
        text-sm
      `}
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
      <div className="flex items-center gap-4">
        <span className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
          Made with ❤️ by X50000
        </span>
      </div>

      <div className="flex items-center gap-6">
        {/* Time */}
        <div className={`flex items-center ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
          {currentTime.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}
        </div>

        {/* Battery Status */}
        {batteryLevel !== null && (
          <div className={`
            flex items-center gap-1.5
            ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}
          `}>
            {isCharging && (
              <BoltIcon className="w-4 h-4 text-green-500" />
            )}
            <div className="flex items-center gap-1">
              <Battery0Icon className={`w-5 h-5 ${batteryLevel > 20
                ? 'text-green-500'
                : 'text-red-500'
                }`} />
              <span className="text-sm">{Math.round(batteryLevel)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};