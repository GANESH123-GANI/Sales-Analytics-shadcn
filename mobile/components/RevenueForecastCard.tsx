import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Target, TrendingUp, CheckCircle, AlertCircle, Sparkles, RefreshCw, ChevronRight } from 'lucide-react-native';
import { THEME } from '../constants/theme';

interface RevenueForecastCardProps {
  currentRevenue?: number;
  annualTarget?: number;
  projectedRevenue?: number;
}

interface QuarterConfig {
  name: string;
  badge: string;
  actual: number;
  target: number;
  projected: number;
  dailyReq: string;
  runRate: string;
  status: string;
  pacing: string;
  statusColor: string;
  progressPercent: number;
  pipelineHealth: string;
  runway: string;
  confidence: string;
  highlight: string;
}

const QUARTER_DATA: Record<string, QuarterConfig> = {
  ALL: {
    name: 'Full Fiscal Year 2026',
    badge: '104% Pacing',
    actual: 1248500,
    target: 1200000,
    projected: 1380000,
    dailyReq: '₹3,348 / day',
    runRate: '₹3,489 / day',
    status: 'Ahead of Pace (+4.2%)',
    pacing: '104.0',
    statusColor: '#2563eb',
    progressPercent: 104,
    pipelineHealth: '94.8% • Strong',
    runway: '+14.2% MoM',
    confidence: 'High (AI Pacing)',
    highlight: 'Annual run-rate benchmark on target with strong digital sales growth.',
  },
  Q1: {
    name: 'Quarter 1 (Jan – Mar)',
    badge: '104% Met',
    actual: 295400,
    target: 285000,
    projected: 295400,
    dailyReq: '₹3,166 / day',
    runRate: '₹3,282 / day',
    status: 'Target Exceeded (+3.6%)',
    pacing: '103.6',
    statusColor: '#047857',
    progressPercent: 100,
    pipelineHealth: '92.1% • Settled',
    runway: '+9.8% QoQ',
    confidence: 'Historical Audited',
    highlight: 'Post-holiday restocking surge drove strong early enterprise bookings.',
  },
  Q2: {
    name: 'Quarter 2 (Apr – Jun)',
    badge: '112% Met',
    actual: 342100,
    target: 305000,
    projected: 342100,
    dailyReq: '₹3,351 / day',
    runRate: '₹3,759 / day',
    status: 'Target Exceeded (+12.2%)',
    pacing: '112.2',
    statusColor: '#047857',
    progressPercent: 100,
    pipelineHealth: '95.4% • Settled',
    runway: '+15.8% QoQ',
    confidence: 'Historical Audited',
    highlight: 'Summer promotional velocity and wholesale distributor expansion.',
  },
  Q3: {
    name: 'Quarter 3 (Jul – Sep)',
    badge: '128% Active',
    actual: 389200,
    target: 305000,
    projected: 412000,
    dailyReq: '₹3,351 / day',
    runRate: '₹4,276 / day',
    status: 'Surging Ahead (+27.6%)',
    pacing: '127.6',
    statusColor: '#047857',
    progressPercent: 92,
    pipelineHealth: '96.8% • Peak Run',
    runway: '+13.7% QoQ',
    confidence: 'Real-Time Telemetry',
    highlight: 'Festive pre-orders and premium electronics catalog bundles outperforming.',
  },
  Q4: {
    name: 'Quarter 4 (Oct – Dec)',
    badge: '108% Est',
    actual: 221800,
    target: 305000,
    projected: 330500,
    dailyReq: '₹3,315 / day',
    runRate: '₹3,592 / day',
    status: 'On Track (+8.3%)',
    pacing: '108.4',
    statusColor: '#2563eb',
    progressPercent: 73,
    pipelineHealth: '91.5% • Projected',
    runway: '+11.4% Est',
    confidence: 'ML Forecast',
    highlight: 'Year-end corporate contract renewals and institutional holiday gifting pipeline.',
  },
};

export const RevenueForecastCard: React.FC<RevenueForecastCardProps> = ({
  currentRevenue: defaultCurrent = 1248500,
  annualTarget: defaultTarget = 1200000,
  projectedRevenue: defaultProj = 1380000,
}) => {
  const [selectedQuarter, setSelectedQuarter] = useState<'ALL' | 'Q1' | 'Q2' | 'Q3' | 'Q4'>('Q3');

  const currentData = QUARTER_DATA[selectedQuarter];
  const activeRev = currentData.actual;
  const activeTarget = currentData.target;
  const activeProj = currentData.projected;

  const achievedPercent = Math.min(Math.round((activeRev / activeTarget) * 100), 100);
  const remainingToTarget = Math.max(activeTarget - activeRev, 0);

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
            <TouchableOpacity
              style={[styles.pacingBadge, styles.pacingBadgeOn]}
              onPress={() => setSelectedQuarter(selectedQuarter === 'ALL' ? 'Q3' : 'ALL')}
              activeOpacity={0.7}
            >
              <Sparkles size={11} color="#047857" />
              <Text style={styles.pacingText}>
                {currentData.pacing}% Pacing
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>
            {selectedQuarter === 'ALL' ? 'Annual benchmark pacing & year-end projection' : `${currentData.name} — Interactive Breakdown`}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.targetBadge, selectedQuarter === 'ALL' && styles.targetBadgeActive]}
          onPress={() => setSelectedQuarter('ALL')}
          activeOpacity={0.7}
        >
          <Text style={styles.targetLabel}>{selectedQuarter === 'ALL' ? 'Full Year Target' : 'Reset to Full Year'}</Text>
          <Text style={styles.targetValue}>₹{(activeTarget / 100000).toFixed(1)}L</Text>
        </TouchableOpacity>
      </View>

      {/* Body */}
      <View style={styles.body}>
        {/* Metric Comparison Values (Interactive dynamically bound to selected quarter) */}
        <View style={styles.statsRow}>
          <View style={styles.statCol}>
            <Text style={styles.colLabel}>{selectedQuarter === 'ALL' ? 'Current FY26 Revenue' : `${selectedQuarter} Revenue`}</Text>
            <Text style={styles.colValue}>₹{activeRev.toLocaleString('en-IN')}</Text>
            <Text style={styles.colSub}>{achievedPercent}% of {selectedQuarter === 'ALL' ? 'FY' : selectedQuarter} target</Text>
          </View>

          <View style={styles.statColDivider} />

          <View style={styles.statCol}>
            <Text style={styles.colLabel}>{selectedQuarter === 'ALL' ? 'Projected EOY' : `${selectedQuarter} Forecast`}</Text>
            <Text style={styles.colValueProj}>₹{activeProj.toLocaleString('en-IN')}</Text>
            <Text style={styles.colSub}>Pacing outcome</Text>
          </View>

          <View style={styles.statColDivider} />

          <View style={styles.statCol}>
            <Text style={styles.colLabel}>Target Gap</Text>
            <Text style={styles.colValueGap}>₹{remainingToTarget.toLocaleString('en-IN')}</Text>
            <Text style={styles.colSub}>{remainingToTarget === 0 ? 'Target achieved! 🎉' : 'Remaining to close'}</Text>
          </View>
        </View>

        {/* Visual Benchmark Gauge / Progress */}
        <View style={styles.gaugeContainer}>
          <View style={styles.track}>
            {/* Projected Fill */}
            <View style={[styles.projectedFill, { width: `${Math.min(currentData.projectedPercent, 100)}%` }]} />
            {/* Actual Current Fill */}
            <View style={[styles.currentFill, { width: `${Math.min(achievedPercent, 100)}%` }]} />
          </View>

          {/* Benchmark Markers */}
          <View style={styles.markersRow}>
            <Text style={styles.markerText}>₹0</Text>
            <Text style={styles.markerText}>₹{(activeTarget * 0.5 / 100000).toFixed(1)}L (50%)</Text>
            <Text style={styles.markerTextTarget}>Target: ₹{(activeTarget / 100000).toFixed(1)}L (100%)</Text>
          </View>
        </View>

        {/* Executive Forecast Summary Row */}
        <View style={styles.insightsBox}>
          <View style={styles.insightsRow}>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Daily Pacing Req:</Text>
              <Text style={styles.insightVal}>{currentData.dailyReq}</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Current Run-Rate:</Text>
              <Text style={styles.insightValGreen}>{currentData.runRate}</Text>
            </View>
            <View style={styles.insightItem}>
              <Text style={styles.insightLabel}>Status:</Text>
              <Text style={[styles.insightValStatus, { color: currentData.statusColor }]}>{currentData.status}</Text>
            </View>
          </View>
        </View>

        {/* Quarterly Milestone Breakdown (Clickable interactive cards) */}
        <View style={styles.quarterlySection}>
          <View style={styles.quarterlyHeaderRow}>
            <Text style={styles.sectionHeaderTitle}>Quarterly Revenue Milestones</Text>
            <Text style={styles.clickHintText}>Tap any quarter to inspect</Text>
          </View>

          <View style={styles.quarterlyGrid}>
            {(['Q1', 'Q2', 'Q3', 'Q4'] as const).map((qKey) => {
              const q = QUARTER_DATA[qKey];
              const isSelected = selectedQuarter === qKey;

              return (
                <TouchableOpacity
                  key={qKey}
                  style={[styles.quarterCard, isSelected && styles.quarterCardActive]}
                  onPress={() => setSelectedQuarter(qKey)}
                  activeOpacity={0.7}
                >
                  <View style={styles.quarterTop}>
                    <Text style={[styles.quarterName, isSelected && styles.quarterNameActive]}>
                      {qKey} {qKey === 'Q3' ? '• Now' : ''}
                    </Text>
                    <View style={isSelected ? styles.quarterBadgePacingBox : styles.quarterBadgeMetBox}>
                      <Text style={isSelected ? styles.quarterBadgePacing : styles.quarterBadgeMet}>
                        {q.badge}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.quarterAmount}>₹{(q.actual / 100000).toFixed(2)}L</Text>
                  <Text style={styles.quarterTarget}>Goal: ₹{(q.target / 100000).toFixed(2)}L</Text>

                  <View style={styles.miniProgressTrack}>
                    <View
                      style={[
                        styles.miniProgressFill,
                        {
                          width: `${Math.min(q.progressPercent, 100)}%`,
                          backgroundColor: isSelected ? '#0f172a' : '#10b981',
                        },
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Selected Quarter Driver Telemetry */}
        <View style={styles.driverBar}>
          <Sparkles size={13} color="#2563eb" />
          <Text style={styles.driverText}>
            <Text style={styles.driverBold}>{currentData.name}: </Text>
            {currentData.highlight}
          </Text>
        </View>

        {/* Forecast Health & Runway Metrics Footer */}
        <View style={styles.healthFooter}>
          <View style={styles.healthCol}>
            <Text style={styles.healthLabel}>Pipeline Health</Text>
            <Text style={styles.healthValueGreen}>{currentData.pipelineHealth}</Text>
          </View>
          <View style={styles.healthColDivider} />
          <View style={styles.healthCol}>
            <Text style={styles.healthLabel}>Runway Velocity</Text>
            <Text style={styles.healthValue}>{currentData.runway}</Text>
          </View>
          <View style={styles.healthColDivider} />
          <View style={styles.healthCol}>
            <Text style={styles.healthLabel}>Telemetry Mode</Text>
            <Text style={styles.healthValue}>{currentData.confidence}</Text>
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
  targetBadgeActive: {
    borderColor: '#0f172a',
    backgroundColor: '#0f172a',
  },
  quarterlyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clickHintText: {
    fontSize: 10.5,
    color: '#2563eb',
    fontWeight: '600',
  },
  driverBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 10,
  },
  driverText: {
    flex: 1,
    fontSize: 11.5,
    color: '#1e3a8a',
    lineHeight: 16,
  },
  driverBold: {
    fontWeight: '700',
    color: '#1e40af',
  },
});
