import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#1D9E75";
const GOLD = "#F5A623";
const BG = "#F0F4F3";
const CARD_BG = "#FFFFFF";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";
const DANGER = "#E24B4A";

// ── Reusable row components ──────────────────────────────

function SectionLabel({ title }: { title: string }) {
  return <Text style={styles.sectionLabel}>{title}</Text>;
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
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={18} color={TEXT_PRIMARY} />
      </View>
      <View style={styles.rowContent}>
        <Text style={[styles.rowTitle, danger && { color: DANGER }]}>
          {title}
        </Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      {rightElement ? (
        rightElement
      ) : value ? (
        <View style={styles.rowRight}>
          <Text style={styles.rowValue}>{value}</Text>
          <Text style={styles.chevron}>›</Text>
        </View>
      ) : onPress && !danger ? (
        <Text style={styles.chevron}>›</Text>
      ) : null}
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

// ── Main Screen ──────────────────────────────────────────

export default function SettingsScreen() {
  const [aiMoMoEnabled, setAiMoMoEnabled] = useState(true);

  const handleLogout = () => {
    Alert.alert("Log out", "Are you sure you want to log out of PesakaApp?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log out",
        style: "destructive",
        onPress: () => {
          // TODO: clear Firebase Auth session
          // auth().signOut().then(() => router.replace('/login'))
          Alert.alert("Logged out");
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Profile Card ── */}
        <TouchableOpacity style={styles.profileCard} activeOpacity={0.8}>
          {/* Avatar */}
          <View style={styles.avatarRing}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitials}>KM</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>Kwame Mensah</Text>
            <Text style={styles.profilePhone}>+233 24 123 4567</Text>
          </View>

          <Text style={styles.chevron}>›</Text>
        </TouchableOpacity>

        {/* ── AI & Automation ── */}
        <SectionLabel title="AI & AUTOMATION" />
        <View style={styles.card}>
          <SettingRow
            icon="sparkles"
            iconBg="#E1F5EE"
            title="AI MoMo Import"
            subtitle="Auto-read SMS transactions"
            rightElement={
              <Switch
                value={aiMoMoEnabled}
                onValueChange={setAiMoMoEnabled}
                trackColor={{ false: "#E5E7EB", true: PRIMARY }}
                thumbColor={CARD_BG}
                ios_backgroundColor="#E5E7EB"
              />
            }
          />
        </View>

        {/* ── Preferences ── */}
        <SectionLabel title="PREFERENCES" />
        <View style={styles.card}>
          <SettingRow
            icon="cash"
            iconBg={GOLD}
            title="Currency"
            value="GHS (₵)"
            onPress={() =>
              Alert.alert(
                "Currency",
                "GHS (₵) is the default currency for Ghana.",
              )
            }
          />
          <Divider />
          <SettingRow
            icon="notifications"
            iconBg={GOLD}
            title="Notifications"
            onPress={() =>
              Alert.alert("Notifications", "Notification settings coming soon.")
            }
          />
        </View>

        {/* ── Account & Security ── */}
        <SectionLabel title="ACCOUNT & SECURITY" />
        <View style={styles.card}>
          <SettingRow
            icon="shield-checkmark"
            iconBg={GOLD}
            title="Security Settings"
            subtitle="PIN, Biometrics"
           onPress={() => router.push('/security-settings')}
          />
          <Divider />
          <SettingRow
            icon="help-circle"
            iconBg={GOLD}
            title="Help & Support"
            onPress={() => Alert.alert("Help", "Support chat coming soon.")}
          />
          <Divider />
          <SettingRow
            icon="log-out"
            iconBg="#FEE2E2"
            title="Log Out"
            danger
            onPress={handleLogout}
          />
        </View>

        {/* ── App version ── */}
        <Text style={styles.version}>PesakaApp v1.0.0 · Made in Ghana 🇬🇭</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },

  // Header
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },

  // Profile card
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
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#C0DD97",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitials: {
    fontSize: 20,
    fontWeight: "700",
    color: "#27500A",
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 3,
  },
  profilePhone: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_SECONDARY,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },

  // Card container
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },

  // Row
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
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  rowSubtitle: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rowValue: {
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  chevron: {
    fontSize: 20,
    color: TEXT_SECONDARY,
    fontWeight: "300",
    paddingLeft: 4,
  },

  // Divider
  divider: {
    height: 0.5,
    backgroundColor: "#F0F0F0",
    marginLeft: 70,
  },

  // Version
  version: {
    textAlign: "center",
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 8,
  },
});
