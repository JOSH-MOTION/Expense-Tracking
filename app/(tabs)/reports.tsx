import { useAuth } from "@/lib/AuthContext";
import { getMonthlyTransactions, calcSummary } from "@/lib/db";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator, RefreshControl, ScrollView,
  StatusBar, StyleSheet, Text, TouchableOpacity, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, G, Rect, Text as SvgText } from "react-native-svg";

const PRIMARY        = "#1D9E75";
const BG             = "#F0F4F3";
const CARD_BG        = "#FFFFFF";
const TEXT_PRIMARY   = "#1A1A1A";
const TEXT_SECONDARY = "#6B7280";

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];

// Category colors matching db category IDs
const CAT_COLORS: Record<string, string> = {
  food:      "#F5A623", transport: "#E24B4A", shopping: "#7C3AED",
  bills:     "#F59E0B", airtime:   PRIMARY,   health:   "#EC4899",
  salary:    "#10B981", gift:      "#8B5CF6",  other:   "#B4B2A9",
};
const CAT_LABELS: Record<string, string> = {
  food: "Food & Dining", transport: "Transport", shopping: "Shopping",
  bills: "Bills", airtime: "Airtime/Data", health: "Health",
  salary: "Salary", gift: "Gift", other: "Other",
};

// ── Donut ─────────────────────────────────────────────────
function DonutChart({ slices, total }: { slices: { label: string; pct: number; color: string }[]; total: string }) {
  const SIZE = 200, CX = 100, CY = 100, R = 78, STROKE = 28;
  const CIRCUM = 2 * Math.PI * R;
  let cumDash = 0;
  return (
    <View style={{ alignItems: "center", marginVertical: 8 }}>
      <Svg width={SIZE} height={SIZE}>
        <G rotation={-90} origin={`${CX},${CY}`}>
          {slices.map((s, i) => {
            const dash = (s.pct / 100) * CIRCUM;
            const seg = (
              <Circle key={i} cx={CX} cy={CY} r={R} fill="none"
                stroke={s.color} strokeWidth={STROKE}
                strokeDasharray={`${dash} ${CIRCUM - dash}`}
                strokeDashoffset={-cumDash} strokeLinecap="butt" />
            );
            cumDash += dash;
            return seg;
          })}
          {slices.length === 0 && (
            <Circle cx={CX} cy={CY} r={R} fill="none" stroke="#E5E7EB" strokeWidth={STROKE} />
          )}
        </G>
        <SvgText x={CX} y={CY - 10} textAnchor="middle" fontSize="13" fill={TEXT_SECONDARY}>Total</SvgText>
        <SvgText x={CX} y={CY + 14} textAnchor="middle" fontSize="20" fontWeight="800" fill={TEXT_PRIMARY}>{total}</SvgText>
      </Svg>
    </View>
  );
}

// ── Bar Chart ─────────────────────────────────────────────
function BarChart({ weeks }: { weeks: { label: string; income: number; expense: number }[] }) {
  const W = 300, H = 120, BAR_W = 16, GAP = 4;
  const maxVal = Math.max(...weeks.flatMap(d => [d.income, d.expense]), 1);
  const groupW = BAR_W * 2 + GAP + (W / weeks.length - BAR_W * 2 - GAP);
  return (
    <View style={{ alignItems: "center", marginTop: 8 }}>
      <Svg width={W} height={H + 24}>
        {weeks.map((d, i) => {
          const gx   = i * (W / weeks.length) + (W / weeks.length - BAR_W * 2 - GAP) / 2;
          const incH = (d.income  / maxVal) * H;
          const expH = (d.expense / maxVal) * H;
          return (
            <G key={i}>
              <Rect x={gx}              y={H - incH} width={BAR_W} height={incH || 2} rx={4} fill={PRIMARY}    opacity={0.9} />
              <Rect x={gx + BAR_W + GAP} y={H - expH} width={BAR_W} height={expH || 2} rx={4} fill="#E24B4A" opacity={0.85} />
              <SvgText x={gx + BAR_W} y={H + 16} textAnchor="middle" fontSize="11" fill={TEXT_SECONDARY}>{d.label}</SvgText>
            </G>
          );
        })}
      </Svg>
      <View style={{ flexDirection: "row", gap: 20, marginTop: 4 }}>
        {[{ color: PRIMARY, label: "Income" }, { color: "#E24B4A", label: "Expense" }].map(l => (
          <View key={l.label} style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: l.color }} />
            <Text style={{ fontSize: 12, color: TEXT_SECONDARY }}>{l.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Helpers ───────────────────────────────────────────────
function buildDonutSlices(txs: any[]) {
  const totals: Record<string, number> = {};
  txs.filter(t => t.type === "expense").forEach(t => {
    totals[t.category] = (totals[t.category] || 0) + t.amount;
  });
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0);
  if (grandTotal === 0) return [];
  return Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat, amt]) => ({
      label: CAT_LABELS[cat] || cat,
      pct:   Math.round((amt / grandTotal) * 100),
      color: CAT_COLORS[cat] || "#B4B2A9",
      amt,
    }));
}

function buildWeeklyBars(txs: any[], year: number, month: number) {
  // Split month into 4 roughly-equal week buckets
  const weeks = [
    { label: "W1", income: 0, expense: 0 },
    { label: "W2", income: 0, expense: 0 },
    { label: "W3", income: 0, expense: 0 },
    { label: "W4", income: 0, expense: 0 },
  ];
  txs.forEach(tx => {
    const day = new Date(tx.createdAt).getDate();
    const wi  = day <= 7 ? 0 : day <= 14 ? 1 : day <= 21 ? 2 : 3;
    if (tx.type === "income")  weeks[wi].income  += tx.amount;
    if (tx.type === "expense") weeks[wi].expense += tx.amount;
  });
  return weeks;
}

// ── Main ──────────────────────────────────────────────────
export default function ReportsScreen() {
  const { user } = useAuth();
  const now = new Date();
  const [month,      setMonth]      = useState(now.getMonth());
  const [year,       setYear]       = useState(now.getFullYear());
  const [txs,        setTxs]        = useState<any[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (y: number, m: number) => {
    try {
      const data = await getMonthlyTransactions(y, m);
      setTxs(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { if (user) load(year, month); else setLoading(false); }, [user, year, month, load]);

  const summary = calcSummary(txs);
  const slices  = buildDonutSlices(txs);
  const weeks   = buildWeeklyBars(txs, year, month);

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1); }
    else setMonth(m => m + 1);
  };

  const momoTotal = txs.filter(t => t.paymentType === "MoMo").reduce((s, t) => s + t.amount, 0);
  const cashTotal = txs.filter(t => t.paymentType === "Cash").reduce((s, t) => s + t.amount, 0);
  const grandVol  = momoTotal + cashTotal || 1;

  const fmt = (n: number) => "₵ " + n.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  if (loading) return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <View style={s.loader}><ActivityIndicator color={PRIMARY} size="large" /></View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />
      <View style={s.header}><Text style={s.headerTitle}>Reports</Text></View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(year, month); }} tintColor={PRIMARY} />}>

        {/* Month selector */}
        <View style={s.monthRow}>
          <TouchableOpacity onPress={prevMonth} style={s.monthArrow}><Text style={s.monthArrowTxt}>‹</Text></TouchableOpacity>
          <Text style={s.monthLabel}>{MONTHS[month]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={s.monthArrow}><Text style={s.monthArrowTxt}>›</Text></TouchableOpacity>
        </View>

        {/* Income / Expense summary */}
        <View style={s.summRow}>
          {[
            { label: "Income",  val: summary.income,  dot: "#9FE1CB", color: PRIMARY  },
            { label: "Expense", val: summary.expense, dot: "#F09595", color: "#E24B4A" },
          ].map(r => (
            <View key={r.label} style={s.summCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <View style={[s.summDot, { backgroundColor: r.dot }]} />
                <Text style={s.summLabel}>{r.label}</Text>
              </View>
              <Text style={[s.summAmt, { color: r.color }]}>{fmt(r.val)}</Text>
            </View>
          ))}
        </View>

        {/* MoMo vs Cash */}
        <View style={s.summRow}>
          {[
            { label: "MoMo", val: momoTotal, pct: Math.round((momoTotal / grandVol) * 100), icon: "📱", bg: "#FFF4E0" },
            { label: "Cash", val: cashTotal, pct: Math.round((cashTotal / grandVol) * 100), icon: "💵", bg: "#E1F5EE" },
          ].map(r => (
            <View key={r.label} style={s.summCard}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <View style={[s.summIcon, { backgroundColor: r.bg }]}><Text style={{ fontSize: 14 }}>{r.icon}</Text></View>
                <Text style={s.summLabel}>{r.label}</Text>
              </View>
              <Text style={s.summAmt}>{fmt(r.val)}</Text>
              <Text style={{ fontSize: 11, color: TEXT_SECONDARY, marginTop: 4 }}>{r.pct}% of volume</Text>
            </View>
          ))}
        </View>

        {/* Expense categories donut */}
        <View style={s.card}>
          <View style={s.cardHdr}>
            <View>
              <Text style={s.cardTitle}>Expense Categories</Text>
              <Text style={s.cardSub}>Where your money goes</Text>
            </View>
          </View>
          {slices.length === 0 ? (
            <View style={s.noData}><Text style={s.noDataTxt}>No expense data this month</Text></View>
          ) : (
            <>
              <DonutChart slices={slices} total={fmt(summary.expense)} />
              <View style={{ marginTop: 8, gap: 12 }}>
                {slices.map(sl => (
                  <View key={sl.label} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: sl.color }} />
                      <Text style={{ fontSize: 14, color: TEXT_PRIMARY, fontWeight: "500" }}>{sl.label}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontSize: 14, fontWeight: "700", color: TEXT_PRIMARY }}>{sl.pct}%</Text>
                      <Text style={{ fontSize: 11, color: TEXT_SECONDARY }}>{fmt((sl as any).amt)}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Weekly cashflow */}
        <View style={[s.card, { marginBottom: 24 }]}>
          <View style={s.cardHdr}>
            <View>
              <Text style={s.cardTitle}>Weekly Cashflow</Text>
              <Text style={s.cardSub}>Income vs Expense by week</Text>
            </View>
          </View>
          {txs.length === 0 ? (
            <View style={s.noData}><Text style={s.noDataTxt}>No transactions this month</Text></View>
          ) : (
            <BarChart weeks={weeks} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:    { flex: 1, backgroundColor: BG },
  loader:  { flex: 1, alignItems: "center", justifyContent: "center" },
  header:  { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12 },
  headerTitle: { fontSize: 26, fontWeight: "800", color: TEXT_PRIMARY, letterSpacing: -0.5 },
  content: { paddingHorizontal: 16, paddingBottom: 16 },
  monthRow:     { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: CARD_BG, borderRadius: 14, paddingVertical: 12, paddingHorizontal: 16, marginBottom: 14, borderWidth: 0.5, borderColor: "#E5E7EB" },
  monthArrow:   { width: 32, height: 32, borderRadius: 16, backgroundColor: BG, alignItems: "center", justifyContent: "center" },
  monthArrowTxt:{ fontSize: 22, color: TEXT_PRIMARY, lineHeight: 26 },
  monthLabel:   { fontSize: 16, fontWeight: "700", color: TEXT_PRIMARY },
  summRow:  { flexDirection: "row", gap: 12, marginBottom: 14 },
  summCard: { flex: 1, backgroundColor: CARD_BG, borderRadius: 16, padding: 14, borderWidth: 0.5, borderColor: "#E5E7EB" },
  summDot:  { width: 8, height: 8, borderRadius: 4 },
  summIcon: { width: 30, height: 30, borderRadius: 8, alignItems: "center", justifyContent: "center" },
  summLabel:{ fontSize: 13, color: TEXT_SECONDARY, fontWeight: "500" },
  summAmt:  { fontSize: 18, fontWeight: "800", color: TEXT_PRIMARY, letterSpacing: -0.5 },
  card:     { backgroundColor: CARD_BG, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 0.5, borderColor: "#E5E7EB" },
  cardHdr:  { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 },
  cardTitle:{ fontSize: 16, fontWeight: "700", color: TEXT_PRIMARY },
  cardSub:  { fontSize: 12, color: TEXT_SECONDARY, marginTop: 2 },
  noData:   { paddingVertical: 32, alignItems: "center" },
  noDataTxt:{ fontSize: 14, color: TEXT_SECONDARY },
});