import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Package,
  AlertTriangle,
  ShoppingBag,
  Coins,
  Plus,
  Eye,
  Tag,
  CheckCircle2,
  Boxes,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react-native';
import { AppShell } from '../components/AppShell';
import { LoadingView } from '../components/LoadingView';
import { DetailModal } from '../components/ActionModal';
import { useTheme } from '../context/ThemeContext';
import { getProducts } from '../services/api';
import { Product } from '../types/sales';

export default function ProductsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const { colors, isDark, radiusValues } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [detailItem, setDetailItem] = useState<Product | null>(null);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

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

  const categories = useMemo(() => {
    const list = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ['All', ...list];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mName = p.name?.toLowerCase().includes(q);
        const mCat = p.category?.toLowerCase().includes(q);
        const mId = String(p.id).includes(q);
        if (!mName && !mCat && !mId) return false;
      }
      return true;
    });
  }, [products, selectedCategory, searchQuery]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  const getShadcnPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  // Aggregate metrics from real database
  const totalCatalogRevenue = useMemo(
    () => products.reduce((acc, p) => acc + (Number(p.revenue) || (p.price * p.unitsSold) || 0), 0),
    [products]
  );
  const totalUnitsSold = useMemo(
    () => products.reduce((acc, p) => acc + (Number(p.unitsSold) || 0), 0),
    [products]
  );
  const lowStockProducts = useMemo(
    () => products.filter((p) => (Number(p.stock) || 0) < 15),
    [products]
  );
  const healthyStockCount = products.length - lowStockProducts.length;

  return (
    <AppShell
      activeTab="Products"
      title="Product Catalog & Inventory Intelligence"
      subtitle="Stock velocity, catalog valuation, and item fulfillment metrics"
      onSearch={(q) => {
        setSearchQuery(q);
        setCurrentPage(1);
      }}
      searchPlaceholder="Search product SKU, name, or category..."
      headerRight={
        <TouchableOpacity
          style={[styles.addHeaderBtn, { backgroundColor: isDark ? '#f4f4f5' : '#09090b' }]}
          onPress={() => alert('New product entry form will open in the next release.')}
          activeOpacity={0.85}
        >
          <Plus size={14} color={isDark ? '#09090b' : '#ffffff'} />
          <Text style={[styles.addHeaderBtnText, { color: isDark ? '#09090b' : '#ffffff' }]}>
            + Add Product
          </Text>
        </TouchableOpacity>
      }
    >
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />

      <LoadingView isLoading={loading} error={error} onRetry={() => fetchData(false, true)}>
        <View style={styles.container}>
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* 1. TOP 4 DEDICATED INVENTORY KPI BOXES */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <View style={styles.kpiRow}>
            {/* Card 1: Active Catalog SKUs */}
            <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
              <View style={styles.kpiCardTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: isDark ? '#143828' : '#dcfce7' }]}>
                  <Package size={18} color="#16a34a" />
                </View>
                <View style={[styles.kpiTrendBadge, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={[styles.kpiTrendText, { color: '#16a34a' }]}>+100% Listed</Text>
                </View>
              </View>

              <View style={styles.kpiCardBottomBody}>
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{products.length}</Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Active Catalog SKUs</Text>
                <Text style={[styles.kpiSubText, { color: colors.textMuted }]}>Live in product directory</Text>
              </View>
            </View>

            {/* Card 2: Catalog Valuation */}
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
                  ₹{(totalCatalogRevenue / 1000).toFixed(1)}k
                </Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Catalog Valuation</Text>
                <Text style={[styles.kpiSubText, { color: colors.textMuted }]}>Gross stock revenue value</Text>
              </View>
            </View>

            {/* Card 3: Total Units Sold */}
            <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
              <View style={styles.kpiCardTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: isDark ? '#172554' : '#eff6ff' }]}>
                  <ShoppingBag size={18} color="#2563eb" />
                </View>
                <View style={[styles.kpiTrendBadge, { backgroundColor: '#eff6ff' }]}>
                  <Text style={[styles.kpiTrendText, { color: '#2563eb' }]}>+14.2%</Text>
                </View>
              </View>

              <View style={styles.kpiCardBottomBody}>
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
                  {totalUnitsSold.toLocaleString('en-IN')}
                </Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Units Dispatched</Text>
                <Text style={[styles.kpiSubText, { color: colors.textMuted }]}>Units fulfilled to clients</Text>
              </View>
            </View>

            {/* Card 4: Inventory Health */}
            <View style={[styles.kpiCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
              <View style={styles.kpiCardTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: isDark ? '#382b13' : '#fef3c7' }]}>
                  <AlertTriangle size={18} color="#d97706" />
                </View>
                <View
                  style={[
                    styles.kpiTrendBadge,
                    { backgroundColor: lowStockProducts.length > 0 ? '#fee2e2' : '#ecfdf5' },
                  ]}
                >
                  <Text
                    style={[
                      styles.kpiTrendText,
                      { color: lowStockProducts.length > 0 ? '#dc2626' : '#16a34a' },
                    ]}
                  >
                    {lowStockProducts.length > 0 ? 'Restock' : 'Optimal'}
                  </Text>
                </View>
              </View>

              <View style={styles.kpiCardBottomBody}>
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
                  {lowStockProducts.length > 0 ? `${lowStockProducts.length} Low` : 'Healthy'}
                </Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Inventory Health</Text>
                <Text style={[styles.kpiSubText, { color: colors.textMuted }]}>
                  {healthyStockCount} items well-stocked
                </Text>
              </View>
            </View>
          </View>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* 2. PRODUCT CATALOG LEDGER TABLE                                       */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <View
            style={[
              styles.tableSectionCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radiusValues.md,
              },
            ]}
          >
            {/* Table Header Controls */}
            <View style={[styles.tableControlsBar, { borderBottomColor: colors.border }]}>
              {/* Category Segmented Tabs */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.statusTabsGroup}>
                  {categories.map((cat) => {
                    const isActive = selectedCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        style={[
                          styles.statusTabPill,
                          isActive && [
                            styles.statusTabPillActive,
                            { backgroundColor: isDark ? '#27272a' : '#f1f5f9' },
                          ],
                        ]}
                        onPress={() => {
                          setSelectedCategory(cat);
                          setCurrentPage(1);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={[
                            styles.statusTabPillText,
                            { color: isActive ? colors.textPrimary : colors.textMuted },
                            isActive && { fontWeight: '500' },
                          ]}
                        >
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>

              <Text style={[styles.transactionCountText, { color: colors.textMuted }]}>
                {filteredProducts.length} Items Listed
              </Text>
            </View>

            {/* Scrollable Data Table */}
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.salesTableInner}>
                {/* Header */}
                <View
                  style={[
                    styles.tableHeaderRow,
                    {
                      borderBottomColor: colors.border,
                      backgroundColor: isDark ? '#18181b' : '#ffffff',
                    },
                  ]}
                >
                  <Text style={[styles.thText, { width: 120, color: colors.textMuted }]}>
                    SKU ID
                  </Text>
                  <Text style={[styles.thText, { width: 280, color: colors.textMuted }]}>
                    PRODUCT & CATEGORY
                  </Text>
                  <Text style={[styles.thText, { width: 140, color: colors.textMuted, textAlign: 'right' }]}>
                    UNIT PRICE
                  </Text>
                  <Text style={[styles.thText, { width: 140, color: colors.textMuted, textAlign: 'center' }]}>
                    STOCK LEVEL
                  </Text>
                  <Text style={[styles.thText, { width: 130, color: colors.textMuted, textAlign: 'right' }]}>
                    UNITS SOLD
                  </Text>
                  <Text style={[styles.thText, { width: 150, color: colors.textMuted, textAlign: 'right' }]}>
                    TOTAL REVENUE
                  </Text>
                  <Text style={[styles.thText, { width: 90, color: colors.textMuted, textAlign: 'center' }]}>
                    ACTIONS
                  </Text>
                </View>

                {/* Rows */}
                {filteredProducts.length === 0 ? (
                  <View style={styles.emptyTableState}>
                    <Text style={[styles.emptyTableText, { color: colors.textMuted }]}>
                      No products found matching your search.
                    </Text>
                  </View>
                ) : (
                  paginatedProducts.map((p, i) => {
                    const isLowStock = (p.stock || 0) < 15;
                    const revenue = p.revenue || (p.price * p.unitsSold) || 0;

                    return (
                      <View
                        key={p.id}
                        style={[
                          styles.tableRow,
                          {
                            borderBottomColor: colors.border,
                            backgroundColor: isDark ? '#18181b' : '#ffffff',
                          },
                        ]}
                      >
                        {/* SKU ID */}
                        <View style={{ width: 120, paddingHorizontal: 12 }}>
                          <Text style={[styles.orderIdBadgeText, { color: colors.textPrimary }]}>
                            PRD-{String(p.id).padStart(3, '0')}
                          </Text>
                        </View>

                        {/* Product Name & Category */}
                        <View style={{ width: 280, paddingHorizontal: 12 }}>
                          <Text
                            style={[styles.productNameText, { color: colors.textPrimary }]}
                            numberOfLines={1}
                          >
                            {p.name}
                          </Text>
                          <Text style={[styles.customerSubText, { color: colors.textMuted }]}>
                            {p.category}
                          </Text>
                        </View>

                        {/* Unit Price */}
                        <View style={{ width: 140, paddingHorizontal: 12, alignItems: 'flex-end' }}>
                          <Text style={[styles.saleAmountText, { color: colors.textPrimary }]}>
                            ₹{p.price.toLocaleString('en-IN')}
                          </Text>
                        </View>

                        {/* Stock Level */}
                        <View style={{ width: 140, paddingHorizontal: 12, alignItems: 'center' }}>
                          <View
                            style={[
                              styles.statusPill,
                              isLowStock
                                ? { backgroundColor: '#fee2e2', borderColor: '#fecdd3' }
                                : { backgroundColor: '#ecfdf5', borderColor: '#a7f3d0' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.statusPillText,
                                isLowStock ? { color: '#dc2626' } : { color: '#16a34a' },
                              ]}
                            >
                              {p.stock} In Stock
                            </Text>
                          </View>
                        </View>

                        {/* Units Sold */}
                        <View style={{ width: 130, paddingHorizontal: 12, alignItems: 'flex-end' }}>
                          <Text style={[styles.unitsSoldText, { color: colors.textPrimary }]}>
                            {p.unitsSold.toLocaleString('en-IN')}
                          </Text>
                        </View>

                        {/* Total Revenue */}
                        <View style={{ width: 150, paddingHorizontal: 12, alignItems: 'flex-end' }}>
                          <Text style={[styles.saleAmountText, { color: colors.textPrimary }]}>
                            ₹{revenue.toLocaleString('en-IN')}
                          </Text>
                        </View>

                        {/* Actions */}
                        <View
                          style={{
                            width: 90,
                            flexDirection: 'row',
                            justifyContent: 'center',
                            gap: 6,
                          }}
                        >
                          <TouchableOpacity
                            style={styles.actionBtn}
                            onPress={() => setDetailItem(p)}
                            activeOpacity={0.7}
                          >
                            <Eye size={15} color={colors.textSecondary} />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </ScrollView>

            {/* ─── SHADCN STYLE PAGINATION FOOTER ─── */}
            <View
              style={[
                styles.shadcnPaginationFooter,
                {
                  borderTopColor: colors.border,
                  backgroundColor: isDark ? '#18181b' : '#ffffff',
                },
              ]}
            >
              <Text style={[styles.shadcnPaginationInfoText, { color: colors.textMuted }]}>
                Showing {filteredProducts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                {Math.min(currentPage * pageSize, filteredProducts.length)} of{' '}
                {filteredProducts.length} entries
              </Text>

              <View style={styles.shadcnPaginationRight}>
                {/* < Previous link */}
                <TouchableOpacity
                  style={[
                    styles.shadcnTextNavBtn,
                    currentPage === 1 && { opacity: 0.35 },
                  ]}
                  disabled={currentPage === 1}
                  onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  activeOpacity={0.6}
                >
                  <ChevronLeft size={16} color={currentPage === 1 ? colors.textMuted : colors.textPrimary} />
                  <Text
                    style={[
                      styles.shadcnTextNavBtnText,
                      { color: currentPage === 1 ? colors.textMuted : colors.textPrimary },
                    ]}
                  >
                    Previous
                  </Text>
                </TouchableOpacity>

                {/* Page Numbers */}
                <View style={styles.shadcnPageNumbersGroup}>
                  {getShadcnPageNumbers().map((pg, idx) => {
                    if (pg === '...') {
                      return (
                        <Text
                          key={`ellipsis-${idx}`}
                          style={[styles.shadcnEllipsis, { color: colors.textMuted }]}
                        >
                          ...
                        </Text>
                      );
                    }
                    const isActive = pg === currentPage;
                    return (
                      <TouchableOpacity
                        key={`page-${pg}`}
                        style={[
                          styles.shadcnPageSquare,
                          isActive
                            ? [styles.shadcnPageSquareActive, { backgroundColor: isDark ? '#f4f4f5' : '#0f172a' }]
                            : [styles.shadcnPageSquareInactive, { backgroundColor: isDark ? '#27272a' : '#f1f5f9' }],
                        ]}
                        onPress={() => setCurrentPage(Number(pg))}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.shadcnPageSquareText,
                            { color: isActive ? (isDark ? '#09090b' : '#ffffff') : colors.textPrimary },
                            isActive && { fontWeight: '500' },
                          ]}
                        >
                          {pg}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Next > link */}
                <TouchableOpacity
                  style={[
                    styles.shadcnTextNavBtn,
                    currentPage === totalPages && { opacity: 0.35 },
                  ]}
                  disabled={currentPage === totalPages}
                  onPress={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  activeOpacity={0.6}
                >
                  <Text
                    style={[
                      styles.shadcnTextNavBtnText,
                      { color: currentPage === totalPages ? colors.textMuted : colors.textPrimary },
                    ]}
                  >
                    Next
                  </Text>
                  <ChevronRight size={16} color={currentPage === totalPages ? colors.textMuted : colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </LoadingView>

      {/* Product Detail Modal */}
      {detailItem && (
        <DetailModal
          title={`Product PRD-${String(detailItem.id).padStart(3, '0')}`}
          subtitle={detailItem.name}
          data={{
            'SKU Reference': `PRD-${String(detailItem.id).padStart(3, '0')}`,
            'Product Name': detailItem.name,
            Category: detailItem.category,
            'Unit Price': `₹${detailItem.price.toLocaleString('en-IN')}`,
            'Available Stock': `${detailItem.stock} units`,
            'Units Fulfilled': `${detailItem.unitsSold} units sold`,
            'Realized Revenue': `₹${(detailItem.revenue || detailItem.price * detailItem.unitsSold).toLocaleString('en-IN')}`,
            'Inventory Status': detailItem.stock < 15 ? 'Low Stock Warning' : 'Healthy Inventory',
          }}
          onClose={() => setDetailItem(null)}
        />
      )}
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 32,
  },

  addHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addHeaderBtnText: {
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
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

  // 2. TABLE SECTION
  tableSectionCard: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableControlsBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusTabsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusTabPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusTabPillActive: {},
  statusTabPillText: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
  },
  transactionCountText: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
  },
  salesTableInner: {
    minWidth: 1050,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  thText: {
    fontSize: 10.5,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
    letterSpacing: 0.4,
    paddingHorizontal: 12,
  },
  emptyTableState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyTableText: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  orderIdBadgeText: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  productNameText: {
    fontSize: 11.5,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  customerSubText: {
    fontSize: 10,
    marginTop: 1,
    fontFamily: 'Manrope_400Regular',
  },
  saleAmountText: {
    fontSize: 11.5,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  unitsSoldText: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusPillText: {
    fontSize: 10.5,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  actionBtn: {
    width: 28,
    height: 28,
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Shadcn Pagination Footer
  shadcnPaginationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    flexWrap: 'wrap',
    gap: 12,
  },
  shadcnPaginationInfoText: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
  },
  shadcnPaginationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  shadcnTextNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  shadcnTextNavBtnText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  shadcnPageNumbersGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  shadcnPageSquare: {
    width: 28,
    height: 28,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadcnPageSquareActive: {},
  shadcnPageSquareInactive: {},
  shadcnPageSquareText: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
  },
  shadcnEllipsis: {
    fontSize: 12,
    paddingHorizontal: 4,
    fontFamily: 'Manrope_500Medium',
  },
});
