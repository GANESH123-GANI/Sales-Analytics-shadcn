import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Calendar, Clock, Flame, Info } from 'lucide-react-native';
import { THEME } from '../constants/theme';

interface TimeSlot {
  slot: string;
  label: string;
}

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const SLOTS: TimeSlot[] = [
  { slot: 'Morning', label: '8a - 12p' },
  { slot: 'Afternoon', label: '12p - 4p' },
  { slot: 'Evening', label: '4p - 8p' },
  { slot: 'Night', label: '8p - 12a' },
];

// Activity matrix [dayIdx][slotIdx] = { orders: number, revenue: number }
const HEATMAP_DATA: { orders: number; revenue: number }[][] = [
  // Mon
  [{ orders: 2, revenue: 14500 }, { orders: 4, revenue: 38200 }, { orders: 5, revenue: 49000 }, { orders: 1, revenue: 8900 }],
  // Tue
  [{ orders: 3, revenue: 22000 }, { orders: 5, revenue: 54000 }, { orders: 7, revenue: 78500 }, { orders: 2, revenue: 16000 }],
  // Wed
  [{ orders: 1, revenue: 9500 },  { orders: 4, revenue: 41000 }, { orders: 6, revenue: 62000 }, { orders: 2, revenue: 18000 }],
  // Thu
  [{ orders: 4, revenue: 35000 }, { orders: 6, revenue: 67000 }, { orders: 8, revenue: 94000 }, { orders: 3, revenue: 26000 }],
  // Fri (Peak day)
  [{ orders: 5, revenue: 48000 }, { orders: 7, revenue: 82000 }, { orders: 11, revenue: 142000 }, { orders: 6, revenue: 58000 }],
  // Sat
  [{ orders: 6, revenue: 65000 }, { orders: 9, revenue: 110000 }, { orders: 8, revenue: 98000 }, { orders: 4, revenue: 39000 }],
  // Sun
  [{ orders: 3, revenue: 28000 }, { orders: 5, revenue: 49000 }, { orders: 6, revenue: 63000 }, { orders: 2, revenue: 19000 }],
];

export const SalesHeatmapChart: React.FC = () => {
  const [selectedCell, setSelectedCell] = useState<{ day: number; slot: number }>({
    day: 4, // Friday
    slot: 2, // Evening (Peak)
  });

  const activeData = HEATMAP_DATA[selectedCell.day][selectedCell.slot];
  const activeDayName = DAYS[selectedCell.day];
  const activeSlot = SLOTS[selectedCell.slot];

  // Helper for color intensity
  const getCellBg = (orders: number) => {
    if (orders >= 9) return '#0f172a'; // Deepest black/slate
    if (orders >= 6) return '#334155'; // Slate-700
    if (orders >= 4) return '#64748b'; // Slate-500
    if (orders >= 2) return '#cbd5e1'; // Slate-300
    return '#f1f5f9'; // Slate-100
  };

  const getCellTextColor = (orders: number) => {
    return orders >= 6 ? '#ffffff' : '#475569';
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <View style={styles.iconWrap}>
              <Flame size={15} color="#ea580c" strokeWidth={2.4} />
            </View>
            <Text style={styles.title}>Trading Velocity Heatmap</Text>
            <View style={styles.peakBadge}>
              <Text style={styles.peakBadgeText}>Fri 4p-8p Peak</Text>
            </View>
          </View>
          <Text style={styles.subtitle}>Order density across days and hourly intervals</Text>
        </View>
      </View>

      {/* Heatmap Grid */}
      <View style={styles.body}>
        {/* Column Headers (Time Slots) */}
        <View style={styles.slotHeaderRow}>
          <View style={styles.dayLabelSpacer} />
          {SLOTS.map((s) => (
            <View key={s.slot} style={styles.slotHeaderCol}>
              <Text style={styles.slotTitle}>{s.slot}</Text>
              <Text style={styles.slotRange}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Day Rows */}
        <View style={styles.grid}>
          {DAYS.map((dayName, dIdx) => (
            <View key={dayName} style={styles.row}>
              <Text style={styles.dayLabel}>{dayName}</Text>
              <View style={styles.cellsRow}>
                {SLOTS.map((slot, sIdx) => {
                  const cell = HEATMAP_DATA[dIdx][sIdx];
                  const isSelected = selectedCell.day === dIdx && selectedCell.slot === sIdx;
                  const bg = getCellBg(cell.orders);
                  const textColor = getCellTextColor(cell.orders);

                  return (
                    <TouchableOpacity
                      key={`${dayName}-${slot.slot}`}
                      style={[
                        styles.cell,
                        { backgroundColor: bg },
                        isSelected && styles.cellSelected,
                      ]}
                      onPress={() => setSelectedCell({ day: dIdx, slot: sIdx })}
                      activeOpacity={0.8}
                    >
                      <Text style={[styles.cellText, { color: textColor }]}>
                        {cell.orders}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* Heatmap Legend */}
        <View style={styles.legendRow}>
          <Text style={styles.legendLabel}>Low Activity</Text>
          <View style={styles.legendScale}>
            <View style={[styles.legendBox, { backgroundColor: '#f1f5f9' }]} />
            <View style={[styles.legendBox, { backgroundColor: '#cbd5e1' }]} />
            <View style={[styles.legendBox, { backgroundColor: '#64748b' }]} />
            <View style={[styles.legendBox, { backgroundColor: '#334155' }]} />
            <View style={[styles.legendBox, { backgroundColor: '#0f172a' }]} />
          </View>
          <Text style={styles.legendLabel}>Peak Trading</Text>
        </View>

        {/* Interactive Cell Inspector Card */}
        <View style={styles.inspectorBar}>
          <View style={styles.inspectorLeft}>
            <Clock size={14} color="#0f172a" />
            <Text style={styles.inspectorTime}>
              {activeDayName} ({activeSlot.slot} • {activeSlot.label})
            </Text>
          </View>
          <View style={styles.inspectorRight}>
            <Text style={styles.inspectorOrders}>{activeData.orders} orders</Text>
            <Text style={styles.inspectorRevenue}>
              ₹{activeData.revenue.toLocaleString('en-IN')} volume
            </Text>
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
    backgroundColor: '#fff7ed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.semibold,
    color: '#09090b',
  },
  peakBadge: {
    backgroundColor: '#ffedd5',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  peakBadgeText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#c2410c',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: THEME.fontFamily.regular,
    marginTop: 2,
  },
  body: {
    padding: 16,
    gap: 12,
  },
  slotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  dayLabelSpacer: {
    width: 36,
  },
  slotHeaderCol: {
    flex: 1,
    alignItems: 'center',
  },
  slotTitle: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
  },
  slotRange: {
    fontSize: 9.5,
    color: '#94a3b8',
  },
  grid: {
    gap: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayLabel: {
    width: 36,
    fontSize: 11,
    fontWeight: '600',
    color: '#64748b',
  },
  cellsRow: {
    flex: 1,
    flexDirection: 'row',
    gap: 4,
  },
  cell: {
    flex: 1,
    height: 28,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellSelected: {
    borderWidth: 2,
    borderColor: '#2563eb',
  },
  cellText: {
    fontSize: 11,
    fontWeight: '700',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  legendLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  legendScale: {
    flexDirection: 'row',
    gap: 3,
  },
  legendBox: {
    width: 14,
    height: 10,
    borderRadius: 2,
  },
  inspectorBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginTop: 4,
    flexWrap: 'wrap',
    gap: 6,
  },
  inspectorLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  inspectorTime: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  inspectorRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inspectorOrders: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  inspectorRevenue: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#047857',
  },
});
