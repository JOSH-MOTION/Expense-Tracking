import { useAuth } from "@/lib/AuthContext";
import { calcSummary, getRecentTransactions } from "@/lib/db";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#1D9E75",
  GOLD = "#F5A623",
  BG = "#F7F9F8",
  CARD_BG = "#FFFFFF",
  TEXT_PRIMARY = "#1A1A1A",
  TEXT_SECONDARY = "#6B7280";

function fmt(n: number, signed = true) {
  const a = Math.abs(n).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  if (!signed) return `₵ ${a}`;
  return n >= 0 ? `+₵ ${a}` : `-₵ ${a}`;
}

function greeting() {
  const h = new Date().getHours();
  return h < 12
    ? "Good morning,"
    : h < 17
      ? "Good afternoon,"
      : "Good evening,";
}
function initials(n: string) {
  if (!n?.trim()) return "?";
  return n
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
function catIcon(c: string) {
  return (
    (
      {
        food: "🍽",
        transport: "🚗",
        shopping: "🛍",
        bills: "⚡",
        airtime: "📱",
        health: "💊",
        salary: "💼",
        gift: "🎁",
        other: "📦",
      } as any
    )[c] ?? "📦"
  );
}
function catBg(c: string) {
  return (
    (
      {
        food: "#FFF4E0",
        transport: "#FBEAF0",
        shopping: "#EEF2FF",
        bills: "#FFFBEB",
        airtime: "#E1F5EE",
        health: "#FEF2F2",
        salary: "#E1F5EE",
        gift: "#FDF4FF",
        other: "#F1EFE8",
      } as any
    )[c] ?? "#F1EFE8"
  );
}
function fmtTime(date: Date) {
  if (!date || isNaN(date.getTime())) return "";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const txDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = today.getTime() - txDay.getTime();
  const time = date.toLocaleTimeString("en-GH", {
    hour: "2-digit",
    minute: "2-digit",
  });
  if (diff === 0) return `Today, ${time}`;
  if (diff === 86400000) return `Yesterday, ${time}`;
  return date.toLocaleDateString("en-GH", { day: "numeric", month: "short" });
}

export default function HomeScreen() {
  const { profile, user } = useAuth();
  const [txs, setTxs] = useState<any[]>([]);
  const [sum, setSum] = useState({ income: 0, expense: 0, balance: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  const load = useCallback(async () => {
    try {
      const t = await getRecentTransactions(10);
      setTxs(t);
      setSum(calcSummary(t));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      load();
    } else {
      setLoading(false);
    }
  }, [user, load]);

  useEffect(() => {
    (async () => {
      const hidden = await AsyncStorage.getItem("hideBalance");
      setHideBalance(hidden === "true");
    })();
  }, []);

  // Listen for storage changes
  useEffect(() => {
    const interval = setInterval(async () => {
      const hidden = await AsyncStorage.getItem("hideBalance");
      setHideBalance(hidden === "true");
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const name = profile?.displayName || user?.displayName || "there";
  const firstName = name.split(" ")[0];
  const avatarUrl = (profile as any)?.avatarUrl || user?.photoURL || null;

  return (
    <SafeAreaView style={st.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      {loading ? (
        <View style={st.loader}>
          <ActivityIndicator color={PRIMARY} size="large" />
        </View>
      ) : (
        <ScrollView
          style={st.scroll}
          contentContainerStyle={st.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load();
              }}
              tintColor={PRIMARY}
            />
          }
        >
          <View style={st.header}>
            <View>
              <Text style={st.greet}>{greeting()}</Text>
              <Text style={st.name}>{firstName}</Text>
            </View>
            {avatarUrl ? (
              <Image
                source={{ uri: avatarUrl }}
                style={st.avatarImg}
                contentFit="cover"
              />
            ) : (
              <View style={st.avatarCircle}>
                <Text style={st.avatarTxt}>{initials(name)}</Text>
              </View>
            )}
          </View>

          <View style={st.balCard}>
            <Text style={st.balLabel}>Total Balance</Text>
            <Text style={st.balAmt}>
              {hideBalance ? "••••••" : fmt(sum.balance, false)}
            </Text>
            <View style={st.balDiv} />
            <View style={st.balRow}>
              {[
                { label: "Income", val: sum.income, dot: "#9FE1CB" },
                {
                  label: "Expense",
                  val: sum.expense,
                  dot: "#F09595",
                  color: "#F09595",
                },
              ].map((r) => (
                <View key={r.label} style={st.balStat}>
                  <View style={st.statLblRow}>
                    <View style={[st.statDot, { backgroundColor: r.dot }]} />
                    <Text style={st.statLbl}>{r.label}</Text>
                  </View>
                  <Text style={[st.statAmt, r.color ? { color: r.color } : {}]}>
                    {hideBalance ? "•••" : fmt(r.val, false)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity
            style={st.banner}
            onPress={() => router.push("/ai-momo-import")}
            activeOpacity={0.85}
          >
            <View style={st.bannerIcon}>
              <Text style={{ fontSize: 18 }}>✦</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.bannerTitle}>MoMo auto-import</Text>
              <Text style={st.bannerSub}>Tap to scan your SMS inbox</Text>
            </View>
            <Text style={st.bannerChev}>›</Text>
          </TouchableOpacity>

          <View style={st.secHdr}>
            <Text style={st.secTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/history")}>
              <Text style={st.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {txs.length === 0 ? (
            <View style={st.empty}>
              <Text style={{ fontSize: 32, marginBottom: 12 }}>💸</Text>
              <Text style={st.emptyTitle}>No transactions yet</Text>
              <Text style={st.emptySub}>Tap + to add your first one</Text>
            </View>
          ) : (
            <View style={st.txList}>
              {txs.slice(0, 5).map((tx, i) => (
                <View
                  key={tx.id}
                  style={[
                    st.txRow,
                    i < Math.min(txs.length, 5) - 1 && st.txRowBorder,
                  ]}
                >
                  <View
                    style={[st.txIcon, { backgroundColor: catBg(tx.category) }]}
                  >
                    <Text style={{ fontSize: 18 }}>{catIcon(tx.category)}</Text>
                  </View>
                  <View style={st.txInfo}>
                    <Text style={st.txName}>{tx.name}</Text>
                    <View style={st.txMeta}>
                      <View
                        style={[
                          st.txBadge,
                          {
                            backgroundColor:
                              tx.paymentType === "MoMo" ? "#FFF4C2" : "#F1EFE8",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            st.txBadgeTxt,
                            {
                              color:
                                tx.paymentType === "MoMo"
                                  ? "#92400E"
                                  : "#5F5E5A",
                            },
                          ]}
                        >
                          {tx.paymentType === "MoMo"
                            ? (tx.network ?? "MoMo")
                            : "Cash"}
                        </Text>
                      </View>
                      <Text style={st.txTime}>{fmtTime(tx.createdAt)}</Text>
                    </View>
                  </View>
                  <Text
                    style={[
                      st.txAmt,
                      { color: tx.type === "income" ? PRIMARY : TEXT_PRIMARY },
                    ]}
                  >
                    {hideBalance
                      ? "•••"
                      : fmt(tx.type === "income" ? tx.amount : -tx.amount)}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  scroll: { flex: 1 },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  content: { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  greet: { fontSize: 14, color: TEXT_SECONDARY },
  name: { fontSize: 22, fontWeight: "800", color: TEXT_PRIMARY, marginTop: 2 },
  avatarImg: { width: 44, height: 44, borderRadius: 22 },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#C0DD97",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarTxt: { fontSize: 15, fontWeight: "700", color: "#27500A" },
  balCard: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    padding: 20,
    marginBottom: 14,
  },
  balLabel: { fontSize: 13, color: "rgba(255,255,255,0.75)", marginBottom: 6 },
  balAmt: {
    fontSize: 34,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: -0.5,
  },
  balDiv: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 16,
  },
  balRow: { flexDirection: "row", justifyContent: "space-between" },
  balStat: { flex: 1 },
  statLblRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  statDot: { width: 7, height: 7, borderRadius: 4 },
  statLbl: { fontSize: 12, color: "rgba(255,255,255,0.75)" },
  statAmt: { fontSize: 16, fontWeight: "700", color: "#fff" },
  banner: {
    backgroundColor: GOLD,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  bannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bannerTitle: { fontSize: 14, fontWeight: "700", color: "#4A2800" },
  bannerSub: { fontSize: 12, color: "#7A4F00", marginTop: 2 },
  bannerChev: { fontSize: 22, color: "#7A4F00" },
  secHdr: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  secTitle: { fontSize: 17, fontWeight: "700", color: TEXT_PRIMARY },
  seeAll: { fontSize: 14, color: PRIMARY, fontWeight: "500" },
  empty: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 6,
  },
  emptySub: { fontSize: 13, color: TEXT_SECONDARY, textAlign: "center" },
  txList: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  txRowBorder: { borderBottomWidth: 0.5, borderBottomColor: "#F0F0F0" },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txInfo: { flex: 1 },
  txName: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 5,
  },
  txMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  txBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  txBadgeTxt: { fontSize: 11, fontWeight: "600" },
  txTime: { fontSize: 12, color: TEXT_SECONDARY },
  txAmt: { fontSize: 15, fontWeight: "700" },
});
