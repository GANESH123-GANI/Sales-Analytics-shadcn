import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { THEME } from '../constants/theme';
import { LucideIcon } from 'lucide-react-native';

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  badge?: string;
  isPositiveTrend?: boolean;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  isPositiveTrend = true,
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{title}</Text>
        {Icon && (
          <View style={styles.iconContainer}>
            <Icon size={15} color={THEME.colors.textSecondary} />
          </View>
        )}
      </View>

      <Text style={styles.value}>{value}</Text>

      {(subtitle || badge) && (
        <View style={styles.footerRow}>
          {badge && (
            <View
              style={[
                styles.badge,
                isPositiveTrend ? styles.positiveBadge : styles.neutralBadge,
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  isPositiveTrend ? styles.positiveBadgeText : styles.neutralBadgeText,
                ]}
              >
                {badge}
              </Text>
            </View>
          )}
          {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </View>
      )}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: THEME.fontSize.base,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
    color: THEME.colors.textSecondary,
    letterSpacing: 0.1,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: THEME.fontSize['3xl'],
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
    marginVertical: 2,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  badge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: THEME.fontSize.xs,
    fontFamily: THEME.fontFamily.semibold,
  },
  positiveBadge: {
    backgroundColor: THEME.colors.status.completedBg,
    borderColor: THEME.colors.status.completedBorder,
  },
  positiveBadgeText: {
    fontWeight: '600',
    color: THEME.colors.status.completedText,
  },
  neutralBadge: {
    backgroundColor: THEME.colors.secondary,
    borderColor: THEME.colors.border,
  },
  neutralBadgeText: {
    fontWeight: '500',
    color: THEME.colors.textSecondary,
  },
  subtitle: {
    fontSize: THEME.fontSize.xs,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textMuted,
    flexShrink: 1,
  },
});
