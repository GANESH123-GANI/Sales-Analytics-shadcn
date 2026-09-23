import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { LucideIcon } from 'lucide-react-native';

interface EnterpriseStatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: 'default' | 'alert' | 'warning' | 'success';
}

export const EnterpriseStatCard: React.FC<EnterpriseStatCardProps> = ({
  label,
  value,
  icon: Icon,
  variant = 'default',
}) => {
  const isAlert   = variant === 'alert';
  const isWarning = variant === 'warning';
  const isSuccess = variant === 'success';

  const accentColor = isAlert
    ? THEME.colors.destructive
    : isWarning
    ? THEME.colors.chart.amber
    : isSuccess
    ? THEME.colors.chart.emerald
    : THEME.colors.textSecondary;

  const valueColor = isAlert ? THEME.colors.status.cancelledText : THEME.colors.textPrimary;

  const iconBg = isAlert
    ? THEME.colors.status.cancelledBg
    : isSuccess
    ? THEME.colors.status.successBg
    : THEME.colors.secondary;

  return (
    <View style={[styles.card, isAlert && styles.cardAlert, isSuccess && styles.cardSuccess]}>
      <View style={styles.content}>
        <View style={styles.labelRow}>
          {Icon && (
            <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
              <Icon size={13} color={accentColor} />
            </View>
          )}
          <Text style={styles.label} numberOfLines={1}>{label}</Text>
        </View>
        <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexBasis: '22%',
    minWidth: 0,
    minHeight: 88,
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
    ...THEME.shadow.card,
  },
  cardAlert: {
    borderColor: THEME.colors.status.cancelledBorder,
    backgroundColor: THEME.colors.status.cancelledBg,
  },
  cardSuccess: {
    borderColor: THEME.colors.status.successBorder,
    backgroundColor: THEME.colors.status.successBg,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: THEME.radius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textSecondary,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
    letterSpacing: -0.1,
    flexShrink: 1,
  },
  value: {
    fontSize: THEME.fontSize['4xl'],
    fontWeight: '700',
    letterSpacing: -1,
    lineHeight: 34,
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
  },
});
