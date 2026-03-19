import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import './global.css';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider } from '@/lib/AuthContext';

export const unstable_settings = { anchor: '(tabs)' };

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="index"             options={{ headerShown: false }} />
          <Stack.Screen name="onboarding"        options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/phone"      options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/otp"        options={{ headerShown: false, animation: 'slide_from_right' }} />
          <Stack.Screen name="(tabs)"            options={{ headerShown: false }} />
          <Stack.Screen name="security-settings" options={{ headerShown: false, presentation: 'card' }} />
          <Stack.Screen name="add-transaction"   options={{ headerShown: false, presentation: 'transparentModal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="ai-momo-import" options={{ headerShown: false, presentation: 'card', animation: 'slide_from_right' }} />
          <Stack.Screen name="(auth)/setup-profile" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)/signup" options={{ headerShown: false }} />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}