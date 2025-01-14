import { View, Platform } from 'react-native';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSettings } from '../hooks/useSettings';
import { Switch } from '@/components/ui/switch';
import { Button, ButtonIcon } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Ionicons } from '@expo/vector-icons';

export default function Settings() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();

  const toggleTheme = useCallback(() => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  }, [settings.theme]);

  const toggleSound = useCallback(() => {
    updateSettings({ sound: !settings.sound });
  }, [settings.sound]);

  const toggleVibration = useCallback(() => {
    updateSettings({ vibration: !settings.vibration });
  }, [settings.vibration]);

  return (
    <View className={`flex-1 px-4 pt-14 ${settings.theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#f7f7f7]'}`}>
      <HStack className="items-center mb-8">
        <Button
          variant="link"
          onPress={() => router.back()}
          className="p-2 -ml-2"
        >
          <ButtonIcon>
            <Ionicons 
              name="chevron-back" 
              size={28} 
              color={settings.theme === 'dark' ? '#fff' : '#000'} 
            />
          </ButtonIcon>
        </Button>
        <Text 
          size="3xl" 
          className={`font-bold ml-2 ${settings.theme === 'dark' ? 'text-white' : 'text-black'}`}
        >
          设置
        </Text>
      </HStack>

      <VStack 
        className={`rounded-3xl p-4 space-y-6 ${
          settings.theme === 'dark' ? 'bg-[#242424]' : 'bg-white'
        }`}
      >
        <HStack className="justify-between items-center">
          <Text 
            size="lg"
            className={settings.theme === 'dark' ? 'text-white' : 'text-black'}
          >
            深色模式
          </Text>
          <Switch
            value={settings.theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#E2E8F0', true: '#4A5568' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E2E8F0"
          />
        </HStack>

        <HStack className="justify-between items-center">
          <Text 
            size="lg"
            className={settings.theme === 'dark' ? 'text-white' : 'text-black'}
          >
            音效
          </Text>
          <Switch
            value={settings.sound}
            onValueChange={toggleSound}
            trackColor={{ false: '#E2E8F0', true: '#4A5568' }}
            thumbColor="#FFFFFF"
            ios_backgroundColor="#E2E8F0"
          />
        </HStack>

        {Platform.OS !== 'web' && (
          <HStack className="justify-between items-center">
            <Text 
              size="lg"
              className={settings.theme === 'dark' ? 'text-white' : 'text-black'}
            >
              震动
            </Text>
            <Switch
              value={settings.vibration}
              onValueChange={toggleVibration}
              trackColor={{ false: '#E2E8F0', true: '#4A5568' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E2E8F0"
            />
          </HStack>
        )}
      </VStack>
    </View>
  );
}