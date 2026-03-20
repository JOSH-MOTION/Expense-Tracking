import { useAuth } from "@/lib/AuthContext";
import { getRecentTransactions } from "@/lib/db";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
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
const GOLD = "#F5A623";
const BG = "#F8FAFC";
const CARD_BG = "#FFFFFF";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#6B7280";

type Filter = "All" | "MoMo" | "Cash" | "Income" | "Expense";
const FILTERS: Filter[] = ["All", "MoMo", "Cash", "Income", "Expense"];

function fmt(amount: number) {
  const abs = Math.abs(amount).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount >= 0 ? `+ ₵${abs}` : `- ₵${abs}`;
}

function catIcon(c: string): string {
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
function catBg(c: string): string {
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
function fmtDay(date: Date): string {
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
  return (
    date.toLocaleDateString("en-GH", { day: "numeric", month: "short" }) +
    `, ${time}`
  );
}
function dayKey(date: Date): string {
  if (!date || isNaN(date.getTime())) return "Other";
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const txDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = today.getTime() - txDay.getTime();
  if (diff === 0) return "TODAY";
  if (diff === 86400000) return "YESTERDAY";
  return date
    .toLocaleDateString("en-GH", {
      weekday: "long",
      day: "numeric",
      month: "short",
    })
    .toUpperCase();
}

function TxCard({ tx, hideBalance }: { tx: any; hideBalance: boolean }) {
  const isIncome = tx.type === "income";
  const label = tx.paymentType === "MoMo" ? (tx.network ?? "MoMo") : "Cash";
  const labelBg = tx.paymentType === "MoMo" ? "#FFF4C2" : "#F1EFE8";
  const labelTxt = tx.paymentType === "MoMo" ? "#92400E" : "#5F5E5A";
  return (
    <View style={styles.txCard}>
      <View style={[styles.txIconBox, { backgroundColor: catBg(tx.category) }]}>
        <Text style={{ fontSize: 20 }}>{catIcon(tx.category)}</Text>
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txName}>{tx.name}</Text>
        <View style={styles.txMeta}>
          <View style={[styles.badge, { backgroundColor: labelBg }]}>
            <Text style={[styles.badgeTxt, { color: labelTxt }]}>{label}</Text>
          </View>
          <Text style={styles.txDot}>•</Text>
          <Text style={styles.txTime}>{fmtDay(tx.createdAt)}</Text>
        </View>
      </View>
      <Text
        style={[styles.txAmt, { color: isIncome ? PRIMARY : TEXT_PRIMARY }]}
      >
        {hideBalance ? "•••" : fmt(isIncome ? tx.amount : -tx.amount)}
      </Text>
    </View>
  );
}

export default function HistoryScreen() {
  const { user } = useAuth();
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<Filter>("All");
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [hideBalance, setHideBalance] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await getRecentTransactions(100);
      setTxs(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
    else setLoading(false);
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

  const filtered = useMemo(() => {
    return txs.filter((tx) => {
      const matchFilter =
        filter === "All" ||
        (filter === "MoMo" && tx.paymentType === "MoMo") ||
        (filter === "Cash" && tx.paymentType === "Cash") ||
        (filter === "Income" && tx.type === "income") ||
        (filter === "Expense" && tx.type === "expense");
      const matchSearch =
        !search || tx.name?.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [txs, filter, search]);

  // Group by day
  const grouped = useMemo(() => {
    const map: Record<string, any[]> = {};
    filtered.forEach((tx) => {
      const key = dayKey(tx.createdAt);
      if (!map[key]) map[key] = [];
      map[key].push(tx);
    });
    return map;
  }, [filtered]);

  const sections = Object.keys(grouped);

  if (loading)
    return (
      <SafeAreaView style={styles.safe} edges={["top"]}>
        <StatusBar barStyle="dark-content" backgroundColor={BG} />
        <View style={styles.loader}>
          <ActivityIndicator color={PRIMARY} size="large" />
        </View>
      </SafeAreaView>
    );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* Header */}
      <View style={styles.header}>
        {showSearch ? (
          <View style={styles.searchRow}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor={TEXT_SECONDARY}
              value={search}
              onChangeText={setSearch}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => {
                setShowSearch(false);
                setSearch("");
              }}
            >
              <Text style={styles.cancelTxt}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.headerTitle}>History</Text>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => setShowSearch(true)}
            >
              <Ionicons name="search" size={20} color={TEXT_PRIMARY} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.chip, filter === f && styles.chipActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[styles.chipTxt, filter === f && styles.chipTxtActive]}
            >
              {f}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary bar */}
      {filtered.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryTxt}>
            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""}
          </Text>
          <Text style={styles.summaryIncome}>
            {hideBalance
              ? "+•••"
              : `+₵${filtered
                  .filter((t) => t.type === "income")
                  .reduce((s, t) => s + t.amount, 0)
                  .toLocaleString("en-GH", { minimumFractionDigits: 2 })}`}
          </Text>
          <Text style={styles.summaryExpense}>
            {hideBalance
              ? "-•••"
              : `-₵${filtered
                  .filter((t) => t.type === "expense")
                  .reduce((s, t) => s + t.amount, 0)
                  .toLocaleString("en-GH", { minimumFractionDigits: 2 })}`}
          </Text>
        </View>
      )}

      {/* List */}
      {filtered.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="receipt-outline" size={32} color={PRIMARY} />
          </View>
          <Text style={styles.emptyTitle}>No transactions found</Text>
          <Text style={styles.emptySub}>
            Try a different filter or add transactions with +
          </Text>
        </View>
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(s) => s}
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
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item: section }) => (
            <View>
              <Text style={styles.groupLabel}>{section}</Text>
              {grouped[section].map((tx) => (
                <TxCard key={tx.id} tx={tx} hideBalance={hideBalance} />
              ))}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  searchRow: { flex: 1, flexDirection: "row", alignItems: "center", gap: 12 },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: CARD_BG,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 15,
    color: TEXT_PRIMARY,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cancelTxt: { fontSize: 16, color: PRIMARY, fontWeight: "500" },
  filterRow: { paddingHorizontal: 20, paddingBottom: 6, gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    height: 30,
    justifyContent: "center",
  },
  chipActive: { backgroundColor: PRIMARY, borderColor: PRIMARY },
  chipTxt: { fontSize: 12, fontWeight: "500", color: TEXT_PRIMARY },
  chipTxtActive: { color: "#fff" },
  summaryBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 6,
    gap: 12,
  },
  summaryTxt: { fontSize: 12, color: TEXT_SECONDARY, flex: 1 },
  summaryIncome: { fontSize: 13, fontWeight: "700", color: PRIMARY },
  summaryExpense: { fontSize: 13, fontWeight: "700", color: "#E24B4A" },
  listContent: { paddingHorizontal: 16, paddingBottom: 32 },
  groupLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: TEXT_SECONDARY,
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
    paddingLeft: 4,
  },
  txCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderWidth: 0.5,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  txIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
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
  txMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeTxt: { fontSize: 10, fontWeight: "700" },
  txDot: { fontSize: 12, color: TEXT_SECONDARY },
  txTime: { fontSize: 12, color: TEXT_SECONDARY },
  txAmt: { fontSize: 15, fontWeight: "700" },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySub: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: "center",
    lineHeight: 20,
  },
});
