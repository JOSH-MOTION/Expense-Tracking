import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    Image,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const PRIMARY = "#1D9E75";
const GOLD = "#F5A623";
const BG = "#F7F9F8";
const CARD_BG = "#FFFFFF";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";
const DANGER = "#E24B4A";

const transactions = [
  {
    id: "1",
    name: "Kofi's Cafe",
    badge: "MTN MoMo",
    badgeColor: GOLD,
    badgeText: "#7A4F00",
    time: "Today, 09:41 AM",
    amount: -45.0,
    icon: "☕",
    iconBg: "#FFF4E0",
  },
  {
    id: "2",
    name: "Salary Deposit",
    badge: "Bank",
    badgeColor: "#E6F1FB",
    badgeText: "#185FA5",
    time: "Yesterday",
    amount: 5800.0,
    icon: "💼",
    iconBg: "#E1F5EE",
  },
  {
    id: "3",
    name: "Uber Ride",
    badge: "Telecel",
    badgeColor: "#FBEAF0",
    badgeText: "#993556",
    time: "Yesterday",
    amount: -65.0,
    icon: "🚗",
    iconBg: "#F1EFE8",
  },
];

function formatAmount(amount: number) {
  const abs = Math.abs(amount).toFixed(2);
  const formatted = Number(abs).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount >= 0 ? `+₵ ${formatted}` : `-₵ ${formatted}`;
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Header ── */}
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <Image
              source={{
                uri: "https://picsum.photos/seed/user-profile/100/100.jpg",
              }}
              style={styles.profileImage}
            />
            <View style={styles.greetingSection}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>Kwame Osei</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.8}>
            <Ionicons
              name="notifications-outline"
              size={22}
              color={TEXT_PRIMARY}
            />
          </TouchableOpacity>
        </View>

        {/* ── MoMo Import Banner ── */}
        <TouchableOpacity
          style={styles.importBanner}
          activeOpacity={0.85}
          onPress={() => console.log("Navigate to MoMo receipts review")}
        >
          <View style={styles.importIconWrapper}>
            <Text style={{ fontSize: 20 }}>✦</Text>
          </View>
          <View style={styles.importTextWrapper}>
            <Text style={styles.importTitle}>3 New MoMo Receipts</Text>
            <Text style={styles.importSub}>Tap to review and import</Text>
          </View>
          <Text style={styles.importChevron}>›</Text>
        </TouchableOpacity>

        {/* ── Balance Card ── */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Total Balance</Text>
          <Text style={styles.balanceAmount}>₵ 4,250.00</Text>

          <View style={styles.balanceDivider} />

          <View style={styles.balanceRow}>
            <View style={styles.balanceStat}>
              <View style={styles.statLabelRow}>
                <View
                  style={[styles.statDot, { backgroundColor: "#9FE1CB" }]}
                />
                <Text style={styles.statLabel}>Income</Text>
              </View>
              <Text style={styles.statAmount}>₵ 5,800.00</Text>
            </View>
            <View style={styles.balanceStat}>
              <View style={styles.statLabelRow}>
                <View
                  style={[styles.statDot, { backgroundColor: "#F09595" }]}
                />
                <Text style={styles.statLabel}>Expense</Text>
              </View>
              <Text style={[styles.statAmount, { color: "#F09595" }]}>
                ₵ 1,550.00
              </Text>
            </View>
          </View>
        </View>

        {/* ── Recent Transactions ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => console.log("Navigate to all transactions")}
          >
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.transactionsList}>
          {transactions.map((tx, index) => (
            <TouchableOpacity
              key={tx.id}
              style={[
                styles.txRow,
                index < transactions.length - 1 && styles.txRowBorder,
              ]}
              activeOpacity={0.7}
              onPress={() =>
                console.log(`Navigate to transaction ${tx.id}: ${tx.name}`)
              }
            >
              <View style={[styles.txIcon, { backgroundColor: tx.iconBg }]}>
                <Text style={{ fontSize: 18 }}>{tx.icon}</Text>
              </View>

              <View style={styles.txInfo}>
                <Text style={styles.txName}>{tx.name}</Text>
                <View style={styles.txMeta}>
                  <View
                    style={[styles.txBadge, { backgroundColor: tx.badgeColor }]}
                  >
                    <Text style={[styles.txBadgeText, { color: tx.badgeText }]}>
                      {tx.badge}
                    </Text>
                  </View>
                  <Text style={styles.txTime}>{tx.time}</Text>
                </View>
              </View>

              <Text
                style={[
                  styles.txAmount,
                  { color: tx.amount >= 0 ? PRIMARY : TEXT_PRIMARY },
                ]}
              >
                {formatAmount(tx.amount)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: BG,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 8,
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  greetingSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    fontWeight: "400",
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginTop: 2,
  },
  bellButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  // Import Banner
  importBanner: {
    backgroundColor: GOLD,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  importIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  importTextWrapper: {
    flex: 1,
  },
  importTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4A2800",
  },
  importSub: {
    fontSize: 12,
    color: "#7A4F00",
    marginTop: 2,
  },
  importChevron: {
    fontSize: 22,
    color: "#7A4F00",
    fontWeight: "300",
  },

  // Balance Card
  balanceCard: {
    backgroundColor: PRIMARY,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 13,
    color: "rgba(255,255,255,0.75)",
    fontWeight: "400",
    marginBottom: 6,
  },
  balanceAmount: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  balanceDivider: {
    height: 0.5,
    backgroundColor: "rgba(255,255,255,0.25)",
    marginVertical: 16,
  },
  balanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceStat: {
    flex: 1,
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginBottom: 4,
  },
  statDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.75)",
  },
  statAmount: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
  },

  // Section Header
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  seeAll: {
    fontSize: 14,
    color: PRIMARY,
    fontWeight: "500",
  },

  // Transactions
  transactionsList: {
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
  txRowBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "#F0F0F0",
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
    marginBottom: 5,
  },
  txMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  txBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  txBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  txTime: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "right",
  },
});
