import { Stack } from 'expo-router';
import { AppSettingsProvider } from '../context/AppSettingsContext';

export default function RootLayout() {
  return (
    <AppSettingsProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />
        <Stack.Screen name="student" />
      </Stack>
    </AppSettingsProvider>
  );
}