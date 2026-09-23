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
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <MapPin size={16} color={THEME.colors.textPrimary} strokeWidth={2.4} />
            <Text style={styles.title}>Sales by Region</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No region data available</Text>
        </View>
      </View>
    );
  }

  const maxVal = Math.max(...data.map((d) => d.sales), 1);
  const totalSales = data.reduce((acc, curr) => acc + curr.sales, 0);

  return (
    <View style={styles.card}>
      {/* Uniform Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <MapPin size={16} color={THEME.colors.textPrimary} strokeWidth={2.4} />
            <Text style={styles.title}>Sales by Region</Text>
          </View>
          <Text style={styles.subtitle}>Geographic revenue distribution across India</Text>
        </View>

        <View style={styles.regionCountBadge}>
          <Text style={styles.regionCountText}>{data.length} Regions</Text>
        </View>
      </View>

      {/* Uniform Body */}
      <View style={styles.body}>
        <View style={styles.listContainer}>
          {data.map((item, index) => {
            const percentage = ((item.sales / maxVal) * 100).toFixed(0);
            const share = ((item.sales / (totalSales || 1)) * 100).toFixed(1);

            return (
              <View key={item.region || index} style={styles.regionRow}>
                <View style={styles.infoRow}>
                  <View style={styles.regionTitleWrap}>
                    <Text style={styles.regionRank}>#{index + 1}</Text>
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
                        backgroundColor: index === 0 ? '#0f172a' : '#334155',
                      },
                    ]}
                  />
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
  regionCountBadge: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  regionCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  body: {
    padding: 16,
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
  regionRank: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textMuted,
    minWidth: 18,
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
