import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {
  ShieldCheck,
  Users,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Search,
  Eye,
  AlertTriangle,
  RefreshCw,
  ShoppingBag,
  Coins,
  X,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import {
  getAdminDashboard,
  getAdminUsers,
  updateAdminUserStatus,
  getAdminUserSales,
  AdminDashboardData,
  AdminUser,
} from '../services/api';
import { Sale } from '../types/sales';
import { useAuth } from '../context/AuthContext';

export const AdminPortal: React.FC = () => {
  const { user: currentAdmin } = useAuth();

  const [dashboardData, setDashboardData] = useState<AdminDashboardData | null>(null);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'active' | 'inactive'>('All');
  const [roleFilter, setRoleFilter] = useState<'All' | 'admin' | 'user'>('All');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  // User inspection modal
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userSales, setUserSales] = useState<Sale[]>([]);
  const [salesLoading, setSalesLoading] = useState(false);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [dash, uList] = await Promise.all([
        getAdminDashboard(true),
        getAdminUsers(
          {
            search,
            status: statusFilter,
            role: roleFilter,
          },
          true
        ),
      ]);

      setDashboardData(dash);
      setUsers(uList);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, roleFilter]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const handleToggleStatus = async (user: AdminUser) => {
    if (user.id === currentAdmin?.id) {
      alert('You cannot deactivate your own administrative account.');
      return;
    }

    const nextStatus = user.status === 'active' ? 'inactive' : 'active';
    try {
      setActionLoading(user.id);
      await updateAdminUserStatus(user.id, nextStatus);
      // Update local state
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
      if (dashboardData) {
        setDashboardData({
          ...dashboardData,
          activeUsers:
            nextStatus === 'active'
              ? dashboardData.activeUsers + 1
              : dashboardData.activeUsers - 1,
          inactiveUsers:
            nextStatus === 'inactive'
              ? dashboardData.inactiveUsers + 1
              : dashboardData.inactiveUsers - 1,
        });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update user status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleInspectUser = async (user: AdminUser) => {
    setSelectedUser(user);
    setSalesLoading(true);
    try {
      const sales = await getAdminUserSales(user.id);
      setUserSales(sales);
    } catch (err) {
      setUserSales([]);
    } finally {
      setSalesLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Admin Header Banner */}
      <View style={styles.adminBanner}>
        <View style={styles.bannerLeft}>
          <View style={styles.shieldBadge}>
            <ShieldCheck size={20} color="#ffffff" />
          </View>
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.adminTitle}>Admin Control Center</Text>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>Restricted Role</Text>
              </View>
            </View>
            <Text style={styles.adminSub}>
              System-wide user directory, account statuses, and centralized analytics
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.refreshBtn} onPress={fetchAdminData} activeOpacity={0.8}>
          <RefreshCw size={14} color="#09090b" />
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <AlertTriangle size={16} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Top Admin KPI Metrics */}
      {dashboardData && (
        <View style={styles.kpiGrid}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Total Accounts</Text>
              <Users size={16} color="#64748b" />
            </View>
            <Text style={styles.kpiValue}>{dashboardData.totalUsers}</Text>
            <Text style={styles.kpiSub}>registered platform users</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Active Users</Text>
              <CheckCircle2 size={16} color="#10b981" />
            </View>
            <Text style={[styles.kpiValue, { color: '#047857' }]}>
              {dashboardData.activeUsers}
            </Text>
            <Text style={styles.kpiSub}>authorized accounts</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Inactive Users</Text>
              <XCircle size={16} color="#ef4444" />
            </View>
            <Text style={[styles.kpiValue, { color: '#b91c1c' }]}>
              {dashboardData.inactiveUsers}
            </Text>
            <Text style={styles.kpiSub}>access suspended</Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Text style={styles.kpiLabel}>Total Platform Volume</Text>
              <Coins size={16} color="#2563eb" />
            </View>
            <Text style={styles.kpiValue}>
              ₹{(dashboardData.totalRevenue / 1000).toFixed(0)}k
            </Text>
            <Text style={styles.kpiSub}>{dashboardData.totalSales} recorded sales</Text>
          </View>
        </View>
      )}

      {/* Filter and Search Bar */}
      <View style={styles.filterSection}>
        <View style={styles.searchBox}>
          <Search size={15} color="#94a3b8" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by name, email, or user ID..."
            placeholderTextColor="#94a3b8"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.pillRow}>
          {(['All', 'active', 'inactive'] as const).map((s) => (
            <TouchableOpacity
              key={s}
              style={[styles.pill, statusFilter === s && styles.pillActive]}
              onPress={() => setStatusFilter(s)}
            >
              <Text style={[styles.pillText, statusFilter === s && styles.pillTextActive]}>
                {s === 'All' ? 'All Statuses' : s.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}

          {(['All', 'admin', 'user'] as const).map((r) => (
            <TouchableOpacity
              key={r}
              style={[styles.pill, roleFilter === r && styles.pillActive]}
              onPress={() => setRoleFilter(r)}
            >
              <Text style={[styles.pillText, roleFilter === r && styles.pillTextActive]}>
                {r === 'All' ? 'All Roles' : r.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Users Management Table */}
      <View style={styles.tableCard}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableTitle}>User Management Directory</Text>
          <Text style={styles.tableCount}>{users.length} users found</Text>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#09090b" />
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyBox}>
            <Users size={32} color="#94a3b8" />
            <Text style={styles.emptyText}>No users matched your filter criteria.</Text>
          </View>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              {/* Header row */}
              <View style={styles.rowHeader}>
                <Text style={[styles.th, { width: 60 }]}>ID</Text>
                <Text style={[styles.th, { width: 180 }]}>User Name</Text>
                <Text style={[styles.th, { width: 220 }]}>Email Address</Text>
                <Text style={[styles.th, { width: 100 }]}>Role</Text>
                <Text style={[styles.th, { width: 110 }]}>Status</Text>
                <Text style={[styles.th, { width: 110 }]}>Sales Qty</Text>
                <Text style={[styles.th, { width: 130, textAlign: 'right' }]}>Total Volume</Text>
                <Text style={[styles.th, { width: 180, textAlign: 'center' }]}>Actions</Text>
              </View>

              {/* Data rows */}
              {users.map((u) => {
                const isCurrentAdmin = u.id === currentAdmin?.id;
                const isActive = u.status === 'active';

                return (
                  <View key={u.id} style={styles.row}>
                    <Text style={[styles.td, { width: 60, fontFamily: THEME.fontFamily.medium }]}>
                      #{u.id}
                    </Text>

                    <View style={{ width: 180 }}>
                      <Text style={styles.userName} numberOfLines={1}>
                        {u.name}
                      </Text>
                      <Text style={styles.userDate}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                      </Text>
                    </View>

                    <Text style={[styles.td, { width: 220, color: '#64748b' }]} numberOfLines={1}>
                      {u.email}
                    </Text>

                    <View style={{ width: 100 }}>
                      <View
                        style={[
                          styles.roleBadge,
                          u.role === 'admin' ? styles.roleBadgeAdmin : styles.roleBadgeUser,
                        ]}
                      >
                        <Text
                          style={[
                            styles.roleBadgeText,
                            u.role === 'admin' ? styles.roleTextAdmin : styles.roleTextUser,
                          ]}
                        >
                          {u.role.toUpperCase()}
                        </Text>
                      </View>
                    </View>

                    <View style={{ width: 110 }}>
                      <View
                        style={[
                          styles.statusBadge,
                          isActive ? styles.statusBadgeActive : styles.statusBadgeInactive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusBadgeText,
                            isActive ? styles.statusTextActive : styles.statusTextInactive,
                          ]}
                        >
                          {isActive ? 'ACTIVE' : 'DEACTIVATED'}
                        </Text>
                      </View>
                    </View>

                    <Text style={[styles.td, { width: 110 }]}>{u.salesCount || 0} sales</Text>

                    <Text
                      style={[
                        styles.td,
                        { width: 130, textAlign: 'right', fontFamily: THEME.fontFamily.semibold },
                      ]}
                    >
                      ₹{(u.totalRevenue || 0).toLocaleString('en-IN')}
                    </Text>

                    <View style={styles.actionCell}>
                      {/* Inspect user */}
                      <TouchableOpacity
                        style={styles.actionInspectBtn}
                        onPress={() => handleInspectUser(u)}
                        activeOpacity={0.8}
                      >
                        <Eye size={13} color="#09090b" />
                        <Text style={styles.actionInspectText}>Inspect</Text>
                      </TouchableOpacity>

                      {/* Toggle status */}
                      <TouchableOpacity
                        style={[
                          styles.actionToggleBtn,
                          isActive ? styles.actionDeact : styles.actionAct,
                          isCurrentAdmin && styles.actionDisabled,
                        ]}
                        disabled={isCurrentAdmin || actionLoading === u.id}
                        onPress={() => handleToggleStatus(u)}
                        activeOpacity={0.8}
                      >
                        {actionLoading === u.id ? (
                          <ActivityIndicator size="small" color="#09090b" />
                        ) : (
                          <Text
                            style={[
                              styles.actionToggleText,
                              isActive ? styles.actionDeactText : styles.actionActText,
                            ]}
                          >
                            {isActive ? 'Deactivate' : 'Activate'}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </ScrollView>
        )}
      </View>

      {/* Inspect User Sales Modal */}
      {selectedUser && (
        <Modal visible={!!selectedUser} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalBox}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>User Account #{selectedUser.id}</Text>
                  <Text style={styles.modalSub}>{selectedUser.name} ({selectedUser.email})</Text>
                </View>
                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedUser(null)}
                >
                  <X size={18} color="#09090b" />
                </TouchableOpacity>
              </View>

              <View style={styles.userStatsRow}>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Role</Text>
                  <Text style={styles.statVal}>{selectedUser.role.toUpperCase()}</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Status</Text>
                  <Text style={[styles.statVal, { color: selectedUser.status === 'active' ? '#047857' : '#b91c1c' }]}>
                    {selectedUser.status?.toUpperCase()}
                  </Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statLabel}>Lifetime Revenue</Text>
                  <Text style={styles.statVal}>₹{(selectedUser.totalRevenue || 0).toLocaleString('en-IN')}</Text>
                </View>
              </View>

              <Text style={styles.salesListTitle}>User Sales Ledger ({userSales.length} items)</Text>

              {salesLoading ? (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <ActivityIndicator size="small" color="#09090b" />
                </View>
              ) : userSales.length === 0 ? (
                <Text style={styles.emptySales}>No sales recorded for this user yet.</Text>
              ) : (
                <ScrollView style={{ maxHeight: 260 }}>
                  {userSales.map((s) => (
                    <View key={s.id} style={styles.saleItem}>
                      <View>
                        <Text style={styles.saleProd}>{s.productName}</Text>
                        <Text style={styles.saleCustomer}>{s.customer} • {s.date} • {s.region}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={styles.saleAmount}>₹{s.amount.toLocaleString('en-IN')}</Text>
                        <Text style={styles.saleStatus}>{s.status}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 24,
  },
  adminBanner: {
    backgroundColor: '#ffffff',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...THEME.shadow.card,
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shieldBadge: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#09090b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  adminTitle: {
    fontSize: 16,
    fontFamily: THEME.fontFamily.bold,
    fontWeight: '500',
    color: '#09090b',
  },
  roleTag: {
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  roleTagText: {
    fontSize: 10,
    fontFamily: THEME.fontFamily.semibold,
    color: '#09090b',
  },
  adminSub: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: THEME.fontFamily.regular,
    marginTop: 2,
  },
  refreshBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: THEME.radius.md,
    backgroundColor: '#f1f5f9',
  },
  refreshText: {
    fontSize: 12,
    fontFamily: THEME.fontFamily.medium,
    color: '#09090b',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    padding: 12,
    borderRadius: THEME.radius.md,
  },
  errorText: {
    color: '#b91c1c',
    fontSize: 12,
    fontFamily: THEME.fontFamily.medium,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCard: {
    flex: 1,
    minWidth: 180,
    backgroundColor: '#ffffff',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 14,
    ...THEME.shadow.card,
  },
  kpiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  kpiLabel: {
    fontSize: 12,
    fontFamily: THEME.fontFamily.medium,
    color: '#64748b',
  },
  kpiValue: {
    fontSize: 22,
    fontFamily: THEME.fontFamily.bold,
    fontWeight: '500',
    color: '#09090b',
  },
  kpiSub: {
    fontSize: 11,
    color: '#94a3b8',
    fontFamily: THEME.fontFamily.regular,
    marginTop: 2,
  },
  filterSection: {
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: THEME.radius.md,
    height: 40,
    paddingHorizontal: 12,
    gap: 8,
    ...THEME.shadow.card,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: '#09090b',
    outlineWidth: 0,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: THEME.radius.full,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  pillActive: {
    backgroundColor: '#09090b',
    borderColor: '#09090b',
  },
  pillText: {
    fontSize: 11,
    fontFamily: THEME.fontFamily.medium,
    color: '#64748b',
  },
  pillTextActive: {
    color: '#ffffff',
    fontFamily: THEME.fontFamily.semibold,
  },
  tableCard: {
    backgroundColor: '#ffffff',
    borderRadius: THEME.radius.lg,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    overflow: 'hidden',
    ...THEME.shadow.card,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  tableTitle: {
    fontSize: 14,
    fontFamily: THEME.fontFamily.semibold,
    fontWeight: '500',
    color: '#09090b',
  },
  tableCount: {
    fontSize: 12,
    color: '#64748b',
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
  },
  emptyBox: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#94a3b8',
  },
  table: {
    minWidth: 1050,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  th: {
    fontSize: 11,
    fontFamily: THEME.fontFamily.semibold,
    fontWeight: '500',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  td: {
    fontSize: 12,
    color: '#09090b',
  },
  userName: {
    fontSize: 12,
    fontFamily: THEME.fontFamily.semibold,
    fontWeight: '500',
    color: '#09090b',
  },
  userDate: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  roleBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  roleBadgeAdmin: {
    backgroundColor: '#ede9fe',
  },
  roleBadgeUser: {
    backgroundColor: '#f1f5f9',
  },
  roleBadgeText: {
    fontSize: 10,
    fontFamily: THEME.fontFamily.bold,
  },
  roleTextAdmin: {
    color: '#6d28d9',
  },
  roleTextUser: {
    color: '#475569',
  },
  statusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  statusBadgeActive: {
    backgroundColor: '#ecfdf5',
  },
  statusBadgeInactive: {
    backgroundColor: '#fef2f2',
  },
  statusBadgeText: {
    fontSize: 10,
    fontFamily: THEME.fontFamily.bold,
  },
  statusTextActive: {
    color: '#047857',
  },
  statusTextInactive: {
    color: '#b91c1c',
  },
  actionCell: {
    width: 180,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionInspectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: '#f1f5f9',
  },
  actionInspectText: {
    fontSize: 11,
    fontFamily: THEME.fontFamily.medium,
    color: '#09090b',
  },
  actionToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  actionDeact: {
    backgroundColor: '#fee2e2',
  },
  actionAct: {
    backgroundColor: '#dcfce7',
  },
  actionDisabled: {
    opacity: 0.3,
  },
  actionToggleText: {
    fontSize: 11,
    fontFamily: THEME.fontFamily.medium,
  },
  actionDeactText: {
    color: '#b91c1c',
  },
  actionActText: {
    color: '#15803d',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalBox: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#ffffff',
    borderRadius: THEME.radius.xl,
    padding: 20,
    ...THEME.shadow.modal,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 16,
    fontFamily: THEME.fontFamily.bold,
    fontWeight: '500',
    color: '#09090b',
  },
  modalSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    padding: 4,
  },
  userStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statLabel: {
    fontSize: 10,
    color: '#64748b',
    fontFamily: THEME.fontFamily.medium,
  },
  statVal: {
    fontSize: 14,
    fontFamily: THEME.fontFamily.bold,
    fontWeight: '500',
    color: '#09090b',
    marginTop: 2,
  },
  salesListTitle: {
    fontSize: 13,
    fontFamily: THEME.fontFamily.semibold,
    color: '#09090b',
    marginBottom: 8,
  },
  emptySales: {
    fontSize: 12,
    color: '#94a3b8',
    paddingVertical: 12,
    textAlign: 'center',
  },
  saleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  saleProd: {
    fontSize: 12,
    fontFamily: THEME.fontFamily.semibold,
    color: '#09090b',
  },
  saleCustomer: {
    fontSize: 10,
    color: '#64748b',
  },
  saleAmount: {
    fontSize: 12,
    fontFamily: THEME.fontFamily.bold,
    color: '#09090b',
  },
  saleStatus: {
    fontSize: 10,
    color: '#10b981',
  },
});
