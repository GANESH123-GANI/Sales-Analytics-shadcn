import React, { useState } from 'react';
import { View, Text, StyleSheet, DimensionValue, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { RegionSales } from '../types/sales';
import { MapPin, Sparkles, TrendingUp, Award } from 'lucide-react-native';

interface RegionChartProps {
  data: RegionSales[];
}

export const RegionChart: React.FC<RegionChartProps> = ({ data = [] }) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(0);

  if (!data || data.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={styles.iconWrap}>
              <MapPin size={15} color="#0f172a" strokeWidth={2.4} />
            </View>
            <Text style={styles.title}>Sales by Region</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No regional data available</Text>
        </View>
      </View>
    );
  }

  const sortedData = [...data].sort((a, b) => b.sales - a.sales);
  const maxVal = Math.max(...sortedData.map((d) => d.sales), 1);
  const totalSales = sortedData.reduce((acc, curr) => acc + curr.sales, 0);

  const activeItem =
    selectedIdx !== null && sortedData[selectedIdx]
      ? sortedData[selectedIdx]
      : sortedData[0];

  const getRankBadgeStyle = (idx: number) => {
    if (idx === 0) return styles.rankGold;
    if (idx === 1) return styles.rankSilver;
    if (idx === 2) return styles.rankBronze;
    return styles.rankDefault;
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <View style={styles.iconWrap}>
              <MapPin size={15} color="#0f172a" strokeWidth={2.4} />
            </View>
            <Text style={styles.title}>Geographic Revenue</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{sortedData.length} Hubs</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Regional distribution and market density</Text>
        </View>

        <View style={styles.totalBadge}>
          <Text style={styles.totalLabel}>Top Territory</Text>
          <Text style={styles.totalValue}>{sortedData[0]?.region || 'N/A'}</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        <View style={styles.listContainer}>
          {sortedData.map((item, index) => {
            const isSelected = selectedIdx === index;
            const percentage = ((item.sales / maxVal) * 100).toFixed(0);
            const share = ((item.sales / (totalSales || 1)) * 100).toFixed(1);

            return (
              <TouchableOpacity
                key={item.region || index}
                style={[styles.regionRow, isSelected && styles.regionRowActive]}
                onPress={() => setSelectedIdx(index)}
                activeOpacity={0.7}
              >
                <View style={styles.infoRow}>
                  <View style={styles.regionTitleWrap}>
                    <View style={[styles.rankTag, getRankBadgeStyle(index)]}>
                      <Text style={[styles.rankText, isSelected && styles.rankTextActive]}>
                        #{index + 1}
                      </Text>
                    </View>
                    <Text style={[styles.regionName, isSelected && styles.regionNameActive]}>
                      {item.region}
                    </Text>
                  </View>

                  <View style={styles.amountWrap}>
                    <Text style={[styles.amountText, isSelected && styles.amountTextActive]}>
                      ₹{item.sales.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.percentageText}>{share}% share</Text>
                  </View>
                </View>

                {/* Relative progress bar */}
                <View style={styles.track}>
                  <View
                    style={[
                      styles.bar,
                      {
                        width: `${Math.max(Number(percentage), 4)}%` as DimensionValue,
                        backgroundColor:
                          index === 0
                            ? '#0f172a'
                            : isSelected
                            ? '#334155'
                            : '#64748b',
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Hub Insights Banner */}
        {activeItem && (
          <View style={styles.callout}>
            <View style={styles.calloutHeader}>
              <Award size={13} color="#0f172a" />
              <Text style={styles.calloutTitle}>{activeItem.region} Performance Hub</Text>
            </View>
            <View style={styles.calloutGrid}>
              <View style={styles.calloutCol}>
                <Text style={styles.calloutLabel}>Gross Revenue</Text>
                <Text style={styles.calloutVal}>₹{activeItem.sales.toLocaleString('en-IN')}</Text>
              </View>
              <View style={styles.calloutCol}>
                <Text style={styles.calloutLabel}>Territory Share</Text>
                <Text style={styles.calloutVal}>
                  {((activeItem.sales / (totalSales || 1)) * 100).toFixed(1)}% of total
                </Text>
              </View>
              <View style={styles.calloutCol}>
                <Text style={styles.calloutLabel}>Status</Text>
                <Text style={styles.calloutValGreen}>
                  {selectedIdx === 0 ? 'Top Performer' : 'Stable Growth'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    flex: 1,
    height: '100%',
    ...THEME.shadow.card,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerLeft: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 24,
    height: 24,
    borderRadius: 5,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.semibold,
    color: '#09090b',
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#475569',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
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
  totalLabel: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
  body: {
    padding: 16,
    gap: 12,
  },
  listContainer: {
    gap: 8,
  },
  regionRow: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#ffffff',
  },
  regionRowActive: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  regionTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rankTag: {
    width: 22,
    height: 18,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankGold: { backgroundColor: '#fef3c7' },
  rankSilver: { backgroundColor: '#f1f5f9' },
  rankBronze: { backgroundColor: '#fed7aa' },
  rankDefault: { backgroundColor: '#f8fafc' },
  rankText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
  },
  rankTextActive: {
    color: '#0f172a',
  },
  regionName: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#334155',
    fontFamily: THEME.fontFamily.medium,
  },
  regionNameActive: {
    color: '#09090b',
    fontWeight: '700',
  },
  amountWrap: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  amountTextActive: {
    color: '#09090b',
  },
  percentageText: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 1,
  },
  track: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 3,
  },
  callout: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
    marginTop: 4,
  },
  calloutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  calloutTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  calloutGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calloutCol: {
    flex: 1,
  },
  calloutLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 2,
  },
  calloutVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#09090b',
  },
  calloutValGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
  },
});
