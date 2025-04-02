import React, { useState, useCallback, memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  BellIcon, 
  ClockIcon, 
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

export type ReminderTime = '5min' | '15min' | '30min' | '1hour' | '1day' | 'custom';

export interface Reminder {
  id: string;
  time: ReminderTime;
  customTime?: number; // in minutes
  enabled: boolean;
}

// Default reminder object
const defaultReminder: Reminder = {
  id: '',
  time: '30min',
  enabled: false,
};

interface ReminderSettingsProps {
  reminder?: Reminder;
  onUpdate: (reminder: Reminder) => void;
  onClose: () => void;
}

export const ReminderSettings = memo<ReminderSettingsProps>(({
  reminder = defaultReminder,
  onUpdate,
  onClose,
}) => {
  const { isDarkMode, currentTheme } = useTheme();
  const [selectedTime, setSelectedTime] = useState<ReminderTime>(reminder.time);
  const [customMinutes, setCustomMinutes] = useState<string>(
    reminder.customTime ? reminder.customTime.toString() : '30'
  );
  const [isCustom, setIsCustom] = useState<boolean>(reminder.time === 'custom');

  // Memoize handlers
  const handleSave = useCallback(() => {
    const updatedReminder: Reminder = {
      ...reminder,
      time: selectedTime,
      customTime: isCustom ? parseInt(customMinutes, 10) : undefined,
      enabled: true,
    };
    onUpdate(updatedReminder);
    onClose();
  }, [reminder, selectedTime, isCustom, customMinutes, onUpdate, onClose]);

  const handleToggleReminder = useCallback(() => {
    onUpdate({
      ...reminder,
      enabled: !reminder.enabled,
    });
    onClose();
  }, [reminder, onUpdate, onClose]);

  // Memoize styles
  const containerStyle = useMemo(() => ({
    backgroundColor: isDarkMode ? currentTheme.colors.surface : 'white',
    borderColor: isDarkMode ? currentTheme.colors.border : '#e5e7eb',
  }), [isDarkMode, currentTheme.colors.surface, currentTheme.colors.border]);

  const inputStyle = useMemo(() => ({
    backgroundColor: isDarkMode ? currentTheme.colors.surface : '#f9fafb',
    borderColor: isDarkMode ? currentTheme.colors.border : '#e5e7eb',
    color: isDarkMode ? currentTheme.colors.text : '#111827',
  }), [isDarkMode, currentTheme.colors.surface, currentTheme.colors.border, currentTheme.colors.text]);

  const reminderOptions: { value: ReminderTime; label: string }[] = [
    { value: '5min', label: '5 minutes before' },
    { value: '15min', label: '15 minutes before' },
    { value: '30min', label: '30 minutes before' },
    { value: '1hour', label: '1 hour before' },
    { value: '1day', label: '1 day before' },
    { value: 'custom', label: 'Custom time' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`mt-4 p-4 rounded-lg shadow-lg border ${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
      style={containerStyle}
    >
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <BellIcon className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`} 
              style={{ color: currentTheme.colors.primary }} />
            <h3 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              style={{ color: isDarkMode ? currentTheme.colors.text : '#111827' }}>
              Reminder Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className={`p-1 rounded-full ${
              isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
            }`}
            style={{
              color: isDarkMode ? currentTheme.colors.textSecondary : '#6b7280',
            }}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {reminder.enabled ? (
          <>
            <div className="mb-4">
              <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                style={{ color: isDarkMode ? currentTheme.colors.text : '#374151' }}>
                Remind me
              </label>
              <div className="space-y-2">
                {reminderOptions.map((option) => (
                  <div
                    key={option.value}
                    className={`flex items-center p-2 rounded-md cursor-pointer ${
                      selectedTime === option.value
                        ? isDarkMode ? 'bg-blue-900/30' : 'bg-blue-50'
                        : isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: selectedTime === option.value
                        ? isDarkMode ? `${currentTheme.colors.primary}20` : '#eff6ff'
                        : 'transparent',
                    }}
                    onClick={() => {
                      setSelectedTime(option.value);
                      setIsCustom(option.value === 'custom');
                    }}
                  >
                    <div className={`flex-1 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}
                      style={{ color: isDarkMode ? currentTheme.colors.text : '#374151' }}>
                      {option.label}
                    </div>
                    {selectedTime === option.value && (
                      <CheckIcon className={`w-4 h-4 ${isDarkMode ? 'text-blue-400' : 'text-blue-500'}`}
                        style={{ color: currentTheme.colors.primary }} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {isCustom && (
              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
                  style={{ color: isDarkMode ? currentTheme.colors.text : '#374151' }}>
                  Custom time (minutes)
                </label>
                <div className="flex items-center gap-2">
                  <ClockIcon className={`w-5 h-5 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                    style={{ color: isDarkMode ? currentTheme.colors.textSecondary : '#6b7280' }} />
                  <input
                    type="number"
                    min="1"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(e.target.value)}
                    className={`w-full px-3 py-2 rounded-md text-sm ${
                      isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    style={inputStyle}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={onClose}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-100 text-gray-700'
                }`}
                style={{
                  color: isDarkMode ? currentTheme.colors.text : '#374151',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={`px-3 py-1.5 rounded-md text-sm ${
                  isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                }`}
                style={{
                  backgroundColor: currentTheme.colors.primary,
                }}
              >
                Save
              </button>
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}
              style={{ color: isDarkMode ? currentTheme.colors.text : '#374151' }}>
              Reminders are currently disabled for this task.
            </p>
            <button
              onClick={handleToggleReminder}
              className={`px-4 py-2 rounded-md text-sm ${
                isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
              }`}
              style={{
                backgroundColor: currentTheme.colors.primary,
              }}
            >
              Enable Reminders
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
});

// Add display name for better debugging
ReminderSettings.displayName = 'ReminderSettings'; 