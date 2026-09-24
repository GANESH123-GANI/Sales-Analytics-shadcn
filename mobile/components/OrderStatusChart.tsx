import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle, Text as SvgText, G } from 'react-native-svg';
import { PieChart as PieIcon, CheckCircle2, Clock, XCircle } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { OrderStatusData } from '../types/sales';

interface OrderStatusChartProps {
  data: OrderStatusData | null;
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  const { width: winWidth } = useWindowDimensions();
  const isNarrow = winWidth < 380;
  const [activeStatus, setActiveStatus] = useState<string | null>(null);
  const [chartType, setChartType] = useState<'pie' | 'donut'>('pie');
  const [activeOpsMetric, setActiveOpsMetric] = useState<'dispatch' | 'sla' | 'transit' | 'dispute' | null>('dispatch');
  const [activeChannel, setActiveChannel] = useState<'express' | 'ground' | 'warehouse' | null>(null);

  if (!data || !data.list || data.list.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <PieIcon size={16} color={THEME.colors.textPrimary} strokeWidth={2.4} />
            <Text style={styles.title}>Order Status</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No order status data</Text>
        </View>
      </View>
    );
  }

  const items = data.list;
  const total = items.reduce((acc, curr) => acc + curr.count, 0) || 1;

  const STATUS_CONFIG: Record<
    string,
    { color: string; bg: string; text: string; label: string; icon: React.ReactNode; revShare: string; avgTicket: string; insight: string }
  > = {
    Completed: {
      color: '#10b981', // Emerald
      bg: THEME.colors.status.completedBg,
      text: THEME.colors.status.completedText,
      label: 'Completed',
      icon: <CheckCircle2 size={12} color="#047857" />,
      revShare: '₹9,72,500 (78.0%)',
      avgTicket: '₹3,828',
      insight: '98.4% delivered within SLA target window. Customer CSAT: 4.9/5.0.',
    },
    Pending: {
      color: '#f59e0b', // Amber
      bg: THEME.colors.status.pendingBg,
      text: THEME.colors.status.pendingText,
      label: 'Pending',
      icon: <Clock size={12} color="#b45309" />,
      revShare: '₹1,95,500 (15.0%)',
      avgTicket: '₹4,072',
      insight: '48 orders in queue. 4 orders nearing the 3:00 PM same-day dispatch cutoff.',
    },
    Cancelled: {
      color: '#ef4444', // Rose
      bg: THEME.colors.status.cancelledBg,
      text: THEME.colors.status.cancelledText,
      label: 'Cancelled',
      icon: <XCircle size={12} color="#b91c1c" />,
      revShare: '₹80,500 (7.0%)',
      avgTicket: '₹3,659',
      insight: '58% caused by address verification mismatch. 100% of refunds settled.',
    },
  };

  const OPS_TELEMETRY = {
    dispatch: {
      title: 'Warehouse Fulfillment Velocity',
      subtitle: 'Real-time order packing and courier handover metrics across regional facilities',
      metrics: [
        { label: 'Hub BLR (South)', value: '2.8 hrs', tag: 'Fastest' },
        { label: 'Hub BOM (West)', value: '3.4 hrs', tag: 'Optimal' },
        { label: 'Hub DEL (North)', value: '4.2 hrs', tag: 'On Target' },
      ],
      footnote: '⚡ 94.2% of orders packed and handed over within the same-day benchmark window.',
    },
    sla: {
      title: 'Carrier Logistics SLA Audit',
      subtitle: 'On-time delivery and doorstep handover compliance across 30-day transport audit',
      metrics: [
        { label: 'BlueDart Air', value: '99.2%', tag: '148 Orders' },
        { label: 'Delhivery Surface', value: '98.6%', tag: '104 Orders' },
        { label: 'Shadowfax Hyper', value: '97.4%', tag: '72 Orders' },
      ],
      footnote: '✅ Zero critical logistics breach escalations reported in the past 7 days.',
    },
    transit: {
      title: 'Active In-Transit Tracking Telemetry',
      subtitle: 'Live courier telemetry and shipment progress for 48 active packages',
      metrics: [
        { label: 'Out for Delivery', value: '31 pkgs', tag: 'Arriving Today' },
        { label: 'Regional Sorting', value: '14 pkgs', tag: 'Hub Processing' },
        { label: 'Line-Haul Freight', value: '3 pkgs', tag: 'Inter-City' },
      ],
      footnote: '🚚 100% of shipments have real-time GPS courier tracking enabled.',
    },
    dispute: {
      title: 'Dispute & Reverse Logistics Audit',
      subtitle: 'Quality control, customer RMA claims, and returns resolution summary',
      metrics: [
        { label: 'RMA Restocked', value: '2 claims', tag: '₹6,800 Settled' },
        { label: 'Inspection Queue', value: '1 claim', tag: '₹4,400 In Review' },
        { label: 'Fraud Risk Flag', value: '0 items', tag: 'Protected' },
      ],
      footnote: '🛡️ Low return rate of 1.2% is well below the maximum 3.5% enterprise allowance.',
    },
  };

  const size = 156;
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = 70;
  const innerRadius = chartType === 'donut' ? 42 : 0;

  // Compute pie/donut slices
  let currentAngle = -90; // Start at 12 o'clock
  const slices = items.map((item) => {
    const ratio = total > 0 ? item.count / total : 0;
    const sweepAngle = Math.max(ratio * 360, 0.001);
    const startAngle = currentAngle;
    const endAngle = currentAngle + sweepAngle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + outerRadius * Math.cos(startRad);
    const y1 = cy + outerRadius * Math.sin(startRad);
    const x2 = cx + outerRadius * Math.cos(endRad);
    const y2 = cy + outerRadius * Math.sin(endRad);

    const largeArcFlag = sweepAngle > 180 ? 1 : 0;

    let pathD = '';
    if (chartType === 'donut') {
      const ix1 = cx + innerRadius * Math.cos(startRad);
      const iy1 = cy + innerRadius * Math.sin(startRad);
      const ix2 = cx + innerRadius * Math.cos(endRad);
      const iy2 = cy + innerRadius * Math.sin(endRad);

      pathD = `M ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${ix1} ${iy1} Z`;
    } else {
      pathD = `M ${cx} ${cy} L ${x1} ${y1} A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
    }

    const midAngle = startAngle + sweepAngle / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const labelRadius = chartType === 'donut' ? (outerRadius + innerRadius) / 2 : outerRadius * 0.62;
    const labelX = cx + labelRadius * Math.cos(midRad);
    const labelY = cy + labelRadius * Math.sin(midRad);

    const percentage = Math.round(ratio * 100);
    const color = STATUS_CONFIG[item.status]?.color || THEME.colors.chart.slate;

    return {
      ...item,
      ratio,
      sweepAngle,
      startAngle,
      endAngle,
      pathD,
      percentage,
      labelX,
      labelY,
      color,
      isSingle: ratio >= 0.999,
    };
  });

  const activeSliceItem = activeStatus ? items.find((i) => i.status === activeStatus) : null;
  const activeConfig = activeStatus ? STATUS_CONFIG[activeStatus] : null;
  const activeOps = activeOpsMetric ? OPS_TELEMETRY[activeOpsMetric] : null;

  return (
    <View style={styles.card}>
      {/* Uniform Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <PieIcon size={16} color={THEME.colors.textPrimary} strokeWidth={2.4} />
            <Text style={styles.title}>Order Status</Text>
            {activeStatus && (
              <View style={styles.activeFilterPill}>
                <Text style={styles.activeFilterPillText}>{activeStatus}</Text>
              </View>
            )}
          </View>
          <Text style={styles.subtitle}>
            {activeStatus
              ? `Inspecting ${activeStatus} orders — click slice or legend to toggle`
              : 'Fulfillment & completion breakdown'}
          </Text>
        </View>

        {/* Total Orders Badge & Type Toggle */}
        <View style={styles.headerRight}>
          <View style={styles.togglePill}>
            <TouchableOpacity
              style={[styles.toggleBtn, chartType === 'pie' && styles.toggleBtnActive]}
              onPress={() => setChartType('pie')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleBtnText, chartType === 'pie' && styles.toggleBtnTextActive]}>
                Pie
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleBtn, chartType === 'donut' && styles.toggleBtnActive]}
              onPress={() => setChartType('donut')}
              activeOpacity={0.7}
            >
              <Text style={[styles.toggleBtnText, chartType === 'donut' && styles.toggleBtnTextActive]}>
                Donut
              </Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.totalBadge}
            onPress={() => setActiveStatus(null)}
            activeOpacity={0.7}
          >
            <Text style={styles.totalBadgeText}>{total} Orders</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Uniform Body */}
      <View style={styles.body}>
        <View style={[styles.contentRow, isNarrow && styles.contentRowNarrow]}>
          {/* Pie / Donut Chart */}
          <View style={styles.chartWrap}>
            <View style={{ width: size, height: size, position: 'relative' }}>
              <Svg width={size} height={size}>
                {slices.map((slice, idx) => {
                  const isHovered = activeStatus === slice.status;
                  const opacity = activeStatus === null || isHovered ? 1 : 0.45;

                  if (slice.isSingle) {
                    return (
                      <Circle
                        key={idx}
                        cx={cx}
                        cy={cy}
                        r={outerRadius}
                        fill={slice.color}
                        opacity={opacity}
                      />
                    );
                  }

                  return (
                    <G
                      key={idx}
                      {...((Platform.OS === 'web'
                        ? {
                            onClick: () =>
                              setActiveStatus(activeStatus === slice.status ? null : slice.status),
                            style: { cursor: 'pointer' },
                          }
                        : {
                            onPress: () =>
                              setActiveStatus(activeStatus === slice.status ? null : slice.status),
                          }) as any)}
                    >
                      <Path
                        d={slice.pathD}
                        fill={slice.color}
                        stroke="#ffffff"
                        strokeWidth={isHovered ? 3.5 : 2.5}
                        strokeLinejoin="round"
                        opacity={opacity}
                      />
                      {slice.percentage >= 15 && (
                        <SvgText
                          x={slice.labelX}
                          y={slice.labelY + 3.5}
                          fontSize={11}
                          fontWeight="700"
                          fill="#ffffff"
                          textAnchor="middle"
                        >
                          {slice.percentage}%
                        </SvgText>
                      )}
                    </G>
                  );
                })}
              </Svg>

              {/* Donut Center Display */}
              {chartType === 'donut' && (
                <View style={styles.donutCenter} pointerEvents="none">
                  <Text style={styles.donutCenterNumber}>
                    {activeSliceItem ? activeSliceItem.count : total}
                  </Text>
                  <Text style={styles.donutCenterLabel}>
                    {activeStatus ? activeStatus : 'Total Orders'}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            {items.map((item, idx) => {
              const cfg =
                STATUS_CONFIG[item.status] || {
                  color: THEME.colors.chart.slate,
                  bg: '#f1f5f9',
                  text: THEME.colors.textPrimary,
                  label: item.status,
                  icon: null,
                  revShare: '',
                  avgTicket: '',
                  insight: '',
                };
              const percentage = ((item.count / total) * 100).toFixed(0);
              const isSelected = activeStatus === item.status;

              return (
                <TouchableOpacity
                  key={idx}
                  style={[
                    styles.legendItem,
                    isSelected && styles.legendItemActive,
                  ]}
                  onPress={() =>
                    setActiveStatus(activeStatus === item.status ? null : item.status)
                  }
                  activeOpacity={0.7}
                >
                  <View style={styles.legendLeft}>
                    <View style={[styles.indicator, { backgroundColor: cfg.color }]} />
                    <Text style={[styles.statusLabel, isSelected && styles.statusLabelActive]}>
                      {cfg.label}
                    </Text>
                  </View>

                  <View style={styles.legendRight}>
                    <Text style={styles.countText}>{item.count}</Text>
                    <View style={[styles.percentageBadge, { backgroundColor: cfg.bg }]}>
                      <Text style={[styles.percentageText, { color: cfg.text }]}>
                        {percentage}%
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Dynamic Status Inspector (Shows when a status is clicked) */}
        {activeStatus && activeConfig && activeSliceItem && (
          <View style={[styles.statusInspector, { borderColor: activeConfig.color }]}>
            <View style={styles.inspectorHeader}>
              <View style={styles.inspectorTitleRow}>
                <View style={[styles.inspectorDot, { backgroundColor: activeConfig.color }]} />
                <Text style={styles.inspectorTitle}>{activeStatus} Orders Telemetry</Text>
                <View style={[styles.inspectorBadge, { backgroundColor: activeConfig.bg }]}>
                  <Text style={[styles.inspectorBadgeText, { color: activeConfig.text }]}>
                    {activeSliceItem.count} Orders ({((activeSliceItem.count / total) * 100).toFixed(1)}%)
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.inspectorCloseBtn}
                onPress={() => setActiveStatus(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.inspectorCloseText}>✕ Clear</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inspectorMetricsRow}>
              <View style={styles.inspectorMetricItem}>
                <Text style={styles.inspectorMetricLabel}>Volume Value</Text>
                <Text style={styles.inspectorMetricVal}>{activeConfig.revShare}</Text>
              </View>
              <View style={styles.inspectorMetricItem}>
                <Text style={styles.inspectorMetricLabel}>Avg Order Ticket</Text>
                <Text style={styles.inspectorMetricVal}>{activeConfig.avgTicket}</Text>
              </View>
              <View style={[styles.inspectorMetricItem, { flex: 1.4 }]}>
                <Text style={styles.inspectorMetricLabel}>Operational Status</Text>
                <Text style={styles.inspectorMetricInsight}>{activeConfig.insight}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Fulfillment Velocity & Operations KPI Strip (Clickable interactive cards) */}
        <View style={styles.opsMetricsSection}>
          <View style={styles.opsHeaderRow}>
            <Text style={styles.opsSectionTitle}>Fulfillment Velocity & Operational Health</Text>
            <Text style={styles.clickHint}>Tap card for live telemetry drilldown</Text>
          </View>

          <View style={styles.opsGrid}>
            <TouchableOpacity
              style={[
                styles.opsCard,
                activeOpsMetric === 'dispatch' && styles.opsCardActive,
              ]}
              onPress={() =>
                setActiveOpsMetric(activeOpsMetric === 'dispatch' ? null : 'dispatch')
              }
              activeOpacity={0.7}
            >
              <View style={styles.opsCardHeader}>
                <Text style={styles.opsLabel}>Avg Dispatch Time</Text>
                {activeOpsMetric === 'dispatch' && <View style={styles.activeDot} />}
              </View>
              <Text style={styles.opsValue}>3.8 hrs</Text>
              <Text style={styles.opsSub}>⚡ Same-Day Target met</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.opsCard,
                activeOpsMetric === 'sla' && styles.opsCardActive,
              ]}
              onPress={() => setActiveOpsMetric(activeOpsMetric === 'sla' ? null : 'sla')}
              activeOpacity={0.7}
            >
              <View style={styles.opsCardHeader}>
                <Text style={styles.opsLabel}>On-Time SLA</Text>
                {activeOpsMetric === 'sla' && <View style={styles.activeDot} />}
              </View>
              <Text style={styles.opsValueGreen}>98.4%</Text>
              <Text style={styles.opsSub}>Standard benchmark: 95%</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.opsCard,
                activeOpsMetric === 'transit' && styles.opsCardActive,
              ]}
              onPress={() =>
                setActiveOpsMetric(activeOpsMetric === 'transit' ? null : 'transit')
              }
              activeOpacity={0.7}
            >
              <View style={styles.opsCardHeader}>
                <Text style={styles.opsLabel}>Active In-Transit</Text>
                {activeOpsMetric === 'transit' && <View style={styles.activeDot} />}
              </View>
              <Text style={styles.opsValue}>48 orders</Text>
              <Text style={styles.opsSub}>Tracking active in network</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.opsCard,
                activeOpsMetric === 'dispute' && styles.opsCardActive,
              ]}
              onPress={() =>
                setActiveOpsMetric(activeOpsMetric === 'dispute' ? null : 'dispute')
              }
              activeOpacity={0.7}
            >
              <View style={styles.opsCardHeader}>
                <Text style={styles.opsLabel}>Dispute / Return</Text>
                {activeOpsMetric === 'dispute' && <View style={styles.activeDot} />}
              </View>
              <Text style={styles.opsValueMuted}>1.2%</Text>
              <Text style={styles.opsSub}>Well below 3.5% threshold</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Operational Telemetry Deep Dive Panel */}
        {activeOps && (
          <View style={styles.telemetryPanel}>
            <View style={styles.telemetryHeader}>
              <View>
                <Text style={styles.telemetryTitle}>{activeOps.title}</Text>
                <Text style={styles.telemetrySubtitle}>{activeOps.subtitle}</Text>
              </View>
              <TouchableOpacity
                style={styles.telemetryClose}
                onPress={() => setActiveOpsMetric(null)}
                activeOpacity={0.7}
              >
                <Text style={styles.telemetryCloseText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.telemetryMetricsRow}>
              {activeOps.metrics.map((m, mIdx) => (
                <View key={mIdx} style={styles.telemetryCard}>
                  <Text style={styles.telemetryMetricLabel}>{m.label}</Text>
                  <Text style={styles.telemetryMetricVal}>{m.value}</Text>
                  <Text style={styles.telemetryTag}>{m.tag}</Text>
                </View>
              ))}
            </View>

            <Text style={styles.telemetryFootnote}>{activeOps.footnote}</Text>
          </View>
        )}

        {/* Fulfillment Channel Summary (Clickable Filter Pills) */}
        <View style={styles.channelBar}>
          <TouchableOpacity
            style={[
              styles.channelItem,
              activeChannel === 'express' && styles.channelItemActive,
            ]}
            onPress={() =>
              setActiveChannel(activeChannel === 'express' ? null : 'express')
            }
            activeOpacity={0.7}
          >
            <View style={[styles.channelDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.channelText}>Express Courier: 218</Text>
            {activeChannel === 'express' && <Text style={styles.channelPercent}> (67.3%)</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.channelItem,
              activeChannel === 'ground' && styles.channelItemActive,
            ]}
            onPress={() =>
              setActiveChannel(activeChannel === 'ground' ? null : 'ground')
            }
            activeOpacity={0.7}
          >
            <View style={[styles.channelDot, { backgroundColor: '#3b82f6' }]} />
            <Text style={styles.channelText}>Standard Ground: 72</Text>
            {activeChannel === 'ground' && <Text style={styles.channelPercent}> (22.2%)</Text>}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.channelItem,
              activeChannel === 'warehouse' && styles.channelItemActive,
            ]}
            onPress={() =>
              setActiveChannel(activeChannel === 'warehouse' ? null : 'warehouse')
            }
            activeOpacity={0.7}
          >
            <View style={[styles.channelDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.channelText}>Warehouse Processing: 34</Text>
            {activeChannel === 'warehouse' && <Text style={styles.channelPercent}> (10.5%)</Text>}
          </TouchableOpacity>
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
    flex: 1,
    height: '100%',
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
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontFamily: THEME.fontFamily.regular,
    marginTop: 2,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  togglePill: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    padding: 2,
    gap: 1,
  },
  toggleBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 3,
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 1,
    elevation: 1,
  },
  toggleBtnText: {
    fontSize: 10.5,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
  },
  toggleBtnTextActive: {
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  totalBadge: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 4,
  },
  totalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  body: {
    padding: 16,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  contentRowNarrow: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  legendContainer: {
    flex: 1,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  legendItemActive: {
    backgroundColor: '#f1f5f9',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 9,
    height: 9,
    borderRadius: 2,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  percentageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    minWidth: 36,
    alignItems: 'center',
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
  },
  opsMetricsSection: {
    marginTop: 14,
    gap: 8,
  },
  opsSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: THEME.fontFamily.semibold,
  },
  opsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  opsCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    gap: 2,
  },
  opsLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  opsValue: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  opsValueGreen: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#047857',
  },
  opsValueMuted: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#64748b',
  },
  opsSub: {
    fontSize: 9.5,
    color: '#64748b',
    marginTop: 2,
  },
  channelBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  statusLabelActive: {
    color: '#0f172a',
    fontWeight: '700',
  },
  activeFilterPill: {
    backgroundColor: '#0f172a',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
    marginLeft: 4,
  },
  activeFilterPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#ffffff',
  },
  donutCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutCenterNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: THEME.fontFamily.bold,
  },
  donutCenterLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748b',
    marginTop: -2,
    textTransform: 'uppercase',
  },
  statusInspector: {
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
    borderRadius: 6,
    padding: 10,
    marginTop: 12,
    gap: 8,
  },
  inspectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  inspectorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  inspectorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  inspectorTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  inspectorBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inspectorBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  inspectorCloseBtn: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
  },
  inspectorCloseText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  inspectorMetricsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  inspectorMetricItem: {
    flex: 1,
    minWidth: 90,
  },
  inspectorMetricLabel: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#64748b',
    marginBottom: 2,
  },
  inspectorMetricVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  inspectorMetricInsight: {
    fontSize: 11,
    fontWeight: '500',
    color: '#334155',
    lineHeight: 15,
  },
  opsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  clickHint: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '500',
  },
  opsCardActive: {
    borderColor: '#0f172a',
    backgroundColor: '#f8fafc',
    borderWidth: 1.5,
  },
  opsCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563eb',
  },
  telemetryPanel: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 6,
    padding: 10,
    marginTop: 8,
    gap: 8,
  },
  telemetryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  telemetryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  telemetrySubtitle: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 1,
  },
  telemetryClose: {
    padding: 4,
  },
  telemetryCloseText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748b',
  },
  telemetryMetricsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  telemetryCard: {
    flex: 1,
    minWidth: 90,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 4,
    padding: 6,
  },
  telemetryMetricLabel: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '500',
  },
  telemetryMetricVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  telemetryTag: {
    fontSize: 9,
    color: '#047857',
    fontWeight: '600',
    marginTop: 1,
  },
  telemetryFootnote: {
    fontSize: 10.5,
    color: '#334155',
    fontWeight: '500',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  channelItemActive: {
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  channelPercent: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  channelItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  channelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  channelText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
});
