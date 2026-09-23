import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { MoreHorizontal } from 'lucide-react-native';

export interface Column<T> {
  key: string;
  header: string;
  width?: number;
  flex?: number;
  align?: 'left' | 'center' | 'right';
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableLayoutConfig {
  compact?: boolean;
  showBorders?: boolean;
  minTableWidth?: number;
  headerPaddingHorizontal?: number;
  headerPaddingVertical?: number;
  rowPaddingHorizontal?: number;
  rowPaddingVertical?: number;
  rowGap?: number;
  cellPaddingHorizontal?: number;
  cellPaddingVertical?: number;
  actionColumnWidth?: number;
  borderColor?: string;
}

interface DataTableProps<T> {
  title?: string;
  count?: number;
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  onRowAction?: (item: T) => void;
  actionButtonLabel?: string;
  showActionMenu?: boolean;
  layout?: DataTableLayoutConfig;
}

export function DataTable<T>({
  title,
  count,
  columns,
  data,
  keyExtractor,
  onRowAction,
  actionButtonLabel,
  showActionMenu = true,
  layout,
}: DataTableProps<T>) {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

  const resolvedLayout: Required<DataTableLayoutConfig> = {
    compact: false,
    showBorders: true,
    minTableWidth: 0,
    headerPaddingHorizontal: 12,
    headerPaddingVertical: isDesktop ? 10 : 7,
    rowPaddingHorizontal: 12,
    rowPaddingVertical: isDesktop ? 8 : 5,
    rowGap: 10,
    cellPaddingHorizontal: 8,
    cellPaddingVertical: isDesktop ? 8 : 5,
    actionColumnWidth: 120,
    borderColor: THEME.colors.border,
    ...layout,
  };

  if (resolvedLayout.compact) {
    resolvedLayout.headerPaddingHorizontal = 8;
    resolvedLayout.headerPaddingVertical = 7;
    resolvedLayout.rowPaddingHorizontal = 8;
    resolvedLayout.rowPaddingVertical = 7;
    resolvedLayout.cellPaddingHorizontal = 6;
    resolvedLayout.cellPaddingVertical = 7;
    resolvedLayout.actionColumnWidth = 100;
  }

  const tableHeaderStyle = [
    styles.tableHeader,
    {
      paddingHorizontal: resolvedLayout.headerPaddingHorizontal,
      paddingVertical: resolvedLayout.headerPaddingVertical,
    },
  ];

  const renderHeaderCell = (col: Column<T>, isActionCell = false) => (
    <View
      key={isActionCell ? 'action-header' : col.key}
      style={[
        styles.headerCell,
        {
          paddingHorizontal: resolvedLayout.cellPaddingHorizontal,
          paddingVertical: resolvedLayout.cellPaddingVertical,
          borderRightWidth: resolvedLayout.showBorders && !isActionCell ? 1 : 0,
          borderRightColor: resolvedLayout.borderColor,
        },
        isActionCell
          ? { width: resolvedLayout.actionColumnWidth, alignItems: 'center' }
          : col.width
            ? { width: col.width }
            : { flex: col.flex || 1, minWidth: 80, flexShrink: 1 },
        (col.align === 'right' || isActionCell) && { alignItems: 'flex-end' },
        col.align === 'center' && { alignItems: 'center' },
      ]}
    >
      <Text style={styles.headerText}>{isActionCell ? 'Action' : col.header}</Text>
    </View>
  );

  const renderCell = (col: Column<T>, item: T, index: number, isActionCell = false) => (
    <View
      key={isActionCell ? 'action-cell' : col.key}
      style={[
        styles.cell,
        {
          paddingHorizontal: resolvedLayout.cellPaddingHorizontal,
          paddingVertical: resolvedLayout.cellPaddingVertical,
          borderRightWidth: resolvedLayout.showBorders && !isActionCell ? 1 : 0,
          borderRightColor: resolvedLayout.borderColor,
        },
        isActionCell
          ? { width: resolvedLayout.actionColumnWidth, alignItems: 'flex-end' }
          : col.width
            ? { width: col.width }
            : { flex: col.flex || 1, minWidth: 80, flexShrink: 1 },
        col.align === 'right' && { alignItems: 'flex-end' },
        col.align === 'center' && { alignItems: 'center' },
      ]}
    >
      {isActionCell ? (
        <View style={styles.actionCellInner}>
          {actionButtonLabel && (
            <TouchableOpacity
              style={styles.actionBtn}
              onPress={() => onRowAction && onRowAction(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>{actionButtonLabel}</Text>
            </TouchableOpacity>
          )}
          {showActionMenu && (
            <TouchableOpacity style={styles.menuBtn} activeOpacity={0.6}>
              <MoreHorizontal size={15} color={THEME.colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
      ) : col.render ? (
        col.render(item, index)
      ) : (
        <Text style={styles.cellText} numberOfLines={1}>
          {String((item as any)[col.key] ?? '')}
        </Text>
      )}
    </View>
  );

  return (
    <View style={styles.card}>
      {title && (
        <View style={styles.headerBar}>
          <Text style={styles.title}>{title}</Text>
          {count !== undefined && (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{count}</Text>
            </View>
          )}
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        alwaysBounceHorizontal={false}
        contentContainerStyle={{ width: '100%', minWidth: resolvedLayout.minTableWidth || '100%' }}
      >
        <View style={[styles.table, { width: '100%', minWidth: resolvedLayout.minTableWidth || '100%' }]}>
          <View style={tableHeaderStyle}>
            {columns.map((col) => renderHeaderCell(col))}
            {(actionButtonLabel || showActionMenu) && renderHeaderCell({ key: 'action', header: 'Action' } as Column<T>, true)}
          </View>

          {data.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No records found</Text>
            </View>
          ) : (
            data.map((item, index) => (
              <View
                key={keyExtractor(item, index)}
                style={[
                  styles.row,
                  index % 2 === 1 && styles.rowAlt,
                  {
                    paddingHorizontal: resolvedLayout.rowPaddingHorizontal,
                    paddingVertical: resolvedLayout.rowPaddingVertical,
                    marginBottom: 10,
                  },
                ]}
              >
                {columns.map((col) => renderCell(col, item, index))}
                {(actionButtonLabel || showActionMenu) && renderCell({ key: 'action', header: 'Action' } as Column<T>, item, index, true)}
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// ─── Status Pill ──────────────────────────────────────────────────────────────
export const StatusPill: React.FC<{
  status: 'Completed' | 'Pending' | 'Cancelled' | 'Approved' | 'Overdue' | 'Upcoming' | 'Due soon' | string;
}> = ({ status }) => {
  const isApproved = status === 'Completed' || status === 'Approved';
  const isPending = status === 'Pending' || status === 'Due soon' || status === 'Upcoming';

  const badgeStyle = isApproved
    ? styles.approvedBadge
    : isPending
      ? styles.pendingBadge
      : styles.overdueBadge;

  const textStyle = isApproved
    ? styles.approvedText
    : isPending
      ? styles.pendingText
      : styles.overdueText;

  return (
    <View style={[styles.pill, badgeStyle]}>
      <Text style={[styles.pillText, textStyle]}>{status}</Text>
    </View>
  );
};

// ─── Inline badge for IDs (shared across pages) ───────────────────────────────
export const IdBadge: React.FC<{ label: string }> = ({ label }) => (
  <View style={styles.idBadge}>
    <Text style={styles.idBadgeText}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    overflow: 'hidden',
    width: '100%',
    ...THEME.shadow.card,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: THEME.fontSize.md,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
  countBadge: {
    backgroundColor: THEME.colors.secondary,
    borderRadius: THEME.radius.full,
    paddingHorizontal: 7,
    paddingVertical: 1,
  },
  countText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textSecondary,
  },
  table: {
    width: '100%',
    minWidth: 0,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.muted,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
  },
  headerCell: {
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: THEME.colors.border,
    minHeight: 36,
  },
  headerText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textSecondary,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.borderSubtle,
    overflow: 'hidden',
  },
  rowAlt: {
    backgroundColor: '#fcfcfd',
  },
  cell: {
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: THEME.colors.borderSubtle,
    minHeight: 40,
  },
  cellText: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textPrimary,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
  },
  actionCellInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  actionBtn: {
    backgroundColor: THEME.colors.buttonDark,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radius.md,
  },
  actionBtnText: {
    color: '#ffffff',
    fontSize: THEME.fontSize.sm,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
  },
  menuBtn: {
    padding: 4,
    borderRadius: THEME.radius.sm,
  },
  emptyRow: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: THEME.fontSize.base,
    color: THEME.colors.textMuted,
    fontFamily: THEME.fontFamily.regular,
  },
  // Status Pills
  pill: {
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  pillText: {
    fontSize: THEME.fontSize.xs,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
  },
  approvedBadge: {
    backgroundColor: THEME.colors.status.completedBg,
    borderColor: THEME.colors.status.completedBorder,
  },
  approvedText: {
    color: THEME.colors.status.completedText,
  },
  pendingBadge: {
    backgroundColor: THEME.colors.status.pendingBg,
    borderColor: THEME.colors.status.pendingBorder,
  },
  pendingText: {
    color: THEME.colors.status.pendingText,
  },
  overdueBadge: {
    backgroundColor: THEME.colors.status.cancelledBg,
    borderColor: THEME.colors.status.cancelledBorder,
  },
  overdueText: {
    color: THEME.colors.status.cancelledText,
  },
  // ID Badge (shared)
  idBadge: {
    backgroundColor: THEME.colors.muted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radius.sm,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  idBadgeText: {
    fontSize: THEME.fontSize.sm,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
    letterSpacing: 0.1,
  },
});
