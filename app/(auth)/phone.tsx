import { useAuth } from "@/lib/AuthContext";
import { createUserIfNew } from "@/lib/db";
import * as Google from "expo-auth-session/providers/google";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

const PRIMARY = "#1D9E75";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";

export default function PhoneScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleResponse(response);
    }
  }, [response, handleGoogleResponse]);

  const handleGoogleResponse = useCallback(
    async (resp: any) => {
      setLoading(true);
      try {
        // Extract user info from Google response
        const userData = {
          email: resp.params.email || "",
          displayName: resp.params.name || "",
          photoURL: resp.params.picture || "",
        };

        // Sign in using AuthContext
        await signIn(userData);

        // Create user in database
        await createUserIfNew(userData.email);

        // Navigate to appropriate screen
        router.replace("/(tabs)/home");
      } catch (error: any) {
        Alert.alert("Sign-in failed", error.message);
      } finally {
        setLoading(false);
      }
    },
    [signIn],
  );

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <View style={s.content}>
        <View style={s.logoBox}>
          <View style={s.logo}>
            <Text style={s.logoText}>P</Text>
          </View>
        </View>

        <Text style={s.title}>Welcome to Pesaka</Text>
        <Text style={s.subtitle}>
          Track your MoMo and cash transactions.{"\n"}Sign in to get started.
        </Text>

        <View style={s.spacer} />

        <TouchableOpacity
          style={[s.googleBtn, (!request || loading) && s.btnDisabled]}
          onPress={() => promptAsync({ useProxy: true })}
          disabled={!request || loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#1A1A1A" size="small" />
          ) : (
            <>
              <View style={s.googleIconBox}>
                <Text style={s.googleG}>G</Text>
              </View>
              <Text style={s.googleText}>Continue with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={s.hint}>
          By continuing, you agree to our Terms & Privacy Policy
        </Text>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#FFFFFF" },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 32,
  },
  logoBox: { alignItems: "center", marginBottom: 32 },
  logo: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: { fontSize: 32, fontWeight: "800", color: "#fff" },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    textAlign: "center",
    letterSpacing: -0.5,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 22,
  },
  spacer: { flex: 1 },
  googleBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 16,
    height: 58,
    gap: 12,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  btnDisabled: { opacity: 0.5 },
  googleIconBox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F9FF",
  },
  googleG: { fontSize: 14, fontWeight: "800", color: "#4285F4" },
  googleText: { fontSize: 16, fontWeight: "600", color: TEXT_PRIMARY },
  hint: {
    textAlign: "center",
    fontSize: 12,
    color: TEXT_SECONDARY,
    lineHeight: 18,
  },
});
