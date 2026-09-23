import React from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { THEME } from '../constants/theme';
import { CategorySales } from '../types/sales';

interface CategoryChartProps {
  data: CategorySales[];
}

const CATEGORY_COLORS = [
  '#2563eb', // Blue
  '#0d9488', // Teal
  '#7c3aed', // Purple
  '#ea580c', // Orange
  '#059669', // Emerald
];

export const CategoryChart: React.FC<CategoryChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No category sales data</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data.map(d => d.sales), 1);
  const totalSales = data.reduce((acc, curr) => acc + curr.sales, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sales by Category</Text>
          <Text style={styles.subtitle}>Volume distributed across product lines</Text>
        </View>
      </View>

      <View style={styles.barsContainer}>
        {data.map((item, index) => {
          const percentage = ((item.sales / maxVal) * 100).toFixed(0);
          const share = ((item.sales / (totalSales || 1)) * 100).toFixed(1);
          const barColor = CATEGORY_COLORS[index % CATEGORY_COLORS.length];

          return (
            <View key={item.category || index} style={styles.row}>
              <View style={styles.labelRow}>
                <View style={styles.categoryBadge}>
                  <View style={[styles.dot, { backgroundColor: barColor }]} />
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {item.category}
                  </Text>
                </View>
                <View style={styles.valueRow}>
                  <Text style={styles.salesValue}>₹{item.sales.toLocaleString('en-IN')}</Text>
                  <Text style={styles.shareText}>({share}%)</Text>
                </View>
              </View>

              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${percentage}%` as DimensionValue,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              </View>
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
    marginBottom: 16,
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
  barsContainer: {
    gap: 14,
  },
  row: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  salesValue: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  shareText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
  },
  track: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: THEME.radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: THEME.radius.full,
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
