import { useAuth } from "@/lib/AuthContext";
import { updateDisplayName, updateUserAvatar } from "@/lib/db";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator, Alert, Image, KeyboardAvoidingView,
  Platform, StatusBar, StyleSheet, Text,
  TextInput, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#1D9E75";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";

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
    { method: "POST", body: formData }
  );
  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload failed");
  return data.secure_url;
}

export default function SetupProfileScreen() {
  const { refreshProfile } = useAuth();
  const [name, setName] = useState("");
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
    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleContinue = async () => {
    if (!name.trim()) {
      Alert.alert("Enter your name", "Please enter your name to continue.");
      return;
    }
    setLoading(true);
    try {
      await updateDisplayName(name.trim());
      if (photoUri) {
        const url = await uploadToCloudinary(photoUri);
        await updateUserAvatar(url);
      }
      await refreshProfile();
      router.replace("/(tabs)/home");
    } catch (e: any) {
      Alert.alert("Error", e.message);
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
          <Text style={s.title}>Set up your profile</Text>
          <Text style={s.subtitle}>Just a few details to get you started</Text>

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
              onSubmitEditing={handleContinue}
            />
          </View>

          <TouchableOpacity
            style={[s.btn, (!name.trim() || loading) && s.btnDisabled]}
            onPress={handleContinue}
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
              await updateDisplayName("User");
              router.replace("/(tabs)/home");
            }}
          >
            <Text style={s.skip}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  content: { flex: 1, paddingHorizontal: 24, paddingTop: 32, alignItems: "center" },
  title: { fontSize: 26, fontWeight: "800", color: TEXT_PRIMARY, marginBottom: 8, textAlign: "center" },
  subtitle: { fontSize: 15, color: TEXT_SECONDARY, marginBottom: 32, textAlign: "center" },
  avatarBox: { width: 110, height: 110, marginBottom: 32, position: "relative" },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: {
    width: 110, height: 110, borderRadius: 55,
    backgroundColor: "#F0FDF4", borderWidth: 2,
    borderColor: "#D1FAE5", borderStyle: "dashed",
    alignItems: "center", justifyContent: "center",
  },
  avatarIcon: { fontSize: 28, marginBottom: 4 },
  avatarHint: { fontSize: 11, color: TEXT_SECONDARY },
  avatarBadge: {
    position: "absolute", bottom: 0, right: 0,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: PRIMARY, alignItems: "center",
    justifyContent: "center", borderWidth: 2, borderColor: "#fff",
  },
  inputWrapper: { gap: 6, width: "100%", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", color: TEXT_PRIMARY },
  input: {
    borderWidth: 1.5, borderColor: "#E5E7EB", borderRadius: 14,
    height: 52, paddingHorizontal: 16, fontSize: 15,
    color: TEXT_PRIMARY, backgroundColor: "#FAFAFA",
  },
  btn: {
    backgroundColor: PRIMARY, borderRadius: 14, height: 54,
    alignItems: "center", justifyContent: "center", width: "100%",
  },
  btnDisabled: { opacity: 0.5 },
  btnText: { fontSize: 16, fontWeight: "700", color: "#fff" },
  skip: { fontSize: 14, color: TEXT_SECONDARY, marginTop: 16 },
});