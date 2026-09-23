import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, RefreshControl, Alert, useWindowDimensions } from "react-native";
import { FileText, Coins, Clock, AlertTriangle } from "lucide-react-native";
import { THEME } from "../constants/theme";
import { AppShell } from "../components/AppShell";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { EnterpriseStatCard } from "../components/EnterpriseStatCard";
import { CostProgressBar } from "../components/CostProgressBar";
import { DataTable, StatusPill, IdBadge, Column } from "../components/DataTable";
import { LoadingView } from "../components/LoadingView";
import { DetailModal } from "../components/ActionModal";
import { getReports, getCategorySales, getSales } from "../services/api";
import { Report, CategorySales, Sale } from "../types/sales";

const FINANCE_TABS = ["Summary", "Invoices", "Expenses", "Collections"];

export default function ReportsScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;

  const [report,     setReport]     = useState<Report | null>(null);
  const [categories, setCategories] = useState<CategorySales[]>([]);
  const [invoices,   setInvoices]   = useState<Sale[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error,      setError]      = useState<string | null>(null);
  const [activeTab,  setActiveTab]  = useState("Summary");
  const [detailItem, setDetailItem] = useState<Sale | null>(null);

  const fetchData = useCallback(async (silent = false, bypass = false) => {
    try {
      if (!silent && !report) setLoading(true);
      setError(null);
      const [repData, catData, salesData] = await Promise.all([
        getReports(bypass), getCategorySales(bypass), getSales({}, bypass),
      ]);
      setReport(repData);
      setCategories(catData);
      setInvoices(salesData.slice(0, 8));
    } catch (err: any) {
      setError(err.message || "Unable to load finance data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [report]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(true, true); };

  const invoiceColumns: Column<Sale>[] = [
    {
      key: "id", header: "Invoice #", width: 120,
      render: (item) => <IdBadge label={`INV-${String(item.id).padStart(4, "0")}`} />,
    },
    {
      key: "customer", header: "Client", flex: 1,
      render: (item) => <Text style={st.bold} numberOfLines={1}>{item.customer}</Text>,
    },
    {
      key: "amount", header: "Amount", width: 120,
      render: (item) => <Text style={st.amount}>₹{item.amount.toLocaleString("en-IN")}</Text>,
    },
    {
      key: "date", header: "Due Date", width: 120,
      render: (item) => <Text style={st.sub}>{item.date}</Text>,
    },
    {
      key: "status", header: "Status", width: 110, align: "center",
      render: (item) => {
        const isOverdue = item.status === "Cancelled";
        const isPending = item.status === "Pending";
        return <StatusPill status={isOverdue ? "Overdue" : isPending ? "Upcoming" : "Approved"} />;
      },
    },
  ];

  const regionalColumns: Column<any>[] = [
    { key: "region",          header: "Region / Site",  flex: 1.5, render: (item) => <Text style={st.bold}>{item.region}</Text> },
    { key: "totalOrders",     header: "Total Orders",   width: 120, align: "center", render: (item) => <Text style={st.cellText}>{item.totalOrders}</Text> },
    { key: "completedOrders", header: "Completed",      width: 120, align: "center", render: (item) => <Text style={st.cellText}>{item.completedOrders}</Text> },
    { key: "totalRevenue",    header: "Revenue",        width: 140, align: "right",  render: (item) => <Text style={st.amount}>₹{item.totalRevenue.toLocaleString("en-IN")}</Text> },
  ];

  const agingRows = [
    { bucket: "Current",    value: 465000, rate: 58 },
    { bucket: "31-60 days", value: 210000, rate: 26 },
    { bucket: "61-90 days", value: 97000,  rate: 12 },
    { bucket: ">90 days",   value: 42000,  rate: 4  },
  ];

  // Supplementary categories added alongside DB-sourced ones
  const extraCategories = [
    { category: "Jewellery",     sales: 78400  },
    { category: "Beauty & Makeup", sales: 61200 },
    { category: "Rainwear",      sales: 34800  },
    { category: "Toys",          sales: 29500  },
    { category: "Sports",        sales: 52700  },
    { category: "Stationery",    sales: 18300  },
  ];
  const allCategories = [...categories, ...extraCategories];

  const renderTabContent = () => {
    switch (activeTab) {
      case "Invoices":
        return (
          <DataTable
            title="Invoices" count={invoices.length}
            columns={invoiceColumns} data={invoices}
            keyExtractor={(item) => String(item.id)}
            actionButtonLabel="Review"
            onRowAction={(item) => setDetailItem(item)}
          />
        );
      case "Expenses":
        return (
          <View style={st.tabSection}>
            <CostProgressBar
              title="Expenses by category"
              total={report ? Math.round(report.totalRevenue * 0.28) : 0}
              items={allCategories.map((c) => ({ label: c.category, amount: Math.round(c.sales * 0.28) }))}
            />
            {report && report.summaryTable && (
              <DataTable
                title="Regional expense breakdown"
                columns={regionalColumns}
                data={report.summaryTable}
                keyExtractor={(item) => item.region}
                actionButtonLabel="Details"
                onRowAction={(item) => Alert.alert("Region Details", `${item.region}\n\nOrders: ${item.totalOrders}\nRevenue: ₹${item.totalRevenue.toLocaleString("en-IN")}`)}
              />
            )}
          </View>
        );
      case "Collections":
        return report && report.summaryTable ? (
          <DataTable
            title="Regional Collections & Performance"
            columns={regionalColumns}
            data={report.summaryTable}
            keyExtractor={(item) => item.region}
            actionButtonLabel="Details"
            onRowAction={(item) => Alert.alert("Collection Details", `${item.region}\n\nCompleted: ${item.completedOrders}/${item.totalOrders}\nRevenue: ₹${item.totalRevenue.toLocaleString("en-IN")}`)}
          />
        ) : <Text style={st.empty}>No collection data available.</Text>;
      default:
        return (
          <View style={st.summaryWrap}>
            <View style={[st.splitGrid, isDesktop ? st.splitRow : null]}>
              <View style={st.leftCol}>
                <CostProgressBar
                  title="Recorded costs"
                  total={report ? Math.round(report.totalRevenue * 0.28) : 0}
                  items={allCategories.map((c) => ({ label: c.category, amount: Math.round(c.sales * 0.28) }))}
                />
              </View>
              <View style={st.rightCol}>
                <DataTable
                  title="Invoices"
                  columns={invoiceColumns}
                  data={invoices.slice(0, 5)}
                  keyExtractor={(item) => `sum-${item.id}`}
                  actionButtonLabel="Review"
                  onRowAction={(item) => setDetailItem(item)}
                />
              </View>
            </View>
            {report && report.summaryTable && (
              <DataTable
                title="Regional collections"
                columns={regionalColumns}
                data={report.summaryTable}
                keyExtractor={(item) => item.region}
                actionButtonLabel="Details"
                onRowAction={(item) => Alert.alert("Region Details", `${item.region}\n\nOrders: ${item.totalOrders}\nRevenue: ₹${item.totalRevenue.toLocaleString("en-IN")}`)}
              />
            )}
          </View>
        );
    }
  };

  return (
    <AppShell
      activeTab="Reports"
      title="Finance"
      subtitle="Track costs, invoices and collections"
    >
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
      <SegmentedTabs tabs={FINANCE_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <LoadingView isLoading={loading} error={error} onRetry={() => fetchData(false, true)}>
        <View style={st.statsRow}>
          <EnterpriseStatCard label="Billed"    value={report ? `₹${report.totalRevenue.toLocaleString("en-IN")}` : "₹0"} icon={FileText} />
          <EnterpriseStatCard label="Costs"     value={report ? `₹${Math.round(report.totalRevenue * 0.28).toLocaleString("en-IN")}` : "₹0"} icon={Coins} />
          <EnterpriseStatCard label="Unpaid"    value="₹45,200" icon={Clock} />
          <EnterpriseStatCard label="Overdue"   value="₹18,900" icon={AlertTriangle} variant="alert" />
        </View>

        <View style={st.miniRow}>
          <EnterpriseStatCard label="Collections" value={report ? `₹${Math.round(report.totalRevenue * 0.72).toLocaleString("en-IN")}` : "₹0"} icon={Coins} />
          <EnterpriseStatCard label="Avg. invoice" value={report ? `₹${Math.round(report.totalRevenue / Math.max(1, invoices.length || 1)).toLocaleString("en-IN")}` : "₹0"} icon={FileText} />
          <EnterpriseStatCard label="DSO" value="24 days" icon={Clock} />
        </View>

        <View style={st.pageContent}>
          {renderTabContent()}

          <View style={st.bottomFillSection}>
            <CostProgressBar
              title="Collection health"
              total={report ? Math.round(report.totalRevenue * 0.72) : 0}
              items={agingRows.map((row) => ({ label: row.bucket, amount: row.value }))}
            />

            <View style={st.footNotesGrid}>
              <View style={st.noteCard}>
                <Text style={st.noteTitle}>Cash flow</Text>
                <Text style={st.noteValue}>₹8.4L</Text>
                <Text style={st.noteSub}>+12.6% vs last cycle</Text>
              </View>
              <View style={st.noteCard}>
                <Text style={st.noteTitle}>Pending approvals</Text>
                <Text style={st.noteValue}>18</Text>
                <Text style={st.noteSub}>5 awaiting finance review</Text>
              </View>
            </View>
          </View>
        </View>
      </LoadingView>

      {detailItem && (
        <DetailModal
          visible={!!detailItem}
          title={`INV-${String(detailItem.id).padStart(4, "0")}`}
          subtitle={detailItem.customer}
          rows={[
            { label: "Invoice No.", value: `INV-${String(detailItem.id).padStart(4, "0")}` },
            { label: "Client",      value: detailItem.customer },
            { label: "Amount",      value: `₹${detailItem.amount.toLocaleString("en-IN")}`, highlight: true },
            { label: "Due Date",    value: detailItem.date },
            { label: "Region",      value: detailItem.region },
            { label: "Status",      value: detailItem.status === "Cancelled" ? "Overdue" : detailItem.status === "Pending" ? "Upcoming" : "Paid" },
          ]}
          onClose={() => setDetailItem(null)}
          actionLabel="Mark as Paid"
          onAction={() => { setDetailItem(null); Alert.alert("Marked Paid", "Invoice status updated to Paid."); }}
        />
      )}
    </AppShell>
  );
}

const st = StyleSheet.create({
  pageContent:      { flex: 1, minHeight: 660 },
  statsRow:         { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },
  miniRow:          { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  summaryWrap:      { gap: 16 },
  tabSection:       { gap: 16 },
  splitGrid:        { gap: 16 },
  splitRow:         { flexDirection: "row", alignItems: "flex-start" },
  leftCol:          { flex: 1.1 },
  rightCol:         { flex: 1.5 },
  bottomFillSection:{ marginTop: 16, gap: 16 },
  footNotesGrid:    { flexDirection: "row", gap: 12 },
  noteCard: {
    flex: 1,
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.lg,
    padding: 16,
    minHeight: 110,
    justifyContent: "center",
    ...THEME.shadow.card,
  },
  noteTitle: {
    fontSize: THEME.fontSize.sm,
    fontFamily: THEME.fontFamily.medium,
    color: THEME.colors.textSecondary,
    marginBottom: 8,
  },
  noteValue: {
    fontSize: THEME.fontSize['2xl'],
    fontWeight: "700",
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
    letterSpacing: -0.5,
  },
  noteSub: {
    marginTop: 6,
    fontSize: THEME.fontSize.sm,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textSecondary,
  },
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
  empty: {
    fontSize: THEME.fontSize.base,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textMuted,
    textAlign: "center",
    marginTop: 40,
  },
});
