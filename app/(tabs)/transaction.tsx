import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { saveTransaction } from '@/lib/db';
import React, { useRef, useState } from "react";
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

const PRIMARY = "#1D9E75";
const GOLD = "#F5A623";
const BG = "#F0F4F3";
const CARD_BG = "#FFFFFF";
const TEXT_PRIMARY = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";
const DANGER = "#E24B4A";

type TransactionType = "Expense" | "Income";
type AccountType = "MoMo" | "Cash";
type Network = "MTN" | "Vodafone" | "AirtelTigo";

type Category = {
  id: string;
  label: string;
  icon: string;
  bg: string;
  color: string;
};

const CATEGORIES: Category[] = [
  {
    id: "food",
    label: "Food",
    icon: "restaurant",
    bg: "#FFF4E0",
    color: "#854F0B",
  },
  {
    id: "transport",
    label: "Transport",
    icon: "car",
    bg: "#FBEAF0",
    color: "#993556",
  },
  {
    id: "shopping",
    label: "Shopping",
    icon: "cart",
    bg: "#EEF2FF",
    color: "#4338CA",
  },
  {
    id: "bills",
    label: "Bills",
    icon: "flash",
    bg: "#FFFBEB",
    color: "#92400E",
  },
  {
    id: "airtime",
    label: "Airtime",
    icon: "phone-portrait",
    bg: "#E1F5EE",
    color: PRIMARY,
  },
  {
    id: "health",
    label: "Health",
    icon: "medical",
    bg: "#FEF2F2",
    color: "#991B1B",
  },
  {
    id: "salary",
    label: "Salary",
    icon: "wallet",
    bg: "#E1F5EE",
    color: PRIMARY,
  },
  { id: "gift", label: "Gift", icon: "gift", bg: "#FDF4FF", color: "#7E22CE" },
  {
    id: "other",
    label: "Other",
    icon: "cube",
    bg: "#F1EFE8",
    color: "#5F5E5A",
  },
];

const NETWORKS: {
  id: Network;
  label: string;
  color: string;
  textColor: string;
}[] = [
  { id: "MTN", label: "MTN", color: "#FFF4C2", textColor: "#92400E" },
  { id: "Vodafone", label: "Vodafone", color: "#FEE2E2", textColor: "#991B1B" },
  {
    id: "AirtelTigo",
    label: "AirtelTigo",
    color: "#EFF6FF",
    textColor: "#1E40AF",
  },
];

export default function AddTransactionScreen() {
  const [txType, setTxType] = useState<TransactionType>("Expense");
  const [accountType, setAccountType] = useState<AccountType>("MoMo");
  const [network, setNetwork] = useState<Network>("MTN");
  const [category, setCategory] = useState<string>("food");
  const [note, setNote] = useState("");
  const [amount, setAmount] = useState("0.00");
  const [isEditing, setIsEditing] = useState(false);

  const scaleAnim = useRef(new Animated.Value(1)).current;

  // ── Amount input: tap → full keyboard entry
  const handleAmountPress = () => {
    setIsEditing(true);
    if (amount === "0.00") setAmount("");
  };

  const handleAmountChange = (val: string) => {
    const clean = val.replace(/[^0-9.]/g, "");
    const parts = clean.split(".");
    if (parts.length > 2) return;
    if (parts[1]?.length > 2) return;
    setAmount(clean);
  };

  const handleAmountBlur = () => {
    setIsEditing(false);
    const num = parseFloat(amount);
    if (isNaN(num) || amount === "") setAmount("0.00");
    else setAmount(num.toFixed(2));
  };

  // ── Save
 

const handleSave = async () => {
  const num = parseFloat(amount);
  if (!num || num === 0) {
    Alert.alert('Enter an amount', 'Please enter a transaction amount.');
    return;
  }
  setLoading(true);
  try {
    await saveTransaction({
      name: note || category,
      amount: num,
      type: txType === 'Expense' ? 'expense' : 'income',
      paymentType: accountType,
      network: accountType === 'MoMo' ? network : undefined,
      category,
      note,
    });
    Alert.alert('Saved!', `${txType} of ₵${amount} recorded.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  } catch (e: any) {
    Alert.alert('Error', e.message);
  } finally {
    setLoading(false);
  }
};

  const selectedCategory = CATEGORIES.find((c) => c.id === category)!;

  return (
    <View style={styles.overlay}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={() => router.back()}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.sheetWrapper}
      >
        <View style={styles.sheet}>
          {/* Drag handle */}
          <View style={styles.dragHandle} />

          {/* Header */}
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Add Transaction</Text>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={16} color={TEXT_SECONDARY} />
            </TouchableOpacity>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* ── Type Toggle ── */}
            <View style={styles.typeToggle}>
              {(["Expense", "Income"] as TransactionType[]).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeBtn, txType === t && styles.typeBtnActive]}
                  onPress={() => setTxType(t)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.typeBtnText,
                      txType === t &&
                        (t === "Expense"
                          ? styles.expenseActive
                          : styles.incomeActive),
                    ]}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* ── Amount ── */}
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Enter Amount</Text>
              <TouchableOpacity onPress={handleAmountPress} activeOpacity={0.8}>
                <View style={styles.amountRow}>
                  <Text style={styles.amountCurrency}>₵</Text>
                  {isEditing ? (
                    <TextInput
                      style={styles.amountInput}
                      value={amount}
                      onChangeText={handleAmountChange}
                      onBlur={handleAmountBlur}
                      keyboardType="decimal-pad"
                      autoFocus
                      selectionColor={PRIMARY}
                    />
                  ) : (
                    <Text style={styles.amountDisplay}>{amount}</Text>
                  )}
                </View>
              </TouchableOpacity>
            </View>

            {/* ── Account Type ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Account Type</Text>
              <View style={styles.accountRow}>
                {/* MoMo */}
                <TouchableOpacity
                  style={[
                    styles.accountBtn,
                    accountType === "MoMo" && styles.accountBtnMoMo,
                  ]}
                  onPress={() => setAccountType("MoMo")}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.accountIconBox,
                      {
                        backgroundColor:
                          accountType === "MoMo" ? "#FFF4C2" : "#F1EFE8",
                      },
                    ]}
                  >
                    <Ionicons
                      name="phone-portrait"
                      size={14}
                      color={accountType === "MoMo" ? "#92400E" : "#5F5E5A"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.accountBtnText,
                      accountType === "MoMo" && { color: "#92400E" },
                    ]}
                  >
                    Mobile Money
                  </Text>
                </TouchableOpacity>

                {/* Cash */}
                <TouchableOpacity
                  style={[
                    styles.accountBtn,
                    accountType === "Cash" && styles.accountBtnCash,
                  ]}
                  onPress={() => setAccountType("Cash")}
                  activeOpacity={0.8}
                >
                  <View
                    style={[
                      styles.accountIconBox,
                      {
                        backgroundColor:
                          accountType === "Cash" ? "#E1F5EE" : "#F1EFE8",
                      },
                    ]}
                  >
                    <Ionicons
                      name="cash"
                      size={14}
                      color={accountType === "Cash" ? PRIMARY : "#5F5E5A"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.accountBtnText,
                      accountType === "Cash" && { color: PRIMARY },
                    ]}
                  >
                    Cash
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Network picker — only when MoMo */}
              {accountType === "MoMo" && (
                <View style={styles.networkRow}>
                  {NETWORKS.map((n) => (
                    <TouchableOpacity
                      key={n.id}
                      style={[
                        styles.networkChip,
                        network === n.id && {
                          backgroundColor: n.color,
                          borderColor: n.textColor,
                        },
                      ]}
                      onPress={() => setNetwork(n.id)}
                      activeOpacity={0.75}
                    >
                      <Text
                        style={[
                          styles.networkText,
                          network === n.id && {
                            color: n.textColor,
                            fontWeight: "600",
                          },
                        ]}
                      >
                        {n.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* ── Category ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Category</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      category === cat.id && {
                        borderColor: cat.color,
                        backgroundColor: cat.bg,
                      },
                    ]}
                    onPress={() => setCategory(cat.id)}
                    activeOpacity={0.75}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={14}
                      color={category === cat.id ? cat.color : "#5F5E5A"}
                    />
                    <Text
                      style={[
                        styles.categoryChipText,
                        category === cat.id && {
                          color: cat.color,
                          fontWeight: "600",
                        },
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* ── Note ── */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Note (Optional)</Text>
              <View style={styles.noteBox}>
                <TextInput
                  style={styles.noteInput}
                  placeholder="What was this for?"
                  placeholderTextColor={TEXT_SECONDARY}
                  value={note}
                  onChangeText={setNote}
                  multiline
                  maxLength={120}
                />
                <Ionicons
                  name="create"
                  size={16}
                  color={TEXT_SECONDARY}
                  style={styles.noteIcon}
                />
              </View>
            </View>

            {/* ── Save Button ── */}
            <Animated.View
              style={[
                styles.saveBtnWrapper,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.saveBtn,
                  {
                    backgroundColor: txType === "Expense" ? PRIMARY : "#0F6E56",
                  },
                ]}
                onPress={handleSave}
                activeOpacity={0.85}
              >
                <Text style={styles.saveBtnText}>Save Transaction</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={{ height: Platform.OS === "ios" ? 16 : 24 }} />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "transparent",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  sheetWrapper: {
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: BG,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#D1D5DB",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: 4,
  },

  // Header
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXT_PRIMARY,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: CARD_BG,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  closeX: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    fontWeight: "500",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 8,
  },

  // Type toggle
  typeToggle: {
    flexDirection: "row",
    backgroundColor: CARD_BG,
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
  },
  typeBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    alignItems: "center",
  },
  typeBtnActive: {
    backgroundColor: CARD_BG,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  typeBtnText: {
    fontSize: 15,
    fontWeight: "500",
    color: TEXT_SECONDARY,
  },
  expenseActive: { color: DANGER, fontWeight: "700" },
  incomeActive: { color: PRIMARY, fontWeight: "700" },

  // Amount
  amountSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  amountLabel: {
    fontSize: 13,
    color: TEXT_SECONDARY,
    marginBottom: 8,
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  amountCurrency: {
    fontSize: 32,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 4,
    marginRight: 2,
  },
  amountDisplay: {
    fontSize: 52,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -1,
    minWidth: 120,
    textAlign: "center",
  },
  amountInput: {
    fontSize: 52,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    letterSpacing: -1,
    minWidth: 120,
    textAlign: "center",
    padding: 0,
  },

  // Sections
  section: {
    marginBottom: 22,
  },
  sectionLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: TEXT_PRIMARY,
    marginBottom: 12,
  },

  // Account type
  accountRow: {
    flexDirection: "row",
    gap: 10,
  },
  accountBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: CARD_BG,
    gap: 8,
  },
  accountBtnMoMo: {
    borderColor: GOLD,
    backgroundColor: "#FFFBF0",
  },
  accountBtnCash: {
    borderColor: PRIMARY,
    backgroundColor: "#F0FAF6",
  },
  accountIconBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  accountBtnText: {
    fontSize: 14,
    fontWeight: "500",
    color: TEXT_SECONDARY,
  },

  // Network
  networkRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  networkChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: CARD_BG,
  },
  networkText: {
    fontSize: 13,
    fontWeight: "500",
    color: TEXT_SECONDARY,
  },

  // Category
  categoryRow: {
    gap: 8,
    paddingBottom: 4,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    backgroundColor: CARD_BG,
  },
  categoryChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: TEXT_SECONDARY,
  },

  // Note
  noteBox: {
    backgroundColor: CARD_BG,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: "#E5E7EB",
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    minHeight: 72,
  },
  noteInput: {
    flex: 1,
    fontSize: 14,
    color: TEXT_PRIMARY,
    lineHeight: 20,
    padding: 0,
    textAlignVertical: "top",
  },
  noteIcon: {
    fontSize: 16,
    marginLeft: 8,
    marginTop: 2,
  },

  // Save
  saveBtnWrapper: {
    marginTop: 8,
  },
  saveBtn: {
    borderRadius: 16,
    paddingVertical: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  saveBtnText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
});
