import React, { useState } from 'react';
import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Svg, { Path, Line, Rect, Circle, Text as SvgText } from 'react-native-svg';
import { TrendingUp, ArrowUpRight } from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { MonthlyRevenue } from '../types/sales';

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const [containerWidth, setContainerWidth] = useState(500);

  const onLayout = (e: LayoutChangeEvent) => {
    const width = e.nativeEvent.layout.width;
    if (width > 100) {
      setContainerWidth(width);
    }
  };

  if (!data || data.length === 0) {
    return (
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <TrendingUp size={16} color={THEME.colors.textPrimary} strokeWidth={2.4} />
            <Text style={styles.title}>Sales Overview</Text>
          </View>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No revenue data available</Text>
        </View>
      </View>
    );
  }

  const chartPadding = 16;
  const chartWidth = Math.max(containerWidth - chartPadding * 2, 280);
  const chartHeight = 220;
  const paddingHorizontal = 20;
  const paddingBottom = 26;
  const paddingTop = 14;
  const innerWidth = chartWidth - paddingHorizontal * 2;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map((d) => d.revenue), 1000);
  const minVal = 0;

  const points = data.map((d, index) => {
    const x = paddingHorizontal + (index / (data.length - 1 || 1)) * innerWidth;
    const y =
      paddingTop +
      innerHeight -
      ((d.revenue - minVal) / (maxVal - minVal || 1)) * innerHeight;
    return { x, y, ...d };
  });

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    pathD += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const areaPathD = `${pathD} L ${points[points.length - 1].x} ${
    chartHeight - paddingBottom
  } L ${points[0].x} ${chartHeight - paddingBottom} Z`;
  const chartBottom = chartHeight - paddingBottom;

  const totalRev = data.reduce((s, c) => s + c.revenue, 0);

  return (
    <View style={styles.card} onLayout={onLayout}>
      {/* Uniform Header */}
      <View style={styles.header}>
        <View>
          <View style={styles.titleRow}>
            <TrendingUp size={16} color={THEME.colors.textPrimary} strokeWidth={2.4} />
            <Text style={styles.title}>Sales Overview</Text>
            <View style={styles.growthBadge}>
              <ArrowUpRight size={11} color="#047857" strokeWidth={2.6} />
              <Text style={styles.growthText}>+18.4%</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Monthly revenue line trajectory</Text>
        </View>

        <View style={styles.totalBadge}>
          <Text style={styles.totalBadgeText}>₹{totalRev.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {/* Uniform Body */}
      <View style={styles.body}>
        <View style={styles.chartWrap}>
          <Svg width={chartWidth} height={chartHeight}>
            {/* Grid base line */}
            <Line
              x1={paddingHorizontal}
              y1={chartBottom}
              x2={chartWidth - paddingHorizontal}
              y2={chartBottom}
              stroke="#e2e8f0"
              strokeWidth="1"
            />

            {/* Area under curve */}
            <Path d={areaPathD} fill="#f1f5f9" opacity={0.65} />

            {/* Subtle background bars */}
            {points.map((p, idx) => {
              const barHeight = ((p.revenue / maxVal) * innerHeight) * 0.3;
              const barX = p.x - 4;
              const barY = chartBottom - barHeight;

              return (
                <Rect
                  key={`${p.month}-${idx}`}
                  x={barX}
                  y={barY}
                  width={8}
                  height={barHeight}
                  fill={idx % 2 === 0 ? '#f1f5f9' : '#e2e8f0'}
                  rx={2}
                />
              );
            })}

            {/* Main curve */}
            <Path
              d={pathD}
              fill="none"
              stroke="#0f172a"
              strokeWidth="2.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((p, idx) => (
              <React.Fragment key={`point-${idx}`}>
                <Circle cx={p.x} cy={p.y} r={3.5} fill="#0f172a" />
                <Circle cx={p.x} cy={p.y} r={7} fill="#0f172a" opacity={0.1} />
              </React.Fragment>
            ))}

            {/* Month labels */}
            {points.map((p, idx) => (
              <SvgText
                key={`label-${idx}`}
                x={p.x}
                y={chartHeight - 6}
                fontSize="10.5"
                fill="#64748b"
                textAnchor="middle"
                fontWeight="500"
              >
                {p.month}
              </SvgText>
            ))}
          </Svg>
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
    borderColor: THEME.colors.border,
    overflow: 'hidden',
    ...THEME.shadow.card,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    gap: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
  growthBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
    gap: 2,
  },
  growthText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#047857',
  },
  subtitle: {
    fontSize: 12,
    color: THEME.colors.textSecondary,
    fontFamily: THEME.fontFamily.regular,
    marginTop: 2,
  },
  totalBadge: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  totalBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: THEME.colors.textPrimary,
  },
  body: {
    padding: 16,
  },
  chartWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: THEME.colors.textMuted,
  },
});
