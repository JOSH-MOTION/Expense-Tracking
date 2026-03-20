import { useColorScheme } from "@/hooks/use-color-scheme";
import { AuthProvider } from "@/lib/AuthContext";
import { getBiometricEnabled, promptBiometric } from "@/lib/biometric";
import { registerForPushNotifications } from "@/lib/notifications";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  AppState, AppStateStatus, Modal, StyleSheet,
  Text, TouchableOpacity, View,
} from "react-native";
import "./global.css";

export const unstable_settings = { anchor: "(tabs)" };

function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const [error,  setError]  = useState("");
  const [trying, setTrying] = useState(false);

  const attempt = async () => {
    setTrying(true); setError("");
    const ok = await promptBiometric();
    if (ok) { onUnlock(); }
    else    { setError("Authentication failed. Try again."); }
    setTrying(false);
  };

  useEffect(() => { attempt(); }, []);

  return (
    <Modal visible animationType="fade" statusBarTranslucent>
      <View style={ls.bg}>
        <View style={ls.card}>
          <Text style={ls.icon}>🔒</Text>
          <Text style={ls.title}>App Locked</Text>
          <Text style={ls.sub}>Verify your identity to continue</Text>
          {error ? <Text style={ls.error}>{error}</Text> : null}
          <TouchableOpacity style={ls.btn} onPress={attempt} disabled={trying} activeOpacity={0.85}>
            <Text style={ls.btnTxt}>{trying ? "Verifying..." : "Unlock with Biometrics"}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const ls = StyleSheet.create({
  bg:    { flex: 1, backgroundColor: "#0D1117", alignItems: "center", justifyContent: "center" },
  card:  { backgroundColor: "#1A1F2E", borderRadius: 24, padding: 32, alignItems: "center", width: "80%", borderWidth: 0.5, borderColor: "#2D3748" },
  icon:  { fontSize: 48, marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#FFFFFF", marginBottom: 8 },
  sub:   { fontSize: 14, color: "#9CA3AF", textAlign: "center", marginBottom: 24, lineHeight: 20 },
  error: { fontSize: 13, color: "#F87171", marginBottom: 16, textAlign: "center" },
  btn:   { backgroundColor: "#1D9E75", borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: "100%", alignItems: "center" },
  btnTxt:{ fontSize: 15, fontWeight: "700", color: "#FFFFFF" },
});

function AppContent() {
  const colorScheme    = useColorScheme();
  const [locked, setLocked] = useState(false);
  const appState       = useRef<AppStateStatus>(AppState.currentState);
  const backgroundedAt = useRef<number | null>(null);
  const LOCK_AFTER_MS  = 3000;

  // Register push notifications on launch
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  // Biometric background lock
  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState) => {
      const biometricOn = await getBiometricEnabled();
      if (!biometricOn) return;

      if (appState.current === "active" &&
          (nextState === "background" || nextState === "inactive")) {
        backgroundedAt.current = Date.now();
      }

      if ((appState.current === "background" || appState.current === "inactive") &&
           nextState === "active") {
        const elapsed = backgroundedAt.current
          ? Date.now() - backgroundedAt.current
          : Infinity;
        if (elapsed >= LOCK_AFTER_MS) setLocked(true);
        backgroundedAt.current = null;
      }

      appState.current = nextState;
    });
    return () => sub.remove();
  }, []);

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index"              options={{ headerShown: false }} />
        <Stack.Screen name="onboarding"         options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/phone"       options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/otp"         options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="(tabs)"             options={{ headerShown: false }} />
        <Stack.Screen name="security-settings"  options={{ headerShown: false, presentation: "card" }} />
        <Stack.Screen name="add-transaction"    options={{ headerShown: false, presentation: "transparentModal", animation: "slide_from_bottom" }} />
        <Stack.Screen name="ai-momo-import"     options={{ headerShown: false, presentation: "card", animation: "slide_from_right" }} />
        <Stack.Screen name="(auth)/setup-profile" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)/signup"      options={{ headerShown: false }} />
        <Stack.Screen name="currency-settings"  options={{ headerShown: false, presentation: "card", animation: "slide_from_right" }} />
        <Stack.Screen name="notification-settings" options={{ headerShown: false, presentation: "card", animation: "slide_from_right" }} />
        <Stack.Screen name="help-support"       options={{ headerShown: false, presentation: "card", animation: "slide_from_right" }} />
      </Stack>
      <StatusBar style="auto" />
      {locked && <LockScreen onUnlock={() => setLocked(false)} />}
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}