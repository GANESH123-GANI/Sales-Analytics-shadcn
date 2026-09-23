import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, useWindowDimensions } from 'react-native';
import { THEME } from '../constants/theme';
import { MoreHorizontal, MoveHorizontal, LayoutGrid, Table as TableIcon } from 'lucide-react-native';

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

  const getColLayout = (col: Column<T>, isActionCell = false, colIdx = 0) => {
    if (isActionCell) {
      return { width: resolvedLayout.actionColumnWidth, flexShrink: 0 };
    }
    if (isDesktop) {
      // In Desktop Web:
      // Fixed badge / status / code columns remain compact
      if (
        col.width &&
        !col.flex &&
        (col.key === 'id' || col.key === 'status' || col.key === 'unitsSold' || col.key === 'totalOrders')
      ) {
        return { width: col.width, flexShrink: 0 };
      }
      if (col.flex) {
        return { flex: col.flex, minWidth: col.width || 90, flexShrink: 1 };
      }
      if (col.width) {
        return { flex: 1, minWidth: col.width, flexShrink: 1 };
      }
      return { flex: 1, minWidth: 90, flexShrink: 1 };
    }
    // Mobile / Tablet horizontal scroll table
    if (col.width) {
      return { width: col.width, flexShrink: 0 };
    }
    return { width: 140, flexShrink: 0 };
  };

  const renderHeaderCell = (col: Column<T>, isActionCell = false, colIdx = 0) => (
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
        getColLayout(col, isActionCell, colIdx),
        (col.align === 'right' || isActionCell) && { alignItems: 'flex-end' },
        col.align === 'center' && { alignItems: 'center' },
      ]}
    >
      <Text style={styles.headerText}>{isActionCell ? 'Action' : col.header}</Text>
    </View>
  );

  const renderCell = (col: Column<T>, item: T, index: number, isActionCell = false, colIdx = 0) => (
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
        getColLayout(col, isActionCell, colIdx),
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

  const [viewMode, setViewMode] = React.useState<'cards' | 'table'>(isDesktop ? 'table' : 'cards');

  // Calculate a healthy minimum width so columns are never squashed on mobile screens
  const calculatedColsWidth = columns.reduce((acc, col) => acc + (col.width || (col.flex ? col.flex * 130 : 130)), 0) +
    ((actionButtonLabel || showActionMenu) ? resolvedLayout.actionColumnWidth : 0);
  const effectiveMinWidth = Math.max(resolvedLayout.minTableWidth || 0, calculatedColsWidth, 640);

  const renderTableContent = (tableMinWidth?: number) => (
    <View style={[styles.table, tableMinWidth ? { minWidth: tableMinWidth } : { width: '100%' }]}>
      <View style={tableHeaderStyle}>
        {columns.map((col, cIdx) => renderHeaderCell(col, false, cIdx))}
        {(actionButtonLabel || showActionMenu) &&
          renderHeaderCell({ key: 'action', header: 'Action' } as Column<T>, true, columns.length)}
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
              },
            ]}
          >
            {columns.map((col, cIdx) => renderCell(col, item, index, false, cIdx))}
            {(actionButtonLabel || showActionMenu) &&
              renderCell(
                { key: 'action', header: 'Action' } as Column<T>,
                item,
                index,
                true,
                columns.length
              )}
          </View>
        ))
      )}
    </View>
  );

  return (
    <View style={styles.card}>
      {title && (
        <View style={styles.headerBar}>
          <View style={styles.headerLeft}>
            <Text style={styles.title}>{title}</Text>
            {count !== undefined && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{count}</Text>
              </View>
            )}
          </View>

          <View style={styles.headerRightControls}>
            {/* View Switcher: Cards vs Table */}
            <View style={styles.viewSwitcher}>
              <TouchableOpacity
                style={[styles.viewSwitchBtn, viewMode === 'cards' && styles.viewSwitchBtnActive]}
                onPress={() => setViewMode('cards')}
                activeOpacity={0.7}
              >
                <LayoutGrid size={12} color={viewMode === 'cards' ? THEME.colors.textPrimary : THEME.colors.textMuted} />
                <Text style={[styles.viewSwitchText, viewMode === 'cards' && styles.viewSwitchTextActive]}>
                  Cards
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.viewSwitchBtn, viewMode === 'table' && styles.viewSwitchBtnActive]}
                onPress={() => setViewMode('table')}
                activeOpacity={0.7}
              >
                <TableIcon size={12} color={viewMode === 'table' ? THEME.colors.textPrimary : THEME.colors.textMuted} />
                <Text style={[styles.viewSwitchText, viewMode === 'table' && styles.viewSwitchTextActive]}>
                  Table
                </Text>
              </TouchableOpacity>
            </View>

            {viewMode === 'table' && !isDesktop && (
              <View style={styles.scrollHintBadge}>
                <MoveHorizontal size={11} color={THEME.colors.textMuted} />
                <Text style={styles.scrollHintText}>Swipe</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* ─── Mode 1: Mobile Responsive Cards ─── */}
      {viewMode === 'cards' ? (
        <View style={styles.cardsListContainer}>
          {data.length === 0 ? (
            <View style={styles.emptyRow}>
              <Text style={styles.emptyText}>No records found</Text>
            </View>
          ) : (
            data.map((item, index) => {
              const statusCol = columns.find((c) => c.key.toLowerCase().includes('status'));
              const idCol = columns[0];
              const mainCol = columns[1];
              const otherCols = columns.filter(
                (c) => c.key !== idCol?.key && c.key !== mainCol?.key && !c.key.toLowerCase().includes('status')
              );

              return (
                <View key={keyExtractor(item, index)} style={styles.mobileCard}>
                  {/* Card Header: ID Badge & Status */}
                  <View style={styles.mobileCardHeader}>
                    <View style={styles.mobileCardIdBox}>
                      {idCol && (idCol.render ? idCol.render(item, index) : (
                        <Text style={styles.mobileCardIdText}>{String((item as any)[idCol.key] ?? '')}</Text>
                      ))}
                    </View>

                    {statusCol && (
                      <View>
                        {statusCol.render ? statusCol.render(item, index) : (
                          <StatusPill status={String((item as any)[statusCol.key] ?? '')} />
                        )}
                      </View>
                    )}
                  </View>

                  {/* Card Main Item (Title / Customer Name / Product) */}
                  {mainCol && (
                    <View style={styles.mobileCardMain}>
                      {mainCol.render ? (
                        mainCol.render(item, index)
                      ) : (
                        <Text style={styles.mobileCardMainTitle}>{String((item as any)[mainCol.key] ?? '')}</Text>
                      )}
                    </View>
                  )}

                  {/* Card Meta Grid (Other attributes: Region, Amount, Date, etc.) */}
                  {otherCols.length > 0 && (
                    <View style={styles.mobileCardMetaGrid}>
                      {otherCols.map((col) => (
                        <View key={col.key} style={styles.mobileCardMetaCol}>
                          <Text style={styles.mobileCardMetaLabel}>{col.header}</Text>
                          <View style={styles.mobileCardMetaValBox}>
                            {col.render ? (
                              col.render(item, index)
                            ) : (
                              <Text style={styles.mobileCardMetaValText}>
                                {String((item as any)[col.key] ?? '')}
                              </Text>
                            )}
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Action Button */}
                  {actionButtonLabel && (
                    <TouchableOpacity
                      style={styles.mobileCardFullActionBtn}
                      onPress={() => onRowAction && onRowAction(item)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.mobileCardFullActionText}>{actionButtonLabel}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })
          )}
        </View>
      ) : isDesktop ? (
        /* ─── Mode 2A: Desktop 100% Full-Width Table View ─── */
        <View style={styles.desktopTableContainer}>
          {renderTableContent()}
        </View>
      ) : (
        /* ─── Mode 2B: Mobile/Tablet Horizontal Scrolling Table ─── */
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          showsVerticalScrollIndicator={false}
          alwaysBounceHorizontal={true}
          style={styles.scrollWrapper}
          contentContainerStyle={{ minWidth: effectiveMinWidth }}
        >
          {renderTableContent(effectiveMinWidth)}
        </ScrollView>
      )}
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
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewSwitcher: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.secondary,
    borderRadius: THEME.radius.sm,
    padding: 2,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  viewSwitchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: THEME.radius.xs,
  },
  viewSwitchBtnActive: {
    backgroundColor: THEME.colors.card,
    elevation: 1,
  },
  viewSwitchText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
    color: THEME.colors.textMuted,
  },
  viewSwitchTextActive: {
    color: THEME.colors.textPrimary,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
  },
  scrollHintBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: THEME.colors.muted,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: THEME.radius.sm,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  scrollHintText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
    color: THEME.colors.textMuted,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
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
  desktopTableContainer: {
    width: '100%',
    overflow: 'hidden',
  },
  scrollWrapper: {
    width: '100%',
  },
  table: {
    width: '100%',
  },
  tableHeader: {
    width: '100%',
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
    width: '100%',
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
  // Mobile Cards Mode Styles
  cardsListContainer: {
    padding: 12,
    gap: 10,
    backgroundColor: '#fafbfc',
  },
  mobileCard: {
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 14,
    gap: 10,
    elevation: 1,
  },
  mobileCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mobileCardIdBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  mobileCardIdText: {
    fontSize: 12,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
  },
  mobileCardMain: {
    marginTop: 2,
  },
  mobileCardMainTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
  mobileCardMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle,
  },
  mobileCardMetaCol: {
    minWidth: '45%',
    flex: 1,
  },
  mobileCardMetaLabel: {
    fontSize: 10.5,
    color: THEME.colors.textMuted,
    fontFamily: THEME.fontFamily.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  mobileCardMetaValBox: {
    marginTop: 2,
  },
  mobileCardMetaValText: {
    fontSize: 12.5,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
  mobileCardFullActionBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  mobileCardFullActionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
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
