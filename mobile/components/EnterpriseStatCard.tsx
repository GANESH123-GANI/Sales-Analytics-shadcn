import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { THEME } from '../constants/theme';
import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react-native';

interface EnterpriseStatCardProps {
  label: string;
  value: string | number;
  icon?: LucideIcon;
  variant?: 'default' | 'alert' | 'warning' | 'success';
  trend?: string;
  trendPositive?: boolean;
  sparklineData?: number[];
  subtitle?: string;
}

export const EnterpriseStatCard: React.FC<EnterpriseStatCardProps> = ({
  label,
  value,
  icon: Icon,
  variant = 'default',
  trend,
  trendPositive = true,
  sparklineData,
  subtitle,
}) => {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isAlert = variant === 'alert';
  const isSuccess = variant === 'success';

  // Generate mini SVG sparkline path
  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length < 2) return null;

    const width = 64;
    const height = 24;
    const min = Math.min(...sparklineData);
    const max = Math.max(...sparklineData);
    const range = max - min || 1;

    const points = sparklineData.map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - 2 - ((val - min) / range) * (height - 4);
      return `${x},${y}`;
    });

    const pathD = `M ${points.join(' L ')}`;
    const strokeColor = isAlert ? '#ef4444' : trendPositive ? '#10b981' : '#64748b';

    return (
      <Svg width={width} height={height} style={styles.sparkline}>
        <Path
          d={pathD}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    );
  };

  return (
    <View style={[styles.card, isMobile && styles.cardMobile, isAlert && styles.cardAlert, isSuccess && styles.cardSuccess]}>
      <View style={styles.headerRow}>
        <Text style={styles.label} numberOfLines={1}>
          {label}
        </Text>
        {Icon && (
          <View style={styles.iconWrap}>
            <Icon size={14} color="#64748b" strokeWidth={2} />
          </View>
        )}
      </View>

      <View style={styles.valueRow}>
        <Text style={[styles.value, isAlert && styles.valueAlert]}>{value}</Text>
        {renderSparkline()}
      </View>

      {(trend || subtitle) && (
        <View style={styles.footerRow}>
          {trend && (
            <View
              style={[
                styles.trendBadge,
                trendPositive ? styles.trendBadgePos : styles.trendBadgeNeg,
              ]}
            >
              {trendPositive ? (
                <ArrowUpRight size={11} color="#047857" strokeWidth={2.5} />
              ) : (
                <ArrowDownRight size={11} color="#b91c1c" strokeWidth={2.5} />
              )}
              <Text
                style={[
                  styles.trendText,
                  trendPositive ? styles.trendTextPos : styles.trendTextNeg,
                ]}
              >
                {trend}
              </Text>
            </View>
          )}
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle || (trendPositive ? 'from previous cycle' : 'requires attention')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    flexBasis: '22%',
    minWidth: 160,
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'space-between',
    elevation: 1,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.03)',
  },
  cardMobile: {
    flexBasis: '46%',
    minWidth: 140,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  cardAlert: {
    borderColor: '#fecaca',
    backgroundColor: '#fffdfd',
  },
  cardSuccess: {
    borderColor: '#bbf7d0',
    backgroundColor: '#fdfffd',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
    color: '#64748b',
    letterSpacing: -0.1,
  },
  iconWrap: {
    width: 22,
    height: 22,
    borderRadius: 5,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    letterSpacing: -0.6,
    color: '#09090b',
  },
  valueAlert: {
    color: '#b91c1c',
  },
  sparkline: {
    marginBottom: 4,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'nowrap',
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 1.5,
  },
  trendBadgePos: {
    backgroundColor: '#ecfdf5',
  },
  trendBadgeNeg: {
    backgroundColor: '#fef2f2',
  },
  trendText: {
    fontSize: 11,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.semibold,
  },
  trendTextPos: {
    color: '#047857',
  },
  trendTextNeg: {
    color: '#b91c1c',
  },
  subtitle: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: THEME.fontFamily.regular,
    flexShrink: 1,
  },
});
