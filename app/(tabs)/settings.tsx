import { useAuth } from "@/lib/AuthContext";
import {
  getBiometricEnabled,
  isBiometricAvailable,
  promptBiometric,
  setBiometricEnabled,
} from "@/lib/biometric";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#1D9E75";
const GOLD = "#F5A623";
const BG = "#F0F4F3";
const CARD_BG = "#FFFFFF";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";
const DANGER = "#E24B4A";

function initials(name: string) {
  if (!name?.trim()) return "?";
  return name
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function SectionLabel({ title }: { title: string }) {
  return <Text style={s.sectionLabel}>{title}</Text>;
}

function SettingRow({
  icon,
  iconBg,
  title,
  subtitle,
  value,
  onPress,
  danger,
  rightElement,
}: {
  icon: string;
  iconBg: string;
  title: string;
  subtitle?: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  rightElement?: React.ReactNode;
}) {
  return (
    <TouchableOpacity
      style={s.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[s.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons
          name={icon as any}
          size={18}
          color={danger ? DANGER : TEXT_PRIMARY}
        />
      </View>
      <View style={s.rowContent}>
        <Text style={[s.rowTitle, danger && { color: DANGER }]}>{title}</Text>
        {subtitle ? <Text style={s.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightElement ? (
        rightElement
      ) : value ? (
        <View style={s.rowRight}>
          <Text style={s.rowValue}>{value}</Text>
          <Text style={s.chevron}>›</Text>
        </View>
      ) : onPress && !danger ? (
        <Text style={s.chevron}>›</Text>
      ) : null}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={s.divider} />;
}

export default function SettingsScreen() {
  const { profile, user, signOut } = useAuth();

  const [momoEnabled, setMomoEnabled] = useState(true);
  const [biometric, setBiometric] = useState(false);
  const [hwAvailable, setHwAvailable] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("GHS");

  const displayName = profile?.displayName || user?.displayName || "User";
  const email = (profile as any)?.email || user?.email || "";
  const avatarUrl = (profile as any)?.avatarUrl || user?.photoURL || null;

  // Load preferences on mount
  useEffect(() => {
    (async () => {
      const enabled = await getBiometricEnabled();
      const available = await isBiometricAvailable();
      const hidden = await AsyncStorage.getItem("hideBalance");
      const currency = await AsyncStorage.getItem("selectedCurrency");

      setBiometric(enabled);
      setHwAvailable(available);
      setHideBalance(hidden === "true");
      setSelectedCurrency(currency || "GHS");
    })();
  }, []);

  const handleHideBalanceToggle = async (value: boolean) => {
    setHideBalance(value);
    await AsyncStorage.setItem("hideBalance", value.toString());
  };

  const getCurrencySymbol = () => {
    const symbols: Record<string, string> = {
      GHS: "₵",
      USD: "$",
      EUR: "€",
      GBP: "£",
      NGN: "₦",
      XOF: "CFA",
      XAF: "FCFA",
      ZAR: "R",
      KES: "KSh",
      UGX: "USh",
    };
    return symbols[selectedCurrency] || "₵";
  };

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const available = await isBiometricAvailable();
      if (!available) {
        Alert.alert(
          "Not available",
          "Your device doesn't have biometric hardware set up. Go to device Settings → Security to enroll a fingerprint or Face ID first.",
        );
        return;
      }
      const ok = await promptBiometric();
      if (!ok) {
        Alert.alert("Failed", "Biometric verification failed. Try again.");
        return;
      }
      await setBiometricEnabled(true);
      setBiometric(true);
      Alert.alert("✅ Enabled", "App will lock when you go to the background.");
    } else {
      const ok = await promptBiometric();
      if (!ok) {
        Alert.alert("Failed", "Could not verify identity.");
        return;
      }
      await setBiometricEnabled(false);
      setBiometric(false);
      Alert.alert("Disabled", "Biometric lock has been turned off.");
    }
  };

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          signOut();
          router.replace("/(auth)/phone");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      <View style={s.header}>
        <Text style={s.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.content}
      >
        {/* ── Profile Card ── */}
        <TouchableOpacity style={s.profileCard} activeOpacity={0.8}>
          <View style={s.avatarRing}>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={s.avatarImage}
                contentFit="cover"
              />
            ) : (
              <View style={s.avatarCircle}>
                <Text style={s.avatarInitials}>{initials(displayName)}</Text>
              </View>
            )}
          </View>
          <View style={s.profileInfo}>
            <Text style={s.profileName}>{displayName}</Text>
            <Text style={s.profileEmail}>{email}</Text>
          </View>
          <Text style={s.chevron}>›</Text>
        </TouchableOpacity>

        {/* ── AI & Automation ── */}
        <SectionLabel title="AI & AUTOMATION" />
        <View style={s.card}>
          <SettingRow
            icon="phone-portrait"
            iconBg="#E1F5EE"
            title="MoMo SMS Import"
            subtitle="Auto-read SMS transactions"
            onPress={() => router.push("/ai-momo-import")}
            rightElement={
              <Switch
                value={momoEnabled}
                onValueChange={setMomoEnabled}
                trackColor={{ false: "#E5E7EB", true: PRIMARY }}
                thumbColor={CARD_BG}
                ios_backgroundColor="#E5E7EB"
              />
            }
          />
        </View>

        {/* ── Security ── */}
        <SectionLabel title="SECURITY" />
        <View style={s.card}>
          <SettingRow
            icon="finger-print"
            iconBg="#E1F5EE"
            title="Biometric Lock"
            subtitle={
              !hwAvailable
                ? "No biometric hardware found"
                : biometric
                  ? "Locks when app goes to background"
                  : "Enable Face ID / Fingerprint lock"
            }
            rightElement={
              <Switch
                value={biometric}
                onValueChange={handleBiometricToggle}
                trackColor={{ false: "#E5E7EB", true: PRIMARY }}
                thumbColor={CARD_BG}
                ios_backgroundColor="#E5E7EB"
                disabled={!hwAvailable}
              />
            }
          />
          <Divider />
          <SettingRow
            icon="shield-checkmark"
            iconBg={GOLD}
            title="Security Settings"
            subtitle="PIN, advanced options"
            onPress={() => router.push("/security-settings")}
          />
        </View>

        {/* ── Preferences ── */}
        <SectionLabel title="PREFERENCES" />
        <View style={s.card}>
          <SettingRow
            icon="eye-off"
            iconBg={GOLD}
            title="Hide Balance"
            subtitle="Keep your amounts private"
            rightElement={
              <Switch
                value={hideBalance}
                onValueChange={handleHideBalanceToggle}
                trackColor={{ false: "#E5E7EB", true: PRIMARY }}
                thumbColor={CARD_BG}
                ios_backgroundColor="#E5E7EB"
              />
            }
          />
          <Divider />
          <SettingRow
            icon="cash"
            iconBg={GOLD}
            title="Currency"
            value={`${selectedCurrency} (${getCurrencySymbol()})`}
            onPress={() => router.push("/currency-settings")}
          />
          <Divider />
          <SettingRow
            icon="notifications"
            iconBg={GOLD}
            title="Notifications"
            onPress={() => router.push("/notification-settings")}
          />
        </View>

        {/* ── Support ── */}
        <SectionLabel title="SUPPORT" />
        <View style={s.card}>
          <SettingRow
            icon="help-circle"
            iconBg={GOLD}
            title="Help & Support"
            onPress={() => router.push("/help-support")}
          />
        </View>

        {/* ── Account ── */}
        <SectionLabel title="ACCOUNT" />
        <View style={s.card}>
          <SettingRow
            icon="log-out"
            iconBg="#FEE2E2"
            title="Log Out"
            danger
            onPress={handleLogout}
          />
        </View>

        <Text style={s.version}>PesakaApp v1.0.0 · Made in Ghana 🇬🇭</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  content: { paddingHorizontal: 16, paddingBottom: 32 },

  profileCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  avatarRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
    overflow: "hidden",
  },
  avatarImage: { width: 60, height: 60, borderRadius: 30 },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#C0DD97",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: { fontSize: 20, fontWeight: "700", color: "#27500A" },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 3,
  },
  profileEmail: { fontSize: 14, color: TEXT_SECONDARY },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_SECONDARY,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  rowContent: { flex: 1 },
  rowTitle: { fontSize: 15, fontWeight: "600", color: TEXT_PRIMARY },
  rowSubtitle: { fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 4 },
  rowValue: { fontSize: 14, color: TEXT_SECONDARY },
  chevron: {
    fontSize: 20,
    color: TEXT_SECONDARY,
    fontWeight: "300",
    paddingLeft: 4,
  },
  divider: { height: 0.5, backgroundColor: "#F0F0F0", marginLeft: 70 },
  version: {
    textAlign: "center",
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 8,
  },
});
