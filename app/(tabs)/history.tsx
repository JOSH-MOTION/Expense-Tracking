import { Ionicons } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import {
    FlatList,
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
const SUCCESS = "#10B981";
const GOLD = "#FFD700";
const BG = "#F8FAFC";
const CARD_BG = "#FFFFFF";
const TEXT_PRIMARY = "#1F2937";
const TEXT_SECONDARY = "#6B7280";

type Filter = "All" | "MoMo" | "Cash" | "Income" | "Expense";

type Transaction = {
  id: string;
  name: string;
  category: string;
  categoryColor: string;
  categoryText: string;
  paymentType: "MoMo" | "Cash";
  time: string;
  amount: number;
  iconBg: string;
  iconColor: string;
  group: "TODAY" | "YESTERDAY";
};

const ALL_TRANSACTIONS: Transaction[] = [
  {
    id: "1",
    name: "Kofi's Shop",
    category: "GROCERIES",
    categoryColor: GOLD,
    categoryText: "#4A2800",
    paymentType: "MoMo",
    time: "10:45 AM",
    amount: -120.0,
    iconBg: GOLD,
    iconColor: "#4A2800",
    group: "TODAY",
  },
  {
    id: "2",
    name: "Freelance Payment",
    category: "SALARY",
    categoryColor: GOLD,
    categoryText: "#4A2800",
    paymentType: "Cash",
    time: "09:00 AM",
    amount: 1500.0,
    iconBg: "#E1F5EE",
    iconColor: PRIMARY,
    group: "TODAY",
  },
  {
    id: "3",
    name: "Uber Ride",
    category: "TRANSPORT",
    categoryColor: GOLD,
    categoryText: "#4A2800",
    paymentType: "Cash",
    time: "06:30 PM",
    amount: -45.5,
    iconBg: "#FBEAF0",
    iconColor: "#D4537E",
    group: "YESTERDAY",
  },
  {
    id: "4",
    name: "MTN Airtime",
    category: "BILLS",
    categoryColor: GOLD,
    categoryText: "#4A2800",
    paymentType: "MoMo",
    time: "02:15 PM",
    amount: -20.0,
    iconBg: GOLD,
    iconColor: "#4A2800",
    group: "YESTERDAY",
  },
  {
    id: "5",
    name: "Aisha Transfer",
    category: "GIFT",
    categoryColor: GOLD,
    categoryText: "#4A2800",
    paymentType: "MoMo",
    time: "11:10 AM",
    amount: 200.0,
    iconBg: GOLD,
    iconColor: "#4A2800",
    group: "YESTERDAY",
  },
];

const FILTERS: Filter[] = ["All", "MoMo", "Cash", "Income", "Expense"];

function formatAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString("en-GH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount >= 0 ? `+ ₵${abs}` : `- ₵${abs}`;
}

// Icon SVG paths as simple shapes per category
function TxIcon({
  bg,
  color,
  category,
}: {
  bg: string;
  color: string;
  category: string;
}) {
  const isIncome = ["SALARY", "GIFT"].includes(category);
  const isTransport = category === "TRANSPORT";

  return (
    <View style={[styles.txIconCircle, { backgroundColor: bg }]}>
      {isTransport ? (
        <Ionicons name="car" size={20} color={color} />
      ) : isIncome ? (
        <Ionicons name="wallet" size={20} color={color} />
      ) : (
        <Ionicons name="phone-portrait" size={20} color={color} />
      )}
    </View>
  );
}

function TransactionCard({ tx }: { tx: Transaction }) {
  const isIncome = tx.amount >= 0;
  return (
    <TouchableOpacity style={styles.txCard} activeOpacity={0.75}>
      <TxIcon bg={tx.iconBg} color={tx.iconColor} category={tx.category} />
      <View style={styles.txInfo}>
        <Text style={styles.txName}>{tx.name}</Text>
        <View style={styles.txMeta}>
          <View
            style={[
              styles.categoryBadge,
              { backgroundColor: tx.categoryColor },
            ]}
          >
            <Text style={[styles.categoryText, { color: tx.categoryText }]}>
              {tx.category}
            </Text>
          </View>
          <Text style={styles.txDot}>•</Text>
          <Text style={styles.txPayment}>{tx.paymentType}</Text>
        </View>
      </View>
      <View style={styles.txRight}>
        <Text
          style={[
            styles.txAmount,
            { color: isIncome ? SUCCESS : TEXT_PRIMARY },
          ]}
        >
          {formatAmount(tx.amount)}
        </Text>
        <Text style={styles.txTime}>{tx.time}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HistoryScreen() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const [searchVisible, setSearchVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = useMemo(() => {
    return ALL_TRANSACTIONS.filter((tx) => {
      const matchesFilter =
        activeFilter === "All" ||
        (activeFilter === "MoMo" && tx.paymentType === "MoMo") ||
        (activeFilter === "Cash" && tx.paymentType === "Cash") ||
        (activeFilter === "Income" && tx.amount >= 0) ||
        (activeFilter === "Expense" && tx.amount < 0);

      const matchesSearch =
        searchQuery === "" ||
        tx.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, searchQuery]);

  const groupedTransactions = useMemo(() => {
    const groups: { [key: string]: Transaction[] } = {};
    filteredTransactions.forEach((tx) => {
      if (!groups[tx.group]) {
        groups[tx.group] = [];
      }
      groups[tx.group].push(tx);
    });
    return groups;
  }, [filteredTransactions]);

  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <TransactionCard tx={item} />
  );

  const renderSectionHeader = (sectionTitle: string) => (
    <Text style={styles.groupLabel}>{sectionTitle}</Text>
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* ── Header ── */}
      <View style={styles.header}>
        {searchVisible ? (
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search transactions..."
              placeholderTextColor={TEXT_SECONDARY}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            <TouchableOpacity
              onPress={() => {
                setSearchVisible(false);
                setSearchQuery("");
              }}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.headerTitle}>History</Text>
            <TouchableOpacity
              onPress={() => setSearchVisible(true)}
              style={styles.searchButton}
              activeOpacity={0.7}
            >
              <Ionicons name="search" size={20} color={TEXT_PRIMARY} />
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* ── Filter chips ── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((filter) => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterChip,
              activeFilter === filter && styles.filterChipActive,
            ]}
            onPress={() => setActiveFilter(filter)}
            activeOpacity={0.75}
          >
            <Text
              style={[
                styles.filterText,
                activeFilter === filter && styles.filterTextActive,
              ]}
            >
              {filter}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* ── Transaction list ── */}
      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyIcon}>
            <Ionicons name="receipt-outline" size={32} color={PRIMARY} />
          </View>
          <Text style={styles.emptyTitle}>No transactions found</Text>
          <Text style={styles.emptySub}>
            Try a different filter or search term
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          renderItem={renderTransactionItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={() => {
            const sections = Object.keys(groupedTransactions);
            return (
              <View>
                {sections.map((section) => (
                  <View key={section}>
                    {renderSectionHeader(section)}
                    {groupedTransactions[section].map((tx) => (
                      <TransactionCard key={tx.id} tx={tx} />
                    ))}
                  </View>
                ))}
              </View>
            );
          }}
        />
      )}
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
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
  cancelButton: {
    paddingHorizontal: 8,
  },
  cancelText: {
    fontSize: 16,
    color: PRIMARY,
    fontWeight: "500",
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },

  // Filters
  filterRow: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
    flexDirection: "row",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  filterChipActive: {
    backgroundColor: PRIMARY,
    borderColor: PRIMARY,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "500",
    color: TEXT_PRIMARY,
    textAlign: "center",
    includeFontPadding: false,
  },
  filterTextActive: {
    color: "#FFFFFF",
    textAlign: "center",
    includeFontPadding: false,
  },

  // List
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  groupLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: TEXT_SECONDARY,
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8,
    paddingLeft: 4,
    textTransform: "uppercase",
  },

  // Transaction card
  txCard: {
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  txIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
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
    gap: 5,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  txDot: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  txPayment: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontWeight: "400",
  },
  txRight: {
    alignItems: "flex-end",
    gap: 4,
  },
  txAmount: {
    fontSize: 15,
    fontWeight: "700",
  },
  txTime: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },

  // Empty state
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingHorizontal: 40,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
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
