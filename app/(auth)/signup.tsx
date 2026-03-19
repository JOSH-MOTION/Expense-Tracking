import { useAuth } from "@/lib/AuthContext";
import { createUserIfNew, updateDisplayName, updateUserAvatar } from "@/lib/db";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
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

const PRIMARY = "#1D9E75";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";

async function uploadToCloudinary(uri: string): Promise<string> {
  const cloudName = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
  const formData = new FormData();
  formData.append("file", { uri, type: "image/jpeg", name: "profile.jpg" } as any);
  formData.append("upload_preset", uploadPreset!);
  formData.append("folder", "pesaka/avatars");
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );
  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload failed");
  return data.secure_url;
}

export default function SignupScreen() {
  const { registerWithEmail, refreshProfile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const handleSignup = async () => {
    if (!name.trim()) {
      Alert.alert("Missing name", "Please enter your name.");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Missing email", "Please enter your email.");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Weak password", "Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      // 1. Create Firebase Auth account
      await registerWithEmail(email.trim(), password);

      // 2. Save name
      await updateDisplayName(name.trim());

      // 3. Upload photo if selected
      if (photoUri) {
        const url = await uploadToCloudinary(photoUri);
        await updateUserAvatar(url);
      }

      // 4. Refresh profile and go home
      await refreshProfile();
      router.replace("/(tabs)/home");
    } catch (error: any) {
      const msg =
        error.code === "auth/email-already-in-use"
          ? "An account with this email already exists."
          : error.code === "auth/invalid-email"
            ? "Please enter a valid email address."
            : error.message;
      Alert.alert("Sign up failed", msg);
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
        <ScrollView
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Back button */}
          <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
            <Text style={s.backText}>← Back</Text>
          </TouchableOpacity>

          <Text style={s.title}>Create account</Text>
          <Text style={s.subtitle}>Set up your Pesaka profile</Text>

          {/* Avatar picker */}
          <TouchableOpacity style={s.avatarBox} onPress={pickImage} activeOpacity={0.8}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={s.avatar} />
            ) : (
              <View style={s.avatarPlaceholder}>
                <Text style={s.avatarIcon}>📷</Text>
                <Text style={s.avatarHint}>Add photo</Text>
              </View>
            )}
            <View style={s.avatarBadge}>
              <Text style={{ fontSize: 12 }}>✏️</Text>
            </View>
          </TouchableOpacity>

          {/* Fields */}
          <View style={s.form}>
            <View style={s.fieldGroup}>
              <Text style={s.label}>Full name</Text>
              <TextInput
                style={s.input}
                placeholder="e.g. Kwame Mensah"
                placeholderTextColor="#CBD5E1"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            <View style={s.fieldGroup}>
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

            <View style={s.fieldGroup}>
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
                <TouchableOpacity onPress={() => setShowPass(!showPass)} style={s.eyeBtn}>
                  <Text style={s.eyeText}>{showPass ? "🙈" : "👁️"}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[s.btn, loading && s.btnDisabled]}
              onPress={handleSignup}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.btnText}>Create Account 🚀</Text>
              )}
            </TouchableOpacity>
          </View>

          <Text style={s.hint}>
            By signing up, you agree to our Terms & Privacy Policy
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  content: { paddingHorizontal: 24, paddingTop: 16, paddingBottom: 40 },
  backBtn: { marginBottom: 20 },
  backText: { fontSize: 15, color: TEXT_SECONDARY, fontWeight: "500" },
  title: { fontSize: 28, fontWeight: "800", color: TEXT_PRIMARY, marginBottom: 6 },
  subtitle: { fontSize: 15, color: TEXT_SECONDARY, marginBottom: 28 },
  avatarBox: {
    width: 96, height: 96, alignSelf: "center",
    marginBottom: 28, position: "relative",
  },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarPlaceholder: {
    width: 96, height: 96, borderRadius: 48,
    backgroundColor: "#F0FDF4", borderWidth: 2,
    borderColor: "#D1FAE5", borderStyle: "dashed",
    alignItems: "center", justifyContent: "center",
  },
  avatarIcon: { fontSize: 24, marginBottom: 2 },
  avatarHint: { fontSize: 10, color: TEXT_SECONDARY },
  avatarBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: PRIMARY, alignItems: "center",
    justifyContent: "center", borderWidth: 2, borderColor: "#fff",
  },
  form: { gap: 16 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 14, fontWeight: "600", color: TEXT_PRIMARY },
  input: {
    borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 14,
    height: 52, paddingHorizontal: 16, fontSize: 15,
    color: TEXT_PRIMARY, backgroundColor: "#FAFAFA",
  },
  passRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  eyeBtn: { padding: 8 },
  eyeText: { fontSize: 18 },
  btn: {
    backgroundColor: PRIMARY, borderRadius: 14, height: 56,
    alignItems: "center", justifyContent: "center", marginTop: 8,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 17, fontWeight: "700", color: "#fff" },
  hint: { textAlign: "center", fontSize: 12, color: TEXT_SECONDARY, marginTop: 20 },
});