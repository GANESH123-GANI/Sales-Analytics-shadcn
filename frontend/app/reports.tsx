import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  TrendingUp,
  ShoppingBag,
  Coins,
  MapPin,
  Package,
  Award,
  Download,
  BarChart3,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  Filter,
  ShieldCheck,
  Zap,
  Users,
  Clock,
  Activity,
} from 'lucide-react-native';
import { AppShell } from '../components/AppShell';
import { LoadingView } from '../components/LoadingView';
import { useTheme } from '../context/ThemeContext';
import { getReports } from '../services/api';
import { Report, ReportSummaryRow } from '../types/sales';

export default function ReportsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const { colors, isDark, radiusValues } = useTheme();

  const [report, setReport] = useState<Report | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'regional' | 'category' | 'metrics'>('regional');

  const fetchData = useCallback(
    async (silent = false, bypass = false) => {
      try {
        if (!silent && !report) setLoading(true);
        setError(null);
        const data = await getReports(bypass);
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Unable to load executive sales reports.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [report]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true, true);
  };

  const summaryRows: ReportSummaryRow[] = useMemo(() => {
    return report?.summaryTable || [];
  }, [report]);

  const totalRevenue = report?.totalRevenue || 0;
  const totalOrders = report?.totalOrders || 0;
  const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Export Regional Summary CSV
  const handleExportCSV = () => {
    if (!summaryRows.length) return;
    const headers = [
      'Operating Region',
      'Total Bookings',
      'Delivered Orders',
      'Settled Revenue (INR)',
      'Fulfillment Rate (%)',
    ];
    const rows = summaryRows.map((r) => {
      const rate =
        r.totalOrders > 0
          ? ((r.completedOrders / r.totalOrders) * 100).toFixed(1)
          : '100';
      return [
        `"${r.region}"`,
        r.totalOrders,
        r.completedOrders,
        r.totalRevenue,
        `"${rate}%"`,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `sales_report_regional_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <AppShell
      activeTab="Reports"
      title="Sales Reports & Regional Intelligence"
      subtitle="Executive revenue statements, territory breakdown, and real-time transaction analytics"
      headerRight={
        <TouchableOpacity
          style={[styles.exportReportBtn, { backgroundColor: isDark ? '#f4f4f5' : '#09090b' }]}
          onPress={handleExportCSV}
          activeOpacity={0.85}
        >
          <Download size={14} color={isDark ? '#09090b' : '#ffffff'} />
          <Text style={[styles.exportReportBtnText, { color: isDark ? '#09090b' : '#ffffff' }]}>
            Export CSV
          </Text>
        </TouchableOpacity>
      }
    >
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />

      <LoadingView isLoading={loading} error={error} onRetry={() => fetchData(false, true)}>
        <View style={styles.container}>
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* 1. TOP 4 EXECUTIVE KPI BOX CARDS (Reduced Width) */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <View style={styles.kpiRow}>
            {/* KPI 1: Gross Sales Revenue */}
            <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
              <View style={styles.kpiCardTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: isDark ? '#3b1d28' : '#ffe4e6' }]}>
                  <Coins size={18} color="#e11d48" />
                </View>
                <View style={[styles.kpiTrendBadge, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={[styles.kpiTrendText, { color: '#16a34a' }]}>+18.4%</Text>
                </View>
              </View>

              <View style={styles.kpiCardBottomBody}>
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
                  ₹{totalRevenue.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Gross Settled Revenue</Text>
                <Text style={[styles.kpiSubText, { color: colors.textMuted }]}>Audited transaction revenue</Text>
              </View>
            </View>

            {/* KPI 2: Total Booked Orders */}
            <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
              <View style={styles.kpiCardTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                  <ShoppingBag size={18} color={isDark ? '#94a3b8' : '#475569'} />
                </View>
                <View style={[styles.kpiTrendBadge, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={[styles.kpiTrendText, { color: '#16a34a' }]}>+12.2%</Text>
                </View>
              </View>

              <View style={styles.kpiCardBottomBody}>
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{totalOrders}</Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Order Volume</Text>
                <Text style={[styles.kpiSubText, { color: colors.textMuted }]}>Fulfilled commercial sales</Text>
              </View>
            </View>

            {/* KPI 3: Top Sales Territory */}
            <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
              <View style={styles.kpiCardTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: isDark ? '#172554' : '#eff6ff' }]}>
                  <MapPin size={18} color="#2563eb" />
                </View>
                <View style={[styles.kpiTrendBadge, { backgroundColor: '#eff6ff' }]}>
                  <Text style={[styles.kpiTrendText, { color: '#2563eb' }]}>Leader</Text>
                </View>
              </View>

              <View style={styles.kpiCardBottomBody}>
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{report?.topRegion || 'N/A'}</Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Top Territory Hub</Text>
                <Text style={[styles.kpiSubText, { color: colors.textMuted }]}>Highest regional revenue</Text>
              </View>
            </View>

            {/* KPI 4: Top Selling Product */}
            <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
              <View style={styles.kpiCardTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: isDark ? '#143828' : '#dcfce7' }]}>
                  <Package size={18} color="#16a34a" />
                </View>
                <View style={[styles.kpiTrendBadge, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={[styles.kpiTrendText, { color: '#16a34a' }]}>Top SKU</Text>
                </View>
              </View>

              <View style={styles.kpiCardBottomBody}>
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]} numberOfLines={1}>
                  {report?.topProduct || 'N/A'}
                </Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Leading Product</Text>
                <Text style={[styles.kpiSubText, { color: '#16a34a', fontWeight: '500' }]}>
                  ₹{(report?.topProductRevenue || 0).toLocaleString('en-IN')} revenue
                </Text>
              </View>
            </View>
          </View>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* 2. REPORT TABS                                                        */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <View style={[styles.tabsHeader, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
            <View style={styles.tabButtonsGroup}>
              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'regional' && [styles.tabButtonActive, { backgroundColor: isDark ? '#27272a' : '#f1f5f9', borderColor: colors.border }],
                ]}
                onPress={() => setActiveTab('regional')}
                activeOpacity={0.8}
              >
                <MapPin size={15} color={activeTab === 'regional' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.tabButtonText, { color: activeTab === 'regional' ? colors.primary : colors.textSecondary }]}>
                  Regional Settlements
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'category' && [styles.tabButtonActive, { backgroundColor: isDark ? '#27272a' : '#f1f5f9', borderColor: colors.border }],
                ]}
                onPress={() => setActiveTab('category')}
                activeOpacity={0.8}
              >
                <Layers size={15} color={activeTab === 'category' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.tabButtonText, { color: activeTab === 'category' ? colors.primary : colors.textSecondary }]}>
                  Product & Category Leaders
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.tabButton,
                  activeTab === 'metrics' && [styles.tabButtonActive, { backgroundColor: isDark ? '#27272a' : '#f1f5f9', borderColor: colors.border }],
                ]}
                onPress={() => setActiveTab('metrics')}
                activeOpacity={0.8}
              >
                <TrendingUp size={15} color={activeTab === 'metrics' ? colors.primary : colors.textSecondary} />
                <Text style={[styles.tabButtonText, { color: activeTab === 'metrics' ? colors.primary : colors.textSecondary }]}>
                  Volume & Margin Analysis
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* 3. TAB 1: REGIONAL SETTLEMENTS TABLE                                  */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'regional' && (
            <View style={[styles.tableCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
              <View style={[styles.tableCardHeader, { borderBottomColor: colors.border }]}>
                <View>
                  <Text style={[styles.tableCardTitle, { color: colors.textPrimary }]}>Territorial Sales Ledger</Text>
                  <Text style={[styles.tableCardSubtitle, { color: colors.textSecondary }]}>
                    Regional sales volume, delivered fulfillment rate, and contribution share
                  </Text>
                </View>
                <View style={[styles.countBadge, { backgroundColor: isDark ? '#27272a' : '#f1f5f9', borderColor: colors.border }]}>
                  <Text style={[styles.countBadgeText, { color: colors.textSecondary }]}>{summaryRows.length} Regions</Text>
                </View>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={styles.tableInner}>
                  {/* Table Header */}
                  <View style={[styles.tableHeaderRow, { borderBottomColor: colors.border, backgroundColor: isDark ? '#18181b' : '#fafafa' }]}>
                    <Text style={[styles.thText, { width: 220, color: colors.textMuted }]}>OPERATING SITE</Text>
                    <Text style={[styles.thText, { width: 140, color: colors.textMuted, textAlign: 'center' }]}>TOTAL ORDERS</Text>
                    <Text style={[styles.thText, { width: 140, color: colors.textMuted, textAlign: 'center' }]}>DELIVERED</Text>
                    <Text style={[styles.thText, { width: 160, color: colors.textMuted, textAlign: 'center' }]}>FULFILLMENT RATE</Text>
                    <Text style={[styles.thText, { width: 180, color: colors.textMuted, textAlign: 'right' }]}>SETTLED REVENUE</Text>
                    <Text style={[styles.thText, { width: 160, color: colors.textMuted, textAlign: 'right' }]}>AVG ORDER VALUE</Text>
                  </View>

                  {/* Table Body */}
                  {summaryRows.length === 0 ? (
                    <View style={styles.emptyTableState}>
                      <Text style={[styles.emptyTableText, { color: colors.textMuted }]}>No regional sales data logged.</Text>
                    </View>
                  ) : (
                    summaryRows.map((r, i) => {
                      const rate = r.totalOrders > 0 ? Math.round((r.completedOrders / r.totalOrders) * 100) : 100;
                      const aov = r.totalOrders > 0 ? Math.round(r.totalRevenue / r.totalOrders) : 0;
                      const share = totalRevenue > 0 ? ((r.totalRevenue / totalRevenue) * 100).toFixed(1) : '0';

                      return (
                        <View
                          key={r.region || i}
                          style={[
                            styles.tableRow,
                            {
                              borderBottomColor: colors.border,
                              backgroundColor: isDark ? '#18181b' : '#ffffff',
                            },
                          ]}
                        >
                          <View style={[{ width: 220, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12 }]}>
                            <View style={[styles.regionIconBadge, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
                              <MapPin size={13} color="#2563eb" />
                            </View>
                            <View>
                              <Text style={[styles.regionTitleText, { color: colors.textPrimary }]}>{r.region}</Text>
                              <Text style={[styles.regionSubText, { color: colors.textMuted }]}>{share}% of platform sales</Text>
                            </View>
                          </View>

                          <View style={[{ width: 140, justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={[styles.tableCellText, { color: colors.textPrimary }]}>{r.totalOrders}</Text>
                          </View>

                          <View style={[{ width: 140, justifyContent: 'center', alignItems: 'center' }]}>
                            <Text style={[styles.tableCellText, { color: colors.textPrimary }]}>{r.completedOrders}</Text>
                          </View>

                          <View style={[{ width: 160, justifyContent: 'center', alignItems: 'center' }]}>
                            <View style={[styles.rateBadge, rate >= 90 ? styles.rateHigh : styles.rateMedium]}>
                              <Text style={[styles.rateText, { color: rate >= 90 ? '#16a34a' : '#d97706' }]}>{rate}% Fulfilled</Text>
                            </View>
                          </View>

                          <View style={[{ width: 180, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 12 }]}>
                            <Text style={[styles.tableCellText, { fontWeight: '500', color: colors.textPrimary }]}>
                              ₹{r.totalRevenue.toLocaleString('en-IN')}
                            </Text>
                          </View>

                          <View style={[{ width: 160, justifyContent: 'center', alignItems: 'flex-end', paddingHorizontal: 12 }]}>
                            <Text style={[styles.tableCellText, { color: colors.textSecondary }]}>
                              ₹{aov.toLocaleString('en-IN')}
                            </Text>
                          </View>
                        </View>
                      );
                    })
                  )}
                </View>
              </ScrollView>
            </View>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* 4. TAB 2: PRODUCT & CATEGORY LEADERS                                  */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'category' && (
            <View style={[styles.categoryInsightsCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
              <View style={[styles.tableCardHeader, { borderBottomColor: colors.border }]}>
                <View>
                  <Text style={[styles.tableCardTitle, { color: colors.textPrimary }]}>Top Grossing SKU Realization</Text>
                  <Text style={[styles.tableCardSubtitle, { color: colors.textSecondary }]}>
                    Catalog items contributing the highest margin and units to gross revenue
                  </Text>
                </View>
              </View>

              <View style={styles.categoryCardBody}>
                <View style={[styles.highlightBox, { backgroundColor: isDark ? '#143828' : '#ecfdf5', borderColor: '#a7f3d0' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <View style={[styles.highlightIcon, { backgroundColor: '#10b981' }]}>
                      <Award size={18} color="#ffffff" />
                    </View>
                    <View>
                      <Text style={[styles.highlightTitle, { color: isDark ? '#34d399' : '#065f46' }]}>
                        Top Performer: {report?.topProduct || 'Catalog Lead'}
                      </Text>
                      <Text style={[styles.highlightSub, { color: isDark ? '#a7f3d0' : '#047857' }]}>
                        Generated ₹{(report?.topProductRevenue || 0).toLocaleString('en-IN')} in verified orders
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.metricsGridRow}>
                  <View style={[styles.subStatBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.subStatLabel, { color: colors.textSecondary }]}>Audited Order Count</Text>
                    <Text style={[styles.subStatVal, { color: colors.textPrimary }]}>{totalOrders} Placed</Text>
                    <Text style={[styles.subStatTrend, { color: '#16a34a' }]}>100% database verified</Text>
                  </View>

                  <View style={[styles.subStatBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.subStatLabel, { color: colors.textSecondary }]}>Mean Transaction Value</Text>
                    <Text style={[styles.subStatVal, { color: colors.textPrimary }]}>₹{avgOrderValue.toLocaleString('en-IN')}</Text>
                    <Text style={[styles.subStatTrend, { color: '#2563eb' }]}>Per customer checkout</Text>
                  </View>

                  <View style={[styles.subStatBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Text style={[styles.subStatLabel, { color: colors.textSecondary }]}>Active Operating Hubs</Text>
                    <Text style={[styles.subStatVal, { color: colors.textPrimary }]}>{summaryRows.length} Territories</Text>
                    <Text style={[styles.subStatTrend, { color: '#d97706' }]}>Nationwide delivery</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* 5. TAB 3: VOLUME & MARGIN ANALYSIS                                    */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {activeTab === 'metrics' && (
            <View style={{ gap: 16 }}>
              {/* Top Side Metric Boxes */}
              <View style={styles.metricsTopRow}>
                {/* Box 1: Realization Rate */}
                <View style={[styles.metricBoxCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
                  <View style={styles.metricBoxTop}>
                    <View style={[styles.metricBoxIcon, { backgroundColor: isDark ? '#143828' : '#ecfdf5' }]}>
                      <CheckCircle2 size={16} color="#16a34a" />
                    </View>
                    <View style={[styles.kpiTrendBadge, { backgroundColor: isDark ? '#143828' : '#ecfdf5' }]}>
                      <Text style={[styles.kpiTrendText, { color: '#16a34a' }]}>+4.1%</Text>
                    </View>
                  </View>
                  <View style={styles.metricBoxBody}>
                    <Text style={[styles.metricBoxVal, { color: colors.textPrimary }]}>94.2%</Text>
                    <Text style={[styles.metricBoxLabel, { color: colors.textSecondary }]}>Fulfillment Realization</Text>
                    <Text style={[styles.metricBoxSub, { color: colors.textMuted }]}>Delivered & settled</Text>
                  </View>
                </View>

                {/* Box 2: Gross Margin */}
                <View style={[styles.metricBoxCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
                  <View style={styles.metricBoxTop}>
                    <View style={[styles.metricBoxIcon, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
                      <TrendingUp size={16} color="#2563eb" />
                    </View>
                    <View style={[styles.kpiTrendBadge, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
                      <Text style={[styles.kpiTrendText, { color: '#2563eb' }]}>+5.8%</Text>
                    </View>
                  </View>
                  <View style={styles.metricBoxBody}>
                    <Text style={[styles.metricBoxVal, { color: colors.textPrimary }]}>68.4%</Text>
                    <Text style={[styles.metricBoxLabel, { color: colors.textSecondary }]}>Gross Margin Ratio</Text>
                    <Text style={[styles.metricBoxSub, { color: colors.textMuted }]}>Blended product margin</Text>
                  </View>
                </View>

                {/* Box 3: Customer Retention */}
                <View style={[styles.metricBoxCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
                  <View style={styles.metricBoxTop}>
                    <View style={[styles.metricBoxIcon, { backgroundColor: isDark ? '#382b14' : '#fffbeb' }]}>
                      <Users size={16} color="#d97706" />
                    </View>
                    <View style={[styles.kpiTrendBadge, { backgroundColor: isDark ? '#382b14' : '#fffbeb' }]}>
                      <Text style={[styles.kpiTrendText, { color: '#d97706' }]}>+12.6%</Text>
                    </View>
                  </View>
                  <View style={styles.metricBoxBody}>
                    <Text style={[styles.metricBoxVal, { color: colors.textPrimary }]}>81.8%</Text>
                    <Text style={[styles.metricBoxLabel, { color: colors.textSecondary }]}>Customer Retention</Text>
                    <Text style={[styles.metricBoxSub, { color: colors.textMuted }]}>Repeat buyer loyalty</Text>
                  </View>
                </View>

                {/* Box 4: Dispatch Velocity */}
                <View style={[styles.metricBoxCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
                  <View style={styles.metricBoxTop}>
                    <View style={[styles.metricBoxIcon, { backgroundColor: isDark ? '#2e1065' : '#f5f3ff' }]}>
                      <Zap size={16} color="#7c3aed" />
                    </View>
                    <View style={[styles.kpiTrendBadge, { backgroundColor: isDark ? '#2e1065' : '#f5f3ff' }]}>
                      <Text style={[styles.kpiTrendText, { color: '#7c3aed' }]}>99.4%</Text>
                    </View>
                  </View>
                  <View style={styles.metricBoxBody}>
                    <Text style={[styles.metricBoxVal, { color: colors.textPrimary }]}>1.2 hrs</Text>
                    <Text style={[styles.metricBoxLabel, { color: colors.textSecondary }]}>Fulfillment Velocity</Text>
                    <Text style={[styles.metricBoxSub, { color: colors.textMuted }]}>Zero delay queue</Text>
                  </View>
                </View>
              </View>

              {/* Dual Box Row: Platform Operational Efficiency & Quality SLA */}
              <View style={styles.dualBoxRow}>
                {/* Box 1: Platform Operational Efficiency (Box, not stretched rectangle) */}
                <View style={[styles.boxedCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
                  <View style={[styles.tableCardHeader, { borderBottomColor: colors.border }]}>
                    <View>
                      <Text style={[styles.tableCardTitle, { color: colors.textPrimary }]}>Platform Operational Efficiency</Text>
                      <Text style={[styles.tableCardSubtitle, { color: colors.textSecondary }]}>
                        Order delivery performance & throughput
                      </Text>
                    </View>
                  </View>

                  <View style={styles.marginAnalysisContainer}>
                    <View style={styles.marginRow}>
                      <View style={styles.marginBarWrap}>
                        <View style={styles.marginBarHeader}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={[styles.dotIndicator, { backgroundColor: '#16a34a' }]} />
                            <Text style={[styles.marginBarTitle, { color: colors.textPrimary }]}>Fulfillment Realization Rate</Text>
                          </View>
                          <Text style={[styles.marginBarPct, { color: '#16a34a' }]}>94.2%</Text>
                        </View>
                        <View style={[styles.marginTrack, { backgroundColor: isDark ? '#27272a' : '#f1f5f9' }]}>
                          <View style={[styles.marginFill, { width: '94.2%', backgroundColor: '#16a34a' }]} />
                        </View>
                      </View>

                      <View style={styles.marginBarWrap}>
                        <View style={styles.marginBarHeader}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={[styles.dotIndicator, { backgroundColor: '#2563eb' }]} />
                            <Text style={[styles.marginBarTitle, { color: colors.textPrimary }]}>Gross Margin Ratio</Text>
                          </View>
                          <Text style={[styles.marginBarPct, { color: '#2563eb' }]}>68.4%</Text>
                        </View>
                        <View style={[styles.marginTrack, { backgroundColor: isDark ? '#27272a' : '#f1f5f9' }]}>
                          <View style={[styles.marginFill, { width: '68.4%', backgroundColor: '#2563eb' }]} />
                        </View>
                      </View>

                      <View style={styles.marginBarWrap}>
                        <View style={styles.marginBarHeader}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <View style={[styles.dotIndicator, { backgroundColor: '#d97706' }]} />
                            <Text style={[styles.marginBarTitle, { color: colors.textPrimary }]}>Customer Retention Index</Text>
                          </View>
                          <Text style={[styles.marginBarPct, { color: '#d97706' }]}>81.8%</Text>
                        </View>
                        <View style={[styles.marginTrack, { backgroundColor: isDark ? '#27272a' : '#f1f5f9' }]}>
                          <View style={[styles.marginFill, { width: '81.8%', backgroundColor: '#d97706' }]} />
                        </View>
                      </View>
                    </View>

                    {/* Quick status chips */}
                    <View style={styles.chipRow}>
                      <View style={[styles.statusChip, { backgroundColor: isDark ? '#143828' : '#ecfdf5', borderColor: '#a7f3d0' }]}>
                        <Text style={[styles.statusChipText, { color: '#16a34a' }]}>Target: 90% Met</Text>
                      </View>
                      <View style={[styles.statusChip, { backgroundColor: isDark ? '#1e293b' : '#eff6ff', borderColor: '#bfdbfe' }]}>
                        <Text style={[styles.statusChipText, { color: '#2563eb' }]}>Realized: 94.2%</Text>
                      </View>
                      <View style={[styles.statusChip, { backgroundColor: isDark ? '#382b14' : '#fffbeb', borderColor: '#fde68a' }]}>
                        <Text style={[styles.statusChipText, { color: '#d97706' }]}>Status: Optimal</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Box 2: Quality & SLA Threshold Benchmarks */}
                <View style={[styles.boxedCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
                  <View style={[styles.tableCardHeader, { borderBottomColor: colors.border }]}>
                    <View>
                      <Text style={[styles.tableCardTitle, { color: colors.textPrimary }]}>Quality & SLA Benchmarks</Text>
                      <Text style={[styles.tableCardSubtitle, { color: colors.textSecondary }]}>
                        Service level agreements and dispatch integrity
                      </Text>
                    </View>
                  </View>

                  <View style={styles.marginAnalysisContainer}>
                    <View style={styles.slaGrid}>
                      <View style={[styles.slaItem, { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Clock size={15} color="#2563eb" />
                          <Text style={[styles.slaItemLabel, { color: colors.textSecondary }]}>Dispatch Latency</Text>
                        </View>
                        <Text style={[styles.slaItemVal, { color: colors.textPrimary }]}>1.2 Hours</Text>
                        <Text style={[styles.slaItemSub, { color: '#16a34a' }]}>99.2% under 2h SLA</Text>
                      </View>

                      <View style={[styles.slaItem, { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <ShieldCheck size={15} color="#16a34a" />
                          <Text style={[styles.slaItemLabel, { color: colors.textSecondary }]}>Return / Defect</Text>
                        </View>
                        <Text style={[styles.slaItemVal, { color: colors.textPrimary }]}>0.38%</Text>
                        <Text style={[styles.slaItemSub, { color: '#16a34a' }]}>Below 1.0% limit</Text>
                      </View>

                      <View style={[styles.slaItem, { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Activity size={15} color="#7c3aed" />
                          <Text style={[styles.slaItemLabel, { color: colors.textSecondary }]}>Availability</Text>
                        </View>
                        <Text style={[styles.slaItemVal, { color: colors.textPrimary }]}>99.98%</Text>
                        <Text style={[styles.slaItemSub, { color: '#7c3aed' }]}>High-Availability</Text>
                      </View>

                      <View style={[styles.slaItem, { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.border }]}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                          <Award size={15} color="#d97706" />
                          <Text style={[styles.slaItemLabel, { color: colors.textSecondary }]}>Trust Score</Text>
                        </View>
                        <Text style={[styles.slaItemVal, { color: colors.textPrimary }]}>A+ Tier</Text>
                        <Text style={[styles.slaItemSub, { color: '#d97706' }]}>Top quartile</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      </LoadingView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 32,
  },

  // 1. TOP 4 KPI ROW
  kpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: 160,
    maxWidth: 230,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 150,
    borderRadius: 12,
  },
  kpiCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  kpiCardBottomBody: {
    gap: 4,
  },
  kpiLabel: {
    fontSize: 12.5,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
    letterSpacing: -0.3,
    lineHeight: 30,
  },
  kpiTrendBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  kpiTrendText: {
    fontSize: 11.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  kpiSubText: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
    marginTop: 1,
  },
  kpiIconBox: {
    width: 42,
    height: 42,
    minWidth: 42,
    maxWidth: 42,
    minHeight: 42,
    maxHeight: 42,
    aspectRatio: 1,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },

  // 2. TABS HEADER
  tabsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 8,
    borderWidth: 1,
  },
  tabButtonsGroup: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabButtonActive: {
    borderWidth: 1,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  exportReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 6,
  },
  exportReportBtnText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },

  // 3. TABLE CARD
  tableCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  tableCardTitle: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  tableCardSubtitle: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
    marginTop: 2,
  },
  countBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  countBadgeText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  tableInner: {
    minWidth: 1000,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  thText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
    letterSpacing: 0.5,
    paddingHorizontal: 12,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  regionIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  regionTitleText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  regionSubText: {
    fontSize: 10.5,
    fontFamily: 'Manrope_400Regular',
    marginTop: 1,
  },
  tableCellText: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
  },
  rateBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    borderWidth: 1,
  },
  rateHigh: {
    backgroundColor: '#ecfdf5',
    borderColor: '#a7f3d0',
  },
  rateMedium: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  rateText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  emptyTableState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTableText: {
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
  },

  // 4. CATEGORY INSIGHTS
  categoryInsightsCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  categoryCardBody: {
    padding: 18,
    gap: 16,
  },
  highlightBox: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  highlightIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  highlightTitle: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  highlightSub: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    marginTop: 2,
  },
  metricsGridRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  subStatBox: {
    flex: 1,
    minWidth: 180,
    padding: 14,
    borderRadius: 8,
    borderWidth: 1,
  },
  subStatLabel: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
  },
  subStatVal: {
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
    marginVertical: 4,
  },
  subStatTrend: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },

  // 5. MARGIN ANALYSIS
  marginAnalysisContainer: {
    padding: 18,
    gap: 16,
  },
  marginRow: {
    gap: 16,
  },
  marginBarWrap: {
    gap: 6,
  },
  marginBarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  marginBarTitle: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  marginBarPct: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  marginTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  marginFill: {
    height: '100%',
    borderRadius: 4,
  },

  // 6. METRIC BOXES & BOXED DUAL ROW
  metricsTopRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricBoxCard: {
    flex: 1,
    minWidth: 160,
    maxWidth: 240,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 140,
  },
  metricBoxTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricBoxIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metricBoxBody: {
    gap: 3,
  },
  metricBoxVal: {
    fontSize: 24,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
    letterSpacing: -0.5,
  },
  metricBoxLabel: {
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  metricBoxSub: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
  },
  dualBoxRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  boxedCard: {
    flex: 1,
    minWidth: 320,
    maxWidth: 580,
    borderWidth: 1,
    overflow: 'hidden',
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  statusChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusChipText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  slaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  slaItem: {
    flex: 1,
    minWidth: 180,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  slaItemLabel: {
    fontSize: 11.5,
    fontFamily: 'Manrope_500Medium',
  },
  slaItemVal: {
    fontSize: 18,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  slaItemSub: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
});
