import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import Svg, {
  Path,
  Line,
  Rect,
  Circle,
  Text as SvgText,
  Defs,
  LinearGradient,
  Stop,
  G,
} from 'react-native-svg';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  Award,
  Sparkles,
  ChartLine,
  ChartColumn,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { MonthlyRevenue } from '../types/sales';

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

type TimeRange = 'all' | '6m' | '3m';
type ChartMode = 'spline' | 'bars' | 'line';

export const RevenueChart: React.FC<RevenueChartProps> = ({ data = [] }) => {
  const [containerWidth, setContainerWidth] = useState(500);
  const [timeRange, setTimeRange] = useState<TimeRange>('all');
  const [chartMode, setChartMode] = useState<ChartMode>('spline');
  const [showBenchmark, setShowBenchmark] = useState<boolean>(true);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 100) {
      setContainerWidth(width);
    }
  };

  if (!data || data.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TrendingUp size={16} color={THEME.colors.textPrimary} strokeWidth={2.4} />
            <Text style={styles.title}>Sales Overview</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No revenue data available</Text>
        </View>
      </View>
    );
  }

  // Filter data according to selected time range
  const filteredData = React.useMemo(() => {
    if (timeRange === '3m') return data.slice(-3);
    if (timeRange === '6m') return data.slice(-6);
    return data;
  }, [data, timeRange]);

  // Overall calculations
  const totalRev = filteredData.reduce((s, c) => s + c.revenue, 0);
  const avgMonthly = Math.round(totalRev / (filteredData.length || 1));
  const maxVal = Math.max(...filteredData.map((d) => d.revenue), 1000);
  const minVal = 0;

  // Peak and Lowest months
  const peakItem = filteredData.reduce(
    (prev, curr) => (curr.revenue > prev.revenue ? curr : prev),
    filteredData[0]
  );
  const lowestItem = filteredData.reduce(
    (prev, curr) => (curr.revenue < prev.revenue ? curr : prev),
    filteredData[0]
  );

  // Period Growth rate (first to last)
  const firstRev = filteredData[0]?.revenue || 1;
  const lastRev = filteredData[filteredData.length - 1]?.revenue || 1;
  const periodGrowth = (((lastRev - firstRev) / firstRev) * 100).toFixed(1);
  const isPositiveGrowth = parseFloat(periodGrowth) >= 0;

  // Geometry
  const cardBodyPadding = 16;
  const chartWidth = Math.max(containerWidth - cardBodyPadding * 2, 280);
  const chartHeight = 230;
  const paddingHorizontal = 28;
  const paddingBottom = 32;
  const paddingTop = 24;
  const innerWidth = chartWidth - paddingHorizontal * 2;
  const innerHeight = chartHeight - paddingTop - paddingBottom;
  const chartBottom = chartHeight - paddingBottom;

  // Benchmark Y coordinate
  const benchmarkY =
    paddingTop + innerHeight - ((avgMonthly - minVal) / (maxVal - minVal || 1)) * innerHeight;

  // Compute coordinate points
  const points = filteredData.map((d, index) => {
    const x =
      filteredData.length === 1
        ? paddingHorizontal + innerWidth / 2
        : paddingHorizontal + (index / (filteredData.length - 1)) * innerWidth;
    const y =
      paddingTop +
      innerHeight -
      ((d.revenue - minVal) / (maxVal - minVal || 1)) * innerHeight;

    const prevRevenue = index > 0 ? filteredData[index - 1].revenue : null;
    const momChange =
      prevRevenue !== null && prevRevenue > 0
        ? (((d.revenue - prevRevenue) / prevRevenue) * 100).toFixed(1)
        : null;

    return {
      x,
      y,
      index,
      ...d,
      momChange,
    };
  });

  // Default active point to the last point if none selected yet
  const activePoint =
    selectedIdx !== null && points[selectedIdx]
      ? points[selectedIdx]
      : points[points.length - 1];

  // Spline Path Generation
  let splinePathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    splinePathD += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  // Straight Line Path Generation
  const straightPathD = points.reduce(
    (acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`,
    ''
  );

  const activePathD = chartMode === 'line' ? straightPathD : splinePathD;
  const areaPathD = `${activePathD} L ${points[points.length - 1].x} ${chartBottom} L ${points[0].x} ${chartBottom} Z`;

  return (
    <View style={styles.card} onLayout={onLayout}>
      {/* ─── Header ─── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <View style={styles.iconBadge}>
              <TrendingUp size={16} color={THEME.colors.primary} strokeWidth={2.4} />
            </View>
            <Text style={styles.title}>Sales Overview</Text>
            <View
              style={[
                styles.growthBadge,
                isPositiveGrowth ? styles.growthBadgePos : styles.growthBadgeNeg,
              ]}
            >
              {isPositiveGrowth ? (
                <ArrowUpRight size={11} color="#047857" strokeWidth={2.6} />
              ) : (
                <ArrowDownRight size={11} color="#dc2626" strokeWidth={2.6} />
              )}
              <Text
                style={[
                  styles.growthText,
                  isPositiveGrowth ? styles.growthTextPos : styles.growthTextNeg,
                ]}
              >
                {isPositiveGrowth ? `+${periodGrowth}%` : `${periodGrowth}%`}
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle}>
            {timeRange === 'all'
              ? 'Complete monthly trajectory'
              : timeRange === '6m'
              ? 'Past 6 months trajectory'
              : 'Recent quarter trend'}
          </Text>
        </View>

        <View style={styles.headerRight}>
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeLabel}>Total</Text>
            <Text style={styles.totalBadgeText}>₹{totalRev.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      </View>

      {/* ─── Interactive Controls Toolbar ─── */}
      <View style={styles.toolbar}>
        {/* Time Range Pills */}
        <View style={styles.pillGroup}>
          {(['all', '6m', '3m'] as TimeRange[]).map((r) => {
            const isActive = timeRange === r;
            const label = r === 'all' ? 'All (9M)' : r === '6m' ? '6 Months' : '3 Months';
            return (
              <TouchableOpacity
                key={r}
                style={[styles.pillBtn, isActive && styles.pillBtnActive]}
                onPress={() => {
                  setTimeRange(r);
                  setSelectedIdx(null);
                }}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* View Mode & Benchmark Toggles */}
        <View style={styles.toolsRight}>
          {/* Average Line Toggle */}
          <TouchableOpacity
            style={[styles.toggleBtn, showBenchmark && styles.toggleBtnActive]}
            onPress={() => setShowBenchmark(!showBenchmark)}
            activeOpacity={0.7}
          >
            <Target
              size={13}
              color={showBenchmark ? '#0f172a' : '#64748b'}
              strokeWidth={2.2}
            />
            <Text style={[styles.toggleBtnText, showBenchmark && styles.toggleBtnTextActive]}>
              Avg ({Math.round(avgMonthly / 1000)}k)
            </Text>
          </TouchableOpacity>

          {/* Chart Display Mode Switcher */}
          <View style={styles.modeSwitcher}>
            <TouchableOpacity
              style={[styles.modeBtn, chartMode === 'spline' && styles.modeBtnActive]}
              onPress={() => setChartMode('spline')}
              activeOpacity={0.7}
            >
              <ChartLine
                size={14}
                color={chartMode === 'spline' ? '#0f172a' : '#94a3b8'}
                strokeWidth={2.4}
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeBtn, chartMode === 'bars' && styles.modeBtnActive]}
              onPress={() => setChartMode('bars')}
              activeOpacity={0.7}
            >
              <ChartColumn
                size={14}
                color={chartMode === 'bars' ? '#0f172a' : '#94a3b8'}
                strokeWidth={2.4}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* ─── Active Data Point Inspector (Interactive Popover) ─── */}
      {activePoint && (
        <View style={styles.inspectorBar}>
          <View style={styles.inspectorLeft}>
            <View style={styles.inspectorDot} />
            <Text style={styles.inspectorMonth}>{activePoint.month} 2026</Text>
            <Text style={styles.inspectorRevenue}>
              ₹{activePoint.revenue.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.inspectorRight}>
            {activePoint.momChange !== null && (
              <View
                style={[
                  styles.diffBadge,
                  parseFloat(activePoint.momChange) >= 0
                    ? styles.diffBadgePos
                    : styles.diffBadgeNeg,
                ]}
              >
                {parseFloat(activePoint.momChange) >= 0 ? (
                  <ArrowUpRight size={11} color="#047857" strokeWidth={2.5} />
                ) : (
                  <ArrowDownRight size={11} color="#b91c1c" strokeWidth={2.5} />
                )}
                <Text
                  style={[
                    styles.diffText,
                    parseFloat(activePoint.momChange) >= 0
                      ? styles.diffTextPos
                      : styles.diffTextNeg,
                  ]}
                >
                  {parseFloat(activePoint.momChange) >= 0
                    ? `+${activePoint.momChange}%`
                    : `${activePoint.momChange}%`} vs prev
                </Text>
              </View>
            )}

            {activePoint.revenue === peakItem.revenue && (
              <View style={styles.peakTag}>
                <Sparkles size={11} color="#d97706" />
                <Text style={styles.peakTagText}>Peak Month</Text>
              </View>
            )}

            <Text style={styles.avgDiffText}>
              {activePoint.revenue >= avgMonthly
                ? `+₹${Math.round((activePoint.revenue - avgMonthly) / 1000)}k vs avg`
                : `-₹${Math.round((avgMonthly - activePoint.revenue) / 1000)}k vs avg`}
            </Text>
          </View>
        </View>
      )}

      {/* ─── SVG Chart Visual ─── */}
      <View style={styles.body}>
        <View style={styles.chartWrap}>
          <Svg width={chartWidth} height={chartHeight}>
            <Defs>
              {/* Lush gradient for smooth area */}
              <LinearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#0f172a" stopOpacity="0.18" />
                <Stop offset="60%" stopColor="#0f172a" stopOpacity="0.04" />
                <Stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
              </LinearGradient>

              {/* Bar gradient */}
              <LinearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#0f172a" stopOpacity="0.85" />
                <Stop offset="100%" stopColor="#334155" stopOpacity="0.5" />
              </LinearGradient>
              <LinearGradient id="barGradActive" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor="#0f172a" stopOpacity="1" />
                <Stop offset="100%" stopColor="#0f172a" stopOpacity="0.85" />
              </LinearGradient>
            </Defs>

            {/* Background Grid Lines */}
            <Line
              x1={paddingHorizontal}
              y1={chartBottom}
              x2={chartWidth - paddingHorizontal}
              y2={chartBottom}
              stroke="#e2e8f0"
              strokeWidth="1.2"
            />
            <Line
              x1={paddingHorizontal}
              y1={paddingTop + innerHeight * 0.5}
              x2={chartWidth - paddingHorizontal}
              y2={paddingTop + innerHeight * 0.5}
              stroke="#f1f5f9"
              strokeWidth="1"
              strokeDasharray="4,4"
            />

            {/* Benchmark Average Line (Toggleable) */}
            {showBenchmark && (
              <G>
                <Line
                  x1={paddingHorizontal}
                  y1={benchmarkY}
                  x2={chartWidth - paddingHorizontal}
                  y2={benchmarkY}
                  stroke="#94a3b8"
                  strokeWidth="1.2"
                  strokeDasharray="4,3"
                />
                <SvgText
                  x={chartWidth - paddingHorizontal}
                  y={benchmarkY - 5}
                  fontSize="9.5"
                  fill="#64748b"
                  textAnchor="end"
                  fontWeight="600"
                >
                  Avg ₹{Math.round(avgMonthly / 1000)}k
                </SvgText>
              </G>
            )}

            {/* Active Vertical Crosshair Guide */}
            {activePoint && (
              <Line
                x1={activePoint.x}
                y1={paddingTop}
                x2={activePoint.x}
                y2={chartBottom}
                stroke="#64748b"
                strokeWidth="1.2"
                strokeDasharray="3,3"
                opacity={0.8}
              />
            )}

            {/* ── Mode 1 & 2: Spline or Straight Line Area + Path ── */}
            {chartMode !== 'bars' && (
              <>
                {/* Area Gradient Fill */}
                <Path d={areaPathD} fill="url(#revenueGrad)" />

                {/* Subtle vertical indicator bars */}
                {points.map((p, idx) => {
                  const barHeight = (p.revenue / maxVal) * innerHeight * 0.28;
                  const isSelected = activePoint?.index === idx;

                  return (
                    <Rect
                      key={`bgbar-${p.month}-${idx}`}
                      x={p.x - 4}
                      y={chartBottom - barHeight}
                      width={8}
                      height={barHeight}
                      fill={isSelected ? '#cbd5e1' : '#f1f5f9'}
                      rx={2}
                    />
                  );
                })}

                {/* Main trajectory path */}
                <Path
                  d={activePathD}
                  fill="none"
                  stroke="#0f172a"
                  strokeWidth="2.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {points.map((p, idx) => {
                  const isSelected = activePoint?.index === idx;
                  return (
                    <G key={`point-${idx}`}>
                      {/* Outer pulse when selected */}
                      {isSelected && (
                        <>
                          <Circle
                            cx={p.x}
                            cy={p.y}
                            r={11}
                            fill="#0f172a"
                            opacity={0.15}
                          />
                          <Circle
                            cx={p.x}
                            cy={p.y}
                            r={7.5}
                            fill="#ffffff"
                            stroke="#0f172a"
                            strokeWidth="2.5"
                          />
                        </>
                      )}

                      {/* Main point circle */}
                      <Circle
                        cx={p.x}
                        cy={p.y}
                        r={isSelected ? 4 : 3.5}
                        fill="#0f172a"
                      />

                      {/* Point Revenue Label above point */}
                      {isSelected && (
                        <SvgText
                          x={p.x}
                          y={p.y - 12}
                          fontSize="10"
                          fill="#0f172a"
                          textAnchor="middle"
                          fontWeight="700"
                        >
                          ₹{(p.revenue / 1000).toFixed(0)}k
                        </SvgText>
                      )}
                    </G>
                  );
                })}
              </>
            )}

            {/* ── Mode 3: High Contrast Rounded Bars ── */}
            {chartMode === 'bars' && (
              <G>
                {points.map((p, idx) => {
                  const barW = Math.min(innerWidth / (points.length * 1.8), 24);
                  const barH = (p.revenue / maxVal) * innerHeight;
                  const isSelected = activePoint?.index === idx;

                  return (
                    <G key={`barmode-${idx}`}>
                      <Rect
                        x={p.x - barW / 2}
                        y={chartBottom - barH}
                        width={barW}
                        height={barH}
                        fill={isSelected ? 'url(#barGradActive)' : 'url(#barGrad)'}
                        rx={barW / 2}
                      />
                      {isSelected && (
                        <SvgText
                          x={p.x}
                          y={chartBottom - barH - 8}
                          fontSize="10"
                          fill="#0f172a"
                          textAnchor="middle"
                          fontWeight="700"
                        >
                          ₹{(p.revenue / 1000).toFixed(0)}k
                        </SvgText>
                      )}
                    </G>
                  );
                })}
              </G>
            )}

            {/* Month Labels along X-Axis */}
            {points.map((p, idx) => {
              const isSelected = activePoint?.index === idx;
              return (
                <SvgText
                  key={`label-${idx}`}
                  x={p.x}
                  y={chartHeight - 8}
                  fontSize={isSelected ? '11' : '10.5'}
                  fill={isSelected ? '#0f172a' : '#64748b'}
                  textAnchor="middle"
                  fontWeight={isSelected ? '700' : '500'}
                >
                  {p.month}
                </SvgText>
              );
            })}

            {/* Interactive Hit Area Columns (Tap/Click/Hover target) */}
            {points.map((p, idx) => {
              const colWidth = innerWidth / (points.length || 1);
              return (
                <Rect
                  key={`hit-${idx}`}
                  x={p.x - colWidth / 2}
                  y={paddingTop}
                  width={colWidth}
                  height={innerHeight + paddingBottom}
                  fill="transparent"
                  onPress={() => setSelectedIdx(idx)}
                  // Web mouse hover support
                  {...(Platform.OS === 'web'
                    ? {
                        onMouseEnter: () => setSelectedIdx(idx),
                        style: { cursor: 'pointer' },
                      }
                    : {})}
                />
              );
            })}
          </Svg>
        </View>
      </View>

      {/* ─── Footer Performance Insights (Mini KPIs) ─── */}
      <View style={styles.footerStats}>
        {/* Peak Month */}
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => {
            const peakIdx = points.findIndex((p) => p.month === peakItem.month);
            if (peakIdx >= 0) setSelectedIdx(peakIdx);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.statTop}>
            <Award size={13} color="#059669" />
            <Text style={styles.statLabel}>Peak Month</Text>
          </View>
          <Text style={styles.statValue}>
            {peakItem.month} (₹{peakItem.revenue.toLocaleString('en-IN')})
          </Text>
        </TouchableOpacity>

        {/* Lowest Month */}
        <TouchableOpacity
          style={styles.statCard}
          onPress={() => {
            const lowIdx = points.findIndex((p) => p.month === lowestItem.month);
            if (lowIdx >= 0) setSelectedIdx(lowIdx);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.statTop}>
            <Target size={13} color="#64748b" />
            <Text style={styles.statLabel}>Lowest Month</Text>
          </View>
          <Text style={styles.statValue}>
            {lowestItem.month} (₹{lowestItem.revenue.toLocaleString('en-IN')})
          </Text>
        </TouchableOpacity>

        {/* Monthly Average */}
        <View style={styles.statCard}>
          <View style={styles.statTop}>
            <Sparkles size={13} color="#2563eb" />
            <Text style={styles.statLabel}>Monthly Average</Text>
          </View>
          <Text style={styles.statValue}>
            ₹{avgMonthly.toLocaleString('en-IN')} / mo
          </Text>
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
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 2,
  },
  growthBadgePos: {
    backgroundColor: '#ecfdf5',
  },
  growthBadgeNeg: {
    backgroundColor: '#fef2f2',
  },
  growthText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  growthTextPos: {
    color: '#047857',
  },
  growthTextNeg: {
    color: '#b91c1c',
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontFamily: THEME.fontFamily.regular,
    marginTop: 2,
  },
  totalBadge: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'flex-end',
  },
  totalBadgeLabel: {
    fontSize: 9.5,
    color: THEME.colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  totalBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },

  /* Toolbar */
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fbfcfd',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexWrap: 'wrap',
    gap: 8,
  },
  pillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    padding: 2,
    gap: 2,
  },
  pillBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  pillBtnActive: {
    backgroundColor: '#ffffff',
    elevation: 1,
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  },
  pillText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
    fontFamily: THEME.fontFamily.medium,
  },
  pillTextActive: {
    color: '#0f172a',
    fontWeight: '700',
  },
  toolsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#ffffff',
  },
  toggleBtnActive: {
    borderColor: '#cbd5e1',
    backgroundColor: '#f1f5f9',
  },
  toggleBtnText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748b',
  },
  toggleBtnTextActive: {
    color: '#0f172a',
    fontWeight: '600',
  },
  modeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    padding: 2,
  },
  modeBtn: {
    padding: 4,
    borderRadius: 4,
  },
  modeBtnActive: {
    backgroundColor: '#ffffff',
    elevation: 1,
    boxShadow: '0 1px 2px rgba(0,0,0,0.06)',
  },

  /* Active Point Inspector */
  inspectorBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  inspectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inspectorDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#0f172a',
  },
  inspectorMonth: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  inspectorRevenue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  inspectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  diffBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 2,
  },
  diffBadgePos: {
    backgroundColor: '#ecfdf5',
  },
  diffBadgeNeg: {
    backgroundColor: '#fef2f2',
  },
  diffText: {
    fontSize: 10,
    fontWeight: '600',
  },
  diffTextPos: {
    color: '#047857',
  },
  diffTextNeg: {
    color: '#b91c1c',
  },
  peakTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  peakTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#b45309',
  },
  avgDiffText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },

  /* Body & SVG */
  body: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Footer Stats */
  footerStats: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  statCard: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRightWidth: 1,
    borderRightColor: '#f1f5f9',
  },
  statTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10.5,
    fontWeight: '500',
    color: '#64748b',
  },
  statValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f172a',
  },

  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
  },
});
