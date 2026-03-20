import { getBiometricEnabled, isBiometricAvailable, promptBiometric, setBiometricEnabled } from "@/lib/biometric";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert, ScrollView, StatusBar, StyleSheet,
  Switch, Text, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY        = "#1D9E75";
const GOLD           = "#F5A623";
const BG             = "#F0F4F3";
const CARD_BG        = "#FFFFFF";
const TEXT_PRIMARY   = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";

function Row({ icon, iconBg, title, subtitle, right }: {
  icon: string; iconBg: string; title: string; subtitle?: string; right?: React.ReactNode;
}) {
  return (
    <View style={s.row}>
      <View style={[s.rowIcon, { backgroundColor: iconBg }]}>
        <Ionicons name={icon as any} size={18} color={TEXT_PRIMARY} />
      </View>
      <View style={s.rowContent}>
        <Text style={s.rowTitle}>{title}</Text>
        {subtitle ? <Text style={s.rowSub}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

export default function SecuritySettingsScreen() {
  const [biometric,   setBiometric]   = useState(false);
  const [hideBalance, setHideBalance] = useState(false);
  const [appLock,     setAppLock]     = useState(false);
  const [hwAvailable, setHwAvailable] = useState(true);

  useEffect(() => {
    (async () => {
      const enabled   = await getBiometricEnabled();
      const available = await isBiometricAvailable();
      const hidden    = await AsyncStorage.getItem("hideBalance");
      setBiometric(enabled);
      setAppLock(enabled);
      setHwAvailable(available);
      setHideBalance(hidden === "true");
    })();
  }, []);

  const handleBiometricToggle = async (value: boolean) => {
    if (value) {
      const available = await isBiometricAvailable();
      if (!available) {
        Alert.alert("Not available",
          "Your device has no biometric hardware set up. Go to device Settings → Security to enroll fingerprint or Face ID first.");
        return;
      }
      const ok = await promptBiometric();
      if (!ok) { Alert.alert("Failed", "Biometric verification failed. Try again."); return; }
      await setBiometricEnabled(true);
      setBiometric(true); setAppLock(true);
      Alert.alert("✅ Enabled", "App will lock when you go to the background.");
    } else {
      const ok = await promptBiometric();
      if (!ok) { Alert.alert("Failed", "Could not verify identity."); return; }
      await setBiometricEnabled(false);
      setBiometric(false); setAppLock(false);
      Alert.alert("Disabled", "Biometric lock has been turned off.");
    }
  };

  const handleHideBalanceToggle = async (value: boolean) => {
    setHideBalance(value);
    await AsyncStorage.setItem("hideBalance", value.toString());
  };

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>Security Settings</Text>
        <View style={{ width: 38 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}>

        <Text style={s.section}>AUTHENTICATION</Text>
        <View style={s.card}>
          <Row icon="finger-print" iconBg="#E1F5EE"
            title="Biometric Lock"
            subtitle={!hwAvailable ? "No biometric hardware found"
              : biometric ? "Locks when app goes to background"
              : "Enable Face ID / Fingerprint"}
            right={
              <Switch value={biometric} onValueChange={handleBiometricToggle}
                trackColor={{ false: "#E5E7EB", true: PRIMARY }}
                thumbColor={CARD_BG} ios_backgroundColor="#E5E7EB"
                disabled={!hwAvailable} />
            }
          />
          <View style={s.div} />
          <Row icon="lock-closed" iconBg={GOLD}
            title="App Lock"
            subtitle={appLock ? "Active — requires biometrics on resume" : "Enable biometrics above to activate"}
            right={
              <View style={[s.badge, { backgroundColor: appLock ? "#E1F5EE" : "#F3F4F6" }]}>
                <Text style={[s.badgeTxt, { color: appLock ? PRIMARY : TEXT_SECONDARY }]}>
                  {appLock ? "ON" : "OFF"}
                </Text>
              </View>
            }
          />
        </View>

        <Text style={s.section}>PRIVACY</Text>
        <View style={s.card}>
          <Row icon="eye-off" iconBg={GOLD}
            title="Hide Balance on Open"
            subtitle="Conceal amounts by default"
            right={
              <Switch value={hideBalance} onValueChange={handleHideBalanceToggle}
                trackColor={{ false: "#E5E7EB", true: PRIMARY }}
                thumbColor={CARD_BG} ios_backgroundColor="#E5E7EB" />
            }
          />
        </View>

        <View style={s.infoBox}>
          <Ionicons name="information-circle" size={18} color={PRIMARY} style={{ marginTop: 1 }} />
          <Text style={s.infoTxt}>
            When enabled, PesakaApp locks every time you return after 3+ seconds in the background.
            Unlock with Face ID, fingerprint, or your device PIN.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: BG },
  header:  { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: CARD_BG, alignItems: "center", justifyContent: "center", borderWidth: 0.5, borderColor: "#E5E7EB" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: TEXT_PRIMARY },
  content: { paddingHorizontal: 16, paddingBottom: 40 },
  section: { fontSize: 11, fontWeight: "700", color: TEXT_SECONDARY, letterSpacing: 0.8, marginBottom: 8, marginLeft: 4, marginTop: 8 },
  card:    { backgroundColor: CARD_BG, borderRadius: 20, marginBottom: 20, borderWidth: 0.5, borderColor: "#E5E7EB", overflow: "hidden" },
  row:     { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 14 },
  rowIcon: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", marginRight: 14 },
  rowContent: { flex: 1 },
  rowTitle:   { fontSize: 15, fontWeight: "600", color: TEXT_PRIMARY },
  rowSub:     { fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 },
  div:        { height: 0.5, backgroundColor: "#F0F0F0", marginLeft: 70 },
  badge:      { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeTxt:   { fontSize: 12, fontWeight: "700" },
  infoBox:    { flexDirection: "row", gap: 10, backgroundColor: "#E1F5EE", borderRadius: 14, padding: 14, borderWidth: 0.5, borderColor: "#A7F3D0" },
  infoTxt:    { flex: 1, fontSize: 13, color: TEXT_PRIMARY, lineHeight: 19 },
});