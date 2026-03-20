import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
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

type NotificationSettings = {
  transactionAlerts: boolean;
  weeklyReports: boolean;
  budgetAlerts: boolean;
  paymentReminders: boolean;
  marketingEmails: boolean;
  pushNotifications: boolean;
};

export default function NotificationSettingsScreen() {
  const [settings, setSettings] = useState<NotificationSettings>({
    transactionAlerts: true,
    weeklyReports: true,
    budgetAlerts: true,
    paymentReminders: false,
    marketingEmails: false,
    pushNotifications: true,
  });

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem("notificationSettings");
        if (saved) {
          setSettings(JSON.parse(saved));
        }
      } catch (error) {
        console.error("Failed to load notification settings:", error);
      }
    })();
  }, []);

  const updateSetting = async (
    key: keyof NotificationSettings,
    value: boolean,
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      await AsyncStorage.setItem(
        "notificationSettings",
        JSON.stringify(newSettings),
      );
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      Alert.alert("Error", "Failed to save notification settings");
    }
  };

  const NotificationRow = ({
    icon,
    iconBg,
    title,
    subtitle,
    value,
    onToggle,
  }: {
    icon: string;
    iconBg: string;
    title: string;
    subtitle: string;
    value: boolean;
    onToggle: (value: boolean) => void;
  }) => (
    <View style={styles.row}>
      <View style={[styles.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={18} color={TEXT_PRIMARY} />
      </View>
      <View style={styles.rowContent}>
        <Text style={styles.rowTitle}>{title}</Text>
        <Text style={styles.rowSubtitle}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: "#E5E7EB", true: PRIMARY }}
        thumbColor={CARD_BG}
        ios_backgroundColor="#E5E7EB"
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Transaction Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRANSACTIONS</Text>
          <View style={styles.card}>
            <NotificationRow
              icon="cash-outline"
              iconBg="#E1F5EE"
              title="Transaction Alerts"
              subtitle="Get notified when new transactions are added"
              value={settings.transactionAlerts}
              onToggle={(value) => updateSetting("transactionAlerts", value)}
            />
            <View style={styles.divider} />
            <NotificationRow
              icon="calendar-outline"
              iconBg="#E1F5EE"
              title="Weekly Reports"
              subtitle="Receive weekly spending summaries every Monday"
              value={settings.weeklyReports}
              onToggle={(value) => updateSetting("weeklyReports", value)}
            />
            <View style={styles.divider} />
            <NotificationRow
              icon="alert-circle-outline"
              iconBg="#FEF2F2"
              title="Budget Alerts"
              subtitle="Alert when you're close to budget limits"
              value={settings.budgetAlerts}
              onToggle={(value) => updateSetting("budgetAlerts", value)}
            />
          </View>
        </View>

        {/* Reminders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REMINDERS</Text>
          <View style={styles.card}>
            <NotificationRow
              icon="notifications-outline"
              iconBg={GOLD}
              title="Payment Reminders"
              subtitle="Remind about upcoming bill payments"
              value={settings.paymentReminders}
              onToggle={(value) => updateSetting("paymentReminders", value)}
            />
          </View>
        </View>

        {/* System Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SYSTEM</Text>
          <View style={styles.card}>
            <NotificationRow
              icon="phone-portrait"
              iconBg="#EEF2FF"
              title="Push Notifications"
              subtitle="Enable push notifications on your device"
              value={settings.pushNotifications}
              onToggle={(value) => updateSetting("pushNotifications", value)}
            />
            <View style={styles.divider} />
            <NotificationRow
              icon="mail-outline"
              iconBg="#FDF4FF"
              title="Marketing Emails"
              subtitle="Receive tips, updates, and promotional content"
              value={settings.marketingEmails}
              onToggle={(value) => updateSetting("marketingEmails", value)}
            />
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={PRIMARY}
          />
          <Text style={styles.infoText}>
            Notification preferences are saved locally on your device. You can
            change them anytime.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  placeholder: { width: 40 },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_SECONDARY,
    letterSpacing: 0.8,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  rowContent: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 2,
  },
  rowSubtitle: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
  },
  divider: {
    height: 0.5,
    backgroundColor: "#F0F0F0",
    marginLeft: 72,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E1F5EE",
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#B7E4C7",
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: TEXT_PRIMARY,
    marginLeft: 8,
    lineHeight: 18,
  },
});
