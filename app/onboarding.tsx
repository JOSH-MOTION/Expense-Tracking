import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: W, height: H } = Dimensions.get("window");
const PRIMARY = "#1D9E75";
const BG = "#F0F4F3";

const SLIDES = [
  {
    id: "1",
    title: "Track every pesewa",
    body: "Log cash and MoMo transactions in seconds. No stress.",
    illustration: "wallet",
  },
  {
    id: "2",
    title: "MoMo auto-import",
    body: "We read your MTN, Vodafone & AirtelTigo SMS and log transactions automatically.",
    illustration: "ai",
  },
  {
    id: "3",
    title: "All networks covered",
    body: "Works with all Ghanaian MoMo networks. MTN, Vodafone and AirtelTigo.",
    illustration: "networks",
  },
];

// ── Illustrations ────────────────────────────────────────
function WalletIllustration() {
  return (
    <View style={il.wrapper}>
      {/* Phone shape */}
      <View style={il.phone}>
        <View style={il.phoneScreen}>
          {/* Balance card */}
          <View style={il.balanceCard}>
            <Text style={il.balanceLabel}>Total Balance</Text>
            <Text style={il.balanceAmt}>₵ 0.00</Text>
            <View style={il.balanceRow}>
              <View>
                <Text style={il.statLbl}>Income</Text>
                <Text style={il.statAmt}>₵ 0.00</Text>
              </View>
              <View>
                <Text style={il.statLbl}>Expense</Text>
                <Text style={il.statAmt}>₵ 0.00</Text>
              </View>
            </View>
          </View>
          {/* Mini tx rows */}
        </View>
      </View>
      {/* Floating badge */}
      <View style={il.badge}>
        <Text style={il.badgeText}>₵</Text>
      </View>
    </View>
  );
}

function AiIllustration() {
  return (
    <View style={il.wrapper}>
      <View style={il.phone}>
        <View style={il.phoneScreen}>
          {/* SMS bubble */}
          <View style={il.smsBubble}>
            <Text style={il.smsTitle}>MTN MoMo</Text>
            <Text style={il.smsBody}>
              You have sent GHS 10.00 to{"\n"}Recipient Name. TxID: 123456789.
              {"\n"}
              Balance: GHS 90.00
            </Text>
          </View>
          {/* Arrow down */}
          <Text style={il.arrow}>↓</Text>
          {/* Parsed card */}
          <View style={il.parsedCard}>
            <Text style={il.parsedLabel}>AI parsed</Text>
            <Text style={il.parsedRow}>
              Amount <Text style={il.parsedVal}>₵ 10.00</Text>
            </Text>
            <Text style={il.parsedRow}>
              Type <Text style={il.parsedVal}>Send</Text>
            </Text>
            <Text style={il.parsedRow}>
              Network <Text style={il.parsedVal}>MTN</Text>
            </Text>
          </View>
        </View>
      </View>
      {/* AI badge */}
      <View style={[il.badge, { backgroundColor: "#E1F5EE" }]}>
        <Text style={[il.badgeText, { color: PRIMARY, fontSize: 12 }]}>AI</Text>
      </View>
    </View>
  );
}

function NetworksIllustration() {
  const nets = [
    { label: "MTN", bg: "#FFF4C2", text: "#92400E", pct: "65%" },
    { label: "Vodafone", bg: "#FEE2E2", text: "#991B1B", pct: "25%" },
    { label: "AirtelTigo", bg: "#EFF6FF", text: "#1E40AF", pct: "10%" },
  ];
  return (
    <View style={il.wrapper}>
      <View style={il.phone}>
        <View style={il.phoneScreen}>
          <Text style={il.netHeading}>Networks</Text>
          {nets.map((n) => (
            <View key={n.label} style={il.netRow}>
              <View style={[il.netBadge, { backgroundColor: n.bg }]}>
                <Text style={[il.netBadgeText, { color: n.text }]}>
                  {n.label}
                </Text>
              </View>
              <View style={il.netBarBg}>
                <View style={[il.netBarFill, { backgroundColor: n.text }]} />
              </View>
              <Text style={[il.netPct, { color: n.text }]}>{n.pct}</Text>
            </View>
          ))}
          <View style={il.checkRow}>
            <View style={[il.check, { backgroundColor: "#E1F5EE" }]}>
              <Text style={{ color: PRIMARY, fontWeight: "700", fontSize: 12 }}>
                ✓
              </Text>
            </View>
            <Text style={il.checkText}>All networks connected</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const ILLUSTRATIONS = [
  WalletIllustration,
  AiIllustration,
  NetworksIllustration,
];

// ── Slide ────────────────────────────────────────────────
function Slide({ item, index }: { item: (typeof SLIDES)[0]; index: number }) {
  const Illustration = ILLUSTRATIONS[index];
  return (
    <View style={[slide.root, { width: W }]}>
      <View style={slide.illustrationBox}>
        <Illustration />
      </View>
    </View>
  );
}

// ── Main ─────────────────────────────────────────────────
export default function OnboardingScreen() {
  const [active, setActive] = useState(0);
  const ref = useRef<FlatList>(null);

  const next = () => {
    if (active < SLIDES.length - 1) {
      ref.current?.scrollToIndex({ index: active + 1 });
      setActive(active + 1);
    } else {
      finish();
    }
  };

  const finish = async () => {
    await AsyncStorage.setItem("onboarding_done", "true");
    router.replace("/(auth)/phone");
  };

  const isLast = active === SLIDES.length - 1;

  return (
    <SafeAreaView style={ob.safe}>
      {/* Skip */}
      <TouchableOpacity style={ob.skip} onPress={finish}>
        <Text style={ob.skipText}>Skip</Text>
      </TouchableOpacity>

      {/* Slides */}
      <FlatList
        ref={ref}
        data={SLIDES}
        keyExtractor={(s) => s.id}
        renderItem={({ item, index }) => <Slide item={item} index={index} />}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) =>
          setActive(Math.round(e.nativeEvent.contentOffset.x / W))
        }
      />

      {/* Bottom */}
      <View style={ob.bottom}>
        <Text style={ob.title}>{SLIDES[active].title}</Text>
        <Text style={ob.body}>{SLIDES[active].body}</Text>

        {/* Dots */}
        <View style={ob.dots}>
          {SLIDES.map((_, i) => (
            <View key={i} style={[ob.dot, i === active && ob.dotActive]} />
          ))}
        </View>

        {/* Button */}
        <TouchableOpacity style={ob.btn} onPress={next} activeOpacity={0.85}>
          <Text style={ob.btnText}>{isLast ? "Get started" : "Next"}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Illustration styles ───────────────────────────────────
const il = StyleSheet.create({
  wrapper: {
    width: W * 0.78,
    height: H * 0.42,
    alignItems: "center",
    justifyContent: "center",
  },
  phone: {
    width: 200,
    height: 320,
    backgroundColor: "#1A1A2E",
    borderRadius: 28,
    padding: 12,
    borderWidth: 3,
    borderColor: "#333",
  },
  phoneScreen: {
    flex: 1,
    backgroundColor: "#F0F4F3",
    borderRadius: 18,
    padding: 10,
    overflow: "hidden",
  },
  // Wallet slide
  balanceCard: {
    backgroundColor: PRIMARY,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  balanceLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.75)",
    marginBottom: 2,
  },
  balanceAmt: {
    fontSize: 16,
    fontWeight: "800",
    color: "#fff",
    marginBottom: 6,
  },
  balanceRow: { flexDirection: "row", justifyContent: "space-between" },
  statLbl: { fontSize: 8, color: "rgba(255,255,255,0.7)" },
  statAmt: { fontSize: 10, fontWeight: "700", color: "#fff" },
  txRow: { flexDirection: "row", alignItems: "center", marginBottom: 5 },
  txDot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  txText: { fontSize: 8, color: "#1A1A1A" },
  // AI slide
  smsBubble: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 8,
    marginBottom: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#F5A623",
  },
  smsTitle: {
    fontSize: 8,
    fontWeight: "700",
    color: "#92400E",
    marginBottom: 3,
  },
  smsBody: { fontSize: 7, color: "#6B7280", lineHeight: 11 },
  arrow: { textAlign: "center", fontSize: 14, color: PRIMARY, marginBottom: 4 },
  parsedCard: {
    backgroundColor: "#E1F5EE",
    borderRadius: 10,
    padding: 8,
  },
  parsedLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: PRIMARY,
    marginBottom: 4,
  },
  parsedRow: { fontSize: 7.5, color: "#1A1A1A", marginBottom: 2 },
  parsedVal: { fontWeight: "700", color: PRIMARY },
  // Networks slide
  netHeading: {
    fontSize: 10,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  netRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 5,
  },
  netBadge: { paddingHorizontal: 5, paddingVertical: 2, borderRadius: 5 },
  netBadgeText: { fontSize: 7, fontWeight: "700" },
  netBarBg: { flex: 1, height: 6, backgroundColor: "#E5E7EB", borderRadius: 3 },
  netBarFill: { height: 6, borderRadius: 3, opacity: 0.7, flex: 1 },
  netPct: { fontSize: 7, fontWeight: "600", width: 24 },
  checkRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    gap: 6,
  },
  check: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
  },
  checkText: { fontSize: 8, color: "#1A1A1A" },
  // Badge
  badge: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F5A623",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { fontSize: 20, fontWeight: "800", color: "#4A2800" },
});

// ── Slide styles ─────────────────────────────────────────
const slide = StyleSheet.create({
  root: {
    alignItems: "center",
    paddingTop: 16,
  },
  illustrationBox: {
    width: W * 0.78,
    height: H * 0.42,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
});

// ── Onboarding styles ─────────────────────────────────────
const ob = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  skip: {
    alignSelf: "flex-end",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  bottom: {
    paddingHorizontal: 24,
    paddingBottom: 36,
    paddingTop: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 15,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  dots: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    marginBottom: 28,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#D1D5DB",
  },
  dotActive: {
    width: 24,
    backgroundColor: PRIMARY,
  },
  btn: {
    backgroundColor: PRIMARY,
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
  },
  btnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});
