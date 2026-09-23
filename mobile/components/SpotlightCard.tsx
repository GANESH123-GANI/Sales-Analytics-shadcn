import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { THEME } from '../constants/theme';
import { Package, MoreHorizontal, TrendingUp, DollarSign, Award, Layers, Percent } from 'lucide-react-native';

interface SpotlightCardProps {
  id?: string;
  title: string;
  subtitle?: string;
  category?: string;
  unitsSold?: number;
  revenue?: number;
  stock?: number;
  margin?: number;
  onPressAction?: () => void;
}

export const SpotlightCard: React.FC<SpotlightCardProps> = ({
  id = 'PRD-001',
  title,
  subtitle = 'Top Performer',
  category = 'Electronics',
  unitsSold = 240,
  revenue = 345000,
  stock = 120,
  margin = 28,
  onPressAction,
}) => {
  const avgPrice = unitsSold > 0 ? Math.round(revenue / unitsSold) : 0;
  const reorderLevel = stock < 50 ? 'Low — reorder soon' : stock < 100 ? 'Moderate' : 'Adequate';
  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.idText}>{id}</Text>
          <Text style={styles.titleText} numberOfLines={1}>{title}</Text>
        </View>
        <TouchableOpacity style={styles.menuButton} activeOpacity={0.7}>
          <MoreHorizontal size={16} color={THEME.colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Visual illustration / badge */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Award size={32} color={THEME.colors.textPrimary} />
        </View>
        <View style={styles.subtitleBadge}>
          <Text style={styles.subtitleBadgeText}>{subtitle}</Text>
        </View>
      </View>

      {/* Stats list */}
      <View style={styles.statsList}>
        <View style={styles.statRow}>
          <View style={styles.statLeft}>
            <Package size={13} color={THEME.colors.textMuted} />
            <Text style={styles.statLabel}>Category</Text>
          </View>
          <Text style={styles.statValue}>{category}</Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statLeft}>
            <TrendingUp size={13} color={THEME.colors.textMuted} />
            <Text style={styles.statLabel}>Units sold</Text>
          </View>
          <Text style={styles.statValue}>{unitsSold.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statLeft}>
            <DollarSign size={13} color={THEME.colors.textMuted} />
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <Text style={styles.statValueHighlight}>₹{revenue.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statLeft}>
            <Layers size={13} color={THEME.colors.textMuted} />
            <Text style={styles.statLabel}>Stock on hand</Text>
          </View>
          <Text style={[styles.statValue, stock < 50 && { color: THEME.colors.status.cancelledText }]}>
            {stock} units
          </Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statLeft}>
            <Percent size={13} color={THEME.colors.textMuted} />
            <Text style={styles.statLabel}>Margin</Text>
          </View>
          <Text style={styles.statValue}>{margin}%</Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statLeft}>
            <DollarSign size={13} color={THEME.colors.textMuted} />
            <Text style={styles.statLabel}>Avg. price</Text>
          </View>
          <Text style={styles.statValue}>₹{avgPrice.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statLeft}>
            <TrendingUp size={13} color={THEME.colors.textMuted} />
            <Text style={styles.statLabel}>Reorder level</Text>
          </View>
          <Text style={[
            styles.statValue,
            stock < 50 && { color: THEME.colors.status.cancelledText },
            stock >= 50 && stock < 100 && { color: THEME.colors.status.pendingText },
          ]}>{reorderLevel}</Text>
        </View>
      </View>

      {/* Dark Action Button */}
      <TouchableOpacity
        style={styles.actionButton}
        onPress={onPressAction}
        activeOpacity={0.85}
      >
        <Text style={styles.actionButtonText}>Open profile</Text>
      </TouchableOpacity>
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
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  idText: {
    fontSize: THEME.fontSize.md,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
    letterSpacing: -0.2,
  },
  titleText: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
    fontWeight: '400',
    fontFamily: THEME.fontFamily.regular,
  },
  menuButton: {
    padding: 4,
    marginLeft: 8,
    borderRadius: THEME.radius.sm,
  },
  iconContainer: {
    alignItems: 'center',
    marginVertical: 14,
    gap: 8,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: THEME.radius.xl,
    backgroundColor: THEME.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  subtitleBadge: {
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  subtitleBadgeText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textSecondary,
  },
  statsList: {
    gap: 8,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle,
    paddingTop: 12,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statLabel: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
    fontFamily: THEME.fontFamily.regular,
  },
  statValue: {
    fontSize: THEME.fontSize.base,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
  statValueHighlight: {
    fontSize: THEME.fontSize.base,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
  },
  actionButton: {
    backgroundColor: THEME.colors.buttonDark,
    borderRadius: THEME.radius.md,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: THEME.colors.primaryForeground,
    fontSize: THEME.fontSize.base,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
  },
});
