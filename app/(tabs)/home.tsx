import { Ionicons } from '@expo/vector-icons';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator, RefreshControl, ScrollView,
  StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/lib/AuthContext';
import { getRecentTransactions, calcSummary } from '@/lib/db';
import { router } from 'expo-router';

const PRIMARY        = '#1D9E75';
const GOLD           = '#F5A623';
const BG             = '#F7F9F8';
const CARD_BG        = '#FFFFFF';
const TEXT_PRIMARY   = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

function formatAmount(amount: number, signed = true) {
  const abs = Math.abs(amount).toLocaleString('en-GH', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
  if (!signed) return `₵ ${abs}`;
  return amount >= 0 ? `+₵ ${abs}` : `-₵ ${abs}`;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning,';
  if (h < 17) return 'Good afternoon,';
  return 'Good evening,';
}

function getInitials(name: string) {
  if (!name?.trim()) return '?';
  return name.trim().split(' ')
    .map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

function getCategoryIcon(category: string) {
  const map: Record<string, string> = {
    food: '🍽', transport: '🚗', shopping: '🛍',
    bills: '⚡', airtime: '📱', health: '💊',
    salary: '💼', gift: '🎁', other: '📦',
  };
  return map[category] ?? '📦';
}

function getCategoryBg(category: string) {
  const map: Record<string, string> = {
    food: '#FFF4E0', transport: '#FBEAF0', shopping: '#EEF2FF',
    bills: '#FFFBEB', airtime: '#E1F5EE', health: '#FEF2F2',
    salary: '#E1F5EE', gift: '#FDF4FF', other: '#F1EFE8',
  };
  return map[category] ?? '#F1EFE8';
}

function formatTxTime(date: Date) {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) return '';
  const now   = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const txDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff  = today.getTime() - txDay.getTime();
  const time  = date.toLocaleTimeString('en-GH', { hour: '2-digit', minute: '2-digit' });
  if (diff === 0)         return `Today, ${time}`;
  if (diff === 86400000)  return `Yesterday, ${time}`;
  return date.toLocaleDateString('en-GH', { day: 'numeric', month: 'short' });
}

export default function HomeScreen() {
  const { profile, user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [summary,      setSummary]      = useState({ income: 0, expense: 0, balance: 0 });
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  const loadData = useCallback(async () => {
    try {
      const txs = await getRecentTransactions(10);
      setTransactions(txs);
      setSummary(calcSummary(txs));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // ← useEffect is INSIDE the component
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user, loadData]);

  const displayName = profile?.displayName || profile?.phone || 'there';
  const firstName   = displayName.split(' ')[0];

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={PRIMARY} size="large" />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); loadData(); }}
              tintColor={PRIMARY}
            />
          }
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>{firstName}</Text>
            </View>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>
                {getInitials(profile?.displayName || '')}
              </Text>
            </View>
          </View>

          {/* ── Balance Card ── */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Total Balance</Text>
            <Text style={styles.balanceAmount}>
              {formatAmount(summary.balance, false)}
            </Text>
            <View style={styles.balanceDivider} />
            <View style={styles.balanceRow}>
              <View style={styles.balanceStat}>
                <View style={styles.statLabelRow}>
                  <View style={[styles.statDot, { backgroundColor: '#9FE1CB' }]} />
                  <Text style={styles.statLabel}>Income</Text>
                </View>
                <Text style={styles.statAmount}>
                  {formatAmount(summary.income, false)}
                </Text>
              </View>
              <View style={styles.balanceStat}>
                <View style={styles.statLabelRow}>
                  <View style={[styles.statDot, { backgroundColor: '#F09595' }]} />
                  <Text style={styles.statLabel}>Expense</Text>
                </View>
                <Text style={[styles.statAmount, { color: '#F09595' }]}>
                  {formatAmount(summary.expense, false)}
                </Text>
              </View>
            </View>
          </View>

          {/* ── AI Import Banner ── */}
          <TouchableOpacity
            style={styles.importBanner}
            activeOpacity={0.85}
          >
            <View style={styles.importIconWrapper}>
              <Text style={{ fontSize: 18 }}>✦</Text>
            </View>
            <View style={styles.importTextWrapper}>
              <Text style={styles.importTitle}>MoMo auto-import</Text>
              <Text style={styles.importSub}>Tap to scan your SMS inbox</Text>
            </View>
            <Text style={styles.importChevron}>›</Text>
          </TouchableOpacity>

          {/* ── Recent Transactions ── */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/history')}>
              <Text style={styles.seeAll}>See all</Text>
            </TouchableOpacity>
          </View>

          {transactions.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyIcon}>💸</Text>
              <Text style={styles.emptyTitle}>No transactions yet</Text>
              <Text style={styles.emptySub}>
                Tap the + button to add your first one
              </Text>
            </View>
          ) : (
            <View style={styles.transactionsList}>
              {transactions.slice(0, 5).map((tx, index) => (
                <View
                  key={tx.id}
                  style={[
                    styles.txRow,
                    index < Math.min(transactions.length, 5) - 1 && styles.txRowBorder,
                  ]}
                >
                  <View style={[styles.txIcon, { backgroundColor: getCategoryBg(tx.category) }]}>
                    <Text style={{ fontSize: 18 }}>{getCategoryIcon(tx.category)}</Text>
                  </View>
                  <View style={styles.txInfo}>
                    <Text style={styles.txName}>{tx.name}</Text>
                    <View style={styles.txMeta}>
                      <View style={[styles.txBadge,
                        { backgroundColor: tx.paymentType === 'MoMo' ? '#FFF4C2' : '#F1EFE8' }]}>
                        <Text style={[styles.txBadgeText,
                          { color: tx.paymentType === 'MoMo' ? '#92400E' : '#5F5E5A' }]}>
                          {tx.paymentType === 'MoMo' ? (tx.network ?? 'MoMo') : 'Cash'}
                        </Text>
                      </View>
                      <Text style={styles.txTime}>
                        {formatTxTime(tx.createdAt)}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.txAmount,
                    { color: tx.type === 'income' ? PRIMARY : TEXT_PRIMARY }]}>
                    {formatAmount(tx.type === 'income' ? tx.amount : -tx.amount)}
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

const styles = StyleSheet.create({
  safe:      { flex: 1, backgroundColor: BG },
  scroll:    { flex: 1 },
  loader:    { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content:   { paddingHorizontal: 16, paddingBottom: 32, paddingTop: 8 },
  header:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting:  { fontSize: 14, color: TEXT_SECONDARY },
  userName:  { fontSize: 22, fontWeight: '800', color: TEXT_PRIMARY, marginTop: 2 },
  avatarCircle: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#C0DD97', alignItems: 'center', justifyContent: 'center',
  },
  avatarText:    { fontSize: 15, fontWeight: '700', color: '#27500A' },
  balanceCard:   { backgroundColor: PRIMARY, borderRadius: 20, padding: 20, marginBottom: 14 },
  balanceLabel:  { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginBottom: 6 },
  balanceAmount: { fontSize: 34, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  balanceDivider:{ height: 0.5, backgroundColor: 'rgba(255,255,255,0.25)', marginVertical: 16 },
  balanceRow:    { flexDirection: 'row', justifyContent: 'space-between' },
  balanceStat:   { flex: 1 },
  statLabelRow:  { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 4 },
  statDot:       { width: 7, height: 7, borderRadius: 4 },
  statLabel:     { fontSize: 12, color: 'rgba(255,255,255,0.75)' },
  statAmount:    { fontSize: 16, fontWeight: '700', color: '#fff' },
  importBanner: {
    backgroundColor: GOLD, borderRadius: 14, padding: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 20,
  },
  importIconWrapper: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  importTextWrapper: { flex: 1 },
  importTitle:   { fontSize: 14, fontWeight: '700', color: '#4A2800' },
  importSub:     { fontSize: 12, color: '#7A4F00', marginTop: 2 },
  importChevron: { fontSize: 22, color: '#7A4F00' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle:  { fontSize: 17, fontWeight: '700', color: TEXT_PRIMARY },
  seeAll:        { fontSize: 14, color: PRIMARY, fontWeight: '500' },
  emptyCard:     { backgroundColor: CARD_BG, borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 0.5, borderColor: '#E5E7EB' },
  emptyIcon:     { fontSize: 32, marginBottom: 12 },
  emptyTitle:    { fontSize: 16, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 6 },
  emptySub:      { fontSize: 13, color: TEXT_SECONDARY, textAlign: 'center' },
  transactionsList: { backgroundColor: CARD_BG, borderRadius: 16, overflow: 'hidden', borderWidth: 0.5, borderColor: '#E5E7EB' },
  txRow:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  txRowBorder:   { borderBottomWidth: 0.5, borderBottomColor: '#F0F0F0' },
  txIcon:        { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  txInfo:        { flex: 1 },
  txName:        { fontSize: 15, fontWeight: '600', color: TEXT_PRIMARY, marginBottom: 5 },
  txMeta:        { flexDirection: 'row', alignItems: 'center', gap: 8 },
  txBadge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  txBadgeText:   { fontSize: 11, fontWeight: '600' },
  txTime:        { fontSize: 12, color: TEXT_SECONDARY },
  txAmount:      { fontSize: 15, fontWeight: '700' },
});