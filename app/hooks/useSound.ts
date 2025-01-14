import { Audio } from 'expo-av';
import { useCallback, useEffect, useRef } from 'react';
import { useSettings } from './useSettings';

export const useSound = () => {
  const sound = useRef<Audio.Sound>();
  const { settings } = useSettings();

  useEffect(() => {
    const loadSound = async () => {
      const { sound: audioSound } = await Audio.Sound.createAsync(
        require('../assets/sound.mp3')
      );
      sound.current = audioSound;
    };

    loadSound();

    return () => {
      if (sound.current) {
        sound.current.unloadAsync();
      }
    };
  }, []);

  const playSound = useCallback(async () => {
    if (!settings.sound || !sound.current) return;
    
    try {
      await sound.current.setPositionAsync(0);
      await sound.current.playAsync();
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  }, [settings.sound]);

  return { playSound };
}; 