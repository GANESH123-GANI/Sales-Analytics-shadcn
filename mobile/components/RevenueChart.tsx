import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Rect, Circle, Text as SvgText } from 'react-native-svg';
import { THEME } from '../constants/theme';
import { MonthlyRevenue } from '../types/sales';

interface RevenueChartProps {
  data: MonthlyRevenue[];
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No revenue data available</Text>
      </View>
    );
  }

  const screenWidth = Dimensions.get('window').width;
  const chartWidth = Math.max(screenWidth - 140, 560);
  const chartHeight = 240;
  const paddingHorizontal = 24;
  const paddingBottom = 28;
  const paddingTop = 10;
  const innerWidth = chartWidth - paddingHorizontal * 2;
  const innerHeight = chartHeight - paddingTop - paddingBottom;

  const maxVal = Math.max(...data.map(d => d.revenue), 1000);
  const minVal = 0;

  const points = data.map((d, index) => {
    const x = paddingHorizontal + (index / (data.length - 1 || 1)) * innerWidth;
    const y = paddingTop + innerHeight - ((d.revenue - minVal) / (maxVal - minVal || 1)) * innerHeight;
    return { x, y, ...d };
  });

  let pathD = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const cx = (prev.x + curr.x) / 2;
    pathD += ` C ${cx} ${prev.y}, ${cx} ${curr.y}, ${curr.x} ${curr.y}`;
  }

  const areaPathD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`;
  const chartBottom = chartHeight - paddingBottom;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Sales Overview</Text>
        <Text style={styles.headerArrow}>↗</Text>
      </View>

      <View style={styles.chartWrap}>
        <Svg width={chartWidth} height={chartHeight}>
          <Line
            x1={paddingHorizontal}
            y1={chartBottom}
            x2={chartWidth - paddingHorizontal}
            y2={chartBottom}
            stroke="#e5e7eb"
            strokeWidth="1"
          />

          <Path d={areaPathD} fill="#f3f4f6" opacity={0.7} />

          {points.map((p, idx) => {
            const barHeight = ((p.revenue / maxVal) * innerHeight) * 0.28;
            const barX = p.x - 4.5;
            const barY = chartBottom - barHeight;

            return (
              <Rect
                key={`${p.month}-${idx}`}
                x={barX}
                y={barY}
                width={9}
                height={barHeight}
                fill={idx % 2 === 0 ? '#f1f5f9' : '#edf2f7'}
                rx={2}
              />
            );
          })}

          <Path d={pathD} fill="none" stroke="#111827" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, idx) => (
            <React.Fragment key={`point-${idx}`}>
              <Circle cx={p.x} cy={p.y} r={3.5} fill="#111827" />
              <Circle cx={p.x} cy={p.y} r={7} fill="#111827" opacity={0.08} />
            </React.Fragment>
          ))}

          {points.map((p, idx) => (
            <SvgText
              key={`label-${idx}`}
              x={p.x}
              y={chartHeight - 6}
              fontSize="11"
              fill="#7a7d83"
              textAnchor="middle"
              fontWeight="400"
            >
              {p.month}
            </SvgText>
          ))}
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 0,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.4,
    fontFamily: THEME.fontFamily.sans,
  },
  headerArrow: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginTop: -4,
    fontFamily: THEME.fontFamily.sans,
  },
  chartWrap: {
    paddingTop: 10,
    paddingBottom: 12,
    paddingHorizontal: 0,
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
