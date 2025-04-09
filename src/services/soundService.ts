import { useState, useEffect, useRef, useCallback } from 'react';

export type SoundType = 'rain' | 'forest' | 'cafe' | 'waves' | 'whitenoise' | 'none';

interface Sound {
    id: SoundType;
    name: string;
    url: string;
}

// Update the URLs to use the correct path without 'public'
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

    // Initialize audio on mount
    useEffect(() => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.loop = true;
        }

        // Cleanup on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);

    // Handle sound changes with better error handling
    useEffect(() => {
        if (!audioRef.current) return;

        const sound = sounds.find(s => s.id === currentSound);
        if (!sound || !sound.url) {
            audioRef.current.pause();
            setIsPlaying(false);
            return;
        }

        // Save settings
        localStorage.setItem('currentSound', currentSound);
        localStorage.setItem('soundVolume', volume.toString());

        const playSound = async () => {
            try {
                audioRef.current!.src = sound.url;
                audioRef.current!.volume = volume;
                await audioRef.current!.load();

                if (isPlaying) {
                    const playPromise = audioRef.current!.play();
                    if (playPromise !== undefined) {
                        playPromise.catch(error => {
                            console.error('Error playing audio:', error);
                            setIsPlaying(false);
                        });
                    }
                }
            } catch (error) {
                console.error('Error loading audio:', error);
                setIsPlaying(false);
            }
        };

        playSound();
    }, [currentSound, volume, isPlaying]);

    const togglePlay = useCallback(() => {
        if (currentSound === 'none' || !audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise
                    .then(() => setIsPlaying(true))
                    .catch(error => {
                        console.error('Error playing audio:', error);
                        setIsPlaying(false);
                    });
            }
        }
    }, [currentSound, isPlaying]);

    const changeSound = useCallback((soundType: SoundType) => {
        setCurrentSound(soundType);
        if (soundType === 'none') {
            setIsPlaying(false);
        }
    }, []);

    const adjustVolume = useCallback((newVolume: number) => {
        setVolume(Math.max(0, Math.min(1, newVolume)));
    }, []);

    return {
        currentSound,
        volume,
        isPlaying,
        togglePlay,
        changeSound,
        adjustVolume,
    };
};