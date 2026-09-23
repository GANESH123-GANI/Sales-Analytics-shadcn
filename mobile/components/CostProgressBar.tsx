import React from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { Layers } from 'lucide-react-native';
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
  title = 'Sales by category',
  total,
  items,
}) => {
  const maxAmount = Math.max(...items.map((i) => i.amount), 1);
  const calculatedTotal = total ?? items.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <View style={styles.card}>
      {/* Uniform Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <Layers size={16} color={THEME.colors.textPrimary} strokeWidth={2.4} />
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.subtitle}>Volume distributed across product lines</Text>
        </View>

        <View style={styles.totalBadge}>
          <Text style={styles.totalLabel}>
            Total{' '}
            <Text style={styles.totalValue}>
              ₹{calculatedTotal.toLocaleString('en-IN')}
            </Text>
          </Text>
        </View>
      </View>

      {/* Uniform Body */}
      <View style={styles.body}>
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
  totalBadge: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  totalLabel: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
    fontFamily: THEME.fontFamily.regular,
  },
  totalValue: {
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
  },
  body: {
    padding: 16,
  },
  list: {
    gap: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    width: 100,
    fontSize: 13,
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
    backgroundColor: '#f1f5f9',
    borderRadius: THEME.radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: THEME.radius.full,
  },
  percent: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.medium,
    color: THEME.colors.textMuted,
    width: 32,
    textAlign: 'right',
  },
  amount: {
    minWidth: 86,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
  },
});
