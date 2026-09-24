import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Target, TrendingUp, CheckCircle, AlertCircle, Sparkles } from 'lucide-react-native';
import { THEME } from '../constants/theme';

interface RevenueForecastCardProps {
  currentRevenue?: number;
  annualTarget?: number;
  projectedRevenue?: number;
}

export const RevenueForecastCard: React.FC<RevenueForecastCardProps> = ({
  currentRevenue = 898634,
  annualTarget = 1200000,
  projectedRevenue = 1140000,
}) => {
  const achievedPercent = Math.min(Math.round((currentRevenue / annualTarget) * 100), 100);
  const projectedPercent = Math.min(Math.round((projectedRevenue / annualTarget) * 100), 100);
  const pacingRate = ((projectedRevenue / annualTarget) * 100).toFixed(1);
  const isOnTrack = parseFloat(pacingRate) >= 90;

  const remainingToTarget = Math.max(annualTarget - currentRevenue, 0);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <View style={styles.iconWrap}>
              <Target size={15} color="#0f172a" strokeWidth={2.4} />
            </View>
            <Text style={styles.title}>Target & Run-Rate Forecast</Text>
            <View
              style={[
                styles.pacingBadge,
                isOnTrack ? styles.pacingBadgeOn : styles.pacingBadgeOff,
              ]}
            >
              <Sparkles size={11} color={isOnTrack ? '#047857' : '#b45309'} />
              <Text
                style={[
                  styles.pacingText,
                  isOnTrack ? styles.pacingTextOn : styles.pacingTextOff,
                ]}
              >
                {pacingRate}% Pacing
              </Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Annual benchmark pacing & year-end projection</Text>
        </View>

        <View style={styles.targetBadge}>
          <Text style={styles.targetLabel}>Annual Target</Text>
          <Text style={styles.targetValue}>₹{(annualTarget / 100000).toFixed(1)}L</Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Metric Comparison Values */}
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.colLabel}>Current Revenue</Text>
            <Text style={styles.colValue}>₹{currentRevenue.toLocaleString('en-IN')}</Text>
            <Text style={styles.colSub}>{achievedPercent}% of target</Text>
          </View>

          <View style={styles.statColDivider} />

          <View style={styles.statCol}>
            <Text style={styles.colLabel}>Projected EOY</Text>
            <Text style={styles.colValueProj}>₹{projectedRevenue.toLocaleString('en-IN')}</Text>
            <Text style={styles.colSub}>Expected outcome</Text>
          </View>

          <View style={styles.statColDivider} />

          <View style={styles.statCol}>
            <Text style={styles.colLabel}>Gap to Target</Text>
            <Text style={styles.colValueGap}>₹{remainingToTarget.toLocaleString('en-IN')}</Text>
            <Text style={styles.colSub}>Remaining to close</Text>
          </View>
        </View>

        {/* Visual Benchmark Gauge / Progress */}
        <View style={styles.gaugeContainer}>
          <View style={styles.track}>
            {/* Projected Fill (Lighter Slate) */}
            <View style={[styles.projectedFill, { width: `${projectedPercent}%` }]} />
            {/* Actual Current Fill (Solid Deep Slate) */}
            <View style={[styles.currentFill, { width: `${achievedPercent}%` }]} />
          </View>

          {/* Benchmark Markers */}
          <View style={styles.markersRow}>
            <Text style={styles.markerText}>₹0</Text>
            <Text style={styles.markerText}>₹6.0L (50%)</Text>
            <Text style={styles.markerTextTarget}>Target: ₹12.0L (100%)</Text>
          </View>
        </View>

        {/* Executive Forecast Summary Row */}
        <View style={styles.insightsBox}>
          <View style={styles.insightsRow}>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Daily Pacing Req:</Text>
              <Text style={styles.insightVal}>₹3,348 / day</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Current Run-Rate:</Text>
              <Text style={styles.insightValGreen}>₹3,489 / day</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Status:</Text>
              <Text style={styles.insightValStatus}>Ahead of Pace (+4.2%)</Text>
            </View>
          </View>
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
  pacingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  pacingBadgeOn: {
    backgroundColor: '#ecfdf5',
  },
  pacingBadgeOff: {
    backgroundColor: '#fef3c7',
  },
  pacingText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  pacingTextOn: {
    color: '#047857',
  },
  pacingTextOff: {
    color: '#b45309',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: THEME.fontFamily.regular,
    marginTop: 2,
  },
  targetBadge: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'flex-end',
  },
  targetLabel: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  targetValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
  body: {
    padding: 16,
    gap: 14,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statCol: {
    flex: 1,
  },
  statColDivider: {
    width: 1,
    height: 36,
    backgroundColor: '#f1f5f9',
    marginHorizontal: 8,
  },
  colLabel: {
    fontSize: 10.5,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  colValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#09090b',
  },
  colValueProj: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2563eb',
  },
  colValueGap: {
    fontSize: 15,
    fontWeight: '700',
    color: '#64748b',
  },
  colSub: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 1,
  },
  gaugeContainer: {
    gap: 6,
  },
  track: {
    height: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    position: 'relative',
    overflow: 'hidden',
  },
  projectedFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#93c5fd',
    borderRadius: 6,
  },
  currentFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: '#0f172a',
    borderRadius: 6,
  },
  markersRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  markerText: {
    fontSize: 10,
    color: '#94a3b8',
  },
  markerTextTarget: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0f172a',
  },
  insightsBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 10,
  },
  insightsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  insightLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  insightVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
  },
  insightValGreen: {
    fontSize: 11,
    fontWeight: '700',
    color: '#047857',
  },
  insightValStatus: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2563eb',
  },
});
