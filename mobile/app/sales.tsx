import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import {
  FileText,
  Coins,
  Clock,
  AlertTriangle,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  TrendingUp,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { AppShell } from '../components/AppShell';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { EnterpriseStatCard } from '../components/EnterpriseStatCard';
import { DataTable, StatusPill, IdBadge, Column } from '../components/DataTable';
import { LoadingView } from '../components/LoadingView';
import { DetailModal } from '../components/ActionModal';
import { getSales } from '../services/api';
import { Sale } from '../types/sales';

const STATUS_TABS = ['All', 'Approved', 'Pending', 'Cancelled'];

export default function SalesScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailItem, setDetailItem] = useState<Sale | null>(null);

  const fetchData = useCallback(
    async (silent = false, bypass = false) => {
      try {
        if (!silent && sales.length === 0) setLoading(true);
        setError(null);
        const data = await getSales({ search: searchQuery }, bypass);
        setSales(data);
      } catch (err: any) {
        setError(err.message || 'Unable to load sales transactions.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [sales.length, searchQuery]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true, true);
  };

  const filtered = sales.filter((s) => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Approved') return s.status === 'Completed';
    return s.status === activeTab;
  });

  const totalAmount = sales
    .filter((s) => s.status !== 'Cancelled')
    .reduce((a, c) => a + c.amount, 0);
  const approvedSales = sales.filter((s) => s.status === 'Completed');
  const pendingSales = sales.filter((s) => s.status === 'Pending');
  const cancelledSales = sales.filter((s) => s.status === 'Cancelled');

  const approvedAmount = approvedSales.reduce((a, c) => a + c.amount, 0);
  const pendingAmount = pendingSales.reduce((a, c) => a + c.amount, 0);
  const cancelledAmount = cancelledSales.reduce((a, c) => a + c.amount, 0);

  const avgOrderVal = Math.round(totalAmount / (approvedSales.length || 1));

  const columns: Column<Sale>[] = [
    {
      key: 'id',
      header: 'Order ID',
      width: 130,
      render: (item) => <IdBadge label={`ORD-${String(item.id).padStart(3, '0')}`} />,
    },
    {
      key: 'customer',
      header: 'Customer',
      flex: 1.4,
      render: (item) => (
        <View>
          <Text style={st.bold} numberOfLines={1}>
            {item.customer}
          </Text>
          <Text style={st.sub}>{item.date}</Text>
        </View>
      ),
    },
    {
      key: 'region',
      header: 'Territory',
      width: 120,
      render: (item) => <Text style={st.cellText}>{item.region}</Text>,
    },
    {
      key: 'amount',
      header: 'Amount',
      width: 120,
      align: 'right',
      render: (item) => (
        <Text style={st.amount}>₹{item.amount.toLocaleString('en-IN')}</Text>
      ),
    },
    {
      key: 'status',
      header: 'Fulfillment',
      width: 120,
      align: 'center',
      render: (item) => (
        <StatusPill status={item.status === 'Completed' ? 'Approved' : item.status} />
      ),
    },
  ];

  return (
    <AppShell
      activeTab="Sales"
      title="Sales Ledger"
      subtitle="Live transactions, status workflows, and settlement records"
      onSearch={setSearchQuery}
      searchPlaceholder="Search order ID, customer name, region..."
    >
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={THEME.colors.primary}
      />

      <LoadingView isLoading={loading} error={error} onRetry={() => fetchData(false, true)}>
        {/* ─── Top KPI Row with Sparklines ─── */}
        <View style={st.statsRow}>
          <EnterpriseStatCard
            label="Total Orders"
            value={sales.length}
            icon={FileText}
            trend="+12.4%"
            trendPositive={true}
            sparklineData={[28, 32, 36, 40, 44, 46]}
            subtitle="recorded transactions"
          />
          <EnterpriseStatCard
            label="Settled Revenue"
            value={`₹${(totalAmount / 1000).toFixed(0)}k`}
            icon={Coins}
            trend="+18.4%"
            trendPositive={true}
            sparklineData={[123, 177, 298, 420, 715, 898]}
            subtitle="gross settled volume"
          />
          <EnterpriseStatCard
            label="Average Order"
            value={`₹${avgOrderVal.toLocaleString('en-IN')}`}
            icon={TrendingUp}
            trend="+5.1%"
            trendPositive={true}
            sparklineData={[18500, 19200, 20100, 20424]}
            subtitle="basket ticket size"
          />
          <EnterpriseStatCard
            label="Pending Settlement"
            value={pendingSales.length}
            icon={Clock}
            variant="warning"
            trend={`${((pendingAmount / (totalAmount || 1)) * 100).toFixed(1)}%`}
            trendPositive={false}
            sparklineData={[3, 2, 4, 2]}
            subtitle={`₹${pendingAmount.toLocaleString('en-IN')} pending`}
          />
        </View>

        {/* ─── Pipeline Health & Settlement Progress Bar ─── */}
        <View style={st.pipelineCard}>
          <View style={st.pipelineHeader}>
            <View style={st.pipelineTitleRow}>
              <CheckCircle2 size={15} color="#0f172a" />
              <Text style={st.pipelineTitle}>Settlement & Approval Velocity</Text>
            </View>
            <Text style={st.pipelineRate}>
              {((approvedSales.length / (sales.length || 1)) * 100).toFixed(1)}% Fulfillment Rate
            </Text>
          </View>

          {/* Multi-segment settlement bar */}
          <View style={st.barTrack}>
            <View
              style={[
                st.barSegmentApproved,
                { width: `${(approvedSales.length / (sales.length || 1)) * 100}%` },
              ]}
            />
            <View
              style={[
                st.barSegmentPending,
                { width: `${(pendingSales.length / (sales.length || 1)) * 100}%` },
              ]}
            />
            <View
              style={[
                st.barSegmentCancelled,
                { width: `${(cancelledSales.length / (sales.length || 1)) * 100}%` },
              ]}
            />
          </View>

          {/* Legend */}
          <View style={st.legendRow}>
            <View style={st.legendItem}>
              <View style={[st.dot, { backgroundColor: '#10b981' }]} />
              <Text style={st.legendText}>
                Approved: {approvedSales.length} (₹{(approvedAmount / 1000).toFixed(0)}k)
              </Text>
            </View>
            <View style={st.legendItem}>
              <View style={[st.dot, { backgroundColor: '#f59e0b' }]} />
              <Text style={st.legendText}>
                Pending: {pendingSales.length} (₹{(pendingAmount / 1000).toFixed(0)}k)
              </Text>
            </View>
            <View style={st.legendItem}>
              <View style={[st.dot, { backgroundColor: '#ef4444' }]} />
              <Text style={st.legendText}>
                Cancelled: {cancelledSales.length} (₹{(cancelledAmount / 1000).toFixed(0)}k)
              </Text>
            </View>
          </View>
        </View>

        {/* ─── Filter Tabs & Table ─── */}
        <SegmentedTabs tabs={STATUS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

        <DataTable
          title="Transaction records"
          count={filtered.length}
          columns={columns}
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          actionButtonLabel="Inspect"
          onRowAction={(item) => setDetailItem(item)}
        />
      </LoadingView>

      {/* Detail Modal */}
      {detailItem && (
        <DetailModal
          title={`Order ORD-${String(detailItem.id).padStart(3, '0')}`}
          subtitle={`Recorded on ${detailItem.date}`}
          data={{
            Customer: detailItem.customer,
            Region: detailItem.region,
            Amount: `₹${detailItem.amount.toLocaleString('en-IN')}`,
            Status: detailItem.status,
            Date: detailItem.date,
          }}
          onClose={() => setDetailItem(null)}
        />
      )}
    </AppShell>
  );
}

const st = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  pipelineCard: {
    backgroundColor: '#ffffff',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 16,
    elevation: 1,
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
    gap: 10,
  },
  pipelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  pipelineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pipelineTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
  pipelineRate: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#047857',
  },
  barTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  barSegmentApproved: {
    backgroundColor: '#10b981',
    height: '100%',
  },
  barSegmentPending: {
    backgroundColor: '#f59e0b',
    height: '100%',
  },
  barSegmentCancelled: {
    backgroundColor: '#ef4444',
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  bold: {
    fontSize: 13,
    fontWeight: '600',
    color: '#09090b',
  },
  sub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  cellText: {
    fontSize: 13,
    color: '#334155',
  },
  amount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
});
