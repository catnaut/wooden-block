import { View, Platform, Pressable } from 'react-native';
import { useCallback, useState } from 'react';
import { useRouter } from 'expo-router';
import { useSettings } from '../hooks/useSettings';
import { Switch } from '@/components/ui/switch';
import { Button, ButtonIcon, ButtonText } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";
import { HStack } from "@/components/ui/hstack";
import { Ionicons } from '@expo/vector-icons';
import { Input, InputField } from "@/components/ui/input";

export default function Settings() {
  const router = useRouter();
  const { settings, updateSettings } = useSettings();
  const [serverUrl, setServerUrl] = useState(settings.serverUrl);

  const toggleTheme = useCallback(() => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  }, [settings.theme]);

  const toggleSound = useCallback(() => {
    updateSettings({ sound: settings.sound? false : true });
  }, [settings.sound]);

  const toggleVibration = useCallback(() => {
    updateSettings({ vibration: settings.vibration? false : true });
  }, [settings.vibration]);

  const handleServerUrlSave = useCallback(() => {
    updateSettings({ serverUrl });
  }, [serverUrl]);

  return (
    <View className={`flex-1 px-4 pt-14 ${settings.theme === 'dark' ? 'bg-[#1a1a1a]' : 'bg-[#f7f7f7]'}`}>
      <HStack className="items-center mb-8">
        <Pressable 
          onPress={() => router.back()}
          className="p-2 -ml-2 rounded-full active:opacity-70"
          style={({ pressed }) => [
            pressed && Platform.OS === 'ios' ? { opacity: 0.7 } : {}
          ]}
        >
          <Ionicons 
            name="chevron-back" 
            size={28} 
            color={settings.theme === 'dark' ? '#fff' : '#000'} 
          />
        </Pressable>
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
            trackColor={{ false: '#E2E8F0', true: '#6750A4' }}
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
            trackColor={{ false: '#E2E8F0', true: '#6750A4' }}
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
              trackColor={{ false: '#E2E8F0', true: '#6750A4' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor="#E2E8F0"
            />
          </HStack>
        )}

        <VStack space="xs">
          <Text 
            size="lg"
            className={settings.theme === 'dark' ? 'text-white' : 'text-black'}
          >
            服务器地址
          </Text>
          <HStack space="sm">
            <Input
              variant="outline"
              size="md"
              className="flex-1"
            >
              <InputField
                value={serverUrl}
                onChangeText={setServerUrl}
                placeholder="输入服务器地址"
                placeholderTextColor={settings.theme === 'dark' ? '#666' : '#999'}
                className={`${settings.theme === 'dark' ? 'text-white border-[#313131]' : 'text-black border-[#E8E8E8]'}`}
              />
            </Input>
            <Button
              size="md"
              variant="solid"
              className={settings.theme === 'dark' ? 'bg-[#6750A4] hover:bg-[#7B65B6] active:bg-[#8C7CC0]' : 'bg-[#6750A4] hover:bg-[#7B65B6] active:bg-[#8C7CC0]'}
              onPress={handleServerUrlSave}
            >
              <ButtonText className="text-white font-medium">保存</ButtonText>
            </Button>
          </HStack>
        </VStack>
      </VStack>
    </View>
  );
}