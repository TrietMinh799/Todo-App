import { useState, useEffect, useRef } from 'react';

export type SoundType = 'rain' | 'forest' | 'cafe' | 'waves' | 'whitenoise' | 'none';

interface Sound {
    id: SoundType;
    name: string;
    url: string;
}

export const sounds: Sound[] = [
    { id: 'none', name: 'No Sound', url: '' },
    { id: 'rain', name: 'Gentle Rain', url: '/sounds/rain.mp3' },
    { id: 'forest', name: 'Forest Ambience', url: '/sounds/forest.mp3' },
    { id: 'cafe', name: 'Cafe Atmosphere', url: '/sounds/cafe.mp3' },
    { id: 'waves', name: 'Ocean Waves', url: '/sounds/waves.mp3' },
    { id: 'whitenoise', name: 'White Noise', url: '/sounds/whitenoise.mp3' },
];

export const useSoundPlayer = () => {
    const [currentSound, setCurrentSound] = useState<SoundType>(() => {
        const savedSound = localStorage.getItem('currentSound');
        return (savedSound as SoundType) || 'none';
    });
    const [volume, setVolume] = useState<number>(() => {
        const savedVolume = localStorage.getItem('soundVolume');
        return savedVolume ? parseFloat(savedVolume) : 0.5;
    });
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Initialize audio element
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
        }

        // Save preferences to localStorage
        localStorage.setItem('currentSound', currentSound);
        localStorage.setItem('soundVolume', volume.toString());

        // Update audio source and play state
        const sound = sounds.find(s => s.id === currentSound);
        if (sound && sound.url) {
            audioRef.current.src = sound.url;
            audioRef.current.volume = volume;

            if (isPlaying) {
                audioRef.current.play().catch(error => {
                    console.error('Error playing audio:', error);
                    setIsPlaying(false);
                });
            } else {
                audioRef.current.pause();
            }
        } else {
            // No sound selected or invalid sound
            audioRef.current.pause();
            setIsPlaying(false);
        }

        // Cleanup function
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
            }
        };
    }, [currentSound, volume, isPlaying]);

    const togglePlay = () => {
        if (currentSound === 'none') {
            // If no sound is selected, don't toggle play state
            return;
        }
        setIsPlaying(!isPlaying);
    };

    const changeSound = (soundType: SoundType) => {
        setCurrentSound(soundType);
        if (soundType === 'none') {
            setIsPlaying(false);
        } else if (!isPlaying) {
            setIsPlaying(true);
        }
    };

    const adjustVolume = (newVolume: number) => {
        setVolume(Math.max(0, Math.min(1, newVolume)));
    };

    return {
        currentSound,
        volume,
        isPlaying,
        togglePlay,
        changeSound,
        adjustVolume,
    };
};