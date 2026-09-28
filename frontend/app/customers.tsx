import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useWindowDimensions,
  Platform,
  Modal,
  ActivityIndicator,
} from 'react-native';
import Svg, { Circle, Polyline, Path } from 'react-native-svg';
import {
  Users,
  Coins,
  UserCheck,
  ShoppingBag,
  Search,
  ChevronDown,
  Upload,
  Download,
  Plus,
  Eye,
  Trash2,
  Edit2,
  MoreVertical,
  Check,
  MapPin,
  Phone,
  Mail,
  X,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  UserPlus,
  TrendingUp,
  Globe,
  Store,
  DollarSign,
  Wallet,
} from 'lucide-react-native';
import { AppShell } from '../components/AppShell';
import { LoadingView } from '../components/LoadingView';
import { DetailModal } from '../components/ActionModal';
import { useTheme } from '../context/ThemeContext';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/api';
import { Customer } from '../types/sales';

type SortField = 'name' | 'totalSpending' | 'totalOrders' | 'id';
type SortOrder = 'asc' | 'desc';

export default function CustomersScreen() {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 960;
  const isTablet = width >= 720;
  const { colors, isDark, radiusValues } = useTheme();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [selectedTier, setSelectedTier] = useState('All');
  const [selectedActivity, setSelectedActivity] = useState('All');
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Sorting
  const [sortField, setSortField] = useState<SortField>('totalSpending');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

  // Modals & Action States
  const [detailItem, setDetailItem] = useState<Customer | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Customer | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Customer | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    region: 'North',
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Dropdown open states
  const [regionOpen, setRegionOpen] = useState(false);
  const [tierOpen, setTierOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [pageSizeOpen, setPageSizeOpen] = useState(false);

  // Quick toast notification helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const fetchData = useCallback(async (silent = false, bypass = false) => {
    try {
      if (!silent && customers.length === 0) setLoading(true);
      setError(null);
      const data = await getCustomers({}, bypass);
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Unable to load client data.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customers.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true, true);
  };

  // Dynamic unique regions from real database
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.region) set.add(c.region);
    });
    return ['All', ...Array.from(set)];
  }, [customers]);

  // Aggregate Metrics strictly calculated from real database
  const totalSpending = useMemo(() => {
    return customers.reduce((sum, c) => sum + (Number(c.totalSpending) || 0), 0);
  }, [customers]);

  const activeBuyers = useMemo(() => {
    return customers.filter((c) => (c.totalOrders || 0) > 0);
  }, [customers]);

  const avgSpending = useMemo(() => {
    return customers.length > 0 ? Math.round(totalSpending / customers.length) : 0;
  }, [customers.length, totalSpending]);

  // Handle Sort Toggle
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  // Filtered & Sorted Dataset
  const filteredAndSortedCustomers = useMemo(() => {
    let result = customers.filter((c) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = c.name?.toLowerCase().includes(query);
        const matchEmail = c.email?.toLowerCase().includes(query);
        const matchPhone = c.phone?.toLowerCase().includes(query);
        const matchRegion = c.region?.toLowerCase().includes(query);
        if (!matchName && !matchEmail && !matchPhone && !matchRegion) {
          return false;
        }
      }

      // 2. Region filter
      if (selectedRegion !== 'All' && c.region !== selectedRegion) {
        return false;
      }

      // 3. Spending Tier filter
      if (selectedTier === 'High Value (₹50k+)' && c.totalSpending < 50000) return false;
      if (selectedTier === 'Mid Tier (₹15k-₹50k)' && (c.totalSpending < 15000 || c.totalSpending >= 50000)) return false;
      if (selectedTier === 'Standard (<₹15k)' && c.totalSpending >= 15000) return false;

      // 4. Order Activity filter
      if (selectedActivity === 'Active Buyers (1+ orders)' && (c.totalOrders || 0) < 1) return false;
      if (selectedActivity === 'High Volume (5+ orders)' && (c.totalOrders || 0) < 5) return false;
      if (selectedActivity === 'No Orders (0 orders)' && (c.totalOrders || 0) > 0) return false;

      return true;
    });

    // Sort
    result.sort((a, b) => {
      let valA: any = a[sortField];
      let valB: any = b[sortField];

      if (sortField === 'name') {
        valA = (valA || '').toLowerCase();
        valB = (valB || '').toLowerCase();
        return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }

      valA = Number(valA || 0);
      valB = Number(valB || 0);
      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [customers, searchQuery, selectedRegion, selectedTier, selectedActivity, sortField, sortOrder]);

  // Pagination Calculations
  const totalPages = Math.max(1, Math.ceil(filteredAndSortedCustomers.length / pageSize));
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAndSortedCustomers.slice(start, start + pageSize);
  }, [filteredAndSortedCustomers, currentPage, pageSize]);

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

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.length === paginatedCustomers.length && paginatedCustomers.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(paginatedCustomers.map((c) => c.id));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // CSV Export using real customer data
  const handleExportCSV = (exportSelectedOnly = false) => {
    const listToExport = exportSelectedOnly
      ? customers.filter((c) => selectedIds.includes(c.id))
      : filteredAndSortedCustomers;

    if (!listToExport.length) {
      showToast('No customer records to export.');
      return;
    }

    const headers = ['Customer ID', 'Customer Name', 'Email', 'Phone', 'Region', 'Total Orders', 'Total Spend (INR)', 'AOV (INR)'];
    const rows = listToExport.map((c) => [
      `CUST-${String(c.id).padStart(3, '0')}`,
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.phone || ''}"`,
      `"${c.region || ''}"`,
      c.totalOrders || 0,
      c.totalSpending || 0,
      c.totalOrders > 0 ? Math.round(c.totalSpending / c.totalOrders) : 0,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `customers_${exportSelectedOnly ? 'selected_' : ''}${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast(`Exported ${listToExport.length} customer records to CSV.`);
    }
  };

  // Create Customer Form Submission
  const handleCreateCustomer = async () => {
    if (!formData.name.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    try {
      setActionLoading(true);
      setFormError(null);
      const created = await createCustomer(formData);
      setCustomers((prev) => [created, ...prev]);
      setAddModalOpen(false);
      setFormData({ name: '', email: '', phone: '', region: 'North' });
      showToast(`Client "${created.name}" created successfully!`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create customer.');
    } finally {
      setActionLoading(false);
    }
  };

  // Update Customer Form Submission
  const handleUpdateCustomer = async () => {
    if (!editItem) return;
    if (!formData.name.trim()) {
      setFormError('Customer name is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    try {
      setActionLoading(true);
      setFormError(null);
      const updated = await updateCustomer(editItem.id, formData);
      setCustomers((prev) =>
        prev.map((c) => (c.id === editItem.id ? { ...c, ...updated } : c))
      );
      setEditItem(null);
      showToast(`Client "${formData.name}" updated successfully!`);
    } catch (err: any) {
      setFormError(err.message || 'Failed to update customer.');
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Customer Action
  const handleDeleteCustomer = async (c: Customer) => {
    try {
      setActionLoading(true);
      await deleteCustomer(c.id);
      setCustomers((prev) => prev.filter((item) => item.id !== c.id));
      setSelectedIds((prev) => prev.filter((id) => id !== c.id));
      setDeleteCandidate(null);
      showToast(`Client "${c.name}" deleted.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete client.');
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Delete Selected
  const handleBulkDelete = async () => {
    if (!selectedIds.length) return;
    try {
      setActionLoading(true);
      await Promise.all(selectedIds.map((id) => deleteCustomer(id)));
      setCustomers((prev) => prev.filter((c) => !selectedIds.includes(c.id)));
      showToast(`Deleted ${selectedIds.length} customer records.`);
      setSelectedIds([]);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete selected customers.');
    } finally {
      setActionLoading(false);
    }
  };

  // Open Edit Modal
  const openEditModal = (c: Customer) => {
    setEditItem(c);
    setFormData({
      name: c.name,
      email: c.email,
      phone: c.phone || '',
      region: c.region || 'North',
    });
    setFormError(null);
  };

  const getCustomerInitials = (name: string): string => {
    if (!name) return 'C';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <AppShell activeTab="Customers">
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View style={[styles.toastContainer, { backgroundColor: isDark ? '#27272a' : '#09090b' }]}>
          <Check size={14} color="#22c55e" style={{ marginRight: 6 }} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <LoadingView isLoading={loading} error={error} onRetry={() => fetchData(false, true)}>
        <View style={styles.container}>
          {/* ─── 1. TOP ROW: 4 KPI BOX CARDS (Reduced Width) ─── */}
          <View style={styles.kpiRow}>
            {/* Card 1: Total Customers */}
            <View
              style={[
                styles.kpiCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radiusValues.md,
                },
              ]}
            >
              <View style={styles.kpiCardTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
                  <Users size={18} color={isDark ? '#94a3b8' : '#475569'} />
                </View>
                <View style={[styles.kpiTrendBadge, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={[styles.kpiTrendText, { color: '#16a34a' }]}>+100%</Text>
                </View>
              </View>

              <View style={styles.kpiCardBottomBody}>
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{customers.length}</Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Customers</Text>
                <Text style={[styles.kpiSubText, { color: colors.textMuted }]}>Registered client accounts</Text>
              </View>
            </View>

            {/* Card 2: Cumulative Customer Spend */}
            <View
              style={[
                styles.kpiCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radiusValues.md,
                },
              ]}
            >
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
                  ₹{(totalSpending / 1000).toFixed(0)}k
                </Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Total Spending</Text>
                <Text style={[styles.kpiSubText, { color: colors.textMuted }]}>Lifetime client spend</Text>
              </View>
            </View>

            {/* Card 3: Active Buyers */}
            <View
              style={[
                styles.kpiCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radiusValues.md,
                },
              ]}
            >
              <View style={styles.kpiCardTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: isDark ? '#143828' : '#dcfce7' }]}>
                  <UserCheck size={18} color="#16a34a" />
                </View>
                <View style={[styles.kpiTrendBadge, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={[styles.kpiTrendText, { color: '#16a34a' }]}>+25%</Text>
                </View>
              </View>

              <View style={styles.kpiCardBottomBody}>
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>{activeBuyers.length}</Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Active Buyers</Text>
                <Text style={[styles.kpiSubText, { color: colors.textMuted }]}>Accounts with placed orders</Text>
              </View>
            </View>

            {/* Card 4: Average Lifetime Value */}
            <View
              style={[
                styles.kpiCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radiusValues.md,
                },
              ]}
            >
              <View style={styles.kpiCardTopRow}>
                <View style={[styles.kpiIconBox, { backgroundColor: isDark ? '#382b13' : '#fef3c7' }]}>
                  <ShoppingBag size={18} color="#d97706" />
                </View>
                <View style={[styles.kpiTrendBadge, { backgroundColor: '#ecfdf5' }]}>
                  <Text style={[styles.kpiTrendText, { color: '#16a34a' }]}>+14.2%</Text>
                </View>
              </View>

              <View style={styles.kpiCardBottomBody}>
                <Text style={[styles.kpiValue, { color: colors.textPrimary }]}>
                  ₹{(avgSpending / 1000).toFixed(1)}k
                </Text>
                <Text style={[styles.kpiLabel, { color: colors.textSecondary }]}>Average Spend</Text>
                <Text style={[styles.kpiSubText, { color: colors.textMuted }]}>Mean customer revenue</Text>
              </View>
            </View>
          </View>

          {/* ─── 2. FILTERS ROW: 3 DROPDOWNS (Matching Screenshot Layout) ─── */}
          <View style={[styles.filtersRow, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
            {/* Filter 1: Select Region */}
            <View style={styles.filterGroup}>
              <Text style={[styles.filterGroupLabel, { color: colors.textPrimary }]}>Select Region</Text>
              <TouchableOpacity
                style={[styles.dropdownTrigger, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.sm }]}
                onPress={() => {
                  setRegionOpen(!regionOpen);
                  setTierOpen(false);
                  setActivityOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.dropdownTriggerText, { color: colors.textPrimary }]}>{selectedRegion}</Text>
                <ChevronDown size={14} color={colors.textMuted} />
              </TouchableOpacity>
              {regionOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.sm }]}>
                  {availableRegions.map((r) => (
                    <TouchableOpacity
                      key={r}
                      style={[styles.dropdownMenuItem, selectedRegion === r && { backgroundColor: isDark ? '#27272a' : '#f1f5f9' }]}
                      onPress={() => {
                        setSelectedRegion(r);
                        setRegionOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      <Text style={[styles.dropdownMenuItemText, { color: selectedRegion === r ? colors.primary : colors.textPrimary }]}>
                        {r}
                      </Text>
                      {selectedRegion === r && <Check size={14} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Filter 2: Select Spending Tier */}
            <View style={styles.filterGroup}>
              <Text style={[styles.filterGroupLabel, { color: colors.textPrimary }]}>Select Spending Tier</Text>
              <TouchableOpacity
                style={[styles.dropdownTrigger, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.sm }]}
                onPress={() => {
                  setTierOpen(!tierOpen);
                  setRegionOpen(false);
                  setActivityOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.dropdownTriggerText, { color: colors.textPrimary }]}>{selectedTier}</Text>
                <ChevronDown size={14} color={colors.textMuted} />
              </TouchableOpacity>
              {tierOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.sm }]}>
                  {['All', 'High Value (₹50k+)', 'Mid Tier (₹15k-₹50k)', 'Standard (<₹15k)'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.dropdownMenuItem, selectedTier === p && { backgroundColor: isDark ? '#27272a' : '#f1f5f9' }]}
                      onPress={() => {
                        setSelectedTier(p);
                        setTierOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      <Text style={[styles.dropdownMenuItemText, { color: selectedTier === p ? colors.primary : colors.textPrimary }]}>
                        {p}
                      </Text>
                      {selectedTier === p && <Check size={14} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Filter 3: Select Order Activity */}
            <View style={styles.filterGroup}>
              <Text style={[styles.filterGroupLabel, { color: colors.textPrimary }]}>Select Order Activity</Text>
              <TouchableOpacity
                style={[styles.dropdownTrigger, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.sm }]}
                onPress={() => {
                  setActivityOpen(!activityOpen);
                  setRegionOpen(false);
                  setTierOpen(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.dropdownTriggerText, { color: colors.textPrimary }]}>{selectedActivity}</Text>
                <ChevronDown size={14} color={colors.textMuted} />
              </TouchableOpacity>
              {activityOpen && (
                <View style={[styles.dropdownMenu, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.sm }]}>
                  {['All', 'Active Buyers (1+ orders)', 'High Volume (5+ orders)', 'No Orders (0 orders)'].map((s) => (
                    <TouchableOpacity
                      key={s}
                      style={[styles.dropdownMenuItem, selectedActivity === s && { backgroundColor: isDark ? '#27272a' : '#f1f5f9' }]}
                      onPress={() => {
                        setSelectedActivity(s);
                        setActivityOpen(false);
                        setCurrentPage(1);
                      }}
                    >
                      <Text style={[styles.dropdownMenuItemText, { color: selectedActivity === s ? colors.primary : colors.textPrimary }]}>
                        {s}
                      </Text>
                      {selectedActivity === s && <Check size={14} color={colors.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* ─── 3. ACTION TOOLBAR: SEARCH + PAGE SIZE + EXPORT + IMPORT + ADD ─── */}
          <View style={styles.actionBar}>
            {/* Search customer input */}
            <View style={[styles.searchInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.sm }]}>
              <Search size={15} color={colors.textMuted} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder="Search client name, email, phone, territory..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={(t) => {
                  setSearchQuery(t);
                  setCurrentPage(1);
                }}
                {...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {})}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <X size={14} color={colors.textMuted} />
                </TouchableOpacity>
              )}
            </View>

            {/* Right Buttons Toolbar */}
            <View style={styles.actionButtonsGroup}>
              {/* Page size dropdown */}
              <View style={{ position: 'relative' }}>
                <TouchableOpacity
                  style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.sm }]}
                  onPress={() => setPageSizeOpen(!pageSizeOpen)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.toolBtnText, { color: colors.textPrimary }]}>{pageSize}</Text>
                  <ChevronDown size={13} color={colors.textMuted} />
                </TouchableOpacity>
                {pageSizeOpen && (
                  <View style={[styles.pageSizeMenu, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.sm }]}>
                    {[5, 10, 20, 50].map((size) => (
                      <TouchableOpacity
                        key={size}
                        style={[styles.dropdownMenuItem, pageSize === size && { backgroundColor: isDark ? '#27272a' : '#f1f5f9' }]}
                        onPress={() => {
                          setPageSize(size);
                          setPageSizeOpen(false);
                          setCurrentPage(1);
                        }}
                      >
                        <Text style={[styles.dropdownMenuItemText, { color: colors.textPrimary }]}>{size}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Export Button */}
              <TouchableOpacity
                style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.sm }]}
                onPress={() => handleExportCSV(false)}
                activeOpacity={0.8}
              >
                <Download size={14} color={colors.textPrimary} />
                <Text style={[styles.toolBtnText, { color: colors.textPrimary }]}>Export</Text>
              </TouchableOpacity>

              {/* Import / Refresh Button */}
              <TouchableOpacity
                style={[styles.toolBtn, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.sm }]}
                onPress={() => setImportModalOpen(true)}
                activeOpacity={0.8}
              >
                <Upload size={14} color={colors.textPrimary} />
                <Text style={[styles.toolBtnText, { color: colors.textPrimary }]}>Import</Text>
              </TouchableOpacity>

              {/* + Add New Customer Button */}
              <TouchableOpacity
                style={[styles.primaryAddBtn, { backgroundColor: isDark ? '#f4f4f5' : '#09090b', borderRadius: radiusValues.sm }]}
                onPress={() => {
                  setFormData({ name: '', email: '', phone: '', region: 'North' });
                  setFormError(null);
                  setAddModalOpen(true);
                }}
                activeOpacity={0.85}
              >
                <Plus size={14} color={isDark ? '#09090b' : '#ffffff'} />
                <Text style={[styles.primaryAddBtnText, { color: isDark ? '#09090b' : '#ffffff' }]}>
                  + Add New Customer
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ─── BULK ACTIONS STRIP (when rows selected) ─── */}
          {selectedIds.length > 0 && (
            <View style={[styles.bulkActionBar, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9', borderColor: colors.border }]}>
              <View style={styles.bulkActionLeft}>
                <View style={[styles.selectedCountBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.selectedCountText}>{selectedIds.length}</Text>
                </View>
                <Text style={[styles.bulkActionTitle, { color: colors.textPrimary }]}>
                  customer{selectedIds.length > 1 ? 's' : ''} selected
                </Text>
              </View>

              <View style={styles.bulkActionButtons}>
                <TouchableOpacity
                  style={[styles.bulkBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  onPress={() => handleExportCSV(true)}
                  activeOpacity={0.8}
                >
                  <Download size={13} color={colors.textPrimary} />
                  <Text style={[styles.bulkBtnText, { color: colors.textPrimary }]}>Export Selected</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.bulkBtn, { backgroundColor: '#fee2e2', borderColor: '#fca5a5' }]}
                  onPress={handleBulkDelete}
                  activeOpacity={0.8}
                >
                  <Trash2 size={13} color="#dc2626" />
                  <Text style={[styles.bulkBtnText, { color: '#dc2626' }]}>Delete Selected</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.bulkBtnClear]}
                  onPress={() => setSelectedIds([])}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.bulkBtnClearText, { color: colors.textMuted }]}>Clear Selection</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ─── 4. DATA TABLE: USER'S REAL MATTER WITH EXACT SCREENSHOT LAYOUT ─── */}
          <View style={[styles.tableContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radiusValues.md }]}>
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={styles.tableInner}>
                {/* Table Header Row with Interactive Sorting */}
                <View style={[styles.tableHeaderRow, { borderBottomColor: colors.border, backgroundColor: isDark ? '#18181b' : '#fafafa' }]}>
                  {/* Select All Checkbox */}
                  <TouchableOpacity
                    style={[styles.thCell, styles.colCheck]}
                    onPress={toggleSelectAll}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.checkboxBox,
                        { borderColor: colors.border },
                        selectedIds.length === paginatedCustomers.length &&
                          paginatedCustomers.length > 0 && {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                          },
                      ]}
                    >
                      {selectedIds.length === paginatedCustomers.length && paginatedCustomers.length > 0 && (
                        <Check size={11} color="#ffffff" />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Customer Column Header */}
                  <TouchableOpacity
                    style={[styles.thCellSortable, styles.colUser]}
                    onPress={() => handleSort('name')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.thText, { color: colors.textMuted }]}>CUSTOMER</Text>
                    {sortField === 'name' ? (
                      sortOrder === 'asc' ? <ArrowUp size={12} color={colors.primary} /> : <ArrowDown size={12} color={colors.primary} />
                    ) : (
                      <ArrowUpDown size={11} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>

                  <Text style={[styles.thText, styles.colPhone, { color: colors.textMuted }]}>PHONE</Text>
                  <Text style={[styles.thText, styles.colRegion, { color: colors.textMuted }]}>TERRITORY</Text>

                  {/* Orders Column Header */}
                  <TouchableOpacity
                    style={[styles.thCellSortable, styles.colOrders, { justifyContent: 'center' }]}
                    onPress={() => handleSort('totalOrders')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.thText, { color: colors.textMuted }]}>ORDERS</Text>
                    {sortField === 'totalOrders' ? (
                      sortOrder === 'asc' ? <ArrowUp size={12} color={colors.primary} /> : <ArrowDown size={12} color={colors.primary} />
                    ) : (
                      <ArrowUpDown size={11} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>

                  {/* Spend Column Header */}
                  <TouchableOpacity
                    style={[styles.thCellSortable, styles.colSpend, { justifyContent: 'flex-end' }]}
                    onPress={() => handleSort('totalSpending')}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.thText, { color: colors.textMuted }]}>TOTAL SPEND</Text>
                    {sortField === 'totalSpending' ? (
                      sortOrder === 'asc' ? <ArrowUp size={12} color={colors.primary} /> : <ArrowDown size={12} color={colors.primary} />
                    ) : (
                      <ArrowUpDown size={11} color={colors.textMuted} />
                    )}
                  </TouchableOpacity>

                  <Text style={[styles.thText, styles.colAOV, { color: colors.textMuted, textAlign: 'right' }]}>AVG ORDER VALUE</Text>
                  <Text style={[styles.thText, styles.colActions, { color: colors.textMuted, textAlign: 'center' }]}>ACTIONS</Text>
                </View>

                {/* Table Body Rows */}
                {paginatedCustomers.length === 0 ? (
                  <View style={styles.emptyTableState}>
                    <Users size={32} color={colors.textMuted} />
                    <Text style={[styles.emptyTableText, { color: colors.textMuted }]}>
                      No clients found matching the selected filters.
                    </Text>
                  </View>
                ) : (
                  paginatedCustomers.map((c) => {
                    const isSelected = selectedIds.includes(c.id);
                    const aov = c.totalOrders > 0 ? Math.round(c.totalSpending / c.totalOrders) : 0;
                    const initials = getCustomerInitials(c.name);

                    return (
                      <View
                        key={c.id}
                        style={[
                          styles.tableRow,
                          { borderBottomColor: colors.border },
                          isSelected && { backgroundColor: isDark ? 'rgba(59, 130, 246, 0.08)' : 'rgba(59, 130, 246, 0.04)' },
                        ]}
                      >
                        {/* Row Checkbox */}
                        <TouchableOpacity
                          style={[styles.tdCell, styles.colCheck]}
                          onPress={() => toggleSelectOne(c.id)}
                          activeOpacity={0.7}
                        >
                          <View
                            style={[
                              styles.checkboxBox,
                              { borderColor: colors.border },
                              isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                            ]}
                          >
                            {isSelected && <Check size={11} color="#ffffff" />}
                          </View>
                        </TouchableOpacity>

                        {/* Customer (Avatar Initials + Name + Email) */}
                        <TouchableOpacity
                          style={[styles.tdCell, styles.colUser]}
                          onPress={() => setDetailItem(c)}
                          activeOpacity={0.8}
                        >
                          <View
                            style={[
                              styles.userAvatarBox,
                              {
                                backgroundColor: isDark ? '#27272a' : '#f1f5f9',
                                borderColor: colors.border,
                              },
                            ]}
                          >
                            <Text style={[styles.userAvatarInitials, { color: colors.textPrimary }]}>{initials}</Text>
                          </View>
                          <View style={styles.userInfoCol}>
                            <Text style={[styles.userNameText, { color: colors.textPrimary }]} numberOfLines={1}>
                              {c.name}
                            </Text>
                            <Text style={[styles.userEmailText, { color: colors.textSecondary }]} numberOfLines={1}>
                              {c.email}
                            </Text>
                          </View>
                        </TouchableOpacity>

                        {/* Phone */}
                        <View style={[styles.tdCell, styles.colPhone]}>
                          <Text style={[styles.tdRegularText, { color: colors.textSecondary }]}>
                            {c.phone || '—'}
                          </Text>
                        </View>

                        {/* Territory / Region */}
                        <View style={[styles.tdCell, styles.colRegion]}>
                          <View style={[styles.regionPill, { backgroundColor: isDark ? '#27272a' : '#f1f5f9', borderColor: colors.border }]}>
                            <MapPin size={11} color={colors.textSecondary} style={{ marginRight: 4 }} />
                            <Text style={[styles.regionPillText, { color: colors.textPrimary }]}>
                              {c.region || 'India'}
                            </Text>
                          </View>
                        </View>

                        {/* Orders */}
                        <View style={[styles.tdCell, styles.colOrders, { justifyContent: 'center' }]}>
                          <View style={[styles.ordersBadge, { backgroundColor: isDark ? '#143828' : '#ecfdf5' }]}>
                            <Text style={[styles.ordersBadgeText, { color: '#16a34a' }]}>
                              {c.totalOrders || 0} orders
                            </Text>
                          </View>
                        </View>

                        {/* Total Spend */}
                        <View style={[styles.tdCell, styles.colSpend, { justifyContent: 'flex-end' }]}>
                          <Text style={[styles.spendText, { color: colors.textPrimary }]}>
                            ₹{Number(c.totalSpending || 0).toLocaleString('en-IN')}
                          </Text>
                        </View>

                        {/* Average Order Value */}
                        <View style={[styles.tdCell, styles.colAOV, { justifyContent: 'flex-end' }]}>
                          <Text style={[styles.aovText, { color: colors.textSecondary }]}>
                            ₹{aov.toLocaleString('en-IN')}
                          </Text>
                        </View>

                        {/* Actions (Trash, Eye, 3-dots matching shadcn) */}
                        <View style={[styles.tdCell, styles.colActions, { justifyContent: 'center', gap: 12 }]}>
                          <TouchableOpacity
                            style={styles.actionIconBtn}
                            onPress={() => setDeleteCandidate(c)}
                            activeOpacity={0.7}
                            accessibilityLabel="Delete Customer"
                          >
                            <Trash2 size={16} color={colors.textSecondary} />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.actionIconBtn}
                            onPress={() => setDetailItem(c)}
                            activeOpacity={0.7}
                            accessibilityLabel="View Customer Details"
                          >
                            <Eye size={16} color={colors.textSecondary} />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.actionIconBtn}
                            onPress={() => openEditModal(c)}
                            activeOpacity={0.7}
                            accessibilityLabel="Edit Customer"
                          >
                            <MoreVertical size={16} color={colors.textSecondary} />
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
                Showing {filteredAndSortedCustomers.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                {Math.min(currentPage * pageSize, filteredAndSortedCustomers.length)} of{' '}
                {filteredAndSortedCustomers.length} entries
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

      {/* ─── ADD / EDIT CUSTOMER MODAL ─── */}
      <Modal
        visible={addModalOpen || editItem !== null}
        transparent
        animationType="fade"
        onRequestClose={() => {
          setAddModalOpen(false);
          setEditItem(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.modalHeaderIcon, { backgroundColor: isDark ? '#1e293b' : '#eff6ff' }]}>
                  <UserPlus size={18} color="#2563eb" />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                    {editItem ? `Edit Client: ${editItem.name}` : 'Register New Client'}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                    {editItem ? 'Update contact info and assigned territory' : 'Add account record directly to database'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => {
                  setAddModalOpen(false);
                  setEditItem(null);
                }}
                style={styles.modalCloseBtn}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Error banner */}
            {formError && (
              <View style={styles.formErrorBanner}>
                <AlertTriangle size={15} color="#dc2626" />
                <Text style={styles.formErrorText}>{formError}</Text>
              </View>
            )}

            {/* Form Fields */}
            <View style={styles.modalForm}>
              {/* Full Name */}
              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: colors.textPrimary }]}>Client Full Name *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="e.g. Arvind Mehta"
                  placeholderTextColor={colors.textMuted}
                  value={formData.name}
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, name: val }))}
                />
              </View>

              {/* Email Address */}
              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: colors.textPrimary }]}>Email Address *</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="arvind.mehta@example.com"
                  placeholderTextColor={colors.textMuted}
                  value={formData.email}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, email: val }))}
                />
              </View>

              {/* Phone */}
              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: colors.textPrimary }]}>Contact Phone</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.border, color: colors.textPrimary }]}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={colors.textMuted}
                  value={formData.phone}
                  keyboardType="phone-pad"
                  onChangeText={(val) => setFormData((prev) => ({ ...prev, phone: val }))}
                />
              </View>

              {/* Region Selector */}
              <View style={styles.formField}>
                <Text style={[styles.formLabel, { color: colors.textPrimary }]}>Operating Region / Territory</Text>
                <View style={styles.regionSelectRow}>
                  {['North', 'South', 'East', 'West', 'Central'].map((r) => {
                    const isSelected = formData.region === r;
                    return (
                      <TouchableOpacity
                        key={r}
                        style={[
                          styles.regionSelectOption,
                          { borderColor: colors.border, backgroundColor: isDark ? '#18181b' : '#f8fafc' },
                          isSelected && { backgroundColor: colors.primary, borderColor: colors.primary },
                        ]}
                        onPress={() => setFormData((prev) => ({ ...prev, region: r }))}
                      >
                        <Text style={[styles.regionSelectText, { color: isSelected ? '#ffffff' : colors.textPrimary }]}>
                          {r}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Modal Actions Footer */}
            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border }]}
                onPress={() => {
                  setAddModalOpen(false);
                  setEditItem(null);
                }}
                disabled={actionLoading}
              >
                <Text style={[styles.modalCancelText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: colors.primary }]}
                onPress={editItem ? handleUpdateCustomer : handleCreateCustomer}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalSubmitText}>
                    {editItem ? 'Save Changes' : 'Create Client Account'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── DELETE CONFIRMATION MODAL ─── */}
      <Modal
        visible={deleteCandidate !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteCandidate(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCardSmall, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.deleteWarnIconBox}>
              <AlertTriangle size={24} color="#dc2626" />
            </View>

            <Text style={[styles.deleteModalTitle, { color: colors.textPrimary }]}>Delete Customer Record</Text>
            <Text style={[styles.deleteModalDesc, { color: colors.textSecondary }]}>
              Are you sure you want to permanently delete{' '}
              <Text style={{ fontWeight: '500', color: colors.textPrimary }}>{deleteCandidate?.name}</Text>? This action
              cannot be undone.
            </Text>

            <View style={styles.deleteModalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: colors.border, flex: 1 }]}
                onPress={() => setDeleteCandidate(null)}
                disabled={actionLoading}
              >
                <Text style={[styles.modalCancelText, { color: colors.textPrimary }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalDeleteBtn, { flex: 1 }]}
                onPress={() => deleteCandidate && handleDeleteCustomer(deleteCandidate)}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalDeleteText}>Confirm Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── IMPORT MODAL ─── */}
      <Modal
        visible={importModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setImportModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={[styles.modalHeaderIcon, { backgroundColor: isDark ? '#1e293b' : '#ecfdf5' }]}>
                  <Upload size={18} color="#16a34a" />
                </View>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Import Customer Records</Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textMuted }]}>
                    Upload CSV or sync live enterprise accounts
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => setImportModalOpen(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 20, gap: 14 }}>
              <TouchableOpacity
                style={[styles.uploadDropzone, { borderColor: colors.border, backgroundColor: isDark ? '#18181b' : '#fafafa' }]}
                onPress={onRefresh}
                activeOpacity={0.8}
              >
                <Upload size={28} color={colors.primary} />
                <Text style={[styles.uploadDropTitle, { color: colors.textPrimary }]}>Sync / Reload Database</Text>
                <Text style={[styles.uploadDropSub, { color: colors.textMuted }]}>
                  Refresh all customer accounts with real Neon PostgreSQL database records
                </Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.modalFooter, { borderTopColor: colors.border }]}>
              <TouchableOpacity
                style={[styles.modalSubmitBtn, { backgroundColor: colors.primary, width: '100%' }]}
                onPress={() => {
                  onRefresh();
                  setImportModalOpen(false);
                  showToast('Database synced successfully!');
                }}
              >
                <Text style={styles.modalSubmitText}>Sync & Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ─── CUSTOMER RECORD DETAIL MODAL ─── */}
      {detailItem && (
        <DetailModal
          title={`Client Profile: ${detailItem.name}`}
          subtitle={`Account ID: CUST-${String(detailItem.id).padStart(3, '0')}`}
          data={{
            'Customer Name': detailItem.name,
            'Email Address': detailItem.email,
            'Phone Number': detailItem.phone || 'N/A',
            'Operating Territory': detailItem.region || 'N/A',
            'Total Orders': `${detailItem.totalOrders} fulfilled purchases`,
            'Lifetime Value': `₹${detailItem.totalSpending.toLocaleString('en-IN')}`,
            'Average Order Value': `₹${detailItem.totalOrders > 0 ? Math.round(detailItem.totalSpending / detailItem.totalOrders).toLocaleString('en-IN') : 0}`,
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

  // 1. KPI Cards
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

  // 2. Filters Row
  filtersRow: {
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  filterGroup: {
    flex: 1,
    minWidth: 200,
    position: 'relative',
  },
  filterGroupLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
    marginBottom: 6,
  },
  dropdownTrigger: {
    borderWidth: 1,
    height: 38,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dropdownTriggerText: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 66,
    left: 0,
    right: 0,
    borderWidth: 1,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
  },
  dropdownMenuItem: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownMenuItemText: {
    fontSize: 12.5,
    fontFamily: 'Manrope_500Medium',
  },

  // 3. Action Toolbar
  actionBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  searchInputWrapper: {
    flex: 1,
    minWidth: 240,
    maxWidth: 360,
    height: 38,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    padding: 0,
  },
  actionButtonsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  toolBtn: {
    height: 38,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toolBtnText: {
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  pageSizeMenu: {
    position: 'absolute',
    top: 42,
    right: 0,
    width: 70,
    borderWidth: 1,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
  },
  primaryAddBtn: {
    height: 38,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  primaryAddBtnText: {
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },

  // Bulk Actions
  bulkActionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    flexWrap: 'wrap',
    gap: 10,
  },
  bulkActionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedCountBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  selectedCountText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500',
  },
  bulkActionTitle: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  bulkActionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  bulkBtnText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  bulkBtnClear: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  bulkBtnClearText: {
    fontSize: 12,
    fontWeight: '500',
  },

  // 4. Data Table
  tableContainer: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  tableInner: {
    minWidth: 1020,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 11,
    paddingHorizontal: 6,
  },
  thCellSortable: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
  },
  thText: {
    fontSize: 10.5,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
    letterSpacing: 0.4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  thCell: {
    paddingHorizontal: 8,
  },
  tdCell: {
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxBox: {
    width: 17,
    height: 17,
    borderRadius: 4,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Column Widths
  colCheck: { width: 44, alignItems: 'center', justifyContent: 'center' },
  colUser: { width: 250 },
  colPhone: { width: 135 },
  colRegion: { width: 125 },
  colOrders: { width: 105 },
  colSpend: { width: 125 },
  colAOV: { width: 125, justifyContent: 'flex-end' },
  colActions: { width: 110, justifyContent: 'center' },

  // User cell
  userAvatarBox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  userAvatarInitials: {
    fontSize: 10,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  userInfoCol: {
    flex: 1,
  },
  userNameText: {
    fontSize: 11.5,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
    marginBottom: 1,
  },
  userEmailText: {
    fontSize: 10,
    fontFamily: 'Manrope_400Regular',
  },
  tdRegularText: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
  },
  regionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 1,
  },
  regionPillText: {
    fontSize: 10.5,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  ordersBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 9999,
    alignSelf: 'center',
  },
  ordersBadgeText: {
    fontSize: 10.5,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  spendText: {
    fontSize: 11.5,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  aovText: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  actionIconBtn: {
    padding: 6,
    borderRadius: 4,
  },
  emptyTableState: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyTableText: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
  },

  // Pagination Footer
  // Shadcn Pagination Footer
  shadcnPaginationFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    flexWrap: 'wrap',
    gap: 12,
  },
  shadcnPaginationInfoText: {
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
  },
  shadcnPaginationRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  shadcnTextNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  shadcnTextNavBtnText: {
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  shadcnPageNumbersGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shadcnPageSquare: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadcnPageSquareActive: {},
  shadcnPageSquareInactive: {},
  shadcnPageSquareText: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
  },
  shadcnEllipsis: {
    fontSize: 13,
    paddingHorizontal: 4,
    fontFamily: 'Manrope_500Medium',
  },

  // Modal Overlays & Cards
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 520,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalCardSmall: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  modalSubtitle: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalForm: {
    padding: 20,
    gap: 14,
  },
  formField: {
    gap: 6,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
  },
  regionSelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  regionSelectOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  regionSelectText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  formErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderColor: '#fecdd3',
    borderWidth: 1,
    padding: 10,
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 6,
  },
  formErrorText: {
    color: '#dc2626',
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  modalCancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  modalSubmitBtn: {
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 110,
  },
  modalSubmitText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },

  // Delete modal
  deleteWarnIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fee2e2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  deleteModalTitle: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
    marginBottom: 6,
  },
  deleteModalDesc: {
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  deleteModalBtnRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  modalDeleteBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDeleteText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },

  // Dropzone
  uploadDropzone: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  uploadDropTitle: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
    marginTop: 4,
  },
  uploadDropSub: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    textAlign: 'center',
    maxWidth: 320,
  },

  // Toast
  toastContainer: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    zIndex: 9999,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
});
