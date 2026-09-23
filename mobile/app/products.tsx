import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, RefreshControl, Alert, useWindowDimensions } from "react-native";
import { Truck, Users, AlertTriangle, Grid } from "lucide-react-native";
import { THEME } from "../constants/theme";
import { AppShell } from "../components/AppShell";
import { EnterpriseStatCard } from "../components/EnterpriseStatCard";
import { SpotlightCard } from "../components/SpotlightCard";
import { DataTable, IdBadge, Column } from "../components/DataTable";
import { LoadingView } from "../components/LoadingView";
import { DetailModal } from "../components/ActionModal";
import { getProducts } from "../services/api";
import { Product } from "../types/sales";
import { useRouter } from "expo-router";

export default function ProductsScreen() {
  const { width } = useWindowDimensions();
  const router    = useRouter();
  const isDesktop  = width >= 860;

  const [products,        setProducts]       = useState<Product[]>([]);
  const [loading,         setLoading]        = useState(true);
  const [refreshing,      setRefreshing]     = useState(false);
  const [error,           setError]          = useState<string | null>(null);
  const [searchQuery,     setSearchQuery]    = useState("");
  const [selectedProduct, setSelectedProduct]= useState<Product | null>(null);
  const [detailItem,      setDetailItem]     = useState<Product | null>(null);

  const fetchData = useCallback(async (silent = false, bypass = false) => {
    try {
      if (!silent && products.length === 0) setLoading(true);
      setError(null);
      const data = await getProducts({ search: searchQuery }, bypass);
      setProducts(data);
      if (data.length > 0 && !selectedProduct) setSelectedProduct(data[0]);
    } catch (err: any) {
      setError(err.message || "Unable to load fleet sales data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [products.length, searchQuery, selectedProduct]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(true, true); };

  const lowStockCount = products.filter((p) => p.stock < 50).length;
  const activeItem    = selectedProduct || products[0];
  const totalUnitsSold= products.reduce((sum, item) => sum + item.unitsSold, 0);
  const totalRevenue  = products.reduce((sum, item) => sum + item.revenue,   0);

  const categoryTotals = products.reduce<Record<string, number>>((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.revenue;
    return acc;
  }, {});

  const rankedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1])
    .map(([category]) => category);

  const bestCategory = rankedCategories[0] || activeItem?.category || "N/A";
  const secondBestCategory = rankedCategories[1] || bestCategory;
  const thirdBestCategory = rankedCategories[2] || secondBestCategory;
  const fourthBestCategory = rankedCategories[3] || thirdBestCategory;

  const bestCategoryProduct = products.find((item) => item.category === bestCategory) || activeItem || products[0];
  const secondCategoryProduct = products.find((item) => item.category === secondBestCategory && item.id !== bestCategoryProduct.id) || products.find((item) => item.category === secondBestCategory) || activeItem || products[0];
  const thirdCategoryProduct = products.find((item) => item.category === thirdBestCategory && item.id !== bestCategoryProduct.id && item.id !== secondCategoryProduct.id) || products.find((item) => item.category === thirdBestCategory) || activeItem || products[0];
  const fourthCategoryProduct = products.find((item) => item.category === fourthBestCategory && item.id !== bestCategoryProduct.id && item.id !== secondCategoryProduct.id && item.id !== thirdCategoryProduct.id) || products.find((item) => item.category === fourthBestCategory) || activeItem || products[0];

  const columns: Column<Product>[] = [
    {
      key: "id", header: "Product ID", width: 120,
      render: (item) => <IdBadge label={`PRD-${String(item.id).padStart(3, "0")}`} />,
    },
    {
      key: "name", header: "Product", flex: 1.5,
      render: (item) => (
        <View>
          <Text style={st.bold} numberOfLines={1}>{item.name}</Text>
          <Text style={st.sub}>{item.category}</Text>
        </View>
      ),
    },
    {
      key: "category", header: "Category", width: 130,
      render: (item) => <Text style={st.cellText}>{item.category}</Text>,
    },
    {
      key: "unitsSold", header: "Units sold", width: 130,
      render: (item) => <Text style={st.cellText}>{item.unitsSold}</Text>,
    },
    {
      key: "revenue", header: "Revenue", width: 140, align: "right",
      render: (item) => <Text style={st.amount}>₹{item.revenue.toLocaleString("en-IN")}</Text>,
    },
  ];

  return (
    <AppShell
      activeTab="Fleet sales"
      title="Fleet sales"
      subtitle="Track revenue, product performance and sales activity"
      onSearch={setSearchQuery}
      searchPlaceholder="Search products, categories and sales..."
    >
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
      <LoadingView isLoading={loading} error={error} onRetry={() => fetchData(false, true)}>
        <View style={st.statsRow}>
          <EnterpriseStatCard label="Products"   value={products.length}                                 icon={Truck} />
          <EnterpriseStatCard label="Units sold" value={totalUnitsSold}                                  icon={Users} />
          <EnterpriseStatCard label="Revenue"    value={`₹${totalRevenue.toLocaleString("en-IN")}`}     icon={AlertTriangle} />
          <EnterpriseStatCard label="Low stock"  value={lowStockCount}                                   icon={Grid}  variant="alert" />
        </View>

        <View style={[st.splitGrid, isDesktop ? st.splitRow : null]}>
          <View style={st.leftCol}>
            <DataTable
              columns={columns}
              data={products}
              keyExtractor={(item) => String(item.id)}
              actionButtonLabel="Details"
              onRowAction={(item) => { setSelectedProduct(item); setDetailItem(item); }}
            />
          </View>
          {activeItem && (
            <View style={st.rightCol}>
              <SpotlightCard
                id={`EX-${String(bestCategoryProduct.id).padStart(3, "0")}`}
                title={bestCategoryProduct.name}
                subtitle={`${bestCategoryProduct.category} • CAT 320`}
                category={bestCategoryProduct.category}
                unitsSold={bestCategoryProduct.unitsSold}
                revenue={bestCategoryProduct.revenue}
                stock={bestCategoryProduct.stock}
                margin={28}
                onPressAction={() => router.push('/sales')}
              />

              <SpotlightCard
                id={`EX-${String(secondCategoryProduct.id).padStart(3, "0")}`}
                title={secondCategoryProduct.name}
                subtitle={`${secondCategoryProduct.category} • CAT 320`}
                category={secondCategoryProduct.category}
                unitsSold={secondCategoryProduct.unitsSold}
                revenue={secondCategoryProduct.revenue}
                stock={secondCategoryProduct.stock}
                margin={24}
                onPressAction={() => router.push('/sales')}
              />

              <SpotlightCard
                id={`EX-${String(thirdCategoryProduct.id).padStart(3, "0")}`}
                title={thirdCategoryProduct.name}
                subtitle={`${thirdCategoryProduct.category} • CAT 320`}
                category={thirdCategoryProduct.category}
                unitsSold={thirdCategoryProduct.unitsSold}
                revenue={thirdCategoryProduct.revenue}
                stock={thirdCategoryProduct.stock}
                margin={18}
                onPressAction={() => router.push('/sales')}
              />

              <SpotlightCard
                id={`EX-${String(fourthCategoryProduct.id).padStart(3, "0")}`}
                title={fourthCategoryProduct.name}
                subtitle={`${fourthCategoryProduct.category} • CAT 320`}
                category={fourthCategoryProduct.category}
                unitsSold={fourthCategoryProduct.unitsSold}
                revenue={fourthCategoryProduct.revenue}
                stock={fourthCategoryProduct.stock}
                margin={16}
                onPressAction={() => router.push('/sales')}
              />
            </View>
          )}
        </View>

        <View style={{ marginTop: 20 }}>
          <DataTable
            title="Top products"
            count={products.slice(0, 4).length}
            columns={columns}
            data={products.slice(0, 4)}
            keyExtractor={(item) => `dep-${item.id}`}
            actionButtonLabel="View"
            onRowAction={(item) => setDetailItem(item)}
          />
        </View>
      </LoadingView>

      {detailItem && (
        <DetailModal
          visible={!!detailItem}
          title={detailItem.name}
          subtitle={`EX-${String(detailItem.id).padStart(3, "0")} • ${detailItem.category}`}
          rows={[
            { label: "Product ID",        value: `PRD-${String(detailItem.id).padStart(3, "0")}` },
            { label: "Product Name",      value: detailItem.name },
            { label: "Category",          value: detailItem.category },
            { label: "Stock on Hand",     value: `${detailItem.stock} units`, highlight: detailItem.stock < 50 },
            { label: "Units Sold",        value: detailItem.unitsSold },
            { label: "Revenue Generated", value: `₹${detailItem.revenue.toLocaleString("en-IN")}`, highlight: true },
          ]}
          onClose={() => setDetailItem(null)}
          actionLabel="View sales"
          onAction={() => { setDetailItem(null); Alert.alert("Sales View", `Sales details for "${detailItem.name}" are open.`); }}
        />
      )}
    </AppShell>
  );
}

const st = StyleSheet.create({
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 20,
  },
  splitGrid: { gap: 16 },
  splitRow:  { flexDirection: "row", alignItems: "flex-start" },
  leftCol:   { flex: 1.5 },
  rightCol:  { flex: 1, gap: 25 },
  miniCards: { flexDirection: "row", gap: 10 },
  bold: {
    fontSize: THEME.fontSize.base,
    fontWeight: "600",
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
  sub: {
    fontSize: THEME.fontSize.xs,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textSecondary,
    marginTop: 2,
  },
  cellText: {
    fontSize: THEME.fontSize.base,
    fontWeight: "500",
    fontFamily: THEME.fontFamily.medium,
    color: THEME.colors.textPrimary,
  },
  amount: {
    fontSize: THEME.fontSize.base,
    fontWeight: "700",
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
  },
});
