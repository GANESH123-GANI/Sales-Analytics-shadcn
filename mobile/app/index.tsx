import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import {
  FileText,
  Coins,
  Clock,
  AlertTriangle,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { AppShell } from '../components/AppShell';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { EnterpriseStatCard } from '../components/EnterpriseStatCard';
import { CostProgressBar } from '../components/CostProgressBar';
import { SpotlightCard } from '../components/SpotlightCard';
import { DataTable, StatusPill, IdBadge, Column } from '../components/DataTable';
import { RevenueChart } from '../components/RevenueChart';
import { CategoryChart } from '../components/CategoryChart';
import { RegionChart } from '../components/RegionChart';
import { OrderStatusChart } from '../components/OrderStatusChart';
import { YearSalesCard } from '../components/YearSalesCard';
import { LoadingView } from '../components/LoadingView';
import {
  getDashboardAll,
  getSales,
  getReports,
  getCustomers,
} from '../services/api';
import {
  CategorySales,
  Customer,
  DashboardSummary,
  MonthlyRevenue,
  OrderStatusData,
  RegionSales,
  Report,
  Sale,
} from '../types/sales';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const [loading,        setLoading]       = useState<boolean>(true);
  const [refreshing,     setRefreshing]    = useState<boolean>(false);
  const [error,          setError]         = useState<string | null>(null);
  const [subTab,         setSubTab]        = useState<string>('Total sales');
  const [summary,        setSummary]       = useState<DashboardSummary | null>(null);
  const [monthlyRevenue, setMonthlyRevenue]= useState<MonthlyRevenue[]>([]);
  const [categorySales,  setCategorySales] = useState<CategorySales[]>([]);
  const [regionSales,    setRegionSales]   = useState<RegionSales[]>([]);
  const [orderStatus,    setOrderStatus]   = useState<OrderStatusData | null>(null);
  const [recentSales,    setRecentSales]   = useState<Sale[]>([]);
  const [customers,      setCustomers]     = useState<Customer[]>([]);
  const [report,         setReport]        = useState<Report | null>(null);

  const fetchDashboardData = useCallback(async (isSilent = false, isRefresh = false) => {
    try {
      if (!isSilent && !summary) setLoading(true);
      setError(null);

      const [dashData, salesData, reportData, customerData] = await Promise.all([
        getDashboardAll(isRefresh),
        getSales({}, isRefresh),
        getReports(isRefresh),
        getCustomers({}, isRefresh),
      ]);

      setSummary(dashData.summary);
      setMonthlyRevenue(dashData.monthlyRevenue);
      setCategorySales(dashData.categorySales);
      setRegionSales(dashData.regionSales);
      setOrderStatus(dashData.orderStatus);
      setRecentSales(salesData.slice(0, 5));
      setCustomers(customerData.slice(0, 5));
      setReport(reportData);
    } catch (err: any) {
      console.error('[Dashboard Error]', err.message);
      setError(err.message || 'Unable to load dashboard data. Please verify backend is running.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [summary]);

  useEffect(() => { fetchDashboardData(false, false); }, [fetchDashboardData]);
  const onRefresh = () => { setRefreshing(true); fetchDashboardData(true, true); };

  // ─── Table columns ──────────────────────────────────────────────────────────
  const salesColumns: Column<Sale>[] = [
    {
      key: 'id',
      header: 'Order ID',
      width: 140,
      render: (item) => <IdBadge label={`ORD-${String(item.id).padStart(3, '0')}`} />,
    },
    {
      key: 'customer',
      header: 'Customer',
      flex: 1.5,
      render: (item) => (
        <View>
          <Text style={styles.cellBold} numberOfLines={1}>{item.customer}</Text>
          <Text style={styles.cellSub}>{item.region}</Text>
        </View>
      ),
    },
    {
      key: 'amount',
      header: 'Sales',
      width: 110,
      align: 'right',
      render: (item) => <Text style={styles.amountText}>₹{item.amount.toLocaleString('en-IN')}</Text>,
    },
    {
      key: 'status',
      header: 'Status',
      width: 110,
      align: 'center',
      render: (item) => <StatusPill status={item.status === 'Completed' ? 'Approved' : item.status} />,
    },
  ];

  const customerColumns: Column<Customer>[] = [
    {
      key: 'id',
      header: 'Customer ID',
      width: 120,
      render: (item) => <IdBadge label={`CUST-${String(item.id).padStart(3, '0')}`} />,
    },
    {
      key: 'name',
      header: 'Customer',
      flex: 1.5,
      render: (item) => (
        <View>
          <Text style={styles.cellBold} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cellSub}>{item.email}</Text>
        </View>
      ),
    },
    {
      key: 'region',
      header: 'Region',
      width: 110,
      render: (item) => <Text style={styles.cellText}>{item.region}</Text>,
    },
    {
      key: 'totalOrders',
      header: 'Orders',
      width: 90,
      align: 'center',
      render: (item) => <Text style={styles.cellBold}>{item.totalOrders}</Text>,
    },
    {
      key: 'totalSpending',
      header: 'Spend',
      width: 120,
      align: 'right',
      render: (item) => <Text style={styles.amountText}>₹{item.totalSpending.toLocaleString('en-IN')}</Text>,
    },
  ];

  const renderDashboardContent = () => {
    if (subTab === 'Orders') {
      return (
        <View style={styles.tabPanel}>
          <DataTable
            title="Recent orders"
            count={recentSales.length}
            columns={salesColumns}
            data={recentSales}
            keyExtractor={(item) => String(item.id)}
            actionButtonLabel="Review"
            onRowAction={() => router.push('/sales')}
          />
          <OrderStatusChart data={orderStatus} />
          <YearSalesCard
            data={monthlyRevenue}
            totalRevenue={summary?.totalRevenue}
            totalOrders={summary?.totalOrders}
          />
        </View>
      );
    }

    if (subTab === 'Customers') {
      return (
        <View style={styles.tabPanel}>
          <DataTable
            title="Top customers"
            count={customers.length}
            columns={customerColumns}
            data={customers}
            keyExtractor={(item) => String(item.id)}
            actionButtonLabel="View"
            onRowAction={() => router.push('/customers')}
          />
          <RegionChart data={regionSales} />
        </View>
      );
    }

    return (
      <>
        <View style={styles.statCardsRow}>
          <EnterpriseStatCard
            label="Total Sales"
            value={summary ? `₹${summary.totalRevenue.toLocaleString('en-IN')}` : '₹8,98,000'}
          />
          <EnterpriseStatCard
            label="Total Orders"
            value={summary ? summary.totalOrders : '46'}
          />
          <EnterpriseStatCard
            label="Customer Growth"
            value={summary ? summary.totalCustomers : '16'}
          />
          <EnterpriseStatCard
            label="Return Requests"
            value={orderStatus ? orderStatus.summary.Pending : '2'}
            variant="alert"
          />
        </View>

        <View style={[styles.splitGrid, isDesktop ? styles.splitGridDesktop : styles.splitGridMobile]}>
          <View style={styles.leftCol}>
            <DataTable
              title="Recent sales"
              count={recentSales.length}
              columns={salesColumns}
              data={recentSales}
              keyExtractor={(item) => String(item.id)}
              actionButtonLabel="Review"
              onRowAction={() => router.push('/sales')}
            />
            <CostProgressBar
              title="Sales by category"
              total={summary?.totalRevenue}
              items={categorySales.map((c) => ({ label: c.category, amount: c.sales }))}
            />
          </View>

          <View style={styles.rightCol}>
            <OrderStatusChart data={orderStatus} />
            <YearSalesCard
              data={monthlyRevenue}
              totalRevenue={summary?.totalRevenue}
              totalOrders={summary?.totalOrders}
            />
          </View>
        </View>

        <View style={styles.chartsSection}>
          <View style={[styles.chartGrid, isDesktop && styles.chartGridDesktop]}>
            <View style={styles.chartCol}>
              <RevenueChart data={monthlyRevenue} />
            </View>
            <View style={styles.chartCol}>
              <RegionChart data={regionSales} />
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <AppShell
      activeTab="Overview"
      title="Store Overview"
      subtitle="Tuesday, 22nd September 2026"
    >
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />

      <SegmentedTabs
        tabs={['Total sales', 'Orders', 'Customers']}
        activeTab={subTab}
        onTabChange={setSubTab}
      />

      <LoadingView isLoading={loading} error={error} onRetry={() => fetchDashboardData(false, true)}>
        {renderDashboardContent()}
      </LoadingView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  statCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 20,
  },
  splitGrid: {
    gap: 16,
    marginBottom: 20,
  },
  splitGridDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  splitGridMobile: {
    flexDirection: 'column',
  },
  leftCol: { flex: 1.4, gap: 16 },
  rightCol: { flex: 1, gap: 16 },

  // Cell styles — centralized here to keep pages DRY
  cellBold: {
    fontSize: THEME.fontSize.base,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
  cellSub: {
    fontSize: THEME.fontSize.xs,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  cellText: {
    fontSize: THEME.fontSize.base,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
    color: THEME.colors.textPrimary,
  },
  amountText: {
    fontSize: THEME.fontSize.base,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
  },

  chartsSection: {
    marginTop: 4,
  },
  chartGrid: {
    gap: 16,
  },
  chartGridDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  chartCol: { flex: 1 },
  tabPanel: { gap: 16 },
});
