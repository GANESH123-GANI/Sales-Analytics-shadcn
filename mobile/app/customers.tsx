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
  Users,
  MapPin,
  ShoppingBag,
  Coins,
  Crown,
  Sparkles,
  TrendingUp,
  Award,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { AppShell } from '../components/AppShell';
import { EnterpriseStatCard } from '../components/EnterpriseStatCard';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { DataTable, IdBadge, Column } from '../components/DataTable';
import { LoadingView } from '../components/LoadingView';
import { DetailModal } from '../components/ActionModal';
import { getCustomers } from '../services/api';
import { Customer } from '../types/sales';

const TIER_TABS = ['All Accounts', 'VIP Tier (>₹75k)', 'Core Tier (₹35k-₹75k)', 'Emerging (<₹35k)'];

export default function CustomersScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTier, setActiveTier] = useState('All Accounts');
  const [detailItem, setDetailItem] = useState<Customer | null>(null);

  const fetchData = useCallback(
    async (silent = false, bypass = false) => {
      try {
        if (!silent && customers.length === 0) setLoading(true);
        setError(null);
        const data = await getCustomers({ search: searchQuery }, bypass);
        setCustomers(data);
      } catch (err: any) {
        setError(err.message || 'Unable to load clients.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [customers.length, searchQuery]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true, true);
  };

  const totalSpending = customers.reduce((a, c) => a + c.totalSpending, 0);
  const totalOrders = customers.reduce((a, c) => a + c.totalOrders, 0);
  const avgCustomerLTV = Math.round(totalSpending / (customers.length || 1));
  const activeRegions = new Set(customers.map((c) => c.region)).size;

  const vipCustomers = customers.filter((c) => c.totalSpending >= 75000);
  const coreCustomers = customers.filter((c) => c.totalSpending >= 35000 && c.totalSpending < 75000);
  const emergingCustomers = customers.filter((c) => c.totalSpending < 35000);

  const filtered = customers.filter((c) => {
    if (activeTier === 'VIP Tier (>₹75k)') return c.totalSpending >= 75000;
    if (activeTier === 'Core Tier (₹35k-₹75k)')
      return c.totalSpending >= 35000 && c.totalSpending < 75000;
    if (activeTier === 'Emerging (<₹35k)') return c.totalSpending < 35000;
    return true;
  });

  const columns: Column<Customer>[] = [
    {
      key: 'id',
      header: 'Client ID',
      width: 120,
      render: (item) => <IdBadge label={`CUST-${String(item.id).padStart(3, '0')}`} />,
    },
    {
      key: 'name',
      header: 'Customer Account',
      flex: 2,
      render: (item) => {
        const initials =
          (item.name || 'C')
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase() || 'C';

        const isVIP = item.totalSpending >= 75000;

        return (
          <View style={st.clientCell}>
            <View style={[st.avatar, isVIP && st.avatarVIP]}>
              <Text style={[st.avatarText, isVIP && st.avatarTextVIP]}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={st.nameRow}>
                <Text style={st.bold} numberOfLines={1}>
                  {item.name}
                </Text>
                {isVIP && (
                  <View style={st.vipBadge}>
                    <Crown size={10} color="#b45309" />
                    <Text style={st.vipBadgeText}>VIP</Text>
                  </View>
                )}
              </View>
              <Text style={st.sub}>{item.email}</Text>
            </View>
          </View>
        );
      },
    },
    {
      key: 'region',
      header: 'Territory',
      flex: 1.2,
      render: (item) => <Text style={st.bold}>{item.region}</Text>,
    },
    {
      key: 'totalOrders',
      header: 'Orders',
      width: 90,
      align: 'center',
      render: (item) => <Text style={st.cellText}>{item.totalOrders}</Text>,
    },
    {
      key: 'totalSpending',
      header: 'Lifetime Value (LTV)',
      flex: 1.3,
      align: 'right',
      render: (item) => (
        <Text style={st.amount}>₹{item.totalSpending.toLocaleString('en-IN')}</Text>
      ),
    },
  ];

  return (
    <AppShell
      activeTab="Customers"
      title="Client Directory & Accounts"
      subtitle="Customer portfolio, high-value accounts, and territorial concentration"
      onSearch={setSearchQuery}
      searchPlaceholder="Search client name, account email, or city..."
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
            label="Total Accounts"
            value={customers.length}
            icon={Users}
            trend="+25.0%"
            trendPositive={true}
            sparklineData={[11, 13, 14, 16]}
            subtitle="high-affinity buyers"
          />
          <EnterpriseStatCard
            label="Territorial Hubs"
            value={activeRegions}
            icon={MapPin}
            trend="100% active"
            trendPositive={true}
            sparklineData={[4, 5, 6, 6]}
            subtitle="cities across India"
          />
          <EnterpriseStatCard
            label="Average Account LTV"
            value={`₹${(avgCustomerLTV / 1000).toFixed(1)}k`}
            icon={Coins}
            trend="+14.2%"
            trendPositive={true}
            sparklineData={[42, 48, 51, 56]}
            subtitle="lifetime spend per account"
          />
          <EnterpriseStatCard
            label="VIP Portfolio"
            value={vipCustomers.length}
            icon={Crown}
            trend={`${((vipCustomers.length / (customers.length || 1)) * 100).toFixed(0)}% tier`}
            trendPositive={true}
            sparklineData={[2, 3, 4, 5]}
            subtitle="accounts >₹75,000"
          />
        </View>

        {/* ─── Portfolio Tier Distribution Strip ─── */}
        <View style={st.tierCard}>
          <View style={st.tierHeader}>
            <View style={st.tierTitleRow}>
              <Award size={15} color="#0f172a" />
              <Text style={st.tierTitle}>Customer LTV Tier Breakdown</Text>
            </View>
            <Text style={st.tierLtvAvg}>
              Portfolio Total: ₹{(totalSpending / 100000).toFixed(1)} Lakhs
            </Text>
          </View>

          <View style={st.tierBarTrack}>
            <View
              style={[
                st.tierBarVip,
                { width: `${(vipCustomers.length / (customers.length || 1)) * 100}%` },
              ]}
            />
            <View
              style={[
                st.tierBarCore,
                { width: `${(coreCustomers.length / (customers.length || 1)) * 100}%` },
              ]}
            />
            <View
              style={[
                st.tierBarEmerging,
                { width: `${(emergingCustomers.length / (customers.length || 1)) * 100}%` },
              ]}
            />
          </View>

          <View style={st.tierLegend}>
            <Text style={st.tierLegendText}>
              👑 VIP Tier: {vipCustomers.length} accounts (
              {((vipCustomers.reduce((a, c) => a + c.totalSpending, 0) / (totalSpending || 1)) * 100).toFixed(0)}% revenue)
            </Text>
            <Text style={st.tierLegendText}>
              ⭐ Core Tier: {coreCustomers.length} accounts
            </Text>
            <Text style={st.tierLegendText}>
              🌱 Emerging: {emergingCustomers.length} accounts
            </Text>
          </View>
        </View>

        {/* ─── Segmented Tabs & Data Table ─── */}
        <SegmentedTabs
          tabs={TIER_TABS}
          activeTab={activeTier}
          onTabChange={setActiveTier}
          scrollable
        />

        <DataTable
          title="Account ledger"
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
          title={detailItem.name}
          subtitle={`Account CUST-${String(detailItem.id).padStart(3, '0')}`}
          data={{
            Email: detailItem.email,
            Territory: detailItem.region,
            'Total Orders': detailItem.totalOrders,
            'Lifetime Spend': `₹${detailItem.totalSpending.toLocaleString('en-IN')}`,
            Tier: detailItem.totalSpending >= 75000 ? '👑 VIP Tier' : detailItem.totalSpending >= 35000 ? '⭐ Core Tier' : '🌱 Emerging',
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
    gap: 10,
    marginBottom: 12,
  },
  tierCard: {
    backgroundColor: '#ffffff',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 12,
    marginBottom: 12,
    ...THEME.shadow.card,
    gap: 8,
  },
  tierHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  tierTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tierTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
  tierLtvAvg: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#047857',
  },
  tierBarTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  tierBarVip: {
    backgroundColor: '#0f172a',
    height: '100%',
  },
  tierBarCore: {
    backgroundColor: '#3b82f6',
    height: '100%',
  },
  tierBarEmerging: {
    backgroundColor: '#94a3b8',
    height: '100%',
  },
  tierLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  tierLegendText: {
    fontSize: 11,
    color: '#64748b',
    fontWeight: '500',
  },
  clientCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarVIP: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#fde68a',
  },
  avatarText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  avatarTextVIP: {
    color: '#b45309',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  vipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  vipBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#b45309',
  },
  bold: {
    fontSize: 13,
    fontWeight: '600',
    color: '#09090b',
  },
  sub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
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
