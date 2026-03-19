import { useAuth } from "@/lib/AuthContext";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#1D9E75";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";

export default function LoginScreen() {
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      const needsSetup = await signInWithEmail(email.trim(), password);
      if (needsSetup) {
        router.replace("/(auth)/setup-profile");
      } else {
        router.replace("/(tabs)/home");
      }
    } catch (error: any) {
      const msg =
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password" ||
        error.code === "auth/invalid-credential"
          ? "Incorrect email or password."
          : error.code === "auth/invalid-email"
            ? "Please enter a valid email address."
            : error.message;
      Alert.alert("Login failed", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={s.content}>
          {/* Logo */}
          <View style={s.logoBox}>
            <View style={s.logo}>
              <Text style={s.logoText}>P</Text>
            </View>
            <Text style={s.appName}>Pesaka</Text>
            <Text style={s.tagline}>Track every pesewa 🇬🇭</Text>
          </View>

          {/* Form */}
          <View style={s.form}>
            <TextInput
              style={s.input}
              placeholder="Email address"
              placeholderTextColor="#CBD5E1"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={s.passRow}>
              <TextInput
                style={[s.input, { flex: 1, marginBottom: 0 }]}
                placeholder="Password"
                placeholderTextColor="#CBD5E1"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPass(!showPass)}
                style={s.eyeBtn}
              >
                <Text style={s.eyeText}>{showPass ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>Sign In</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity style={s.forgotBtn}>
              <Text style={s.forgotText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <View style={s.spacer} />

          {/* Bottom signup link */}
          <View style={s.bottomRow}>
            <Text style={s.bottomText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push("/(auth)/signup")}>
              <Text style={s.signupLink}>Create one</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 40, paddingBottom: 32 },
  logoBox: { alignItems: "center", marginBottom: 48 },
  logo: {
    width: 76, height: 76, borderRadius: 22,
    backgroundColor: PRIMARY, alignItems: "center", justifyContent: "center",
    shadowColor: PRIMARY, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3, shadowRadius: 16, elevation: 8, marginBottom: 14,
  },
  logoText: { fontSize: 34, fontWeight: "800", color: "#fff" },
  appName: { fontSize: 28, fontWeight: "800", color: TEXT_PRIMARY, marginBottom: 4 },
  tagline: { fontSize: 14, color: TEXT_SECONDARY },
  form: { gap: 12 },
  input: {
    borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 14,
    height: 54, paddingHorizontal: 18, fontSize: 15,
    color: TEXT_PRIMARY, backgroundColor: "#FAFAFA",
  },
  passRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn: { padding: 8 },
  eyeText: { fontSize: 18 },
  btn: {
    backgroundColor: PRIMARY, borderRadius: 14, height: 56,
    alignItems: "center", justifyContent: "center", marginTop: 4,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 17, fontWeight: "700", color: "#fff" },
  forgotBtn: { alignItems: "center", paddingVertical: 4 },
  forgotText: { fontSize: 14, color: TEXT_SECONDARY },
  spacer: { flex: 1 },
  bottomRow: { flexDirection: "row", justifyContent: "center", alignItems: "center" },
  bottomText: { fontSize: 15, color: TEXT_SECONDARY },
  signupLink: { fontSize: 15, color: PRIMARY, fontWeight: "700" },
});