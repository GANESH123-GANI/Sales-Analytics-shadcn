import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, RefreshControl, Alert } from "react-native";
import { FileText, Coins, Clock, AlertTriangle } from "lucide-react-native";
import { THEME } from "../constants/theme";
import { AppShell } from "../components/AppShell";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { EnterpriseStatCard } from "../components/EnterpriseStatCard";
import { DataTable, StatusPill, IdBadge, Column } from "../components/DataTable";
import { LoadingView } from "../components/LoadingView";
import { DetailModal } from "../components/ActionModal";
import { getSales } from "../services/api";
import { Sale } from "../types/sales";

const STATUS_TABS = ["All", "Approved", "Pending", "Cancelled"];

export default function SalesScreen() {
  const [sales,       setSales]       = useState<Sale[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [activeTab,   setActiveTab]   = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [detailItem,  setDetailItem]  = useState<Sale | null>(null);

  const fetchData = useCallback(async (silent = false, bypass = false) => {
    try {
      if (!silent && sales.length === 0) setLoading(true);
      setError(null);
      const data = await getSales({ search: searchQuery }, bypass);
      setSales(data);
    } catch (err: any) {
      setError(err.message || "Unable to load data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sales.length, searchQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(true, true); };

  const filtered = sales.filter((s) => {
    if (activeTab === "All")      return true;
    if (activeTab === "Approved") return s.status === "Completed";
    return s.status === activeTab;
  });

  const totalAmount    = sales.filter((s) => s.status !== "Cancelled").reduce((a, c) => a + c.amount, 0);
  const approvedCount  = sales.filter((s) => s.status === "Completed").length;
  const pendingCount   = sales.filter((s) => s.status === "Pending").length;
  const cancelledCount = sales.filter((s) => s.status === "Cancelled").length;

  const columns: Column<Sale>[] = [
    {
      key: "id", header: "Order ID", width: 140,
      render: (item) => <IdBadge label={`ORD-${String(item.id).padStart(3, "0")}`} />,
    },
    {
      key: "region", header: "Region", width: 130,
      render: (item) => <Text style={st.bold}>{item.region}</Text>,
    },
    {
      key: "customer", header: "Customer", flex: 1.2,
      render: (item) => (
        <View>
          <Text style={st.bold} numberOfLines={1}>{item.customer}</Text>
          <Text style={st.sub}>{item.date}</Text>
        </View>
      ),
    },
    {
      key: "amount", header: "Sales", width: 130, align: "right",
      render: (item) => <Text style={st.amount}>₹{item.amount.toLocaleString("en-IN")}</Text>,
    },
    {
      key: "status", header: "Status", width: 120, align: "center",
      render: (item) => <StatusPill status={item.status === "Completed" ? "Approved" : item.status} />,
    },
  ];

  return (
    <AppShell
      activeTab="Sales"
      title="Sales overview"
      subtitle="Live revenue, orders and customer activity"
      onSearch={setSearchQuery}
      searchPlaceholder="Search customers, regions, orders..."
    >
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
      <SegmentedTabs tabs={STATUS_TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <LoadingView isLoading={loading} error={error} onRetry={() => fetchData(false, true)}>
        <View style={st.statsRow}>
          <EnterpriseStatCard label="Orders"    value={sales.length}        icon={FileText} />
          <EnterpriseStatCard label="Revenue"   value={`₹${(totalAmount / 1000).toFixed(0)}k`} icon={Coins} />
          <EnterpriseStatCard label="Approved"  value={approvedCount}       icon={Clock}   variant="success" />
          <EnterpriseStatCard label="Pending"   value={pendingCount}        icon={AlertTriangle} variant="alert" />
        </View>

        <DataTable
          title={activeTab === "All" ? "All sales" : `${activeTab} sales`}
          count={filtered.length}
          columns={columns}
          data={filtered}
          keyExtractor={(item) => String(item.id)}
          actionButtonLabel="Review"
          onRowAction={(item) => setDetailItem(item)}
        />

        {activeTab === "All" && pendingCount > 0 && (
          <View style={{ marginTop: 20 }}>
            <DataTable
              title="Pending review"
              count={pendingCount}
              columns={columns}
              data={sales.filter((s) => s.status === "Pending")}
              keyExtractor={(item) => `p-${item.id}`}
              actionButtonLabel="Review"
              onRowAction={(item) => setDetailItem(item)}
            />
          </View>
        )}
      </LoadingView>

      {detailItem && (
        <DetailModal
          visible={!!detailItem}
          title={`ORD-${String(detailItem.id).padStart(3, "0")}`}
          subtitle={detailItem.customer}
          rows={[
            { label: "Order ID",  value: `ORD-${String(detailItem.id).padStart(3, "0")}` },
            { label: "Customer",  value: detailItem.customer },
            { label: "Region",    value: detailItem.region },
            { label: "Date",      value: detailItem.date },
            { label: "Amount",    value: `₹${detailItem.amount.toLocaleString("en-IN")}`, highlight: true },
            { label: "Status",    value: detailItem.status },
          ]}
          onClose={() => setDetailItem(null)}
          actionLabel="Mark Approved"
          onAction={() => { setDetailItem(null); Alert.alert("Approved", "Status updated."); }}
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
  amount: {
    fontSize: THEME.fontSize.base,
    fontWeight: "700",
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
  },
});
