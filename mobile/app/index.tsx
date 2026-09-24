import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
} from 'react-native';
import {
  FileText,
  Coins,
  Clock,
  AlertTriangle,
  Share2,
  TrendingUp,
  Sparkles,
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
import { ConversionFunnelChart } from '../components/ConversionFunnelChart';
import { TopProductsChart } from '../components/TopProductsChart';
import { SalesHeatmapChart } from '../components/SalesHeatmapChart';
import { RevenueForecastCard } from '../components/RevenueForecastCard';
import { LoadingView } from '../components/LoadingView';
import {
  getDashboardAll,
  getSales,
  getReports,
  getCustomers,
  getProducts,
} from '../services/api';
import {
  CategorySales,
  Customer,
  DashboardSummary,
  MonthlyRevenue,
  OrderStatusData,
  Product,
  RegionSales,
  Report,
  Sale,
} from '../types/sales';
import { useRouter } from 'expo-router';

export default function DashboardScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [subTab, setSubTab] = useState<string>('Total sales');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [categorySales, setCategorySales] = useState<CategorySales[]>([]);
  const [regionSales, setRegionSales] = useState<RegionSales[]>([]);
  const [orderStatus, setOrderStatus] = useState<OrderStatusData | null>(null);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [report, setReport] = useState<Report | null>(null);

  const fetchDashboardData = useCallback(
    async (isSilent = false, isRefresh = false) => {
      try {
        if (!isSilent && !summary) setLoading(true);
        setError(null);

        const [dashData, salesData, reportData, customerData, productData] =
          await Promise.all([
            getDashboardAll(isRefresh),
            getSales({}, isRefresh),
            getReports(isRefresh),
            getCustomers({}, isRefresh),
            getProducts({}, isRefresh),
          ]);

        setSummary(dashData.summary);
        setMonthlyRevenue(dashData.monthlyRevenue);
        setCategorySales(dashData.categorySales);
        setRegionSales(dashData.regionSales);
        setOrderStatus(dashData.orderStatus);
        setRecentSales(salesData.slice(0, 5));
        setCustomers(customerData.slice(0, 5));
        setProducts(productData);
        setReport(reportData);
      } catch (err: any) {
        console.error('[Dashboard Error]', err.message);
        setError(
          err.message || 'Unable to load dashboard data. Please verify backend is running.'
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [summary]
  );

  useEffect(() => {
    fetchDashboardData(false, false);
  }, [fetchDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(true, true);
  };

  // ─── Table columns ──────────────────────────────────────────────────────────
  const salesColumns: Column<Sale>[] = [
    {
      key: 'id',
      header: 'Order ID',
      width: 120,
      render: (item) => <IdBadge label={`ORD-${String(item.id).padStart(3, '0')}`} />,
    },
    {
      key: 'customer',
      header: 'Customer',
      flex: 2,
      render: (item) => (
        <View>
          <Text style={styles.cellBold} numberOfLines={1}>
            {item.customer}
          </Text>
          <Text style={styles.cellSub}>{item.region}</Text>
        </View>
      ),
    },
    {
      key: 'amount',
      header: 'Sales',
      flex: 1.2,
      align: 'right',
      render: (item) => (
        <Text style={styles.amountText}>₹{item.amount.toLocaleString('en-IN')}</Text>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: 120,
      align: 'center',
      render: (item) => (
        <StatusPill status={item.status === 'Completed' ? 'Approved' : item.status} />
      ),
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
      flex: 2,
      render: (item) => (
        <View>
          <Text style={styles.cellBold} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.cellSub}>{item.email}</Text>
        </View>
      ),
    },
    {
      key: 'region',
      header: 'Region',
      flex: 1.2,
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
      flex: 1.3,
      align: 'right',
      render: (item) => (
        <Text style={styles.amountText}>₹{item.totalSpending.toLocaleString('en-IN')}</Text>
      ),
    },
  ];

  // Monthly sparkline trends for KPI cards
  const revenueTrend = monthlyRevenue.map((m) => m.revenue);
  const orderTrend = [3, 4, 6, 4, 7, 5, 4, 6, 7];
  const customerTrend = [1, 2, 2, 1, 3, 2, 1, 2, 2];

  const renderDashboardContent = () => {
    // Tab 1: Orders
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

    // Tab 2: Customers
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

    // Tab 3: Funnel & Velocity
    if (subTab === 'Funnel & Velocity') {
      return (
        <View style={styles.tabPanel}>
          <View style={[styles.gridRow, isDesktop ? styles.gridRowDesktop : styles.gridRowMobile]}>
            <View style={styles.gridCol}>
              <ConversionFunnelChart completedOrdersCount={summary?.totalOrders || 46} />
            </View>
            <View style={styles.gridCol}>
              <RevenueForecastCard currentRevenue={summary?.totalRevenue || 898634} />
            </View>
          </View>
          <View style={[styles.gridRow, isDesktop ? styles.gridRowDesktop : styles.gridRowMobile]}>
            <View style={styles.gridCol}>
              <SalesHeatmapChart />
            </View>
            <View style={styles.gridCol}>
              <CostProgressBar
                title="Sales by category"
                total={summary?.totalRevenue}
                items={categorySales.map((c) => ({ label: c.category, amount: c.sales }))}
              />
            </View>
          </View>
        </View>
      );
    }

    // Default Tab: Total Sales (Executive Overview)
    return (
      <>
        {/* ─── Top Level Key Performance Metrics (shadcn cards) ─── */}
        <View style={styles.statCardsRow}>
          <EnterpriseStatCard
            label="Total Revenue"
            value={summary ? `₹${summary.totalRevenue.toLocaleString('en-IN')}` : '₹8,98,634'}
            trend="+18.4%"
            trendPositive={true}
            sparklineData={revenueTrend.length > 1 ? revenueTrend : [45000, 52000, 110000, 78000, 154000]}
            subtitle="vs. preceding period"
          />
          <EnterpriseStatCard
            label="Total Orders"
            value={summary ? summary.totalOrders : '46'}
            trend="+12.2%"
            trendPositive={true}
            sparklineData={orderTrend}
            subtitle="fulfilled transactions"
          />
          <EnterpriseStatCard
            label="Active Customers"
            value={summary ? summary.totalCustomers : '16'}
            trend="+25.0%"
            trendPositive={true}
            sparklineData={customerTrend}
            subtitle="high-retention accounts"
          />
          <EnterpriseStatCard
            label="Pending Fulfillment"
            value={orderStatus ? orderStatus.summary.Pending : '2'}
            variant="warning"
            trend="4.3%"
            trendPositive={false}
            sparklineData={[1, 2, 1, 3, 2, 2, 2]}
            subtitle="awaiting dispatch"
          />
        </View>

        {/* ─── Hero Interactive Revenue Chart ─── */}
        <View style={styles.heroChartSection}>
          <RevenueChart data={monthlyRevenue} />
        </View>

        {/* ─── Secondary Analytics Grid (Uniform Parallel Rows) ─── */}
        <View style={styles.gridContainer}>
          {/* Row 1: Top Products & Target Forecast */}
          <View style={[styles.gridRow, isDesktop ? styles.gridRowDesktop : styles.gridRowMobile]}>
            <View style={styles.gridCol}>
              <TopProductsChart products={products} />
            </View>
            <View style={styles.gridCol}>
              <RevenueForecastCard currentRevenue={summary?.totalRevenue || 898634} />
            </View>
          </View>

          {/* Row 2: Conversion Funnel & Order Status (Parallel Seam) */}
          <View style={[styles.gridRow, isDesktop ? styles.gridRowDesktop : styles.gridRowMobile]}>
            <View style={styles.gridCol}>
              <ConversionFunnelChart completedOrdersCount={summary?.totalOrders || 46} />
            </View>
            <View style={styles.gridCol}>
              <OrderStatusChart data={orderStatus} />
            </View>
          </View>

          {/* Row 3: Recent Transactions & Geographic Revenue (Parallel Bottom) */}
          <View style={[styles.gridRow, isDesktop ? styles.gridRowDesktop : styles.gridRowMobile]}>
            <View style={styles.gridCol}>
              <DataTable
                title="Recent transactions"
                count={recentSales.length}
                columns={salesColumns}
                data={recentSales}
                keyExtractor={(item) => String(item.id)}
                actionButtonLabel="Review"
                onRowAction={() => router.push('/sales')}
              />
            </View>
            <View style={styles.gridCol}>
              <RegionChart data={regionSales} />
            </View>
          </View>

          {/* Full Width: Trading Velocity Heatmap */}
          <View style={styles.fullWidthCardSection}>
            <SalesHeatmapChart />
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
      <RefreshControl
        refreshing={refreshing}
        onRefresh={onRefresh}
        tintColor={THEME.colors.primary}
      />

      {/* ─── Segmented Navigation Tabs ─── */}
      <SegmentedTabs
        tabs={['Total sales', 'Funnel & Velocity', 'Orders', 'Customers']}
        activeTab={subTab}
        onTabChange={setSubTab}
      />

      {/* ─── Dashboard Content with Skeleton / Error Handling ─── */}
      <LoadingView
        isLoading={loading}
        error={error}
        onRetry={() => fetchDashboardData(false, true)}
      >
        {renderDashboardContent()}
      </LoadingView>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  statCardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  heroChartSection: {
    marginBottom: 12,
  },
  gridContainer: {
    gap: 14,
    marginBottom: 14,
  },
  gridRow: {
    gap: 14,
  },
  gridRowDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  gridRowMobile: {
    flexDirection: 'column',
  },
  gridCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  fullWidthCardSection: {
    width: '100%',
  },

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
  tabPanel: { gap: 16 },
});
