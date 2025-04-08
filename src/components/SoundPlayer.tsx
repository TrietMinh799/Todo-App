import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  PauseIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';
import { SoundType, sounds as predefinedSounds, useSoundPlayer } from '../services/soundService';

export interface Sound {
  id: SoundType | string;
  name: string;
  url: string;
}

export const SoundPlayer: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { currentSound, volume, isPlaying, togglePlay, changeSound, adjustVolume } = useSoundPlayer();
  const [isOpen, setIsOpen] = useState(false);

  // Manage imported custom sounds
  const [customSounds, setCustomSounds] = useState<Sound[]>(() => {
    const stored = localStorage.getItem("customSounds");
    return stored ? JSON.parse(stored) : [];
  });

  // Merge predefined sounds with custom sounds
  const allSounds: Sound[] = [...predefinedSounds.filter(s => s.id !== 'none'), ...customSounds];

  // Reference to the hidden file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentSoundName = allSounds.find(s => s.id === currentSound)?.name || 'No Sound';

  // Handler when user selects a file
  const handleImportSound = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const newSound: Sound = { id: `custom-${Date.now()}`, name: file.name, url };
      const updated = [...customSounds, newSound];
      setCustomSounds(updated);
      localStorage.setItem("customSounds", JSON.stringify(updated));
    }
  };

  // Trigger file input button click
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex items-center gap-2 p-2 rounded-lg ${isDarkMode ? 'bg-gray-800/80' : 'bg-white/80'} backdrop-blur-sm shadow-md border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <button
          onClick={togglePlay}
          disabled={currentSound === 'none'}
          className={`p-2 rounded-full ${currentSound === 'none'
            ? 'opacity-50 cursor-not-allowed'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <PauseIcon className="w-5 h-5" />
          ) : (
            <PlayIcon className="w-5 h-5" />
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => adjustVolume(Math.max(0, volume - 0.1))}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Decrease Volume"
          >
            <SpeakerXMarkIcon className="w-4 h-4" />
          </button>
          <div className="relative w-20 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
            <div
              className="absolute top-0 left-0 h-full bg-primary-500 rounded-full"
              style={{ width: `${volume * 100}%` }}
            />
          </div>
          <button
            onClick={() => adjustVolume(Math.min(1, volume + 0.1))}
            className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            title="Increase Volume"
          >
            <SpeakerWaveIcon className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <span className="text-sm">{currentSoundName}</span>
          <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* New Import Sound Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={triggerFileInput}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
          title="Import Sound"
        >
          <span className="text-sm">Import Sound</span>
        </motion.button>
        {/* Hidden file input */}
        <input
          type="file"
          accept="audio/*"
          ref={fileInputRef}
          onChange={handleImportSound}
          style={{ display: 'none' }}
        />
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`absolute top-full right-0 mt-2 w-48 rounded-lg shadow-lg overflow-hidden z-10 ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
          >
            <div className="py-1">
              {allSounds.map((sound) => (
                <button
                  key={sound.id}
                  onClick={() => {
                    changeSound(sound.id as SoundType);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 ${currentSound === sound.id
                    ? isDarkMode
                      ? 'bg-gray-700 text-white'
                      : 'bg-gray-100 text-gray-900'
                    : isDarkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-700 hover:bg-gray-100'
                    }`}
                >
                  {sound.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};