import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import Svg, { Rect, Line, Text as SvgText, G } from 'react-native-svg';
import {
  BarChart3,
  ArrowUpRight,
  Target,
  Award,
  TrendingUp,
} from 'lucide-react-native';
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
  annualTarget = 1200000,
}) => {
  const [selectedYear, setSelectedYear] = useState<'2026' | '2025'>('2026');
  const [viewMode, setViewMode] = useState<'monthly' | 'quarterly'>('monthly');
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [containerWidth, setContainerWidth] = useState(380);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 100) {
      setContainerWidth(width);
    }
  };

  // Base dataset
  const currentData: MonthlyRevenue[] =
    data.length > 0
      ? data
      : [
          { month: 'Jan', revenue: 123495 },
          { month: 'Feb', revenue: 53994 },
          { month: 'Mar', revenue: 117586 },
          { month: 'Apr', revenue: 49495 },
          { month: 'May', revenue: 120995 },
          { month: 'Jun', revenue: 102487 },
          { month: 'Jul', revenue: 69595 },
          { month: 'Aug', revenue: 106995 },
          { month: 'Sep', revenue: 153992 },
        ];

  // Adjust for year switch
  const activeYearData = currentData.map((d) => ({
    month: d.month,
    revenue:
      selectedYear === '2026' ? d.revenue : Math.round(d.revenue * 0.84),
  }));

  // Aggregate for quarterly view if selected
  const quarterlyData = [
    {
      label: 'Q1',
      revenue: activeYearData.slice(0, 3).reduce((s, c) => s + c.revenue, 0),
    },
    {
      label: 'Q2',
      revenue: activeYearData.slice(3, 6).reduce((s, c) => s + c.revenue, 0),
    },
    {
      label: 'Q3',
      revenue: activeYearData.slice(6, 9).reduce((s, c) => s + c.revenue, 0),
    },
    {
      label: 'Q4',
      revenue: selectedYear === '2026' ? 0 : 210000,
    },
  ];

  const chartItems =
    viewMode === 'monthly'
      ? activeYearData.map((d) => ({ label: d.month, revenue: d.revenue }))
      : quarterlyData;

  const calculatedTotal =
    totalRevenue ??
    activeYearData.reduce((acc, curr) => acc + curr.revenue, 0);

  const displayTotal =
    selectedYear === '2026'
      ? calculatedTotal
      : Math.round(calculatedTotal * 0.84);

  const displayTarget = selectedYear === '2026' ? annualTarget : 1000000;
  const progressPercent = Math.min(
    Math.round((displayTotal / displayTarget) * 100),
    100
  );

  const maxVal = Math.max(...chartItems.map((i) => i.revenue), 1000);
  const avgMonthly = Math.round(displayTotal / (activeYearData.length || 1));

  // Find peak
  const peakItem = chartItems.reduce(
    (prev, curr) => (curr.revenue > prev.revenue ? curr : prev),
    chartItems[0]
  );

  // SVG Chart Geometry
  const cardBodyPadding = 16;
  const chartWidth = Math.max(containerWidth - cardBodyPadding * 2, 260);
  const chartHeight = 150;
  const padLeft = 44;
  const padRight = 12;
  const padBottom = 24;
  const padTop = 16;

  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  // Grid line values
  const yTicks = [0, 0.5, 1].map((pct) => ({
    pct,
    y: padTop + innerH - pct * innerH,
    value: Math.round(maxVal * pct),
  }));

  const formatShortINR = (num: number) => {
    if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
    if (num >= 1000) return `₹${Math.round(num / 1000)}k`;
    return `₹${num}`;
  };

  const activeItem =
    activeIdx !== null && chartItems[activeIdx] ? chartItems[activeIdx] : null;

  return (
    <View style={styles.card} onLayout={onLayout}>
      {/* Uniform Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <BarChart3
              size={16}
              color={THEME.colors.textPrimary}
              strokeWidth={2.4}
            />
            <Text style={styles.title}>Year Sales</Text>
            <View style={styles.growthBadge}>
              <ArrowUpRight size={11} color="#047857" strokeWidth={2.6} />
              <Text style={styles.growthText}>
                {selectedYear === '2026' ? '+18.4%' : '+12.1%'}
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Annual bar chart & progress</Text>
        </View>

        {/* View Mode & Year Switchers */}
        <View style={styles.controlsRow}>
          <View style={styles.segmentedPill}>
            <TouchableOpacity
              onPress={() => {
                setViewMode('monthly');
                setActiveIdx(null);
              }}
              style={[
                styles.pillBtn,
                viewMode === 'monthly' && styles.pillBtnActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  viewMode === 'monthly' && styles.pillTextActive,
                ]}
              >
                M
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setViewMode('quarterly');
                setActiveIdx(null);
              }}
              style={[
                styles.pillBtn,
                viewMode === 'quarterly' && styles.pillBtnActive,
              ]}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.pillText,
                  viewMode === 'quarterly' && styles.pillTextActive,
                ]}
              >
                Q
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.segmentedPill}>
            {(['2026', '2025'] as const).map((yr) => (
              <TouchableOpacity
                key={yr}
                onPress={() => {
                  setSelectedYear(yr);
                  setActiveIdx(null);
                }}
                style={[
                  styles.pillBtn,
                  selectedYear === yr && styles.pillBtnActive,
                ]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillText,
                    selectedYear === yr && styles.pillTextActive,
                  ]}
                >
                  {yr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Uniform Body */}
      <View style={styles.body}>
        {/* Hero Metric */}
        <View style={styles.heroRow}>
          <View>
            <Text style={styles.revenueAmount}>
              ₹{displayTotal.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.revenueSub}>
              {selectedYear === '2026'
                ? `YTD recorded revenue (${totalOrders} orders)`
                : `FY 2025 total revenue`}
            </Text>
          </View>

          {activeItem ? (
            <View style={styles.activeInspectBadge}>
              <Text style={styles.activeInspectLabel}>{activeItem.label}</Text>
              <Text style={styles.activeInspectVal}>
                ₹{activeItem.revenue.toLocaleString('en-IN')}
              </Text>
            </View>
          ) : (
            <View style={styles.peakInspectBadge}>
              <Award size={12} color="#047857" strokeWidth={2.5} />
              <Text style={styles.peakInspectText}>
                Peak: {peakItem.label} ({formatShortINR(peakItem.revenue)})
              </Text>
            </View>
          )}
        </View>

        {/* Target Progress Bar */}
        <View style={styles.targetWrap}>
          <View style={styles.targetInfo}>
            <View style={styles.targetLabelRow}>
              <Target size={12} color={THEME.colors.textSecondary} />
              <Text style={styles.targetLabel}>
                Target: {formatShortINR(displayTarget)}
              </Text>
            </View>
            <Text style={styles.targetPercentage}>{progressPercent}% achieved</Text>
          </View>
          <View style={styles.targetTrack}>
            <View
              style={[styles.targetFill, { width: `${progressPercent}%` }]}
            />
          </View>
        </View>

        {/* Vertical Bar Chart Graph */}
        <View style={styles.chartWrapper}>
          <Svg width={chartWidth} height={chartHeight}>
            {/* Horizontal Grid lines and Y-axis labels */}
            {yTicks.map((tick, i) => (
              <G key={`tick-${i}`}>
                <Line
                  x1={padLeft}
                  y1={tick.y}
                  x2={chartWidth - padRight}
                  y2={tick.y}
                  stroke="#e2e8f0"
                  strokeWidth={1}
                  strokeDasharray={
                    i > 0 && i < yTicks.length - 1 ? '4,4' : undefined
                  }
                />
                <SvgText
                  x={padLeft - 6}
                  y={tick.y + 3.5}
                  fontSize={10}
                  fontWeight="500"
                  fill="#94a3b8"
                  textAnchor="end"
                >
                  {formatShortINR(tick.value)}
                </SvgText>
              </G>
            ))}

            {/* Vertical Bars */}
            {chartItems.map((item, idx) => {
              const count = chartItems.length;
              const slotW = innerW / count;
              const barW = Math.min(Math.max(slotW * 0.62, 12), 28);
              const x = padLeft + idx * slotW + (slotW - barW) / 2;

              const barH =
                maxVal > 0 ? (item.revenue / maxVal) * innerH : 0;
              const y = padTop + innerH - barH;

              const isPeak = item.label === peakItem.label;
              const isSelected = activeIdx === idx;

              let barColor = '#334155';
              if (isSelected) {
                barColor = '#2563eb';
              } else if (isPeak) {
                barColor = '#0f172a';
              } else if (item.revenue === 0) {
                barColor = '#f1f5f9';
              }

              return (
                <G
                  key={`bar-${item.label}-${idx}`}
                  {...((Platform.OS === 'web'
                    ? {
                        onClick: () => setActiveIdx(activeIdx === idx ? null : idx),
                        style: { cursor: 'pointer' },
                      }
                    : {
                        onPress: () => setActiveIdx(activeIdx === idx ? null : idx),
                      }) as any)}
                >
                  <Rect
                    x={padLeft + idx * slotW}
                    y={padTop}
                    width={slotW}
                    height={innerH}
                    fill="transparent"
                  />

                  {barH > 0 && (
                    <Rect
                      x={x}
                      y={y}
                      width={barW}
                      height={barH}
                      rx={3}
                      fill={barColor}
                    />
                  )}

                  {isPeak && barH > 0 && (
                    <Rect
                      x={x + barW / 2 - 2}
                      y={y - 6}
                      width={4}
                      height={4}
                      rx={2}
                      fill="#10b981"
                    />
                  )}

                  <SvgText
                    x={x + barW / 2}
                    y={chartHeight - 6}
                    fontSize={10}
                    fontWeight={isSelected || isPeak ? '700' : '500'}
                    fill={isSelected ? '#2563eb' : isPeak ? '#0f172a' : '#64748b'}
                    textAnchor="middle"
                  >
                    {item.label}
                  </SvgText>
                </G>
              );
            })}
          </Svg>
        </View>

        {/* Bottom 3 Metric Highlights */}
        <View style={styles.metricsFooter}>
          <View style={styles.footerItem}>
            <Text style={styles.footerItemLabel}>Avg / Month</Text>
            <Text style={styles.footerItemValue}>
              {formatShortINR(avgMonthly)}
            </Text>
          </View>

          <View style={styles.footerItem}>
            <View style={styles.footerLabelRow}>
              <Award size={10} color="#f59e0b" strokeWidth={2.4} />
              <Text style={styles.footerItemLabel}>Peak</Text>
            </View>
            <Text style={styles.footerItemValue}>
              {peakItem.label} ({formatShortINR(peakItem.revenue)})
            </Text>
          </View>

          <View style={styles.footerItem}>
            <View style={styles.footerLabelRow}>
              <TrendingUp size={10} color="#10b981" strokeWidth={2.4} />
              <Text style={styles.footerItemLabel}>Run Rate</Text>
            </View>
            <Text style={styles.footerItemValue}>
              ₹{((avgMonthly * 12) / 100000).toFixed(1)} L/yr
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
    ...THEME.shadow.card,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 2,
  },
  growthText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontFamily: THEME.fontFamily.regular,
    marginTop: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  segmentedPill: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    padding: 2,
    gap: 1,
  },
  pillBtn: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 3,
  },
  pillBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  pillText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
  },
  pillTextActive: {
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  body: {
    padding: 16,
  },
  heroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  revenueAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: THEME.colors.textPrimary,
    letterSpacing: -0.4,
  },
  revenueSub: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  activeInspectBadge: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignItems: 'flex-end',
  },
  activeInspectLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1d4ed8',
    textTransform: 'uppercase',
  },
  activeInspectVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1e40af',
  },
  peakInspectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f0fdf4',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  peakInspectText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#15803d',
  },
  targetWrap: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    padding: 8,
    marginBottom: 8,
  },
  targetInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  targetLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  targetLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
  },
  targetPercentage: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '700',
  },
  targetTrack: {
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  targetFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  chartWrapper: {
    alignItems: 'center',
    marginVertical: 4,
  },
  metricsFooter: {
    flexDirection: 'row',
    gap: 6,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
    marginTop: 6,
  },
  footerItem: {
    flex: 1,
    backgroundColor: '#f8fafc',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  footerLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  footerItemLabel: {
    fontSize: 9.5,
    color: THEME.colors.textMuted,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  footerItemValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginTop: 2,
  },
});
