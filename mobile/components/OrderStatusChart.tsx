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
    { color: string; bg: string; text: string; label: string; icon: React.ReactNode }
  > = {
    Completed: {
      color: '#10b981', // Emerald
      bg: THEME.colors.status.completedBg,
      text: THEME.colors.status.completedText,
      label: 'Completed',
      icon: <CheckCircle2 size={12} color="#047857" />,
    },
    Pending: {
      color: '#f59e0b', // Amber
      bg: THEME.colors.status.pendingBg,
      text: THEME.colors.status.pendingText,
      label: 'Pending',
      icon: <Clock size={12} color="#b45309" />,
    },
    Cancelled: {
      color: '#ef4444', // Rose
      bg: THEME.colors.status.cancelledBg,
      text: THEME.colors.status.cancelledText,
      label: 'Cancelled',
      icon: <XCircle size={12} color="#b91c1c" />,
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

  return (
    <View style={styles.card}>
      {/* Uniform Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <PieIcon size={16} color={THEME.colors.textPrimary} strokeWidth={2.4} />
            <Text style={styles.title}>Order Status</Text>
          </View>
          <Text style={styles.subtitle}>Fulfillment & completion breakdown</Text>
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
          <View style={styles.totalBadge}>
            <Text style={styles.totalBadgeText}>{total} Orders</Text>
          </View>
        </View>
      </View>

      {/* Uniform Body */}
      <View style={styles.body}>
        <View style={[styles.contentRow, isNarrow && styles.contentRowNarrow]}>
          {/* Pie / Donut Chart */}
          <View style={styles.chartWrap}>
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
                      strokeWidth={2.5}
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
                    <Text style={styles.statusLabel}>{cfg.label}</Text>
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
});
