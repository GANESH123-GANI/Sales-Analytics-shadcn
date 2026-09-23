import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import {
  Filter,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';

interface FunnelStage {
  name: string;
  count: number;
  label: string;
  dropoffRate?: string;
  timeSpent: string;
}

const DEFAULT_STAGES: FunnelStage[] = [
  { name: 'Store Visitors', count: 14280, label: 'Sessions', timeSpent: '1m 12s' },
  { name: 'Product Views', count: 8920, label: 'Views', dropoffRate: '37.5%', timeSpent: '2m 04s' },
  { name: 'Added to Cart', count: 3410, label: 'Carts', dropoffRate: '61.8%', timeSpent: '1m 30s' },
  { name: 'Checkout Started', count: 1120, label: 'Checkouts', dropoffRate: '67.2%', timeSpent: '1m 15s' },
  { name: 'Completed Orders', count: 46, label: 'Paid Orders', dropoffRate: '95.9%', timeSpent: '48s' },
];

interface ConversionFunnelChartProps {
  completedOrdersCount?: number;
}

export const ConversionFunnelChart: React.FC<ConversionFunnelChartProps> = ({
  completedOrdersCount = 46,
}) => {
  const [selectedStageIdx, setSelectedStageIdx] = useState<number>(0);

  const stages = DEFAULT_STAGES.map((s, idx) =>
    idx === DEFAULT_STAGES.length - 1
      ? { ...s, count: completedOrdersCount }
      : s
  );

  const topStageCount = stages[0].count;
  const currentStage = stages[selectedStageIdx];
  const overallConversion = ((completedOrdersCount / topStageCount) * 100).toFixed(2);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <View style={styles.iconWrap}>
              <Filter size={15} color="#0f172a" strokeWidth={2.4} />
            </View>
            <Text style={styles.title}>Conversion Funnel</Text>
            <View style={styles.efficiencyBadge}>
              <Sparkles size={11} color="#047857" />
              <Text style={styles.efficiencyText}>{overallConversion}% CVR</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Traffic to paid customer progression</Text>
        </View>

        <View style={styles.summaryBadge}>
          <Text style={styles.summaryLabel}>Overall Conversion</Text>
          <Text style={styles.summaryValue}>{overallConversion}%</Text>
        </View>
      </View>

      {/* Main Funnel Visualization */}
      <View style={styles.body}>
        <View style={styles.funnelList}>
          {stages.map((stage, idx) => {
            const isSelected = selectedStageIdx === idx;
            const percentage = (stage.count / topStageCount) * 100;
            const stepConversion =
              idx === 0
                ? '100%'
                : `${((stage.count / stages[idx - 1].count) * 100).toFixed(1)}%`;

            return (
              <TouchableOpacity
                key={stage.name}
                style={[styles.stageRow, isSelected && styles.stageRowActive]}
                onPress={() => setSelectedStageIdx(idx)}
                activeOpacity={0.7}
              >
                <View style={styles.stageMeta}>
                  <View style={styles.stageTitleWrap}>
                    <Text style={[styles.stageStep, isSelected && styles.stageStepActive]}>
                      0{idx + 1}
                    </Text>
                    <Text style={[styles.stageName, isSelected && styles.stageNameActive]}>
                      {stage.name}
                    </Text>
                  </View>

                  <View style={styles.stageNumbers}>
                    <Text style={[styles.stageCount, isSelected && styles.stageCountActive]}>
                      {stage.count.toLocaleString('en-IN')}
                    </Text>
                    <Text style={styles.stageRatio}>{stepConversion}</Text>
                  </View>
                </View>

                {/* Progress Bar with shadcn fill */}
                <View style={styles.track}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${Math.max(percentage, 3)}%`,
                        backgroundColor:
                          idx === stages.length - 1
                            ? '#0f172a'
                            : isSelected
                            ? '#1e293b'
                            : '#64748b',
                      },
                    ]}
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Selected Stage Detail Insight Bar */}
        <View style={styles.detailCard}>
          <View style={styles.detailHeader}>
            <View style={styles.detailDot} />
            <Text style={styles.detailTitle}>
              Stage 0{selectedStageIdx + 1}: {currentStage.name}
            </Text>
          </View>
          <View style={styles.detailGrid}>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Volume</Text>
              <Text style={styles.detailValue}>{currentStage.count.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Retention</Text>
              <Text style={styles.detailValue}>
                {((currentStage.count / topStageCount) * 100).toFixed(1)}%
              </Text>
            </View>
            <View style={styles.detailCol}>
              <Text style={styles.detailLabel}>Avg Duration</Text>
              <Text style={styles.detailValue}>{currentStage.timeSpent}</Text>
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
    elevation: 1,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
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
  efficiencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  efficiencyText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: THEME.fontFamily.regular,
    marginTop: 2,
  },
  summaryBadge: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'flex-end',
  },
  summaryLabel: {
    fontSize: 9.5,
    color: '#64748b',
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
  body: {
    padding: 16,
    gap: 14,
  },
  funnelList: {
    gap: 8,
  },
  stageRow: {
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
    backgroundColor: '#ffffff',
  },
  stageRowActive: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  stageMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  stageTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stageStep: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
    fontFamily: THEME.fontFamily.semibold,
  },
  stageStepActive: {
    color: '#0f172a',
  },
  stageName: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#334155',
    fontFamily: THEME.fontFamily.medium,
  },
  stageNameActive: {
    color: '#09090b',
    fontWeight: '700',
  },
  stageNumbers: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stageCount: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  stageCountActive: {
    color: '#09090b',
  },
  stageRatio: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
    width: 44,
    textAlign: 'right',
  },
  track: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
  },
  detailCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  detailDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0f172a',
  },
  detailTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
});
