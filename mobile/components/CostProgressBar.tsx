import React from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { THEME } from '../constants/theme';

interface CategoryCostItem {
  label: string;
  amount: number;
}

interface CostProgressBarProps {
  title?: string;
  total?: number;
  items: CategoryCostItem[];
}

const BAR_COLORS = [
  THEME.colors.chart.slate,
  THEME.colors.chart.blue,
  THEME.colors.chart.indigo,
  THEME.colors.chart.teal,
  THEME.colors.chart.emerald,
  THEME.colors.chart.amber,
  THEME.colors.chart.purple,
];

export const CostProgressBar: React.FC<CostProgressBarProps> = ({
  title = 'Recorded sales',
  total,
  items,
}) => {
  const maxAmount = Math.max(...items.map((i) => i.amount), 1);
  const calculatedTotal = total ?? items.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.totalText}>
          Total{' '}
          <Text style={styles.totalValue}>
            ₹{calculatedTotal.toLocaleString('en-IN')}
          </Text>
        </Text>
      </View>

      <View style={styles.list}>
        {items.map((item, index) => {
          const percent = Math.min(Math.max(Math.round((item.amount / maxAmount) * 100), 6), 100);
          const barColor = BAR_COLORS[index % BAR_COLORS.length];
          return (
            <View key={index} style={styles.row}>
              <Text style={styles.label} numberOfLines={1}>
                {item.label}
              </Text>
              <View style={styles.trackWrapper}>
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${percent}%` as DimensionValue,
                        backgroundColor: barColor,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.percent}>{percent}%</Text>
              </View>
              <Text style={styles.amount}>₹{item.amount.toLocaleString('en-IN')}</Text>
            </View>
          );
        })}
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
    padding: 16,
    ...THEME.shadow.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
  totalText: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
    fontFamily: THEME.fontFamily.regular,
  },
  totalValue: {
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
  },
  list: {
    gap: 19.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 0,
  },
  label: {
    width: 96,
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
  },
  trackWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 10,
    gap: 6,
  },
  track: {
    flex: 1,
    height: 8,
    backgroundColor: THEME.colors.secondary,
    borderRadius: THEME.radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: THEME.radius.full,
  },
  percent: {
    fontSize: THEME.fontSize.xs,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
    color: THEME.colors.textMuted,
    width: 32,
    textAlign: 'right',
  },
  amount: {
    minWidth: 82,
    textAlign: 'right',
    fontSize: THEME.fontSize.base,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
  },
});
