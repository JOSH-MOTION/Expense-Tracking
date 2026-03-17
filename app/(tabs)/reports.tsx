import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle, G, Rect, Text as SvgText } from 'react-native-svg';

const PRIMARY   = '#1D9E75';
const BG        = '#F0F4F3';
const CARD_BG   = '#FFFFFF';
const TEXT_PRIMARY   = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

// ── Data ────────────────────────────────────────────────
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const DONUT_DATA = [
  { label: 'Transfers',    pct: 45, color: PRIMARY   },
  { label: 'Food & Drinks',pct: 30, color: '#F5A623' },
  { label: 'Utilities',    pct: 15, color: '#E24B4A' },
  { label: 'Other',        pct: 10, color: '#B4B2A9' },
];

const WEEKLY_DATA = [
  { week: 'W1', income: 38, expense: 18 },
  { week: 'W2', income: 72, expense: 45 },
  { week: 'W3', income: 55, expense: 68 },
  { week: 'W4', income: 90, expense: 30 },
];

// ── Donut Chart ─────────────────────────────────────────
function DonutChart({ data, total }: { data: typeof DONUT_DATA; total: string }) {
  const SIZE   = 200;
  const CX     = SIZE / 2;
  const CY     = SIZE / 2;
  const R      = 78;
  const STROKE = 28;
  const CIRCUM = 2 * Math.PI * R;

  let offset = 0;
  // start from top (-90deg = -CIRCUM/4 offset)
  const segments = data.map((d) => {
    const dash   = (d.pct / 100) * CIRCUM;
    const gap    = CIRCUM - dash;
    const rotate = offset * 3.6 - 90; // pct → degrees
    offset += d.pct;
    return { ...d, dash, gap, rotate };
  });

  return (
    <View style={{ alignItems: 'center', marginVertical: 8 }}>
      <Svg width={SIZE} height={SIZE}>
        <G rotation={-90} origin={`${CX},${CY}`}>
          {segments.map((seg, i) => (
            <Circle
              key={i}
              cx={CX}
              cy={CY}
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth={STROKE}
              strokeDasharray={`${seg.dash} ${seg.gap}`}
              strokeDashoffset={
                -((segments
                  .slice(0, i)
                  .reduce((acc, s) => acc + s.dash, 0)))
              }
              strokeLinecap="butt"
            />
          ))}
        </G>
        {/* Centre label */}
        <SvgText
          x={CX} y={CY - 10}
          textAnchor="middle"
          fontSize="13"
          fill={TEXT_SECONDARY}
        >
          Total
        </SvgText>
        <SvgText
          x={CX} y={CY + 14}
          textAnchor="middle"
          fontSize="22"
          fontWeight="800"
          fill={TEXT_PRIMARY}
        >
          {total}
        </SvgText>
      </Svg>
    </View>
  );
}

// ── Bar Chart ───────────────────────────────────────────
function BarChart({ data }: { data: typeof WEEKLY_DATA }) {
  const W          = 280;
  const H          = 120;
  const BAR_W      = 18;
  const GAP        = 4;
  const GROUP_W    = BAR_W * 2 + GAP + 20;
  const maxVal     = Math.max(...data.flatMap((d) => [d.income, d.expense]));

  return (
    <View style={{ alignItems: 'center', marginTop: 8 }}>
      <Svg width={W} height={H + 24}>
        {data.map((d, i) => {
          const groupX = i * GROUP_W + 20;
          const incH   = (d.income  / maxVal) * H;
          const expH   = (d.expense / maxVal) * H;
          const incY   = H - incH;
          const expY   = H - expH;

          return (
            <G key={i}>
              {/* Income bar */}
              <Rect
                x={groupX}
                y={incY}
                width={BAR_W}
                height={incH}
                rx={5}
                fill={PRIMARY}
                opacity={0.9}
              />
              {/* Expense bar */}
              <Rect
                x={groupX + BAR_W + GAP}
                y={expY}
                width={BAR_W}
                height={expH}
                rx={5}
                fill="#E24B4A"
                opacity={0.85}
              />
              {/* Week label */}
              <SvgText
                x={groupX + BAR_W}
                y={H + 18}
                textAnchor="middle"
                fontSize="12"
                fill={TEXT_SECONDARY}
              >
                {d.week}
              </SvgText>
            </G>
          );
        })}
      </Svg>

      {/* Legend */}
      <View style={styles.barLegend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: PRIMARY }]} />
          <Text style={styles.legendText}>Income</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E24B4A' }]} />
          <Text style={styles.legendText}>Expense</Text>
        </View>
      </View>
    </View>
  );
}

// ── Main Screen ─────────────────────────────────────────
export default function ReportsScreen() {
  const now = new Date();
  const [monthIndex, setMonthIndex] = useState(now.getMonth());
  const [year, setYear]             = useState(now.getFullYear());

  const prevMonth = () => {
    if (monthIndex === 0) { setMonthIndex(11); setYear((y) => y - 1); }
    else setMonthIndex((m) => m - 1);
  };
  const nextMonth = () => {
    if (monthIndex === 11) { setMonthIndex(0); setYear((y) => y + 1); }
    else setMonthIndex((m) => m + 1);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={BG} />

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Reports</Text>
        <TouchableOpacity style={styles.exportBtn} activeOpacity={0.75}>
          {/* download icon */}
          <Svg width={18} height={18} viewBox="0 0 24 24">
            <G stroke={TEXT_PRIMARY} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" fill="none">
              <Rect x={3} y={17} width={18} height={2} rx={1} fill={TEXT_PRIMARY} stroke="none"/>
              <G>
                <Rect x={11} y={3} width={2} height={10} rx={1} fill={TEXT_PRIMARY} stroke="none"/>
                <G transform="translate(12,14) rotate(0)">
                  <Rect x={-4} y={-2} width={4} height={2} rx={1} fill={TEXT_PRIMARY} stroke="none" transform="rotate(-45)"/>
                  <Rect x={0} y={-2} width={4} height={2} rx={1} fill={TEXT_PRIMARY} stroke="none" transform="rotate(45)"/>
                </G>
              </G>
            </G>
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* ── Month Selector ── */}
        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={prevMonth} style={styles.monthArrow} activeOpacity={0.7}>
            <Text style={styles.monthArrowText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTHS[monthIndex]} {year}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.monthArrow} activeOpacity={0.7}>
            <Text style={styles.monthArrowText}>›</Text>
          </TouchableOpacity>
        </View>

        {/* ── MoMo / Cash Cards ── */}
        <View style={styles.summaryRow}>
          {/* MoMo */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <View style={[styles.summaryIcon, { backgroundColor: '#FFF4E0' }]}>
                <Text style={{ fontSize: 16 }}>📱</Text>
              </View>
              <Text style={styles.summaryCardTitle}>MoMo</Text>
            </View>
            <Text style={styles.summaryAmount}>₵ 4,250</Text>
            <View style={styles.summaryFooter}>
              <Text style={styles.summaryPctUp}>↗ 65% of vol</Text>
            </View>
          </View>

          {/* Cash */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryCardHeader}>
              <View style={[styles.summaryIcon, { backgroundColor: '#E1F5EE' }]}>
                <Text style={{ fontSize: 16 }}>💵</Text>
              </View>
              <Text style={styles.summaryCardTitle}>Cash</Text>
            </View>
            <Text style={styles.summaryAmount}>₵ 2,250</Text>
            <View style={styles.summaryFooter}>
              <Text style={styles.summaryPctDown}>↘ 35% of vol</Text>
            </View>
          </View>
        </View>

        {/* ── Expense Categories ── */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Expense Categories</Text>
              <Text style={styles.cardSub}>Where your money goes</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.moreBtn}>•••</Text>
            </TouchableOpacity>
          </View>

          <DonutChart data={DONUT_DATA} total="₵ 2,250" />

          <View style={styles.legendList}>
            {DONUT_DATA.map((d) => (
              <View key={d.label} style={styles.legendRow}>
                <View style={styles.legendLeft}>
                  <View style={[styles.legendDotLg, { backgroundColor: d.color }]} />
                  <Text style={styles.legendLabel}>{d.label}</Text>
                </View>
                <Text style={styles.legendPct}>{d.pct}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Weekly Cashflow ── */}
        <View style={[styles.card, { marginBottom: 24 }]}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Weekly Cashflow</Text>
              <Text style={styles.cardSub}>Income vs Expense</Text>
            </View>
          </View>
          <BarChart data={WEEKLY_DATA} />
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

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
  },
  exportBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: CARD_BG,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  // Month selector
  monthSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: CARD_BG,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  monthArrow: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthArrowText: {
    fontSize: 20,
    color: TEXT_PRIMARY,
    fontWeight: '400',
    lineHeight: 24,
  },
  monthLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },

  // Summary cards
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: CARD_BG,
    borderRadius: 16,
    padding: 14,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  summaryCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: TEXT_SECONDARY,
  },
  summaryAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: TEXT_PRIMARY,
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  summaryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryPctUp: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
  summaryPctDown: {
    fontSize: 12,
    color: '#E24B4A',
  },

  // Cards
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 0.5,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },
  cardSub: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    marginTop: 2,
  },
  moreBtn: {
    fontSize: 16,
    color: TEXT_SECONDARY,
    letterSpacing: 2,
    paddingTop: 2,
  },

  // Donut legend
  legendList: {
    marginTop: 8,
    gap: 12,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  legendDotLg: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendLabel: {
    fontSize: 14,
    color: TEXT_PRIMARY,
    fontWeight: '500',
  },
  legendPct: {
    fontSize: 14,
    fontWeight: '700',
    color: TEXT_PRIMARY,
  },

  // Bar legend
  barLegend: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
  },
});