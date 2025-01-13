import { View, Text, Switch, Pressable, StyleSheet } from 'react-native';
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
    <View style={[
      styles.container,
      { backgroundColor: settings.theme === 'dark' ? '#1a1a1a' : '#f7f7f7' }
    ]}>
      <View style={[
        styles.header,
        { 
          backgroundColor: settings.theme === 'dark' ? '#242424' : '#ffffff',
          borderBottomColor: settings.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)',
        }
      ]}>
        <Pressable 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <View style={[
            styles.backButtonInner,
            { 
              backgroundColor: settings.theme === 'dark' 
                ? 'rgba(255, 255, 255, 0.08)' 
                : 'rgba(0, 0, 0, 0.05)',
            }
          ]}>
            <Text style={[
              styles.backText,
              { color: settings.theme === 'dark' ? '#ffffff' : '#000000' }
            ]}>返回</Text>
          </View>
        </Pressable>

        <Text style={[
          styles.title,
          { color: settings.theme === 'dark' ? '#ffffff' : '#000000' }
        ]}>设置</Text>
      </View>

      <View style={[
        styles.settingsList,
        { 
          backgroundColor: settings.theme === 'dark' ? '#242424' : '#ffffff',
        }
      ]}>
        <View style={[
          styles.settingItem,
          { borderBottomColor: settings.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }
        ]}>
          <Text style={[
            styles.settingText,
            { color: settings.theme === 'dark' ? '#ffffff' : '#000000' }
          ]}>深色模式</Text>
          <Switch
            value={settings.theme === 'dark'}
            onValueChange={toggleTheme}
            trackColor={{ false: '#767577', true: '#4ECDC4' }}
            thumbColor={settings.theme === 'dark' ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>

        <View style={[
          styles.settingItem,
          { borderBottomColor: settings.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }
        ]}>
          <Text style={[
            styles.settingText,
            { color: settings.theme === 'dark' ? '#ffffff' : '#000000' }
          ]}>音效</Text>
          <Switch
            value={settings.sound}
            onValueChange={toggleSound}
            trackColor={{ false: '#767577', true: '#4ECDC4' }}
            thumbColor={settings.sound ? '#ffffff' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
          />
        </View>

        <View style={[
          styles.settingItem,
          { borderBottomColor: settings.theme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)' }
        ]}>
          <Text style={[
            styles.settingText,
            { color: settings.theme === 'dark' ? '#ffffff' : '#000000' }
          ]}>震动</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  backButton: {
    marginBottom: 20,
  },
  backButtonInner: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  backText: {
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  settingsList: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
  },
  settingText: {
    fontSize: 17,
    fontWeight: '500',
    letterSpacing: 0.15,
  },
}); 