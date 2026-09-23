import React from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { THEME } from '../constants/theme';
import { RegionSales } from '../types/sales';
import { MapPin } from 'lucide-react-native';

interface RegionChartProps {
  data: RegionSales[];
}

export const RegionChart: React.FC<RegionChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No region data available</Text>
      </View>
    );
  }

  const maxVal = Math.max(...data.map(d => d.sales), 1);
  const totalSales = data.reduce((acc, curr) => acc + curr.sales, 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sales by Region</Text>
          <Text style={styles.subtitle}>Geographic revenue distribution across India</Text>
        </View>
      </View>

      <View style={styles.listContainer}>
        {data.map((item, index) => {
          const percentage = ((item.sales / maxVal) * 100).toFixed(0);
          const share = ((item.sales / (totalSales || 1)) * 100).toFixed(1);

          return (
            <View key={item.region || index} style={styles.regionRow}>
              <View style={styles.infoRow}>
                <View style={styles.regionTitleWrap}>
                  <MapPin size={13} color={THEME.colors.textSecondary} />
                  <Text style={styles.regionName}>{item.region}</Text>
                </View>
                <View style={styles.amountWrap}>
                  <Text style={styles.amountText}>₹{(item.sales / 1000).toFixed(1)}k</Text>
                  <Text style={styles.percentageText}>{share}%</Text>
                </View>
              </View>

              <View style={styles.track}>
                <View
                  style={[
                    styles.bar,
                    {
                      width: `${percentage}%` as DimensionValue,
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
  listContainer: {
    gap: 12,
  },
  regionRow: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  regionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  regionName: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME.colors.textPrimary,
  },
  amountWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  amountText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  percentageText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    minWidth: 32,
    textAlign: 'right',
  },
  track: {
    height: 7,
    backgroundColor: '#f1f5f9',
    borderRadius: THEME.radius.full,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: '#0f172a', // Clean shadcn slate primary
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
