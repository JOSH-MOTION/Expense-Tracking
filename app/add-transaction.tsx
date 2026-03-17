// app/_layout.tsx  — add this inside your Stack
import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen
        name="add-transaction"
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
          headerShown: false,
        }}
      />
    </Stack>
  );
}