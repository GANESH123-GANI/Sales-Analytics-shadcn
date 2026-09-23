import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TrendingUp, Calendar, Target, Award, ArrowUpRight } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { MonthlyRevenue } from '../types/sales';

interface YearSalesCardProps {
  data?: MonthlyRevenue[];
  totalRevenue?: number;
  totalOrders?: number;
  annualTarget?: number;
}

export const YearSalesCard: React.FC<YearSalesCardProps> = ({
  data = [],
  totalRevenue,
  totalOrders = 44,
  annualTarget = 1200000, // ₹12,00,000 default annual target
}) => {
  const [selectedYear, setSelectedYear] = useState<'2026' | '2025'>('2026');
  const [activeMonthIdx, setActiveMonthIdx] = useState<number | null>(null);

  // Calculate year totals
  const calculatedTotal =
    totalRevenue ?? data.reduce((acc, curr) => acc + curr.revenue, 0);

  const displayTotal =
    selectedYear === '2026'
      ? calculatedTotal
      : Math.round(calculatedTotal * 0.84); // prior year simulated comparison

  const displayTarget =
    selectedYear === '2026' ? annualTarget : 1000000;

  const progressPercent = Math.min(
    Math.round((displayTotal / displayTarget) * 100),
    100
  );

  // Month stats
  const monthsCount = data.length || 1;
  const avgMonthly = Math.round(displayTotal / monthsCount);

  let peakMonth = { month: 'Sep', revenue: 0 };
  if (data.length > 0) {
    peakMonth = data.reduce(
      (prev, curr) => (curr.revenue > prev.revenue ? curr : prev),
      data[0]
    );
  }

  const maxRevenue = Math.max(...data.map((d) => d.revenue), 1);
  const activeMonth =
    activeMonthIdx !== null && data[activeMonthIdx]
      ? data[activeMonthIdx]
      : null;

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Calendar size={15} color={THEME.colors.textPrimary} strokeWidth={2.2} />
            <Text style={styles.title}>Year Sales</Text>
          </View>
          <Text style={styles.subtitle}>Annual performance & revenue target</Text>
        </View>

        {/* Year Pill Selector */}
        <View style={styles.yearSwitchWrap}>
          {(['2026', '2025'] as const).map((year) => (
            <TouchableOpacity
              key={year}
              onPress={() => setSelectedYear(year)}
              style={[
                styles.yearTab,
                selectedYear === year && styles.yearTabActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.yearTabText,
                  selectedYear === year && styles.yearTabTextActive,
                ]}
              >
                {year}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Revenue Metric */}
      <View style={styles.metricBlock}>
        <View style={styles.metricTop}>
          <Text style={styles.revenueAmount}>
            ₹{displayTotal.toLocaleString('en-IN')}
          </Text>
          <View style={styles.growthBadge}>
            <ArrowUpRight size={12} color="#047857" strokeWidth={2.5} />
            <Text style={styles.growthText}>
              {selectedYear === '2026' ? '+18.4%' : '+12.1%'}
            </Text>
          </View>
        </View>
        <Text style={styles.revenueSub}>
          {selectedYear === '2026'
            ? `YTD recorded revenue across ${totalOrders} orders`
            : `Full FY 2025 audited revenue`}
        </Text>
      </View>

      {/* Target Progress Bar */}
      <View style={styles.targetSection}>
        <View style={styles.targetHeader}>
          <View style={styles.targetLabelWrap}>
            <Target size={13} color={THEME.colors.textSecondary} />
            <Text style={styles.targetLabel}>
              Target: ₹{displayTarget.toLocaleString('en-IN')}
            </Text>
          </View>
          <Text style={styles.targetPercent}>{progressPercent}% achieved</Text>
        </View>

        <View style={styles.progressTrack}>
          <View
            style={[
              styles.progressFill,
              { width: `${progressPercent}%` },
            ]}
          />
        </View>
      </View>

      {/* Monthly Mini Bar Chart */}
      {data.length > 0 && (
        <View style={styles.chartSection}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartLabel}>Monthly Distribution</Text>
            {activeMonth ? (
              <Text style={styles.activeTooltip}>
                {activeMonth.month}: ₹{activeMonth.revenue.toLocaleString('en-IN')}
              </Text>
            ) : (
              <Text style={styles.chartHint}>Tap bar to inspect</Text>
            )}
          </View>

          <View style={styles.barsContainer}>
            {data.map((item, idx) => {
              const isPeak = item.month === peakMonth.month;
              const isSelected = activeMonthIdx === idx;
              const heightPercent = Math.max(
                Math.round((item.revenue / maxRevenue) * 100),
                10
              );

              return (
                <TouchableOpacity
                  key={item.month}
                  style={styles.barCol}
                  onPress={() =>
                    setActiveMonthIdx(activeMonthIdx === idx ? null : idx)
                  }
                  activeOpacity={0.8}
                >
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        { height: `${heightPercent}%` },
                        isPeak && styles.barFillPeak,
                        isSelected && styles.barFillSelected,
                      ]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barMonth,
                      isPeak && styles.barMonthPeak,
                      isSelected && styles.barMonthSelected,
                    ]}
                  >
                    {item.month}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Summary Stats Row */}
      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statBoxLabel}>Avg. Monthly</Text>
          <Text style={styles.statBoxValue}>
            ₹{avgMonthly.toLocaleString('en-IN')}
          </Text>
        </View>

        <View style={styles.statBox}>
          <View style={styles.statBoxLabelRow}>
            <Award size={11} color="#f59e0b" strokeWidth={2.5} />
            <Text style={styles.statBoxLabel}>Peak Month</Text>
          </View>
          <Text style={styles.statBoxValue}>
            {peakMonth.month} (₹{(peakMonth.revenue / 100000).toFixed(2)}L)
          </Text>
        </View>

        <View style={styles.statBox}>
          <View style={styles.statBoxLabelRow}>
            <TrendingUp size={11} color="#10b981" strokeWidth={2.5} />
            <Text style={styles.statBoxLabel}>Run Rate</Text>
          </View>
          <Text style={styles.statBoxValue}>
            ₹{((avgMonthly * 12) / 100000).toFixed(2)} L/yr
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
    ...THEME.shadow.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  yearSwitchWrap: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    padding: 2,
    gap: 2,
  },
  yearTab: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
  },
  yearTabActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  yearTabText: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
  },
  yearTabTextActive: {
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  metricBlock: {
    marginBottom: 14,
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  revenueAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    gap: 2,
  },
  growthText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  revenueSub: {
    fontSize: 11.5,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  targetSection: {
    marginBottom: 14,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  targetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  targetLabelWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  targetLabel: {
    fontSize: 11.5,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
  },
  targetPercent: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#047857',
  },
  progressTrack: {
    height: 7,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  chartSection: {
    marginBottom: 14,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  chartHint: {
    fontSize: 10.5,
    color: THEME.colors.textMuted,
  },
  activeTooltip: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 68,
    gap: 4,
    paddingTop: 4,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barTrack: {
    flex: 1,
    width: '100%',
    maxHeight: 50,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#94a3b8',
    borderRadius: 2,
  },
  barFillPeak: {
    backgroundColor: '#09090b',
  },
  barFillSelected: {
    backgroundColor: '#2563eb',
  },
  barMonth: {
    fontSize: 9.5,
    color: THEME.colors.textMuted,
    marginTop: 4,
    fontWeight: '500',
  },
  barMonthPeak: {
    color: THEME.colors.textPrimary,
    fontWeight: '700',
  },
  barMonthSelected: {
    color: '#2563eb',
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 8,
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statBoxLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  statBoxLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  statBoxValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
});
