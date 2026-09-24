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

        {/* Quarterly Milestone Breakdown */}
        <View style={styles.quarterlySection}>
          <Text style={styles.sectionHeaderTitle}>Quarterly Revenue Milestones</Text>
          <View style={styles.quarterlyGrid}>
            <View style={styles.quarterCard}>
              <View style={styles.quarterTop}>
                <Text style={styles.quarterName}>Q1</Text>
                <View style={styles.quarterBadgeMetBox}>
                  <Text style={styles.quarterBadgeMet}>104%</Text>
                </View>
              </View>
              <Text style={styles.quarterAmount}>₹2.95L</Text>
              <Text style={styles.quarterTarget}>Target: ₹2.85L</Text>
              <View style={styles.miniProgressTrack}>
                <View style={[styles.miniProgressFill, { width: '100%' }]} />
              </View>
            </View>

            <View style={styles.quarterCard}>
              <View style={styles.quarterTop}>
                <Text style={styles.quarterName}>Q2</Text>
                <View style={styles.quarterBadgeMetBox}>
                  <Text style={styles.quarterBadgeMet}>112%</Text>
                </View>
              </View>
              <Text style={styles.quarterAmount}>₹3.42L</Text>
              <Text style={styles.quarterTarget}>Target: ₹3.05L</Text>
              <View style={styles.miniProgressTrack}>
                <View style={[styles.miniProgressFill, { width: '100%' }]} />
              </View>
            </View>

            <View style={[styles.quarterCard, styles.quarterCardActive]}>
              <View style={styles.quarterTop}>
                <Text style={[styles.quarterName, styles.quarterNameActive]}>Q3 (Active)</Text>
                <View style={styles.quarterBadgePacingBox}>
                  <Text style={styles.quarterBadgePacing}>128%</Text>
                </View>
              </View>
              <Text style={styles.quarterAmount}>₹3.89L</Text>
              <Text style={styles.quarterTarget}>Target: ₹3.05L</Text>
              <View style={styles.miniProgressTrack}>
                <View style={[styles.miniProgressFill, { width: '92%', backgroundColor: '#0f172a' }]} />
              </View>
            </View>

            <View style={styles.quarterCard}>
              <View style={styles.quarterTop}>
                <Text style={styles.quarterName}>Q4 (Est)</Text>
                <View style={styles.quarterBadgeProjBox}>
                  <Text style={styles.quarterBadgeProj}>108%</Text>
                </View>
              </View>
              <Text style={styles.quarterAmount}>₹3.30L</Text>
              <Text style={styles.quarterTarget}>Target: ₹3.05L</Text>
              <View style={styles.miniProgressTrack}>
                <View style={[styles.miniProgressFill, { width: '75%', backgroundColor: '#94a3b8' }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Forecast Health & Runway Metrics Footer */}
        <View style={styles.healthFooter}>
          <View style={styles.healthCol}>
            <Text style={styles.healthLabel}>Pipeline Health</Text>
            <Text style={styles.healthValueGreen}>94.8% • Strong</Text>
          </View>
          <View style={styles.healthColDivider} />
          <View style={styles.healthCol}>
            <Text style={styles.healthLabel}>Runway Velocity</Text>
            <Text style={styles.healthValue}>+14.2% MoM</Text>
          </View>
          <View style={styles.healthColDivider} />
          <View style={styles.healthCol}>
            <Text style={styles.healthLabel}>Forecast Confidence</Text>
            <Text style={styles.healthValue}>High (AI Pacing)</Text>
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
  quarterlySection: {
    marginTop: 14,
    gap: 8,
  },
  sectionHeaderTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    fontFamily: THEME.fontFamily.semibold,
  },
  quarterlyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  quarterCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    padding: 10,
    gap: 3,
  },
  quarterCardActive: {
    borderColor: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  quarterTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  quarterName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  quarterNameActive: {
    color: '#0f172a',
    fontWeight: '700',
  },
  quarterBadgeMetBox: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  quarterBadgeMet: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#047857',
  },
  quarterBadgePacingBox: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  quarterBadgePacing: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#2563eb',
  },
  quarterBadgeProjBox: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  quarterBadgeProj: {
    fontSize: 9.5,
    fontWeight: '600',
    color: '#475569',
  },
  quarterAmount: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  quarterTarget: {
    fontSize: 10,
    color: '#64748b',
  },
  miniProgressTrack: {
    height: 4,
    backgroundColor: '#f1f5f9',
    borderRadius: 2,
    marginTop: 4,
    overflow: 'hidden',
  },
  miniProgressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 2,
  },
  healthFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  healthCol: {
    flex: 1,
    minWidth: 90,
  },
  healthColDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#e2e8f0',
  },
  healthLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  healthValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 1,
  },
  healthValueGreen: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
    marginTop: 1,
  },
});
