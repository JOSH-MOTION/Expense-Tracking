import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { saveTransaction } from '@/lib/db';
import React, { useState } from 'react';
import {
  Alert, ScrollView, StatusBar, StyleSheet,
  Text, TouchableOpacity, View, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PRIMARY        = '#1D9E75';
const GOLD           = '#F5A623';
const BG             = '#F0F4F3';
const CARD_BG        = '#FFFFFF';
const TEXT_PRIMARY   = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

// ── Mock parsed SMS transactions ────────────────────────
const PARSED_TRANSACTIONS = [
  {
    id: '1',
    name: 'KFC Osu',
    time: 'Today, 1:30 PM',
    amount: -125.50,
    category: 'food',
    categoryLabel: 'Food & Dining',
    icon: 'restaurant',
    iconBg: '#FFF0F0',
    iconColor: '#E24B4A',
    smsText: 'Payment made for GHS 125.50 to KFC Osu at 13:30:45. Current Balance: GHS 4,250.00. Reference: Food.',
    type: 'expense' as const,
    paymentType: 'MoMo' as const,
    network: 'MTN' as const,
  },
  {
    id: '2',
    name: 'Ama Serwaa',
    time: 'Yesterday, 4:15 PM',
    amount: 300.00,
    category: 'gift',
    categoryLabel: 'Transfer',
    icon: 'person',
    iconBg: '#E1F5EE',
    iconColor: PRIMARY,
    smsText: 'Cash Received for GHS 300.00 from Ama Serwaa. Current Balance: GHS 4,375.50. Message: Gift.',
    type: 'income' as const,
    paymentType: 'MoMo' as const,
    network: 'MTN' as const,
  },
  {
    id: '3',
    name: 'MTN Airtime',
    time: 'Yesterday, 9:00 AM',
    amount: -50.00,
    category: 'airtime',
    categoryLabel: 'Mobile & Internet',
    icon: 'phone-portrait',
    iconBg: '#FEF3E2',
    iconColor: '#D97706',
    smsText: 'Airtime purchase of GHS 50.00 successful. Current Balance: GHS 4,075.50. Fee: GHS 0.00.',
    type: 'expense' as const,
    paymentType: 'MoMo' as const,
    network: 'MTN' as const,
  },
];

const CATEGORIES = [
  'Food & Dining', 'Transfer', 'Mobile & Internet', 'Bills',
  'Transport', 'Shopping', 'Health', 'Salary', 'Other',
];

function formatAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString('en-GH', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  return amount >= 0 ? `+₵ ${abs}` : `-₵ ${abs}`;
}

function TransactionCard({
  tx,
  selected,
  onToggle,
  onCategoryChange,
}: {
  tx: typeof PARSED_TRANSACTIONS[0];
  selected: boolean;
  onToggle: () => void;
  onCategoryChange: (cat: string) => void;
}) {
  const [showCats, setShowCats] = useState(false);
  const isIncome = tx.amount >= 0;

  return (
    <View style={s.card}>
      {/* Top row */}
      <View style={s.cardTop}>
        <View style={[s.txIcon, { backgroundColor: tx.iconBg }]}>
          <Ionicons name={tx.icon as any} size={22} color={tx.iconColor} />
        </View>
        <View style={s.txMeta}>
          <Text style={s.txName}>{tx.name}</Text>
          <Text style={s.txTime}>{tx.time}</Text>
        </View>
        {/* Checkbox */}
        <TouchableOpacity
          style={[s.checkbox, selected && s.checkboxSelected]}
          onPress={onToggle}
          activeOpacity={0.8}
        >
          {selected && (
            <Ionicons name="checkmark" size={14} color="#fff" />
          )}
        </TouchableOpacity>
      </View>

      {/* Divider */}
      <View style={s.cardDivider} />

      {/* Amount + Category */}
      <View style={s.cardMid}>
        <Text style={[s.txAmount, { color: isIncome ? PRIMARY : TEXT_PRIMARY }]}>
          {formatAmount(tx.amount)}
        </Text>

        {/* Category pill with dropdown */}
        <TouchableOpacity
          style={s.categoryPill}
          onPress={() => setShowCats(!showCats)}
          activeOpacity={0.8}
        >
          <Text style={s.categoryPillText}>{tx.categoryLabel}</Text>
          <Ionicons name="chevron-down" size={14} color="#92400E" />
        </TouchableOpacity>
      </View>

      {/* Category dropdown */}
      {showCats && (
        <View style={s.dropdown}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[s.dropdownItem, cat === tx.categoryLabel && s.dropdownItemActive]}
              onPress={() => { onCategoryChange(cat); setShowCats(false); }}
              activeOpacity={0.7}
            >
              <Text style={[s.dropdownText, cat === tx.categoryLabel && s.dropdownTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* SMS snippet */}
      <View style={s.smsBox}>
        <View style={s.smsAccent} />
        <Text style={s.smsText}>{tx.smsText}</Text>
      </View>
    </View>
  );
}

export default function AiMoMoImportScreen() {
  const [selected,   setSelected]   = useState<Set<string>>(new Set(['1', '2']));
  const [categories, setCategories] = useState<Record<string, string>>(
    Object.fromEntries(PARSED_TRANSACTIONS.map((t) => [t.id, t.categoryLabel]))
  );
  const [importing, setImporting] = useState(false);

  const toggleAll = () => {
    if (selected.size === PARSED_TRANSACTIONS.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(PARSED_TRANSACTIONS.map((t) => t.id)));
    }
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const handleImport = async () => {
    if (selected.size === 0) {
      Alert.alert('No transactions selected', 'Select at least one transaction to import.');
      return;
    }
    setImporting(true);
    try {
      const toImport = PARSED_TRANSACTIONS.filter((t) => selected.has(t.id));
      await Promise.all(
        toImport.map((tx) =>
          saveTransaction({
            name: tx.name,
            amount: Math.abs(tx.amount),
            type: tx.type,
            paymentType: tx.paymentType,
            network: tx.network,
            category: tx.category,
            note: tx.smsText,
          })
        )
      );
      Alert.alert(
        'Imported!',
        `${selected.size} transaction${selected.size > 1 ? 's' : ''} added to your history.`,
        [{ text: 'Done', onPress: () => router.back() }]
      );
    } catch (e: any) {
      Alert.alert('Error', e.message);
    } finally {
      setImporting(false);
    }
  };

  const allSelected = selected.size === PARSED_TRANSACTIONS.length;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* ── Header ── */}
      <View style={s.header}>
        <TouchableOpacity style={s.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={20} color={TEXT_PRIMARY} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>AI MoMo Import</Text>
        <TouchableOpacity onPress={toggleAll} activeOpacity={0.7}>
          <Text style={s.selectAll}>{allSelected ? 'Deselect All' : 'Select All'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Banner ── */}
        <View style={s.banner}>
          <View style={s.bannerIcon}>
            <Ionicons name="sparkles" size={22} color="#92400E" />
          </View>
          <View style={s.bannerText}>
            <Text style={s.bannerTitle}>
              {PARSED_TRANSACTIONS.length} new transactions found
            </Text>
            <Text style={s.bannerSub}>
              Our AI has scanned your recent SMS and auto-categorized these MoMo transactions for you.
            </Text>
          </View>
        </View>

        {/* ── Transaction Cards ── */}
        {PARSED_TRANSACTIONS.map((tx) => (
          <TransactionCard
            key={tx.id}
            tx={{ ...tx, categoryLabel: categories[tx.id] }}
            selected={selected.has(tx.id)}
            onToggle={() => toggle(tx.id)}
            onCategoryChange={(cat) =>
              setCategories((prev) => ({ ...prev, [tx.id]: cat }))
            }
          />
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ── Import Button ── */}
      <View style={s.footer}>
        <TouchableOpacity
          style={[s.importBtn, (selected.size === 0 || importing) && s.importBtnDisabled]}
          onPress={handleImport}
          disabled={selected.size === 0 || importing}
          activeOpacity={0.85}
        >
          {importing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={s.importBtnText}>
              Import {selected.size > 0 ? selected.size : ''} Selected
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: BG },
  scroll: { paddingHorizontal: 16, paddingTop: 8 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: CARD_BG, alignItems: 'center', justifyContent: 'center',
    borderWidth: 0.5, borderColor: '#E5E7EB',
  },
  headerTitle: { fontSize: 18, fontWeight: '800', color: TEXT_PRIMARY },
  selectAll:   { fontSize: 15, fontWeight: '600', color: PRIMARY },

  // Banner
  banner: {
    flexDirection: 'row', alignItems: 'flex-start',
    backgroundColor: '#FFF8EC', borderRadius: 16,
    padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: '#FFE4A0',
  },
  bannerIcon: {
    width: 44, height: 44, borderRadius: 12,
    backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center',
    marginRight: 14,
  },
  bannerText:  { flex: 1 },
  bannerTitle: { fontSize: 16, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 4 },
  bannerSub:   { fontSize: 13, color: TEXT_SECONDARY, lineHeight: 18 },

  // Card
  card: {
    backgroundColor: CARD_BG, borderRadius: 20,
    padding: 16, marginBottom: 14,
    borderWidth: 0.5, borderColor: '#E5E7EB',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTop:     { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  txIcon: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  txMeta:  { flex: 1 },
  txName:  { fontSize: 16, fontWeight: '700', color: TEXT_PRIMARY, marginBottom: 3 },
  txTime:  { fontSize: 13, color: TEXT_SECONDARY },

  // Checkbox
  checkbox: {
    width: 26, height: 26, borderRadius: 8,
    borderWidth: 2, borderColor: '#D1D5DB',
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#fff',
  },
  checkboxSelected: {
    backgroundColor: PRIMARY, borderColor: PRIMARY,
  },

  cardDivider: { height: 0.5, backgroundColor: '#F0F0F0', marginBottom: 14 },

  // Amount row
  cardMid: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 12,
  },
  txAmount: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },

  // Category pill
  categoryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: GOLD, paddingHorizontal: 14,
    paddingVertical: 8, borderRadius: 24,
  },
  categoryPillText: { fontSize: 13, fontWeight: '700', color: '#92400E' },

  // Dropdown
  dropdown: {
    backgroundColor: CARD_BG, borderRadius: 12,
    borderWidth: 1, borderColor: '#E5E7EB',
    marginBottom: 12, overflow: 'hidden',
  },
  dropdownItem: { paddingHorizontal: 16, paddingVertical: 12 },
  dropdownItemActive: { backgroundColor: '#F0FDF4' },
  dropdownText: { fontSize: 14, color: TEXT_PRIMARY },
  dropdownTextActive: { color: PRIMARY, fontWeight: '600' },

  // SMS box
  smsBox: {
    flexDirection: 'row',
    backgroundColor: '#FAFAFA', borderRadius: 10,
    padding: 10, gap: 10,
  },
  smsAccent: { width: 3, borderRadius: 2, backgroundColor: GOLD },
  smsText:   { flex: 1, fontSize: 12, color: TEXT_SECONDARY, lineHeight: 18 },

  // Footer
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12,
    backgroundColor: BG,
    borderTopWidth: 0.5, borderTopColor: '#E5E7EB',
  },
  importBtn: {
    backgroundColor: PRIMARY, borderRadius: 16,
    height: 56, alignItems: 'center', justifyContent: 'center',
  },
  importBtnDisabled: { opacity: 0.5 },
  importBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});