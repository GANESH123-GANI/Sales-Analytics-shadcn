import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { Product } from '../types/sales';
import { Package, TrendingUp, DollarSign } from 'lucide-react-native';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isLowStock = product.stock <= 40;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <Text style={styles.productName} numberOfLines={1}>
            {product.name}
          </Text>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.category}</Text>
          </View>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{product.price.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <Package size={13} color={THEME.colors.textMuted} />
            <Text style={styles.metricLabel}>In Stock</Text>
          </View>
          <Text style={[styles.metricValue, isLowStock && styles.lowStockValue]}>
            {product.stock} units
          </Text>
        </View>

        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <TrendingUp size={13} color={THEME.colors.textMuted} />
            <Text style={styles.metricLabel}>Units Sold</Text>
          </View>
          <Text style={styles.metricValue}>{product.unitsSold}</Text>
        </View>

        <View style={styles.metricBox}>
          <View style={styles.metricHeader}>
            <DollarSign size={13} color={THEME.colors.textMuted} />
            <Text style={styles.metricLabel}>Revenue</Text>
          </View>
          <Text style={styles.metricValue}>₹{(product.revenue / 1000).toFixed(0)}k</Text>
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
    padding: 14,
    marginBottom: 10,
    ...THEME.shadow.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  titleWrap: {
    flex: 1,
    paddingRight: 8,
  },
  productName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    marginBottom: 4,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: THEME.radius.sm,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '500',
    color: THEME.colors.textSecondary,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: 8,
    borderTopWidth: 1,
    borderColor: '#f1f5f9',
    paddingTop: 10,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: THEME.radius.sm,
    padding: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  metricHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  lowStockValue: {
    color: THEME.colors.status.pendingText,
  },
});
