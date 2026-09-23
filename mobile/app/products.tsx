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
  Package,
  Layers,
  AlertTriangle,
  TrendingUp,
  Tag,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { AppShell } from '../components/AppShell';
import { EnterpriseStatCard } from '../components/EnterpriseStatCard';
import { SegmentedTabs } from '../components/SegmentedTabs';
import { DataTable, IdBadge, Column } from '../components/DataTable';
import { LoadingView } from '../components/LoadingView';
import { DetailModal } from '../components/ActionModal';
import { getProducts } from '../services/api';
import { Product } from '../types/sales';

export default function ProductsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [detailItem, setDetailItem] = useState<Product | null>(null);

  const fetchData = useCallback(
    async (silent = false, bypass = false) => {
      try {
        if (!silent && products.length === 0) setLoading(true);
        setError(null);
        const data = await getProducts({ search: searchQuery }, bypass);
        setProducts(data);
      } catch (err: any) {
        setError(err.message || 'Unable to load catalog data.');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [products.length, searchQuery]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true, true);
  };

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'All') return true;
    return p.category === selectedCategory;
  });

  const totalCatalogRevenue = products.reduce((acc, p) => acc + (p.revenue || 0), 0);
  const totalUnitsSold = products.reduce((acc, p) => acc + (p.unitsSold || 0), 0);
  const lowStockProducts = products.filter((p) => (p.stock || 0) < 15);
  const healthyStockCount = products.length - lowStockProducts.length;

  const columns: Column<Product>[] = [
    {
      key: 'id',
      header: 'Product ID',
      width: 120,
      render: (item) => <IdBadge label={`PRD-${String(item.id).padStart(3, '0')}`} />,
    },
    {
      key: 'name',
      header: 'Product Name',
      flex: 1.5,
      render: (item) => (
        <View>
          <Text style={st.bold} numberOfLines={1}>
            {item.name}
          </Text>
          <View style={st.subTagRow}>
            <Text style={st.catTag}>{item.category}</Text>
            <Text style={st.unitPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
          </View>
        </View>
      ),
    },
    {
      key: 'stock',
      header: 'Inventory',
      flex: 1,
      width: 130,
      render: (item) => {
        const isLow = (item.stock || 0) < 15;
        return (
          <View style={st.stockWrap}>
            <View style={[st.stockDot, isLow ? st.stockDotLow : st.stockDotGood]} />
            <Text style={[st.stockText, isLow && st.stockTextLow]}>
              {item.stock} in stock
            </Text>
          </View>
        );
      },
    },
    {
      key: 'unitsSold',
      header: 'Units Sold',
      width: 100,
      align: 'center',
      render: (item) => <Text style={st.bold}>{item.unitsSold || 0}</Text>,
    },
    {
      key: 'revenue',
      header: 'Gross Revenue',
      flex: 1,
      width: 140,
      align: 'right',
      render: (item) => (
        <Text style={st.amount}>₹{(item.revenue || 0).toLocaleString('en-IN')}</Text>
      ),
    },
  ];

  return (
    <AppShell
      activeTab="Fleet sales"
      title="Product Catalog & Inventory"
      subtitle="Catalog pricing, velocity, stock allocation, and revenue contribution"
      onSearch={setSearchQuery}
      searchPlaceholder="Search product SKU, model, category..."
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
            label="Catalog Items"
            value={products.length}
            icon={Package}
            trend="+3 new"
            trendPositive={true}
            sparklineData={[18, 19, 21, 23]}
            subtitle="active commercial SKUs"
          />
          <EnterpriseStatCard
            label="Units Delivered"
            value={totalUnitsSold}
            icon={TrendingUp}
            trend="+16.8%"
            trendPositive={true}
            sparklineData={[180, 220, 260, 310]}
            subtitle="volume moved"
          />
          <EnterpriseStatCard
            label="Catalog Sales"
            value={`₹${(totalCatalogRevenue / 1000).toFixed(0)}k`}
            icon={Layers}
            trend="+18.4%"
            trendPositive={true}
            sparklineData={[340, 520, 710, 898]}
            subtitle="generated to date"
          />
          <EnterpriseStatCard
            label="Low Stock Alerts"
            value={lowStockProducts.length}
            icon={AlertTriangle}
            variant={lowStockProducts.length > 0 ? 'warning' : 'default'}
            trend={lowStockProducts.length > 0 ? 'Action Req' : 'Healthy'}
            trendPositive={lowStockProducts.length === 0}
            sparklineData={[5, 4, 3, lowStockProducts.length]}
            subtitle="SKUs under 15 units"
          />
        </View>

        {/* ─── Inventory Health Banner ─── */}
        <View style={st.healthCard}>
          <View style={st.healthHeader}>
            <View style={st.healthTitleRow}>
              <CheckCircle2 size={15} color="#0f172a" />
              <Text style={st.healthTitle}>Fulfillment Capacity & Inventory Health</Text>
            </View>
            <Text style={st.healthPct}>
              {((healthyStockCount / (products.length || 1)) * 100).toFixed(0)}% Healthy Stock
            </Text>
          </View>

          <View style={st.healthBarTrack}>
            <View
              style={[
                st.healthBarFillGood,
                { width: `${(healthyStockCount / (products.length || 1)) * 100}%` },
              ]}
            />
            <View
              style={[
                st.healthBarFillLow,
                { width: `${(lowStockProducts.length / (products.length || 1)) * 100}%` },
              ]}
            />
          </View>

          <View style={st.healthLegend}>
            <Text style={st.legendText}>
              🟢 {healthyStockCount} SKUs Optimal
            </Text>
            <Text style={st.legendText}>
              ⚠️ {lowStockProducts.length} SKUs Low Stock
            </Text>
            <Text style={st.legendText}>
              Avg Unit Price: ₹{Math.round(totalCatalogRevenue / (totalUnitsSold || 1)).toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* ─── Category Tabs ─── */}
        {categories.length > 1 && (
          <SegmentedTabs
            tabs={categories}
            activeTab={selectedCategory}
            onTabChange={setSelectedCategory}
            scrollable
          />
        )}

        <DataTable
          title="Product ledger"
          count={filteredProducts.length}
          columns={columns}
          data={filteredProducts}
          keyExtractor={(item) => String(item.id)}
          actionButtonLabel="Inspect"
          onRowAction={(item) => setDetailItem(item)}
        />
      </LoadingView>

      {/* Detail Modal */}
      {detailItem && (
        <DetailModal
          title={detailItem.name}
          subtitle={`SKU PRD-${String(detailItem.id).padStart(3, '0')}`}
          data={{
            Category: detailItem.category,
            Price: `₹${detailItem.price.toLocaleString('en-IN')}`,
            'Units Sold': detailItem.unitsSold,
            'Revenue Generated': `₹${detailItem.revenue.toLocaleString('en-IN')}`,
            'Current Stock': `${detailItem.stock} units`,
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
  healthCard: {
    backgroundColor: '#ffffff',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    marginBottom: 16,
    ...THEME.shadow.card,
    gap: 10,
  },
  healthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  healthTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  healthTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
  healthPct: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#047857',
  },
  healthBarTrack: {
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  healthBarFillGood: {
    backgroundColor: '#0f172a',
    height: '100%',
  },
  healthBarFillLow: {
    backgroundColor: '#f59e0b',
    height: '100%',
  },
  healthLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
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
  subTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  catTag: {
    fontSize: 10,
    color: '#64748b',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 3,
  },
  unitPrice: {
    fontSize: 11,
    color: '#64748b',
  },
  stockWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockDotGood: { backgroundColor: '#10b981' },
  stockDotLow: { backgroundColor: '#f59e0b' },
  stockText: {
    fontSize: 12,
    color: '#334155',
  },
  stockTextLow: {
    color: '#b45309',
    fontWeight: '600',
  },
  amount: {
    fontSize: 13,
    fontWeight: '700',
    color: '#09090b',
  },
});
