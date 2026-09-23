import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, RefreshControl, Alert } from "react-native";
import { Users, MapPin, ShoppingBag, Coins } from "lucide-react-native";
import { THEME } from "../constants/theme";
import { AppShell } from "../components/AppShell";
import { EnterpriseStatCard } from "../components/EnterpriseStatCard";
import { DataTable, IdBadge, Column } from "../components/DataTable";
import { LoadingView } from "../components/LoadingView";
import { DetailModal } from "../components/ActionModal";
import { getCustomers } from "../services/api";
import { Customer } from "../types/sales";

export default function CustomersScreen() {
  const [customers,   setCustomers]  = useState<Customer[]>([]);
  const [loading,     setLoading]    = useState(true);
  const [refreshing,  setRefreshing] = useState(false);
  const [error,       setError]      = useState<string | null>(null);
  const [searchQuery, setSearchQuery]= useState("");
  const [detailItem,  setDetailItem] = useState<Customer | null>(null);

  const fetchData = useCallback(async (silent = false, bypass = false) => {
    try {
      if (!silent && customers.length === 0) setLoading(true);
      setError(null);
      const data = await getCustomers({ search: searchQuery }, bypass);
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || "Unable to load clients.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customers.length, searchQuery]);

  useEffect(() => { fetchData(); }, [fetchData]);
  const onRefresh = () => { setRefreshing(true); fetchData(true, true); };

  const totalSpending = customers.reduce((a, c) => a + c.totalSpending, 0);
  const totalOrders   = customers.reduce((a, c) => a + c.totalOrders,   0);

  const columns: Column<Customer>[] = [
    {
      key: "id", header: "Customer ID", width: 120,
      render: (item) => <IdBadge label={`CUST-${String(item.id).padStart(3, "0")}`} />,
    },
    {
      key: "name", header: "Customer Name", flex: 1.5,
      render: (item) => {
        const initials = (item.name || "C").trim().split(/\s+/).filter(Boolean).map((n) => n[0]).join("").substring(0, 2).toUpperCase() || "C";
        return (
          <View style={st.clientCell}>
            <View style={st.avatar}>
              <Text style={st.avatarText}>{initials}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.bold} numberOfLines={1}>{item.name}</Text>
              <Text style={st.sub}>{item.email}</Text>
            </View>
          </View>
        );
      },
    },
    {
      key: "region", header: "Region", width: 140,
      render: (item) => <Text style={st.bold}>{item.region}</Text>,
    },
    {
      key: "totalOrders", header: "Orders", width: 100, align: "center",
      render: (item) => <Text style={st.cellText}>{item.totalOrders}</Text>,
    },
    {
      key: "totalSpending", header: "Lifetime Spend", width: 130, align: "right",
      render: (item) => <Text style={st.amount}>₹{item.totalSpending.toLocaleString("en-IN")}</Text>,
    },
  ];

  return (
    <AppShell
      activeTab="Customers"
      title="Customers"
      subtitle="Customer accounts, regional distribution, and spending records"
      onSearch={setSearchQuery}
      searchPlaceholder="Search customers, email, or region..."
    >
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={THEME.colors.primary} />
      <LoadingView isLoading={loading} error={error} onRetry={() => fetchData(false, true)}>
        <View style={st.statsRow}>
          <EnterpriseStatCard label="Total customers" value={customers.length}                                                    icon={Users} />
          <EnterpriseStatCard label="Active regions"  value={new Set(customers.map((c) => c.region)).size}                       icon={MapPin} />
          <EnterpriseStatCard label="Total orders"    value={totalOrders}                                                        icon={ShoppingBag} />
          <EnterpriseStatCard label="Total revenue"   value={`₹${(totalSpending / 1000).toFixed(0)}k`}                          icon={Coins} />
        </View>

        <DataTable
          title="Customer directory"
          count={customers.length}
          columns={columns}
          data={customers}
          keyExtractor={(item) => String(item.id)}
          actionButtonLabel="View"
          onRowAction={(item) => setDetailItem(item)}
        />
      </LoadingView>

      {detailItem && (
        <DetailModal
          visible={!!detailItem}
          title={detailItem.name}
          subtitle={`CLT-${String(detailItem.id).padStart(3, "0")}`}
          rows={[
            { label: "Customer ID",   value: `CUST-${String(detailItem.id).padStart(3, "0")}` },
            { label: "Name",          value: detailItem.name },
            { label: "Email",         value: detailItem.email },
            { label: "Region",        value: detailItem.region },
            { label: "Total orders",  value: detailItem.totalOrders },
            { label: "Lifetime spend",value: `₹${detailItem.totalSpending.toLocaleString("en-IN")}`, highlight: true },
          ]}
          onClose={() => setDetailItem(null)}
          actionLabel="Send Message"
          onAction={() => { setDetailItem(null); Alert.alert("Message Sent", `A notification has been sent to ${detailItem.name}.`); }}
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
  clientCell: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  avatarText: {
    color: THEME.colors.primaryForeground,
    fontSize: THEME.fontSize.sm,
    fontWeight: "700",
    fontFamily: THEME.fontFamily.bold,
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
