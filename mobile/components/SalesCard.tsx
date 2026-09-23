import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { THEME } from '../constants/theme';
import { Sale } from '../types/sales';
import { Calendar, MapPin, Tag } from 'lucide-react-native';

interface SalesCardProps {
  sale: Sale;
}

export const SalesCard: React.FC<SalesCardProps> = ({ sale }) => {
  const isCompleted = sale.status === 'Completed';
  const isPending = sale.status === 'Pending';

  const badgeStyle = isCompleted
    ? styles.completedBadge
    : isPending
    ? styles.pendingBadge
    : styles.cancelledBadge;

  const badgeTextStyle = isCompleted
    ? styles.completedText
    : isPending
    ? styles.pendingText
    : styles.cancelledText;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.leftHeader}>
          <View style={styles.idBadge}>
            <Text style={styles.idText}>#{String(sale.id).padStart(3, '0')}</Text>
          </View>
          <Text style={styles.customerName} numberOfLines={1}>
            {sale.customer}
          </Text>
        </View>

        <View style={[styles.statusBadge, badgeStyle]}>
          <Text style={[styles.statusText, badgeTextStyle]}>{sale.status}</Text>
        </View>
      </View>

      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Calendar size={13} color={THEME.colors.textMuted} />
          <Text style={styles.detailText}>{sale.date}</Text>
        </View>

        <View style={styles.detailItem}>
          <MapPin size={13} color={THEME.colors.textMuted} />
          <Text style={styles.detailText}>{sale.region}</Text>
        </View>

        <View style={styles.detailItem}>
          <Tag size={13} color={THEME.colors.textMuted} />
          <Text style={styles.detailText}>{sale.itemsCount} {sale.itemsCount === 1 ? 'item' : 'items'}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.amountLabel}>Total Amount</Text>
        <Text style={styles.amountValue}>₹{sale.amount.toLocaleString('en-IN')}</Text>
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
    alignItems: 'center',
    marginBottom: 10,
  },
  leftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  idBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: THEME.radius.sm,
  },
  idText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    flex: 1,
    fontFamily: THEME.fontFamily.sans,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  completedBadge: {
    backgroundColor: THEME.colors.status.completedBg,
    borderColor: THEME.colors.status.completedBorder,
  },
  completedText: {
    color: THEME.colors.status.completedText,
  },
  pendingBadge: {
    backgroundColor: THEME.colors.status.pendingBg,
    borderColor: THEME.colors.status.pendingBorder,
  },
  pendingText: {
    color: THEME.colors.status.pendingText,
  },
  cancelledBadge: {
    backgroundColor: THEME.colors.status.cancelledBg,
    borderColor: THEME.colors.status.cancelledBorder,
  },
  cancelledText: {
    color: THEME.colors.status.cancelledText,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginVertical: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontFamily: THEME.fontFamily.sans,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  amountLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontFamily: THEME.fontFamily.sans,
  },
  amountValue: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
    fontFamily: THEME.fontFamily.sans,
  },
});
