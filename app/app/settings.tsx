import { View, Text, Switch, Pressable } from 'react-native';
import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useSettings } from '../hooks/useSettings';

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
    <View className={`flex-1 ${settings.theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#f7f7f7]'}`}>
      <View className={`pt-[50px] px-5 pb-5 border-b shadow-sm ${
        settings.theme === 'dark' 
          ? 'bg-[#242424] border-white/[0.08]' 
          : 'bg-white border-black/[0.08]'
      }`}>
        <Pressable 
          className="mb-5"
          onPress={() => router.back()}
        >
          <View className={`px-4 py-2 rounded-2xl self-start ${
            settings.theme === 'dark' 
              ? 'bg-white/[0.08]' 
              : 'bg-black/[0.05]'
          }`}>
            <Text className={`text-base font-medium tracking-[0.5px] ${
              settings.theme === 'dark' ? 'text-white' : 'text-black'
            }`}>返回</Text>
          </View>
        </Pressable>

        <Text className={`text-[34px] font-bold tracking-[-0.5px] ${
          settings.theme === 'dark' ? 'text-white' : 'text-black'
        }`}>设置</Text>
      </View>

      <View className={`mt-4 mx-4 rounded-[28px] overflow-hidden shadow-md ${
        settings.theme === 'dark' ? 'bg-[#242424]' : 'bg-white'
      }`}>
        <View className={`flex-row justify-between items-center py-5 px-6 border-b ${
          settings.theme === 'dark' ? 'border-white/[0.08]' : 'border-black/[0.08]'
        }`}>
          <Text className={`text-[17px] font-medium tracking-[0.15px] ${
            settings.theme === 'dark' ? 'text-white' : 'text-black'
          }`}>深色模式</Text>
          <Switch
            value={settings.theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#4ECDC4' }}
            thumbColor={settings.theme === 'dark' ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>

        <View className={`flex-row justify-between items-center py-5 px-6 border-b ${
          settings.theme === 'dark' ? 'border-white/[0.08]' : 'border-black/[0.08]'
        }`}>
          <Text className={`text-[17px] font-medium tracking-[0.15px] ${
            settings.theme === 'dark' ? 'text-white' : 'text-black'
          }`}>音效</Text>
          <Switch
            value={settings.sound}
            onValueChange={toggleSound}
            trackColor={{ false: '#767577', true: '#4ECDC4' }}
            thumbColor={settings.sound ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>

        <View className={`flex-row justify-between items-center py-5 px-6 border-b ${
          settings.theme === 'dark' ? 'border-white/[0.08]' : 'border-black/[0.08]'
        }`}>
          <Text className={`text-[17px] font-medium tracking-[0.15px] ${
            settings.theme === 'dark' ? 'text-white' : 'text-black'
          }`}>震动</Text>
          <Switch
            value={settings.vibration}
            onValueChange={toggleVibration}
            trackColor={{ false: '#767577', true: '#4ECDC4' }}
            thumbColor={settings.vibration ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>
      </View>
    </View>
  );
} 