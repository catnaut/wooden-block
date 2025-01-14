import { Stack } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import "@/global.css";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { useSettings } from "@/hooks/useSettings";

export default function Layout() {
  const { settings } = useSettings();

  return (
    <GluestackUIProvider mode={settings.theme}>
      <StatusBar 
        style={settings.theme === 'dark' ? 'light' : 'dark'}
        backgroundColor="transparent"
        translucent
      />
      <Stack 
        screenOptions={{
          headerShown: false,
          animation: 'fade',
          contentStyle: {
            backgroundColor: settings.theme === 'dark' ? '#1a1a1a' : '#f7f7f7'
          }
        }} 
      />
    </GluestackUIProvider>
  );
}
