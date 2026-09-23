import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import {
  Package,
  ArrowUpRight,
  TrendingUp,
  Tag,
  Layers,
  Sparkles,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { Product } from '../types/sales';

interface TopProductsChartProps {
  products?: Product[];
}

const DEFAULT_TOP_PRODUCTS = [
  { id: 1, name: 'Sony WH-1000XM5 Wireless Headphones', category: 'Electronics', price: 29990, unitsSold: 14, revenue: 419860, stock: 24 },
  { id: 2, name: 'Apple iPad 10th Gen (64GB)', category: 'Electronics', price: 34900, unitsSold: 8, revenue: 279200, stock: 12 },
  { id: 3, name: 'Nike Air Zoom Pegasus 40', category: 'Footwear', price: 10495, unitsSold: 11, revenue: 115445, stock: 18 },
  { id: 4, name: 'Levi\'s 511 Slim Fit Jeans', category: 'Clothing', price: 3499, unitsSold: 16, revenue: 55984, stock: 35 },
  { id: 5, name: 'Atomic Habits Hardcover', category: 'Books', price: 799, unitsSold: 32, revenue: 25568, stock: 45 },
];

export const TopProductsChart: React.FC<TopProductsChartProps> = ({ products = [] }) => {
  const [metric, setMetric] = useState<'revenue' | 'units'>('revenue');
  const [activeIdx, setActiveIdx] = useState<number | null>(0);

  // Normalize product data
  const productList = products.length > 0
    ? products.slice(0, 5).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: p.price,
        unitsSold: p.unitsSold || Math.round(p.revenue / (p.price || 1)) || 10,
        revenue: p.revenue || p.price * 10,
        stock: p.stock || 20,
      }))
    : DEFAULT_TOP_PRODUCTS;

  const sortedList = [...productList].sort((a, b) =>
    metric === 'revenue' ? b.revenue - a.revenue : b.unitsSold - a.unitsSold
  );

  const maxMetricVal = Math.max(
    ...sortedList.map((p) => (metric === 'revenue' ? p.revenue : p.unitsSold)),
    1
  );

  const totalSum = sortedList.reduce(
    (s, c) => s + (metric === 'revenue' ? c.revenue : c.unitsSold),
    0
  );

  const activeProduct = activeIdx !== null && sortedList[activeIdx] ? sortedList[activeIdx] : sortedList[0];

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <View style={styles.iconWrap}>
              <Package size={15} color="#0f172a" strokeWidth={2.4} />
            </View>
            <Text style={styles.title}>Top Revenue Drivers</Text>
          </View>
          <Text style={styles.subtitle}>Best performing catalog items</Text>
        </View>

        {/* Metric Toggle */}
        <View style={styles.toggleWrap}>
          <TouchableOpacity
            style={[styles.toggleBtn, metric === 'revenue' && styles.toggleBtnActive]}
            onPress={() => setMetric('revenue')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, metric === 'revenue' && styles.toggleTextActive]}>
              Revenue (₹)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, metric === 'units' && styles.toggleBtnActive]}
            onPress={() => setMetric('units')}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, metric === 'units' && styles.toggleTextActive]}>
              Units Sold
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Body with Ranked Bars */}
      <View style={styles.body}>
        <View style={styles.list}>
          {sortedList.map((product, idx) => {
            const isSelected = activeIdx === idx;
            const currentVal = metric === 'revenue' ? product.revenue : product.unitsSold;
            const percentage = (currentVal / maxMetricVal) * 100;
            const shareOfTotal = ((currentVal / (totalSum || 1)) * 100).toFixed(1);

            return (
              <TouchableOpacity
                key={product.id || idx}
                style={[styles.itemRow, isSelected && styles.itemRowActive]}
                onPress={() => setActiveIdx(idx)}
                activeOpacity={0.7}
              >
                <View style={styles.itemMeta}>
                  <View style={styles.nameBlock}>
                    <Text style={[styles.rankBadge, isSelected && styles.rankBadgeActive]}>
                      #{idx + 1}
                    </Text>
                    <View style={styles.productTextWrap}>
                      <Text style={[styles.productName, isSelected && styles.productNameActive]} numberOfLines={1}>
                        {product.name}
                      </Text>
                      <View style={styles.subInfoRow}>
                        <Text style={styles.catBadge}>{product.category}</Text>
                        <Text style={styles.priceText}>₹{product.price.toLocaleString('en-IN')}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.valBlock}>
                    <Text style={[styles.valText, isSelected && styles.valTextActive]}>
                      {metric === 'revenue'
                        ? `₹${product.revenue.toLocaleString('en-IN')}`
                        : `${product.unitsSold} units`}
                    </Text>
                    <Text style={styles.shareText}>{shareOfTotal}% share</Text>
                  </View>
                </View>

                {/* Relative Strength Bar */}
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        width: `${Math.max(percentage, 4)}%`,
                        backgroundColor: idx === 0 ? '#0f172a' : isSelected ? '#334155' : '#64748b',
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Product Context Banner */}
        {activeProduct && (
          <View style={styles.productCallout}>
            <View style={styles.calloutLeft}>
              <Sparkles size={13} color="#d97706" />
              <Text style={styles.calloutTitle}>{activeProduct.name}</Text>
            </View>
            <View style={styles.calloutStats}>
              <Text style={styles.calloutStatItem}>
                Stock: <Text style={styles.calloutStatBold}>{activeProduct.stock} left</Text>
              </Text>
              <Text style={styles.calloutStatItem}>
                Unit Price: <Text style={styles.calloutStatBold}>₹{activeProduct.price.toLocaleString('en-IN')}</Text>
              </Text>
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
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: THEME.fontFamily.regular,
    marginTop: 2,
  },
  toggleWrap: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    padding: 2,
  },
  toggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  toggleBtnActive: {
    backgroundColor: '#ffffff',
    elevation: 1,
    ...(Platform.OS === 'web' ? { boxShadow: '0 1px 2px rgba(0,0,0,0.06)' } : {}),
  },
  toggleText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  toggleTextActive: {
    color: '#0f172a',
    fontWeight: '700',
  },
  body: {
    padding: 16,
    gap: 12,
  },
  list: {
    gap: 8,
  },
  itemRow: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  itemRowActive: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  itemMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  nameBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flex: 1,
    marginRight: 10,
  },
  rankBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    marginTop: 1,
  },
  rankBadgeActive: {
    color: '#0f172a',
  },
  productTextWrap: {
    flex: 1,
  },
  productName: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#334155',
    fontFamily: THEME.fontFamily.medium,
  },
  productNameActive: {
    color: '#09090b',
    fontWeight: '700',
  },
  subInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  catBadge: {
    fontSize: 10,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  priceText: {
    fontSize: 10.5,
    color: '#64748b',
  },
  valBlock: {
    alignItems: 'flex-end',
  },
  valText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  valTextActive: {
    color: '#09090b',
  },
  shareText: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 2,
  },
  barTrack: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: 3,
  },
  productCallout: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexWrap: 'wrap',
    gap: 6,
  },
  calloutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  calloutTitle: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#0f172a',
  },
  calloutStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  calloutStatItem: {
    fontSize: 11,
    color: '#64748b',
  },
  calloutStatBold: {
    fontWeight: '700',
    color: '#0f172a',
  },
});
