import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { Customer } from '../types/sales';
import { Mail, MapPin, Phone, ShoppingBag } from 'lucide-react-native';

interface CustomerCardProps {
  customer: Customer;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer }) => {
  const initials = (customer.name || 'C')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase() || 'C';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.headerText}>
          <Text style={styles.customerName} numberOfLines={1}>
            {customer.name}
          </Text>
          <View style={styles.subInfo}>
            <MapPin size={11} color={THEME.colors.textMuted} />
            <Text style={styles.regionText}>{customer.region}</Text>
          </View>
        </View>

        <View style={styles.ordersBadge}>
          <ShoppingBag size={11} color={THEME.colors.textSecondary} />
          <Text style={styles.ordersCount}>{customer.totalOrders} {customer.totalOrders === 1 ? 'order' : 'orders'}</Text>
        </View>
      </View>

      <View style={styles.contactDetails}>
        <View style={styles.contactItem}>
          <Mail size={12} color={THEME.colors.textMuted} />
          <Text style={styles.contactText} numberOfLines={1}>
            {customer.email}
          </Text>
        </View>

        {customer.phone && (
          <View style={styles.contactItem}>
            <Phone size={12} color={THEME.colors.textMuted} />
            <Text style={styles.contactText}>{customer.phone}</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        <Text style={styles.spendLabel}>Lifetime Spending</Text>
        <Text style={styles.spendValue}>₹{customer.totalSpending.toLocaleString('en-IN')}</Text>
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
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0f172a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerText: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  subInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
  },
  regionText: {
    fontSize: 11,
    color: THEME.colors.textSecondary,
  },
  ordersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: THEME.radius.full,
  },
  ordersCount: {
    fontSize: 11,
    fontWeight: '600',
    color: THEME.colors.textSecondary,
  },
  contactDetails: {
    gap: 4,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    marginVertical: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  contactText: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  spendLabel: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
  },
  spendValue: {
    fontSize: 15,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
});
