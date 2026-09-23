import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { THEME } from '../constants/theme';
import { OrderStatusData } from '../types/sales';

interface OrderStatusChartProps {
  data: OrderStatusData | null;
}

export const OrderStatusChart: React.FC<OrderStatusChartProps> = ({ data }) => {
  if (!data || !data.list || data.list.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No order status data</Text>
      </View>
    );
  }

  const items = data.list;
  const total = items.reduce((acc, curr) => acc + curr.count, 0) || 1;

  const size = 160;
  const strokeWidth = 22;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const STATUS_CONFIG: Record<
    string,
    { color: string; bg: string; text: string; label: string }
  > = {
    Completed: {
      color: '#10b981', // Emerald
      bg: THEME.colors.status.completedBg,
      text: THEME.colors.status.completedText,
      label: 'Completed',
    },
    Pending: {
      color: '#f59e0b', // Amber
      bg: THEME.colors.status.pendingBg,
      text: THEME.colors.status.pendingText,
      label: 'Pending',
    },
    Cancelled: {
      color: '#ef4444', // Rose
      bg: THEME.colors.status.cancelledBg,
      text: THEME.colors.status.cancelledText,
      label: 'Cancelled',
    },
  };

  let currentAngle = -90; // start from top
  const segments = items.map((item) => {
    const ratio = total > 0 ? item.count / total : 0;
    const startAngle = currentAngle;
    currentAngle += ratio * 360;
    const strokeDashoffset = circumference * (1 - ratio);
    const color = STATUS_CONFIG[item.status]?.color || THEME.colors.chart.slate;
    // Transform string avoids react-native-svg rotation/origin props that
    // emit invalid CSS `transform-origin` on web
    const transform = `rotate(${startAngle}, ${center}, ${center})`;
    return { ...item, ratio, strokeDashoffset, color, transform };
  });

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Order Status</Text>
      </View>

      <View style={styles.contentRow}>
        <View style={styles.donutWrap}>
          <Svg width={size} height={size}>
            <Circle
              cx={center}
              cy={center}
              r={radius}
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
              fill="transparent"
            />

            {segments.map((seg, idx) => (
              <Circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${circumference} ${circumference}`}
                strokeDashoffset={seg.strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                transform={seg.transform}
              />
            ))}
          </Svg>

          <View style={styles.donutCenter}>
            <Text style={styles.totalNumber}>{total}</Text>
            <Text style={styles.totalLabel}>Orders</Text>
          </View>
        </View>

        <View style={styles.legendContainer}>
          {items.map((item, idx) => {
            const cfg =
              STATUS_CONFIG[item.status] || {
                color: THEME.colors.chart.slate,
                bg: '#f1f5f9',
                text: THEME.colors.textPrimary,
                label: item.status,
              };
            const percentage = ((item.count / total) * 100).toFixed(0);

            return (
              <View key={idx} style={styles.legendItem}>
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
              </View>
            );
          })}
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
    padding: 12,
    ...THEME.shadow.card,
  },
  header: {
    marginBottom: 10,
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
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  donutWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  totalLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  legendContainer: {
    flex: 1,
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  legendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: THEME.colors.textPrimary,
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countText: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  percentageBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 0,
  },
  percentageText: {
    fontSize: 11,
    fontWeight: '600',
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
