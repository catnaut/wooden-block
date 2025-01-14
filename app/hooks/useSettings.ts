import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Settings {
  theme: 'light' | 'dark';
  sound: boolean;
  vibration: boolean;
  serverUrl: string;
}

interface SettingsState {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        theme: 'dark',
        sound: true,
        vibration: true,
        serverUrl: 'http://localhost:3000',
      },
      updateSettings: (newSettings) =>
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        })),
    }),
    {
      name: 'settings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
); 