import { useAuth } from "@/lib/AuthContext";
import { createUserIfNew } from "@/lib/db";
import * as AuthSession from "expo-auth-session";
import * as Google from "expo-auth-session/providers/google";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

WebBrowser.maybeCompleteAuthSession();

const PRIMARY = "#1D9E75";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";

export default function LoginScreen() {
  const { signInWithEmail, registerWithEmail, signIn, markUserAsReturning } =
    useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showProfileSetup, setShowProfileSetup] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<any>(null);
  const [name, setName] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    redirectUri,
  });

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleResponse(response);
    }
  }, [response, handleGoogleResponse]);

  const handleGoogleResponse = useCallback(async (resp: any) => {
    setLoading(true);
    try {
      // Extract user info from Google response
      const userData = {
        email: resp.params.email || "",
        displayName: resp.params.name || "",
        photoURL: resp.params.picture || "",
      };

      // Check if user exists and needs profile setup
      await createUserIfNew(userData.email);

      // Store Google data for profile setup
      setGoogleUserData(userData);
      setName(userData.displayName || "");

      // Show profile setup screen
      setShowProfileSetup(true);
    } catch (error: any) {
      Alert.alert("Sign-in failed", error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Please allow access to your photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  async function uploadToCloudinary(uri: string): Promise<string> {
    const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    const formData = new FormData();
    formData.append("file", {
      uri,
      type: "image/jpeg",
      name: "profile.jpg",
    } as any);
    formData.append("upload_preset", uploadPreset!);
    formData.append("folder", "pesaka/avatars");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData },
    );
    const data = await res.json();
    if (!data.secure_url) throw new Error("Upload failed");
    return data.secure_url;
  }

  const handleProfileSetup = async () => {
    if (!name.trim()) {
      Alert.alert("Enter your name", "Please enter your name to continue.");
      return;
    }
    setLoading(true);
    try {
      let avatarUrl = "";
      if (photoUri) {
        avatarUrl = await uploadToCloudinary(photoUri);
      }

      // Create user with name and avatar
      await createUserIfNew(googleUserData.email, name.trim(), avatarUrl);

      // Sign in using AuthContext
      await signIn(googleUserData);

      // Mark user as returning (one-time login complete)
      await markUserAsReturning();

      // Navigate to home
      router.replace("/(tabs)/home");
    } catch (error: any) {
      Alert.alert("Setup failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      if (isLogin) {
        const isNewUser = await signInWithEmail(email.trim(), password);
        if (isNewUser) {
          router.replace("/(auth)/setup-profile");
        } else {
          router.replace("/(tabs)/home");
        }
      } else {
        await registerWithEmail(email.trim(), password);
        router.replace("/(auth)/setup-profile");
      }
    } catch (error: any) {
      const msg =
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
          ? "Incorrect email or password."
          : error.code === "auth/email-already-in-use"
            ? "An account with this email already exists."
            : error.code === "auth/invalid-email"
              ? "Please enter a valid email address."
              : error.message;
      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
    }
  };

  // If showing profile setup, render that screen
  if (showProfileSetup) {
    return (
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={s.profileContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={s.title}>Set up your profile</Text>
            <Text style={s.subtitle}>
              Just a few details to get you started
            </Text>

            {/* Avatar picker */}
            <TouchableOpacity
              style={s.avatarBox}
              onPress={pickImage}
              activeOpacity={0.8}
            >
              {photoUri ? (
                <Image source={{ uri: photoUri }} style={s.avatar} />
              ) : (
                <View style={s.avatarPlaceholder}>
                  <Text style={s.avatarIcon}>📷</Text>
                  <Text style={s.avatarHint}>Add photo</Text>
                </View>
              )}
              <View style={s.avatarBadge}>
                <Text style={{ fontSize: 14 }}>✏️</Text>
              </View>
            </TouchableOpacity>

            {/* Name input */}
            <View style={s.inputWrapper}>
              <Text style={s.label}>Your name</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Kwame Mensah"
                placeholderTextColor="#CBD5E1"
                value={name}
                onChangeText={setName}
                autoFocus
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleProfileSetup}
              />
            </View>

            <TouchableOpacity
              style={[s.btn, (!name.trim() || loading) && s.btnDisabled]}
              onPress={handleProfileSetup}
              disabled={!name.trim() || loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>Let's go 🚀</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={async () => {
                await signIn(googleUserData);
                router.replace("/(tabs)/home");
              }}
            >
              <Text style={s.skip}>Skip for now</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <View style={s.logoBox}>
            <View style={s.logo}>
              <Text style={s.logoText}>P</Text>
            </View>
            <Text style={s.appName}>Pesaka</Text>
            <Text style={s.tagline}>Track every pesewa 🇬🇭</Text>
          </View>

          {/* Toggle */}
          <View style={s.toggle}>
            <TouchableOpacity
              style={[s.toggleBtn, isLogin && s.toggleActive]}
              onPress={() => setIsLogin(true)}
            >
              <Text style={[s.toggleText, isLogin && s.toggleTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.toggleBtn, !isLogin && s.toggleActive]}
              onPress={() => setIsLogin(false)}
            >
              <Text style={[s.toggleText, !isLogin && s.toggleTextActive]}>
                Create Account
              </Text>
            </TouchableOpacity>
          </View>

          {/* Form */}
          <View style={s.form}>
            <View style={s.inputWrapper}>
              <Text style={s.label}>Email</Text>
              <TextInput
                style={s.input}
                placeholder="you@example.com"
                placeholderTextColor="#CBD5E1"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={s.inputWrapper}>
              <Text style={s.label}>Password</Text>
              <View style={s.passRow}>
                <TextInput
                  style={[s.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="Min. 6 characters"
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
            </View>

            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>
                  {isLogin ? "Sign In" : "Create Account"}
                </Text>
              )}
            </TouchableOpacity>

            {/* Google Sign-in Button */}
            <TouchableOpacity
              style={[s.googleBtn, (!request || loading) && s.btnDisabled]}
              onPress={() => promptAsync()}
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

            {isLogin && (
              <TouchableOpacity style={s.forgotBtn}>
                <Text style={s.forgotText}>Forgot password?</Text>
              </TouchableOpacity>
            )}
          </View>

          <Text style={s.hint}>
            By continuing, you agree to our Terms & Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 },
  profileContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    alignItems: "center",
  },
  logoBox: { alignItems: "center", marginBottom: 36 },
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
    marginBottom: 12,
  },
  logoText: { fontSize: 32, fontWeight: "800", color: "#fff" },
  appName: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 4,
  },
  tagline: { fontSize: 14, color: TEXT_SECONDARY },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_SECONDARY,
    marginBottom: 32,
    textAlign: "center",
  },
  avatarBox: {
    width: 110,
    height: 110,
    marginBottom: 32,
    position: "relative",
  },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F0FDF4",
    borderWidth: 2,
    borderColor: "#D1FAE5",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarIcon: { fontSize: 28, marginBottom: 4 },
  avatarHint: { fontSize: 11, color: TEXT_SECONDARY },
  avatarBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  toggle: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 4,
    marginBottom: 28,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  toggleActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleText: { fontSize: 15, fontWeight: "500", color: TEXT_SECONDARY },
  toggleTextActive: { color: TEXT_PRIMARY, fontWeight: "700" },
  form: { gap: 16 },
  inputWrapper: { gap: 6, width: "100%", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: TEXT_PRIMARY },
  input: {
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 16,
    fontSize: 15,
    color: TEXT_PRIMARY,
    backgroundColor: "#FAFAFA",
  },
  passRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn: { padding: 8 },
  eyeText: { fontSize: 18 },
  btn: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    height: 54,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
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
    marginTop: 12,
  },
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
  forgotBtn: { alignItems: "center", marginTop: 4 },
  forgotText: { fontSize: 14, color: PRIMARY, fontWeight: "500" },
  skip: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 16 },
  hint: {
    textAlign: "center",
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 24,
  },
});
