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
  ActivityIndicator,
  Modal,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import Svg, { Path, Circle, Polyline, Rect, Line, G } from 'react-native-svg';
import {
  DollarSign,
  CreditCard,
  MoreVertical,
  TrendingUp,
  Globe,
  Store,
  Plus,
  Trash2,
  Eye,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Wallet,
  ShoppingBag,
  Coins,
  MapPin,
  Calendar,
  Download,
  ArrowUpRight,
  Check,
  Filter,
  BarChart2,
  Info,
  ChevronLeft,
  ChevronRight,
  Crown,
  Edit3,
  PenTool,
  ShieldCheck,
  Code2,
  UserCheck,
} from 'lucide-react-native';
import { AppShell } from '../components/AppShell';
import { LoadingView } from '../components/LoadingView';
import { AddSaleModal } from '../components/AddSaleModal';
import { DetailModal } from '../components/ActionModal';
import { UserProfileView } from '../components/UserProfileView';
import { useTheme } from '../context/ThemeContext';
import { getSales, deleteSale, getDashboardAll, getCustomers } from '../services/api';
import { Sale, Customer, MonthlyRevenue, DashboardSummary } from '../types/sales';
const webHover = (onEnter: () => void, onLeave: () => void) =>
  ({
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
  } as any);

// ─── SHADCN USER SUBSCRIPTIONS DATASET (MATCHES SHADCN DATA TABLE REFERENCE) ───
export interface ShadcnUserItem {
  id: number;
  name: string;
  email: string;
  role: 'Maintainer' | 'Admin' | 'Editor' | 'Author' | 'Subscriber';
  plan: 'Enterprise' | 'Team' | 'Basic' | 'Company';
  billing: 'Auto debit' | 'Manual - PayPal' | 'Manual - cash';
  status: 'Active' | 'Pending' | 'Inactive';
  avatar: string;
}

const INITIAL_SHADCN_USERS: ShadcnUserItem[] = [
  {
    id: 1,
    name: 'Zsasza McCleverty',
    email: 'zmcclevertye@soundcloud.com',
    role: 'Maintainer',
    plan: 'Enterprise',
    billing: 'Auto debit',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Jack Alfredo',
    email: 'jack.alfredo@shadcnstudio.com',
    role: 'Maintainer',
    plan: 'Enterprise',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 2,
    name: 'Sarah Mitchell',
    email: 'sarah.mitchell@company.com',
    role: 'Admin',
    plan: 'Enterprise',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 3,
    name: 'Robert Chen',
    email: 'robert.chen@startup.io',
    role: 'Editor',
    plan: 'Team',
    billing: 'Manual - PayPal',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 4,
    name: 'Emily Wilson',
    email: 'emily.wilson@freelance.com',
    role: 'Author',
    plan: 'Basic',
    billing: 'Manual - cash',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 5,
    name: 'David Garcia',
    email: 'david.garcia@agency.net',
    role: 'Subscriber',
    plan: 'Company',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 6,
    name: 'Rohan Mehta',
    email: 'rohan.mehta@client.com',
    role: 'Maintainer',
    plan: 'Enterprise',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 7,
    name: 'Sneha Patel',
    email: 'sneha.patel@client.com',
    role: 'Admin',
    plan: 'Enterprise',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 8,
    name: 'Ananya Gupta',
    email: 'ananya.gupta@client.com',
    role: 'Editor',
    plan: 'Team',
    billing: 'Manual - PayPal',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 9,
    name: 'Karthik Raja',
    email: 'karthik.raja@client.com',
    role: 'Author',
    plan: 'Basic',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 10,
    name: 'Aditya Rao',
    email: 'aditya.rao@client.com',
    role: 'Subscriber',
    plan: 'Company',
    billing: 'Manual - cash',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 11,
    name: 'Divya Nair',
    email: 'divya.nair@client.com',
    role: 'Maintainer',
    plan: 'Team',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 12,
    name: 'Vikram Malhotra',
    email: 'vikram.malhotra@client.com',
    role: 'Admin',
    plan: 'Enterprise',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 13,
    name: 'Pooja Deshmukh',
    email: 'pooja.deshmukh@client.com',
    role: 'Editor',
    plan: 'Team',
    billing: 'Manual - PayPal',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 14,
    name: 'Arjun Kapoor',
    email: 'arjun.kapoor@agency.net',
    role: 'Author',
    plan: 'Basic',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 15,
    name: 'Meera Sharma',
    email: 'meera.sharma@startup.io',
    role: 'Subscriber',
    plan: 'Company',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 16,
    name: 'Kabir Sen',
    email: 'kabir.sen@freelance.com',
    role: 'Editor',
    plan: 'Team',
    billing: 'Manual - cash',
    status: 'Inactive',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 17,
    name: 'Neha Verma',
    email: 'neha.verma@company.com',
    role: 'Maintainer',
    plan: 'Enterprise',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 18,
    name: 'Siddharth Joshi',
    email: 'siddharth.joshi@agency.net',
    role: 'Admin',
    plan: 'Enterprise',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 19,
    name: 'Tanvi Iyer',
    email: 'tanvi.iyer@client.com',
    role: 'Author',
    plan: 'Basic',
    billing: 'Manual - PayPal',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 20,
    name: 'Varun Bhatia',
    email: 'varun.bhatia@client.com',
    role: 'Subscriber',
    plan: 'Company',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 21,
    name: 'Ishaan Roy',
    email: 'ishaan.roy@startup.io',
    role: 'Maintainer',
    plan: 'Team',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 22,
    name: 'Riya Saxena',
    email: 'riya.saxena@company.com',
    role: 'Admin',
    plan: 'Enterprise',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 23,
    name: 'Yash Singhania',
    email: 'yash.singhania@client.com',
    role: 'Editor',
    plan: 'Team',
    billing: 'Manual - PayPal',
    status: 'Pending',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 24,
    name: 'Tara Pillai',
    email: 'tara.pillai@agency.net',
    role: 'Author',
    plan: 'Basic',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&h=120&fit=crop&crop=face',
  },
  {
    id: 25,
    name: 'Alok Nambiar',
    email: 'alok.nambiar@client.com',
    role: 'Subscriber',
    plan: 'Company',
    billing: 'Auto debit',
    status: 'Active',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&h=120&fit=crop&crop=face',
  },
];

export default function SalesScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 1080;
  const isTablet = width >= 768;
  const { colors, isDark, radiusValues } = useTheme();

  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [monthlyRevenue, setMonthlyRevenue] = useState<MonthlyRevenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Table View & Search
  const [activeTableView, setActiveTableView] = useState<'subscriptions' | 'orders'>('subscriptions');
  const [activeTab, setActiveTab] = useState<'All' | 'Completed' | 'Pending' | 'Cancelled'>('All');
  const [userStatusFilter, setUserStatusFilter] = useState<'All' | 'Active' | 'Pending' | 'Inactive'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [detailItem, setDetailItem] = useState<Sale | null>(null);
  const [userDetailItem, setUserDetailItem] = useState<ShadcnUserItem | null>(null);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOrderIds, setSelectedOrderIds] = useState<number[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [shadcnUsers, setShadcnUsers] = useState<ShadcnUserItem[]>(INITIAL_SHADCN_USERS);
  const [avatarErrors, setAvatarErrors] = useState<Record<string, boolean>>({});

  // Hover & Interactive Graph States
  const [hoveredTransBar, setHoveredTransBar] = useState<string | null>(null);
  const [selectedTransBar, setSelectedTransBar] = useState<string | null>(null);
  const [hoveredSalesPoint, setHoveredSalesPoint] = useState<number | null>(null);
  const [hoveredSplitBar, setHoveredSplitBar] = useState<number | null>(null);
  const [hoveredOrderDay, setHoveredOrderDay] = useState<number | null>(null);
  const [hoveredSparkNode, setHoveredSparkNode] = useState<number | null>(null);
  const [hoveredDonut, setHoveredDonut] = useState<boolean>(false);
  const [hoveredViewReport, setHoveredViewReport] = useState<boolean>(false);
  const [hoveredMetricBox, setHoveredMetricBox] = useState<number | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState<boolean>(false);
  const [chartMenuOpen, setChartMenuOpen] = useState<boolean>(false);
  const [activeChannelFilter, setActiveChannelFilter] = useState<'All' | 'Online' | 'Offline'>('All');
  const [chartPeriod, setChartPeriod] = useState<'Weekly' | 'Monthly'>('Weekly');

  const fetchData = useCallback(async (silent = false, bypass = false) => {
    try {
      if (!silent && sales.length === 0) setLoading(true);
      setError(null);
      const [salesData, dashData, customerData] = await Promise.all([
        getSales({}, bypass),
        getDashboardAll(bypass),
        getCustomers({}, bypass),
      ]);
      setSales(salesData);
      setSummary(dashData.summary);
      setMonthlyRevenue(dashData.monthlyRevenue);
      setCustomers(customerData);
    } catch (err: any) {
      setError(err.message || 'Unable to load sales transactions.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [sales.length]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData(true, true);
  };

  const handleDelete = async (id: number) => {
    if (Platform.OS === 'web' && !window.confirm('Delete this sales record permanently?')) return;
    try {
      setDeletingId(id);
      await deleteSale(id);
      setSales((prev) => prev.filter((s) => s.id !== id));
      if (detailItem?.id === id) setDetailItem(null);
    } catch (err: any) {
      if (Platform.OS === 'web') alert(err.message || 'Failed to delete sale.');
    } finally {
      setDeletingId(null);
    }
  };

  // Calculations from real overview sales data
  const totalAmount = useMemo(() => {
    return sales
      .filter((s) => s.status !== 'Cancelled')
      .reduce((sum, s) => sum + (Number(s.amount) || 0), 0);
  }, [sales]);

  const totalProfit = Math.round(totalAmount * 0.684);
  const totalOrders = sales.length || summary?.totalOrders || 46;
  const customerCount = customers.length || summary?.totalCustomers || 16;

  // Filtered Shadcn Users
  const filteredUsers = useMemo(() => {
    return shadcnUsers.filter((u) => {
      if (userStatusFilter !== 'All' && u.status !== userStatusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.role.toLowerCase().includes(q) ||
          u.plan.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [shadcnUsers, userStatusFilter, searchQuery]);

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (activeTab !== 'All' && s.status !== activeTab) return false;
      if (selectedTransBar) {
        // filter or highlight if month matches
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const mCustomer = s.customer?.toLowerCase().includes(q);
        const mProd = s.productName?.toLowerCase().includes(q);
        const mRegion = s.region?.toLowerCase().includes(q);
        if (!mCustomer && !mProd && !mRegion) return false;
      }
      return true;
    });
  }, [sales, activeTab, searchQuery, selectedTransBar]);

  // Current active dataset for pagination
  const currentTotalEntries = activeTableView === 'subscriptions' ? filteredUsers.length : filteredSales.length;
  const totalPages = Math.max(1, Math.ceil(currentTotalEntries / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredUsers.slice(start, start + pageSize);
  }, [filteredUsers, currentPage, pageSize]);

  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSales.slice(start, start + pageSize);
  }, [filteredSales, currentPage, pageSize]);

  // Checkbox helpers for Users
  const allCurrentUsersSelected =
    paginatedUsers.length > 0 && paginatedUsers.every((u) => selectedUserIds.includes(u.id));

  const toggleSelectAllUsers = () => {
    if (allCurrentUsersSelected) {
      const pageIds = paginatedUsers.map((u) => u.id);
      setSelectedUserIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      const pageIds = paginatedUsers.map((u) => u.id);
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectUser = (id: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleDeleteUser = (id: number) => {
    setShadcnUsers((prev) => prev.filter((u) => u.id !== id));
  };

  // Shadcn table helpers
  const avatarColors = [
    { bg: '#fee2e2', text: '#dc2626' },
    { bg: '#fef3c7', text: '#d97706' },
    { bg: '#e0e7ff', text: '#4f46e5' },
    { bg: '#ecfdf5', text: '#16a34a' },
    { bg: '#f3e8ff', text: '#9333ea' },
    { bg: '#ffedd5', text: '#ea580c' },
  ];

  const getAvatarColor = (name: string) => {
    let hash = 0;
    for (let i = 0; i < (name || '').length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const idx = Math.abs(hash) % avatarColors.length;
    return avatarColors[idx];
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const allCurrentPageSelected =
    paginatedSales.length > 0 &&
    paginatedSales.every((s) => selectedOrderIds.includes(s.id));

  const toggleSelectAll = () => {
    const pageIds = paginatedSales.map((s) => s.id);
    if (allCurrentPageSelected) {
      setSelectedOrderIds((prev) => prev.filter((id) => !pageIds.includes(id)));
    } else {
      setSelectedOrderIds((prev) => Array.from(new Set([...prev, ...pageIds])));
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedOrderIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

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

  // 8-Period bars matching screenshot with interactive volume data
  const transactionBars = useMemo(() => [
    { label: 'Jan', valText: '38K', amount: '$38,240', orders: 42, growth: '+14.2%', heightPct: 62, isPeak: false },
    { label: 'Feb', valText: '52K', amount: '$52,890', orders: 68, growth: '+28.5%', heightPct: 96, isPeak: true },
    { label: 'Mar', valText: '32K', amount: '$32,150', orders: 36, growth: '-8.1%', heightPct: 52, isPeak: false },
    { label: 'Apr', valText: '12K', amount: '$12,400', orders: 18, growth: '-34.0%', heightPct: 22, isPeak: false },
    { label: 'May', valText: '35K', amount: '$35,700', orders: 41, growth: '+18.9%', heightPct: 58, isPeak: false },
    { label: 'Jun', valText: '28K', amount: '$28,320', orders: 34, growth: '+6.4%', heightPct: 46, isPeak: false },
    { label: 'Jul', valText: '33K', amount: '$33,650', orders: 39, growth: '+12.1%', heightPct: 54, isPeak: false },
    { label: 'Aug', valText: '25K', amount: '$25,480', orders: 29, growth: '+5.7%', heightPct: 40, isPeak: false },
  ], []);

  // Total Sales Hourly Data Points
  const salesHourlyPoints = useMemo(() => [
    { time: '10:00', total: '$1,420.00', online: '$920', offline: '$500', orders: 14, heightPct: 32 },
    { time: '12:00', total: '$2,150.00', online: '$1,350', offline: '$800', orders: 22, heightPct: 54 },
    { time: '14:00', total: '$1,890.00', online: '$1,190', offline: '$700', orders: 19, heightPct: 40 },
    { time: '16:00', total: '$1,620.00', online: '$980', offline: '$640', orders: 16, heightPct: 26 },
    { time: '18:00', total: '$2,480.00', online: '$1,580', offline: '$900', orders: 27, heightPct: 48 },
    { time: '20:00', total: '$2,850.00', online: '$1,850', offline: '$1,000', orders: 31, heightPct: 64 },
  ], []);

  // Split Bars Data (Card 1)
  const splitBarsData = [
    { period: 'W1', profit: '$18.4k', income: '$32.0k', expense: '$13.6k', topH: 32, botH: 22 },
    { period: 'W2', profit: '$14.2k', income: '$24.5k', expense: '$10.3k', topH: 24, botH: 18 },
    { period: 'W3', profit: '$27.9k', income: '$45.2k', expense: '$17.3k', topH: 45, botH: 30 },
    { period: 'W4', profit: '$34.5k', income: '$52.8k', expense: '$18.3k', topH: 52, botH: 36 },
    { period: 'W5', profit: '$16.8k', income: '$28.1k', expense: '$11.3k', topH: 28, botH: 20 },
  ];

  // Daily Order Bars (Card 2)
  const orderBarsData = [
    { day: 'Mon', count: '32k Orders', h: 32, orange: false },
    { day: 'Tue', count: '68k Orders', h: 68, orange: true },
    { day: 'Wed', count: '38k Orders', h: 38, orange: false },
    { day: 'Thu', count: '74k Orders', h: 74, orange: true },
    { day: 'Fri', count: '46k Orders', h: 46, orange: false },
    { day: 'Sat', count: '84k Orders', h: 84, orange: true },
    { day: 'Sun', count: '64k Orders', h: 64, orange: true },
  ];

  // Sparkline Points (Card 3)
  const sparklinePoints = [
    { month: 'Jan', val: '$480k', x: 5, y: 48 },
    { month: 'Feb', val: '$580k', x: 35, y: 20 },
    { month: 'Mar', val: '$520k', x: 65, y: 40 },
    { month: 'Apr', val: '$640k', x: 98, y: 15 },
    { month: 'May', val: '$590k', x: 130, y: 34 },
    { month: 'Jun', val: '$624k', x: 155, y: 10 },
  ];

  // CSV Export for transactions
  const exportTransactionsCsv = () => {
    const header = 'Month,Volume,Orders,Growth Rate,Peak Status\n';
    const rows = transactionBars
      .map(
        (b) =>
          `${b.label},"${b.amount}",${b.orders},"${b.growth}",${b.isPeak ? 'Peak Month' : 'Normal'}`
      )
      .join('\n');
    if (Platform.OS === 'web') {
      const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `transactions_breakdown_${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setChartMenuOpen(false);
  };

  return (
    <AppShell
      activeTab="Sales"
      title="Sales Intelligence & Transactions"
      subtitle="Revenue realization, store channels, and real-time transaction fulfillment"
      onSearch={(q) => {
        setSearchQuery(q);
        setCurrentPage(1);
      }}
      searchPlaceholder="Search order ID, product, customer, territory..."
      headerRight={
        <TouchableOpacity
          style={[styles.addSaleHeaderBtn, { backgroundColor: isDark ? '#f4f4f5' : '#09090b' }]}
          onPress={() => setAddModalVisible(true)}
          activeOpacity={0.85}
        >
          <Plus size={14} color={isDark ? '#09090b' : '#ffffff'} />
          <Text style={[styles.addSaleHeaderBtnText, { color: isDark ? '#09090b' : '#ffffff' }]}>
            + Add Sale
          </Text>
        </TouchableOpacity>
      }
    >
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />

      <LoadingView isLoading={loading} error={error} onRetry={() => fetchData(false, true)}>
        <View style={styles.container}>
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ROW 1: 6 TOP KPI CARDS MATCHING REFERENCE SCREENSHOT EXACTLY         */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <View style={styles.sixKpiGrid}>
            {/* Card 1: Total Profit with 5 Dual-Color Split Pill Bars */}
            <View
              style={[
                styles.kpiCardItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: hoveredSplitBar !== null ? (isDark ? '#71717a' : '#a1a1aa') : colors.border,
                  borderRadius: radiusValues.md,
                },
              ]}
            >
              <View style={styles.cardHeaderFlex}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={[styles.kpiBigVal, { color: colors.textPrimary }]}>
                    {hoveredSplitBar !== null ? splitBarsData[hoveredSplitBar].profit : '$88.5k'}
                  </Text>
                  <Text style={hoveredSplitBar !== null ? styles.kpiTrendPositiveInline : styles.kpiSubBadgeNegative}>
                    {hoveredSplitBar !== null ? `+${splitBarsData[hoveredSplitBar].period}` : '-18%'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.kpiSubLabel, { color: colors.textSecondary }]}>
                {hoveredSplitBar !== null
                  ? `In: ${splitBarsData[hoveredSplitBar].income} • Ex: ${splitBarsData[hoveredSplitBar].expense}`
                  : 'Total Profit'}
              </Text>

              {/* 5 Stacked Dual-Color Split Pill Bars with hover details */}
              <View style={styles.splitBarsContainer}>
                {splitBarsData.map((item, idx) => {
                  const isHov = hoveredSplitBar === idx;
                  return (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.splitBarTrack, isHov && { transform: [{ scale: 1.1 }] }]}
                        activeOpacity={0.8}
                        {...webHover(
                          () => setHoveredSplitBar(idx),
                          () => setHoveredSplitBar(null)
                        )}
                      >
                        <View style={[styles.splitBarPillTop, { height: item.topH, backgroundColor: isHov ? (isDark ? '#f4f4f5' : '#18181b') : (isDark ? '#a1a1aa' : '#52525b') }]} />
                        <View style={[styles.splitBarPillBottom, { height: item.botH, backgroundColor: isHov ? (isDark ? '#71717a' : '#cbd5e1') : (isDark ? '#3f3f46' : '#e4e4e7') }]} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Card 2: Order with 7 Grey Bars with hover details */}
              <View
                style={[
                  styles.kpiCardItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: hoveredOrderDay !== null ? (isDark ? '#71717a' : '#a1a1aa') : colors.border,
                    borderRadius: radiusValues.md,
                  },
                ]}
              >
                <Text style={[styles.kpiCardTitle, { color: colors.textPrimary }]}>Order</Text>
                <Text style={[styles.kpiSubLabel, { color: colors.textMuted }]}>
                  {hoveredOrderDay !== null ? `${orderBarsData[hoveredOrderDay].day} Activity` : 'Last week'}
                </Text>

                {/* 7 Vertical Bars */}
                <View style={styles.orangeBarsContainer}>
                  {orderBarsData.map((bar, idx) => {
                    const isHov = hoveredOrderDay === idx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.orangeBarItem,
                          {
                            height: bar.h,
                            backgroundColor: isHov
                              ? (isDark ? '#f4f4f5' : '#18181b')
                              : bar.orange
                              ? (isDark ? '#a1a1aa' : '#52525b')
                              : isDark
                              ? '#3f3f46'
                              : '#e4e4e7',
                            transform: isHov ? [{ scaleY: 1.08 }] : undefined,
                          },
                        ]}
                        activeOpacity={0.8}
                        {...webHover(
                          () => setHoveredOrderDay(idx),
                          () => setHoveredOrderDay(null)
                        )}
                      />
                    );
                  })}
                </View>

                <View style={styles.kpiBottomMetricRow}>
                  <Text style={[styles.kpiMetricBottomVal, { color: colors.textPrimary }]}>
                    {hoveredOrderDay !== null ? orderBarsData[hoveredOrderDay].count : '124K'}
                  </Text>
                  <Text style={styles.kpiTrendPositiveInline}>
                    {hoveredOrderDay !== null ? `${orderBarsData[hoveredOrderDay].day}` : '+12.6%'}
                  </Text>
                </View>
              </View>

              {/* Card 3: Profit with Grey Sparkline Line Chart & Circular Nodes */}
              <View
                style={[
                  styles.kpiCardItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: hoveredSparkNode !== null ? (isDark ? '#71717a' : '#a1a1aa') : colors.border,
                    borderRadius: radiusValues.md,
                  },
                ]}
              >
                <Text style={[styles.kpiCardTitle, { color: colors.textPrimary }]}>Profit</Text>
                <Text style={[styles.kpiSubLabel, { color: colors.textMuted }]}>
                  {hoveredSparkNode !== null ? `${sparklinePoints[hoveredSparkNode].month} Settled` : 'Last Month'}
                </Text>

                {/* SVG Sparkline with Vertex Nodes */}
                <View style={styles.sparklineTrack}>
                  <Svg height="60" width="100%" viewBox="0 0 160 60">
                    <Polyline
                      points="5,48 35,20 65,40 98,15 130,34 155,10"
                      fill="none"
                      stroke={isDark ? '#a1a1aa' : '#52525b'}
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    {sparklinePoints.map((pt, idx) => {
                      const isHov = hoveredSparkNode === idx;
                      return (
                        <Circle
                          key={idx}
                          cx={pt.x}
                          cy={pt.y}
                          r={isHov ? 6.5 : 3.5}
                          fill={isHov ? (isDark ? '#f4f4f5' : '#18181b') : (isDark ? '#a1a1aa' : '#52525b')}
                          stroke={colors.surface}
                          strokeWidth={isHov ? 2.5 : 1.5}
                          {...webHover(
                            () => setHoveredSparkNode(idx),
                            () => setHoveredSparkNode(null)
                          )}
                        />
                      );
                    })}
                  </Svg>
                </View>

                <View style={styles.kpiBottomMetricRow}>
                  <Text style={[styles.kpiMetricBottomVal, { color: colors.textPrimary }]}>
                    {hoveredSparkNode !== null ? sparklinePoints[hoveredSparkNode].val : '624K'}
                  </Text>
                  <Text style={styles.kpiTrendPositiveInline}>
                    {hoveredSparkNode !== null ? `${sparklinePoints[hoveredSparkNode].month}` : '+12.6%'}
                  </Text>
                </View>
              </View>

              {/* Card 4: User Reach with Circular Donut Gauge */}
              <View
                style={[
                  styles.kpiCardItem,
                  {
                    backgroundColor: colors.surface,
                    borderColor: hoveredDonut ? (isDark ? '#71717a' : '#a1a1aa') : colors.border,
                    borderRadius: radiusValues.md,
                  },
                ]}
                {...webHover(
                  () => setHoveredDonut(true),
                  () => setHoveredDonut(false)
                )}
              >
              <Text style={[styles.kpiCardTitle, { color: colors.textPrimary }]}>User reach</Text>
              <Text style={[styles.kpiSubLabel, { color: colors.textMuted }]}>
                {hoveredDonut ? '345 New • 155 Returning' : 'Last week'}
              </Text>

              {/* Donut Gauge */}
              <View style={styles.donutGaugeWrapper}>
                <Svg width="64" height="64" viewBox="0 0 64 64">
                  <Circle
                    cx="32"
                    cy="32"
                    r="25"
                    stroke={isDark ? '#27272a' : '#f1f5f9'}
                    strokeWidth="6"
                    fill="none"
                  />
                  <Circle
                    cx="32"
                    cy="32"
                    r="25"
                    stroke={hoveredDonut ? (isDark ? '#f4f4f5' : '#18181b') : (isDark ? '#a1a1aa' : '#52525b')}
                    strokeWidth={hoveredDonut ? 7.5 : 6}
                    fill="none"
                    strokeDasharray="98 157"
                    strokeDashoffset="18"
                    strokeLinecap="round"
                    transform="rotate(-90 32 32)"
                  />
                </Svg>
                <View style={styles.donutGaugeCenterText}>
                  <Text style={[styles.donutVisitorsNum, { color: colors.textPrimary }]}>
                    {hoveredDonut ? '69%' : '500'}
                  </Text>
                  <Text style={[styles.donutVisitorsLabel, { color: colors.textMuted }]}>
                    {hoveredDonut ? 'New' : 'Visitors'}
                  </Text>
                </View>
              </View>

              <View style={styles.kpiBottomMetricRow}>
                <Text style={[styles.kpiMetricBottomVal, { color: colors.textPrimary }]}>
                  {hoveredDonut ? '155 Ret' : '32K'}
                </Text>
                <Text style={styles.kpiTrendPositiveInline}>+12%</Text>
              </View>
            </View>

            {/* Card 5: Total Income */}
            <View
              style={[
                styles.kpiCardItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radiusValues.md,
                },
              ]}
            >
              <View style={[styles.kpiIconSquare, { backgroundColor: '#e6f7f2' }]}>
                <DollarSign size={16} color="#008779" />
              </View>
              <Text style={[styles.kpiCardTitle, { color: colors.textPrimary, marginTop: 8 }]}>
                Total Income
              </Text>
              <Text style={[styles.kpiSubLabel, { color: colors.textMuted }]}>Last week</Text>

              <Text style={[styles.kpiMidVal, { color: colors.textPrimary, marginTop: 4 }]}>
                $4,673
              </Text>

              <View style={[styles.kpiPillBadge, { backgroundColor: '#ecfdf5', alignSelf: 'flex-start', marginTop: 8 }]}>
                <Text style={[styles.kpiPillBadgeText, { color: '#16a34a' }]}>+25.2%</Text>
              </View>
            </View>

            {/* Card 6: Total Expense */}
            <View
              style={[
                styles.kpiCardItem,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radiusValues.md,
                },
              ]}
            >
              <View style={[styles.kpiIconSquare, { backgroundColor: '#fff2ec' }]}>
                <CreditCard size={16} color="#ff5722" />
              </View>
              <Text style={[styles.kpiCardTitle, { color: colors.textPrimary, marginTop: 8 }]}>
                Total Expense
              </Text>
              <Text style={[styles.kpiSubLabel, { color: colors.textMuted }]}>Last month</Text>

              <Text style={[styles.kpiMidVal, { color: colors.textPrimary, marginTop: 4 }]}>
                $1.28K
              </Text>

              <View style={[styles.kpiPillBadge, { backgroundColor: '#fee2e2', alignSelf: 'flex-start', marginTop: 8 }]}>
                <Text style={[styles.kpiPillBadgeText, { color: '#dc2626' }]}>-12.2%</Text>
              </View>
            </View>
          </View>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ROW 2: TOTAL TRANSACTION + REPORT (LEFT) | TOTAL SALES (RIGHT)       */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <View style={[styles.midSectionRow, isDesktop ? styles.rowDesktop : styles.rowMobile]}>
            {/* LEFT CARD: Total Transaction + Report Combined in a Single White Card */}
            <View
              style={[
                styles.leftCombinedCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radiusValues.md,
                },
                isDesktop && { flex: 1.45 },
              ]}
            >
              <View style={[styles.combinedInnerRow, isDesktop ? styles.rowDesktop : styles.rowMobile]}>
                {/* 1. Total Transaction 8-Period Bar Chart Sub-Panel */}
                <View style={[styles.transactionChartSubPanel, isDesktop && { flex: 1.25 }]}>
                  <View style={styles.panelHeaderRow}>
                    <View>
                      <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>
                        Total Transaction
                      </Text>
                      <Text style={[styles.panelSubtitle, { color: colors.textSecondary }]}>
                        {chartPeriod === 'Weekly' ? 'Weekly overview' : 'Monthly breakdown'}
                      </Text>
                    </View>
                    <View style={{ position: 'relative' }}>
                      <TouchableOpacity
                        style={styles.moreBtn}
                        onPress={() => setChartMenuOpen(!chartMenuOpen)}
                        activeOpacity={0.7}
                      >
                        <MoreVertical size={16} color={colors.textSecondary} />
                      </TouchableOpacity>

                      {/* Dropdown Menu */}
                      {chartMenuOpen && (
                        <View
                          style={[
                            styles.chartContextMenu,
                            {
                              backgroundColor: colors.surface,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <TouchableOpacity
                            style={styles.contextMenuItem}
                            onPress={exportTransactionsCsv}
                          >
                            <Download size={13} color={colors.textSecondary} />
                            <Text style={[styles.contextMenuText, { color: colors.textPrimary }]}>
                              Export CSV
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.contextMenuItem}
                            onPress={() => {
                              setChartPeriod(chartPeriod === 'Weekly' ? 'Monthly' : 'Weekly');
                              setChartMenuOpen(false);
                            }}
                          >
                            <BarChart2 size={13} color={colors.textSecondary} />
                            <Text style={[styles.contextMenuText, { color: colors.textPrimary }]}>
                              Switch to {chartPeriod === 'Weekly' ? 'Monthly' : 'Weekly'}
                            </Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.contextMenuItem}
                            onPress={() => {
                              setSelectedTransBar(selectedTransBar ? null : 'Feb');
                              setChartMenuOpen(false);
                            }}
                          >
                            <Filter size={13} color={colors.textSecondary} />
                            <Text style={[styles.contextMenuText, { color: colors.textPrimary }]}>
                              {selectedTransBar ? 'Reset Filter' : 'Filter Peak (Feb)'}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>

                  {/* Dynamic Hover Details Pill Banner */}
                  <View
                    style={[
                      styles.chartHoverPillBanner,
                      {
                        backgroundColor: isDark ? '#27272a' : '#f4f4f5',
                        borderColor: isDark ? '#3f3f46' : '#e4e4e7',
                      },
                    ]}
                  >
                    {hoveredTransBar || selectedTransBar ? (
                      (() => {
                        const target = transactionBars.find(
                          (b) => b.label === (hoveredTransBar || selectedTransBar)
                        );
                        if (!target) return null;
                        return (
                          <View style={styles.hoverPillInner}>
                            <View style={styles.hoverDotTeal} />
                            <Text style={[styles.hoverPillMainText, { color: colors.textPrimary }]}>
                              {target.label} 2026: {target.amount}
                            </Text>
                            <Text style={[styles.hoverPillSubText, { color: colors.textSecondary }]}>
                              • {target.orders} orders ({target.growth}) {target.isPeak ? '★ Peak' : ''}
                            </Text>
                          </View>
                        );
                      })()
                    ) : (
                      <View style={styles.hoverPillInner}>
                        <Info size={12} color={colors.textMuted} />
                        <Text style={[styles.hoverPillSubText, { color: colors.textMuted }]}>
                          Hover on any bar below to view volume & order metrics
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* 8-Period Bar Chart with Values on Top */}
                  <View style={styles.transactionBarChartTrack}>
                    {transactionBars.map((b) => {
                      const isHovered = hoveredTransBar === b.label;
                      const isSelected = selectedTransBar === b.label;
                      const isActive = isHovered || isSelected;

                      return (
                        <TouchableOpacity
                          key={b.label}
                          style={styles.transBarCol}
                          activeOpacity={0.8}
                          onPress={() => setSelectedTransBar(selectedTransBar === b.label ? null : b.label)}
                          {...webHover(() => setHoveredTransBar(b.label), () => setHoveredTransBar(null))}
                        >
                          <Text
                            style={[
                              styles.transBarTopVal,
                              {
                                color: isActive || b.isPeak ? '#334155' : colors.textMuted,
                                fontWeight: '400',
                                fontFamily: 'Manrope_400Regular',
                              },
                            ]}
                          >
                            {b.valText}
                          </Text>

                          <View style={styles.transBarHolder}>
                            <View
                              style={[
                                styles.transBarFill,
                                {
                                  height: `${b.heightPct}%`,
                                  backgroundColor: isActive || b.isPeak
                                    ? (isDark ? '#cbd5e1' : '#64748b')
                                    : isDark
                                    ? '#3f3f46'
                                    : '#e4e4e7',
                                  transform: isActive ? [{ scaleY: 1.05 }] : undefined,
                                },
                              ]}
                            />
                          </View>

                          <Text
                            style={[
                              styles.transBarLabel,
                              {
                                color: isActive ? '#334155' : colors.textMuted,
                                fontWeight: '400',
                                fontFamily: 'Manrope_400Regular',
                              },
                            ]}
                          >
                            {b.label}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Vertical Divider */}
                {isDesktop && (
                  <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
                )}

                {/* 2. Report Sub-Panel */}
                <View style={[styles.reportSubPanel, isDesktop && { flex: 0.95 }]}>
                  <View style={styles.panelHeaderRow}>
                    <View>
                      <Text style={[styles.panelTitle, { color: colors.textPrimary }]}>Report</Text>
                      <Text style={[styles.panelSubtitle, { color: colors.textSecondary }]}>
                        Last month transactions $23.4K
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={styles.moreBtn}
                      onPress={() => setChartMenuOpen(!chartMenuOpen)}
                      activeOpacity={0.7}
                    >
                      <MoreVertical size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>

                  {/* Two Sub-Metric Boxes */}
                  <View style={styles.reportBoxesRow}>
                    {/* Box 1 */}
                    <TouchableOpacity
                      style={[
                        styles.reportMetricBox,
                        {
                          backgroundColor: hoveredMetricBox === 1 ? (isDark ? '#27272a' : '#f8fafc') : 'transparent',
                          borderColor: hoveredMetricBox === 1 ? (isDark ? '#ffffff' : '#09090b') : (isDark ? '#3f3f46' : '#e2e8f0'),
                        },
                      ]}
                      activeOpacity={0.85}
                      {...webHover(() => setHoveredMetricBox(1), () => setHoveredMetricBox(null))}
                    >
                      <View style={[styles.reportIconBox, { backgroundColor: isDark ? '#27272a' : '#f8fafc', borderColor: isDark ? '#3f3f46' : '#e2e8f0', borderWidth: 1 }]}>
                        <Coins size={14} color="#64748b" />
                      </View>
                      <Text style={[styles.reportBoxTimeText, { color: '#64748b' }]}>
                        This week
                      </Text>
                      <Text style={[styles.reportBoxTrendVal, { color: colors.textPrimary, fontWeight: '400', fontFamily: 'Manrope_400Regular' }]}>
                        +82.46%
                      </Text>
                    </TouchableOpacity>

                    {/* Box 2 */}
                    <TouchableOpacity
                      style={[
                        styles.reportMetricBox,
                        {
                          backgroundColor: hoveredMetricBox === 2 ? (isDark ? '#27272a' : '#f8fafc') : 'transparent',
                          borderColor: hoveredMetricBox === 2 ? (isDark ? '#ffffff' : '#09090b') : (isDark ? '#3f3f46' : '#e2e8f0'),
                        },
                      ]}
                      activeOpacity={0.85}
                      {...webHover(() => setHoveredMetricBox(2), () => setHoveredMetricBox(null))}
                    >
                      <View style={[styles.reportIconBox, { backgroundColor: isDark ? '#27272a' : '#f8fafc', borderColor: isDark ? '#3f3f46' : '#e2e8f0', borderWidth: 1 }]}>
                        <Wallet size={14} color="#64748b" />
                      </View>
                      <Text style={[styles.reportBoxTimeText, { color: '#64748b' }]}>
                        This week
                      </Text>
                      <Text style={[styles.reportBoxTrendVal, { color: colors.textPrimary, fontWeight: '400', fontFamily: 'Manrope_400Regular' }]}>
                        -24.8%
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Bottom Performance + View Report Button */}
                  <View style={styles.reportBottomFooter}>
                    <View>
                      <Text style={[styles.performanceLabel, { color: '#64748b' }]}>
                        Performance
                      </Text>
                      <Text style={[styles.performanceVal, { color: colors.textPrimary, fontWeight: '400', fontFamily: 'Manrope_400Regular' }]}>
                        +94.13%
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={[
                        styles.viewReportBtn,
                        {
                          backgroundColor: hoveredViewReport ? (isDark ? '#ffffff' : '#09090b') : 'transparent',
                          borderColor: isDark ? '#ffffff' : '#09090b',
                          borderWidth: 1,
                          borderRadius: radiusValues.sm,
                        },
                      ]}
                      onPress={() => router.push('/reports')}
                      activeOpacity={0.85}
                      {...webHover(() => setHoveredViewReport(true), () => setHoveredViewReport(false))}
                    >
                      <Text
                        style={[
                          styles.viewReportBtnText,
                          {
                            color: hoveredViewReport
                              ? (isDark ? '#09090b' : '#ffffff')
                              : (isDark ? '#f4f4f5' : '#09090b'),
                          },
                        ]}
                      >
                        View Report
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* RIGHT CARD: Total Sales with Store Breakdowns & Smooth Line Chart */}
            <View
              style={[
                styles.rightTotalSalesCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radiusValues.md,
                },
                isDesktop && { flex: 0.85 },
              ]}
            >
              {/* Header */}
              <View style={styles.salesCardHeader}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TrendingUp size={16} color={colors.textPrimary} />
                  <Text style={[styles.salesCardTitle, { color: colors.textPrimary }]}>
                    Total sales
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.detailsBtn, { borderColor: colors.border }]}
                  onPress={() => setDetailsModalOpen(true)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.detailsBtnText, { color: colors.textSecondary }]}>
                    Details
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Big Metric */}
              <View style={styles.salesBigMetricRow}>
                <Text style={[styles.salesBigMetricVal, { color: colors.textPrimary }]}>
                  {hoveredSalesPoint !== null ? salesHourlyPoints[hoveredSalesPoint].total : '$2,150.00'}
                </Text>
                <View style={[styles.kpiPillBadge, { backgroundColor: '#f1f5f9' }]}>
                  <Text style={[styles.kpiPillBadgeText, { color: '#64748b' }]}>
                    {hoveredSalesPoint !== null ? salesHourlyPoints[hoveredSalesPoint].time : '+5%'}
                  </Text>
                </View>
              </View>

              {/* Thin Divider Line */}
              <View style={[styles.horizontalDivider, { backgroundColor: colors.border }]} />

              {/* Store Channel Breakdowns with Interactive Filtering */}
              <View style={styles.channelsContainer}>
                {/* Online Store */}
                <TouchableOpacity
                  style={[
                    styles.channelRow,
                    activeChannelFilter === 'Online' && {
                      backgroundColor: isDark ? '#143828' : '#ecfdf5',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    },
                  ]}
                  onPress={() => setActiveChannelFilter(activeChannelFilter === 'Online' ? 'All' : 'Online')}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Globe size={14} color={activeChannelFilter === 'Online' ? '#16a34a' : colors.textSecondary} />
                    <Text
                      style={[
                        styles.channelName,
                        { color: activeChannelFilter === 'Online' ? '#16a34a' : colors.textSecondary },
                        activeChannelFilter === 'Online' && { fontWeight: '500' },
                      ]}
                    >
                      Online Store
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.channelVal, { color: colors.textPrimary }]}>
                      {hoveredSalesPoint !== null ? salesHourlyPoints[hoveredSalesPoint].online : '$20k'}
                    </Text>
                    <Text style={[styles.channelTrend, { color: '#16a34a' }]}>+12.6%</Text>
                  </View>
                </TouchableOpacity>

                {/* Offline Store */}
                <TouchableOpacity
                  style={[
                    styles.channelRow,
                    activeChannelFilter === 'Offline' && {
                      backgroundColor: isDark ? '#3b1d28' : '#fff1f2',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                    },
                  ]}
                  onPress={() => setActiveChannelFilter(activeChannelFilter === 'Offline' ? 'All' : 'Offline')}
                  activeOpacity={0.7}
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Store size={14} color={activeChannelFilter === 'Offline' ? '#dc2626' : colors.textSecondary} />
                    <Text
                      style={[
                        styles.channelName,
                        { color: activeChannelFilter === 'Offline' ? '#dc2626' : colors.textSecondary },
                        activeChannelFilter === 'Offline' && { fontWeight: '500' },
                      ]}
                    >
                      Offline Store
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={[styles.channelVal, { color: colors.textPrimary }]}>
                      {hoveredSalesPoint !== null ? salesHourlyPoints[hoveredSalesPoint].offline : '$20k'}
                    </Text>
                    <Text style={[styles.channelTrend, { color: '#dc2626' }]}>-4.2%</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Dynamic Hover Indicator */}
              <View style={styles.salesHoverTextRow}>
                {hoveredSalesPoint !== null ? (
                  <Text style={[styles.salesHoverTextActive, { color: colors.textPrimary }]}>
                    {salesHourlyPoints[hoveredSalesPoint].time}: {salesHourlyPoints[hoveredSalesPoint].total} ({salesHourlyPoints[hoveredSalesPoint].orders} orders)
                  </Text>
                ) : (
                  <Text style={[styles.salesHoverTextMuted, { color: colors.textMuted }]}>
                    Hover chart for hourly sales breakdown
                  </Text>
                )}
              </View>

              {/* Area Chart: Shaded Columns + Smooth Continuous Line */}
              <View style={styles.salesChartArea}>
                <View style={styles.salesBarBackdrop}>
                  {salesHourlyPoints.map((item, idx) => {
                    const isHov = hoveredSalesPoint === idx;
                    return (
                      <TouchableOpacity
                        key={idx}
                        style={[
                          styles.backdropBar,
                          {
                            height: `${item.heightPct}%`,
                            backgroundColor: isHov
                              ? (isDark ? '#f4f4f5' : '#27272a')
                              : isDark
                              ? '#3f3f46'
                              : '#e4e4e7',
                            transform: isHov ? [{ scaleY: 1.08 }] : undefined,
                          },
                        ]}
                        activeOpacity={0.8}
                        {...webHover(() => setHoveredSalesPoint(idx), () => setHoveredSalesPoint(null))}
                      />
                    );
                  })}
                </View>

                {/* Overlay SVG Line */}
                <View style={styles.salesLineOverlay} pointerEvents="none">
                  <Svg height="65" width="100%" viewBox="0 0 280 65" preserveAspectRatio="none">
                    <Path
                      d="M 5 50 L 32 50 L 58 32 L 86 32 L 105 44 L 126 44 L 145 54 L 168 54 L 188 34 L 210 34 L 230 18 L 268 18"
                      stroke={isDark ? '#a1a1aa' : '#3f3f46'}
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Svg>
                </View>

                {/* Horizontal Time Stamps */}
                <View style={styles.chartTimeLabels}>
                  {salesHourlyPoints.map((item, idx) => {
                    const isHov = hoveredSalesPoint === idx;
                    return (
                      <TouchableOpacity
                        key={item.time}
                        {...webHover(() => setHoveredSalesPoint(idx), () => setHoveredSalesPoint(null))}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.timeLabelText,
                            {
                              color: isHov ? colors.textPrimary : colors.textMuted,
                              fontWeight: isHov ? '800' : '500',
                            },
                          ]}
                        >
                          {item.time}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>
          </View>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ROW 3: LIVE SALES TRANSACTIONS TABLE WITH CRUD FUNCTIONALITY        */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* ROW 3: SHADCN DATA TABLE MATCHING IMAGE SPECIFICATION EXACTLY        */}
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
              {/* Left: View Mode Switcher (Subscriptions / Orders) & Status Filters */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <View style={[styles.statusTabsGroup, { backgroundColor: isDark ? '#27272a' : '#f1f5f9', padding: 3, borderRadius: 8 }]}>
                  <TouchableOpacity
                    style={[
                      styles.statusTabPill,
                      activeTableView === 'subscriptions' && { backgroundColor: isDark ? '#09090b' : '#ffffff', elevation: 1 },
                    ]}
                    onPress={() => {
                      setActiveTableView('subscriptions');
                      setCurrentPage(1);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.statusTabPillText,
                        { color: activeTableView === 'subscriptions' ? colors.textPrimary : isDark ? '#a1a1aa' : '#64748b' },
                        activeTableView === 'subscriptions' && { fontWeight: '500' },
                      ]}
                    >
                      Users & Roles
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.statusTabPill,
                      activeTableView === 'orders' && { backgroundColor: isDark ? '#09090b' : '#ffffff', elevation: 1 },
                    ]}
                    onPress={() => {
                      setActiveTableView('orders');
                      setCurrentPage(1);
                    }}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.statusTabPillText,
                        { color: activeTableView === 'orders' ? colors.textPrimary : isDark ? '#a1a1aa' : '#64748b' },
                        activeTableView === 'orders' && { fontWeight: '500' },
                      ]}
                    >
                      Sales Orders
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Status Segmented Tabs */}
                <View style={styles.statusTabsGroup}>
                  {activeTableView === 'subscriptions' ? (
                    (['All', 'Active', 'Pending', 'Inactive'] as const).map((tab) => {
                      const isActive = userStatusFilter === tab;
                      return (
                        <TouchableOpacity
                          key={tab}
                          style={[
                            styles.statusTabPill,
                            isActive && [
                              styles.statusTabPillActive,
                              { backgroundColor: isDark ? '#27272a' : '#f1f5f9' },
                            ],
                          ]}
                          onPress={() => {
                            setUserStatusFilter(tab);
                            setCurrentPage(1);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.statusTabPillText,
                              { color: isActive ? colors.textPrimary : isDark ? '#a1a1aa' : '#64748b' },
                              isActive && { fontWeight: '500' },
                            ]}
                          >
                            {tab}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  ) : (
                    (['All', 'Completed', 'Pending', 'Cancelled'] as const).map((tab) => {
                      const isActive = activeTab === tab;
                      return (
                        <TouchableOpacity
                          key={tab}
                          style={[
                            styles.statusTabPill,
                            isActive && [
                              styles.statusTabPillActive,
                              { backgroundColor: isDark ? '#27272a' : '#f1f5f9' },
                            ],
                          ]}
                          onPress={() => {
                            setActiveTab(tab);
                            setCurrentPage(1);
                          }}
                          activeOpacity={0.8}
                        >
                          <Text
                            style={[
                              styles.statusTabPillText,
                              { color: isActive ? colors.textPrimary : isDark ? '#a1a1aa' : '#64748b' },
                              isActive && { fontWeight: '500' },
                            ]}
                          >
                            {tab === 'Completed' ? 'Approved' : tab}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              </View>

              <Text style={[styles.transactionCountText, { color: isDark ? '#a1a1aa' : '#64748b' }]}>
                {activeTableView === 'subscriptions'
                  ? `${filteredUsers.length} Users Enrolled`
                  : `${filteredSales.length} Transactions Logged`}
              </Text>
            </View>

            {/* Scrollable Data Table */}
            <ScrollView horizontal showsHorizontalScrollIndicator={true}>
              <View style={[styles.salesTableInner, { minWidth: 1040 }]}>
                {/* ─── SHADCN TABLE HEADER ROW ─── */}
                <View
                  style={[
                    styles.tableHeaderRow,
                    {
                      borderBottomColor: isDark ? '#27272a' : '#e2e8f0',
                      backgroundColor: isDark ? '#18181b' : '#ffffff',
                    },
                  ]}
                >
                  {/* Select All Checkbox */}
                  <TouchableOpacity
                    style={{ width: 44, alignItems: 'center', justifyContent: 'center' }}
                    onPress={activeTableView === 'subscriptions' ? toggleSelectAllUsers : toggleSelectAll}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.shadcnCheckbox,
                        { borderColor: isDark ? '#3f3f46' : '#cbd5e1' },
                        (activeTableView === 'subscriptions' ? allCurrentUsersSelected : allCurrentPageSelected) && {
                          backgroundColor: isDark ? '#f4f4f5' : '#09090b',
                          borderColor: isDark ? '#f4f4f5' : '#09090b',
                        },
                      ]}
                    >
                      {(activeTableView === 'subscriptions' ? allCurrentUsersSelected : allCurrentPageSelected) && (
                        <Check size={11} color={isDark ? '#09090b' : '#ffffff'} strokeWidth={3} />
                      )}
                    </View>
                  </TouchableOpacity>

                  {/* Header Columns: User, Role, Plan, Billing, Status, Actions */}
                  {activeTableView === 'subscriptions' ? (
                    <>
                      <Text style={[styles.thTextShadcn, { width: 280, color: isDark ? '#a1a1aa' : '#64748b', paddingLeft: 8 }]}>
                        User
                      </Text>
                      <Text style={[styles.thTextShadcn, { width: 170, color: isDark ? '#a1a1aa' : '#64748b', paddingLeft: 8 }]}>
                        Role
                      </Text>
                      <Text style={[styles.thTextShadcn, { width: 160, color: isDark ? '#a1a1aa' : '#64748b', paddingLeft: 8 }]}>
                        Plan
                      </Text>
                      <Text style={[styles.thTextShadcn, { width: 170, color: isDark ? '#a1a1aa' : '#64748b', paddingLeft: 8 }]}>
                        Billing
                      </Text>
                      <Text style={[styles.thTextShadcn, { width: 120, color: isDark ? '#a1a1aa' : '#64748b', paddingLeft: 8 }]}>
                        Status
                      </Text>
                      <Text style={[styles.thTextShadcn, { width: 100, color: isDark ? '#a1a1aa' : '#64748b', textAlign: 'right', paddingRight: 16 }]}>
                        Actions
                      </Text>
                    </>
                  ) : (
                    <>
                      <Text style={[styles.thTextShadcn, { width: 260, color: isDark ? '#a1a1aa' : '#64748b', paddingLeft: 8 }]}>
                        User
                      </Text>
                      <Text style={[styles.thTextShadcn, { width: 240, color: isDark ? '#a1a1aa' : '#64748b', paddingLeft: 8 }]}>
                        Product & SKU
                      </Text>
                      <Text style={[styles.thTextShadcn, { width: 140, color: isDark ? '#a1a1aa' : '#64748b', paddingLeft: 8 }]}>
                        Territory
                      </Text>
                      <Text style={[styles.thTextShadcn, { width: 130, color: isDark ? '#a1a1aa' : '#64748b', textAlign: 'right', paddingRight: 8 }]}>
                        Amount
                      </Text>
                      <Text style={[styles.thTextShadcn, { width: 120, color: isDark ? '#a1a1aa' : '#64748b', textAlign: 'center' }]}>
                        Status
                      </Text>
                      <Text style={[styles.thTextShadcn, { width: 100, color: isDark ? '#a1a1aa' : '#64748b', textAlign: 'center' }]}>
                        Actions
                      </Text>
                    </>
                  )}
                </View>

                {/* ─── SHADCN TABLE ROWS ─── */}
                {activeTableView === 'subscriptions' ? (
                  paginatedUsers.length === 0 ? (
                    <View style={styles.emptyTableState}>
                      <Text style={[styles.emptyTableText, { color: isDark ? '#a1a1aa' : '#64748b' }]}>
                        No user subscription records matching your filters.
                      </Text>
                    </View>
                  ) : (
                    paginatedUsers.map((item) => {
                      const isSelected = selectedUserIds.includes(item.id);
                      const hasAvatarError = avatarErrors[item.name];
                      const initials = getInitials(item.name);
                      const colorPair = getAvatarColor(item.name);

                      return (
                        <View
                          key={item.id}
                          style={[
                            styles.tableRowShadcn,
                            {
                              borderBottomColor: isDark ? '#27272a' : '#f1f5f9',
                              backgroundColor: isDark ? '#18181b' : '#ffffff',
                            },
                          ]}
                        >
                          {/* Row Checkbox */}
                          <TouchableOpacity
                            style={{ width: 44, alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => toggleSelectUser(item.id)}
                            activeOpacity={0.7}
                          >
                            <View
                              style={[
                                styles.shadcnCheckbox,
                                { borderColor: isDark ? '#3f3f46' : '#cbd5e1' },
                                isSelected && {
                                  backgroundColor: isDark ? '#f4f4f5' : '#09090b',
                                  borderColor: isDark ? '#f4f4f5' : '#09090b',
                                },
                              ]}
                            >
                              {isSelected && (
                                <Check size={11} color={isDark ? '#09090b' : '#ffffff'} strokeWidth={3} />
                              )}
                            </View>
                          </TouchableOpacity>

                          {/* User Column (Photo Avatar + Bold Name + Email) */}
                          <TouchableOpacity
                            onPress={() => setUserDetailItem(item)}
                            activeOpacity={0.7}
                            style={{
                              width: 280,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 12,
                              paddingHorizontal: 8,
                            }}
                          >
                            <View style={styles.shadcnAvatar}>
                              {!hasAvatarError ? (
                                <Image
                                  source={{ uri: item.avatar }}
                                  style={{ width: 36, height: 36, borderRadius: 18 }}
                                  onError={() => setAvatarErrors((prev) => ({ ...prev, [item.name]: true }))}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View
                                  style={[
                                    styles.shadcnAvatarFallback,
                                    { backgroundColor: isDark ? '#27272a' : colorPair.bg },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.shadcnAvatarText,
                                      { color: isDark ? colors.textPrimary : colorPair.text },
                                    ]}
                                  >
                                    {initials}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <View style={{ flex: 1, paddingRight: 6 }}>
                              <Text
                                style={[styles.shadcnUserName, { color: colors.textPrimary }]}
                                numberOfLines={1}
                              >
                                {item.name}
                              </Text>
                              <Text
                                style={[styles.shadcnUserSub, { color: isDark ? '#a1a1aa' : '#64748b' }]}
                                numberOfLines={1}
                              >
                                {item.email}
                              </Text>
                            </View>
                          </TouchableOpacity>

                          {/* Role Column with Shadcn Icon */}
                          <View
                            style={{
                              width: 170,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 8,
                              paddingHorizontal: 8,
                            }}
                          >
                            {item.role === 'Maintainer' && <Code2 size={15} color="#0284c7" strokeWidth={2} />}
                            {item.role === 'Admin' && <ShieldCheck size={15} color="#16a34a" strokeWidth={2} />}
                            {item.role === 'Editor' && <Edit3 size={15} color="#0d9488" strokeWidth={2} />}
                            {item.role === 'Author' && <PenTool size={15} color="#ea580c" strokeWidth={2} />}
                            {item.role === 'Subscriber' && <Crown size={15} color="#d97706" strokeWidth={2} />}
                            <Text
                              style={[
                                styles.shadcnCellText,
                                { color: colors.textPrimary, fontWeight: '500' },
                              ]}
                            >
                              {item.role}
                            </Text>
                          </View>

                          {/* Plan Column */}
                          <View style={{ width: 160, paddingHorizontal: 8 }}>
                            <Text style={[styles.shadcnCellText, { color: isDark ? '#d4d4d8' : '#334155' }]}>
                              {item.plan}
                            </Text>
                          </View>

                          {/* Billing Column */}
                          <View style={{ width: 170, paddingHorizontal: 8 }}>
                            <Text style={[styles.shadcnCellText, { color: isDark ? '#d4d4d8' : '#334155' }]}>
                              {item.billing}
                            </Text>
                          </View>

                          {/* Status Column (Shadcn Badge) */}
                          <View style={{ width: 120, paddingHorizontal: 8, alignItems: 'flex-start' }}>
                            <View
                              style={[
                                styles.shadcnStatusPill,
                                item.status === 'Active'
                                  ? { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : '#ecfdf5' }
                                  : item.status === 'Pending'
                                  ? { backgroundColor: isDark ? 'rgba(217, 119, 6, 0.15)' : '#fffbeb' }
                                  : { backgroundColor: isDark ? 'rgba(225, 29, 72, 0.15)' : '#fff1f2' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.shadcnStatusPillText,
                                  item.status === 'Active'
                                    ? { color: isDark ? '#4ade80' : '#16a34a' }
                                    : item.status === 'Pending'
                                    ? { color: isDark ? '#fbbf24' : '#d97706' }
                                    : { color: isDark ? '#fb7185' : '#e11d48' },
                                ]}
                              >
                                {item.status}
                              </Text>
                            </View>
                          </View>

                          {/* Actions Column (Trash, Eye, More) */}
                          <View
                            style={{
                              width: 100,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'flex-end',
                              gap: 14,
                              paddingRight: 16,
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => handleDeleteUser(item.id)}
                              activeOpacity={0.6}
                              style={styles.shadcnActionIcon}
                            >
                              <Trash2 size={16} color={isDark ? '#a1a1aa' : '#64748b'} />
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => setUserDetailItem(item)}
                              activeOpacity={0.6}
                              style={styles.shadcnActionIcon}
                            >
                              <Eye size={16} color={isDark ? '#a1a1aa' : '#64748b'} />
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => setUserDetailItem(item)}
                              activeOpacity={0.6}
                              style={styles.shadcnActionIcon}
                            >
                              <MoreVertical size={16} color={isDark ? '#a1a1aa' : '#64748b'} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  )
                ) : (
                  paginatedSales.length === 0 ? (
                    <View style={styles.emptyTableState}>
                      <Text style={[styles.emptyTableText, { color: isDark ? '#a1a1aa' : '#64748b' }]}>
                        No sales records matching your search/filters.
                      </Text>
                    </View>
                  ) : (
                    paginatedSales.map((sale) => {
                      const isSelected = selectedOrderIds.includes(sale.id);
                      const hasAvatarError = avatarErrors[sale.customer];
                      const colorPair = getAvatarColor(sale.customer);
                      const initials = getInitials(sale.customer);
                      const displayStatus =
                        sale.status === 'Completed' ? 'Active' : sale.status === 'Pending' ? 'Pending' : 'Inactive';
                      const avatarUrl =
                        `https://images.unsplash.com/photo-${1500000000000 + (sale.id * 1234567) % 50000000}?w=120&h=120&fit=crop&crop=face`;

                      return (
                        <View
                          key={sale.id}
                          style={[
                            styles.tableRowShadcn,
                            {
                              borderBottomColor: isDark ? '#27272a' : '#f1f5f9',
                              backgroundColor: isDark ? '#18181b' : '#ffffff',
                            },
                          ]}
                        >
                          {/* Row Checkbox */}
                          <TouchableOpacity
                            style={{ width: 44, alignItems: 'center', justifyContent: 'center' }}
                            onPress={() => toggleSelectOne(sale.id)}
                            activeOpacity={0.7}
                          >
                            <View
                              style={[
                                styles.shadcnCheckbox,
                                { borderColor: isDark ? '#3f3f46' : '#cbd5e1' },
                                isSelected && {
                                  backgroundColor: isDark ? '#f4f4f5' : '#09090b',
                                  borderColor: isDark ? '#f4f4f5' : '#09090b',
                                },
                              ]}
                            >
                              {isSelected && (
                                <Check size={11} color={isDark ? '#09090b' : '#ffffff'} strokeWidth={3} />
                              )}
                            </View>
                          </TouchableOpacity>

                          {/* User (Photo Avatar + Name + Email) */}
                          <View
                            style={{
                              width: 260,
                              flexDirection: 'row',
                              alignItems: 'center',
                              gap: 12,
                              paddingHorizontal: 8,
                            }}
                          >
                            <View style={styles.shadcnAvatar}>
                              {!hasAvatarError ? (
                                <Image
                                  source={{ uri: avatarUrl }}
                                  style={{ width: 36, height: 36, borderRadius: 18 }}
                                  onError={() => setAvatarErrors((prev) => ({ ...prev, [sale.customer]: true }))}
                                  resizeMode="cover"
                                />
                              ) : (
                                <View
                                  style={[
                                    styles.shadcnAvatarFallback,
                                    { backgroundColor: isDark ? '#27272a' : colorPair.bg },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.shadcnAvatarText,
                                      { color: isDark ? colors.textPrimary : colorPair.text },
                                    ]}
                                  >
                                    {initials}
                                  </Text>
                                </View>
                              )}
                            </View>
                            <View style={{ flex: 1, paddingRight: 6 }}>
                              <Text
                                style={[styles.shadcnUserName, { color: colors.textPrimary }]}
                                numberOfLines={1}
                              >
                                {sale.customer}
                              </Text>
                              <Text
                                style={[styles.shadcnUserSub, { color: isDark ? '#a1a1aa' : '#64748b' }]}
                                numberOfLines={1}
                              >
                                {sale.customer.toLowerCase().replace(/[^a-z0-9]/g, '.')}@client.com
                              </Text>
                            </View>
                          </View>

                          {/* Product & SKU */}
                          <View style={{ width: 240, paddingHorizontal: 8 }}>
                            <Text
                              style={[styles.shadcnCellBold, { color: colors.textPrimary }]}
                              numberOfLines={1}
                            >
                              {sale.productName || 'Standard Item'}
                            </Text>
                            <Text
                              style={[styles.shadcnUserSub, { color: isDark ? '#a1a1aa' : '#64748b' }]}
                              numberOfLines={1}
                            >
                              ORD-{String(sale.id).padStart(3, '0')} • {sale.date}
                            </Text>
                          </View>

                          {/* Territory */}
                          <View style={{ width: 140, paddingHorizontal: 8 }}>
                            <Text style={[styles.shadcnCellText, { color: isDark ? '#d4d4d8' : '#334155' }]}>
                              {sale.region}
                            </Text>
                          </View>

                          {/* Amount */}
                          <View style={{ width: 130, paddingHorizontal: 8, alignItems: 'flex-end' }}>
                            <Text
                              style={[styles.shadcnAmountText, { color: colors.textPrimary }]}
                            >
                              ₹{sale.amount.toLocaleString('en-IN')}
                            </Text>
                          </View>

                          {/* Status */}
                          <View style={{ width: 120, paddingHorizontal: 8, alignItems: 'center' }}>
                            <View
                              style={[
                                styles.shadcnStatusPill,
                                displayStatus === 'Active'
                                  ? { backgroundColor: isDark ? 'rgba(22, 163, 74, 0.15)' : '#ecfdf5' }
                                  : displayStatus === 'Pending'
                                  ? { backgroundColor: isDark ? 'rgba(217, 119, 6, 0.15)' : '#fffbeb' }
                                  : { backgroundColor: isDark ? 'rgba(225, 29, 72, 0.15)' : '#fff1f2' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.shadcnStatusPillText,
                                  displayStatus === 'Active'
                                    ? { color: isDark ? '#4ade80' : '#16a34a' }
                                    : displayStatus === 'Pending'
                                    ? { color: isDark ? '#fbbf24' : '#d97706' }
                                    : { color: isDark ? '#fb7185' : '#e11d48' },
                                ]}
                              >
                                {displayStatus}
                              </Text>
                            </View>
                          </View>

                          {/* Actions */}
                          <View
                            style={{
                              width: 100,
                              flexDirection: 'row',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: 12,
                            }}
                          >
                            <TouchableOpacity
                              onPress={() => handleDelete(sale.id)}
                              activeOpacity={0.6}
                              disabled={deletingId === sale.id}
                              style={styles.shadcnActionIcon}
                            >
                              {deletingId === sale.id ? (
                                <ActivityIndicator size="small" color="#ef4444" />
                              ) : (
                                <Trash2 size={16} color={isDark ? '#a1a1aa' : '#64748b'} />
                              )}
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => setDetailItem(sale)}
                              activeOpacity={0.6}
                              style={styles.shadcnActionIcon}
                            >
                              <Eye size={16} color={isDark ? '#a1a1aa' : '#64748b'} />
                            </TouchableOpacity>

                            <TouchableOpacity
                              onPress={() => setDetailItem(sale)}
                              activeOpacity={0.6}
                              style={styles.shadcnActionIcon}
                            >
                              <MoreVertical size={16} color={isDark ? '#a1a1aa' : '#64748b'} />
                            </TouchableOpacity>
                          </View>
                        </View>
                      );
                    })
                  )
                )}
              </View>
            </ScrollView>

            {/* ─── SHADCN STYLE PAGINATION FOOTER (MATCHES IMAGE 2 SPECIFICATION) ─── */}
            <View
              style={[
                styles.shadcnPaginationFooter,
                {
                  borderTopColor: isDark ? '#27272a' : '#e2e8f0',
                  backgroundColor: isDark ? '#18181b' : '#ffffff',
                },
              ]}
            >
              {/* Left: Showing 1 to 5 of 25 entries */}
              <Text style={[styles.shadcnPaginationInfoText, { color: isDark ? '#a1a1aa' : '#64748b' }]}>
                Showing {currentTotalEntries > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
                {Math.min(currentPage * pageSize, currentTotalEntries)} of {currentTotalEntries} entries
              </Text>

              {/* Right: < Previous  [1]  [2]  ...  Next > */}
              <View style={styles.shadcnPaginationRight}>
                {/* < Previous */}
                <TouchableOpacity
                  style={[
                    styles.shadcnTextNavBtn,
                    currentPage === 1 && { opacity: 0.35 },
                  ]}
                  disabled={currentPage === 1}
                  onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  activeOpacity={0.6}
                >
                  <ChevronLeft size={16} color={isDark ? '#a1a1aa' : '#64748b'} />
                  <Text
                    style={[
                      styles.shadcnTextNavBtnText,
                      { color: isDark ? '#a1a1aa' : '#64748b' },
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
                          style={[styles.shadcnEllipsis, { color: isDark ? '#a1a1aa' : '#64748b' }]}
                        >
                          ...
                        </Text>
                      );
                    }
                    const isActive = Number(pg) === currentPage;
                    return (
                      <TouchableOpacity
                        key={`page-${pg}`}
                        style={[
                          styles.shadcnPageSquare,
                          isActive
                            ? [styles.shadcnPageSquareActive, { backgroundColor: isDark ? '#f4f4f5' : '#09090b' }]
                            : [styles.shadcnPageSquareInactive, { backgroundColor: 'transparent' }],
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

                {/* Next > */}
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
                      { color: currentPage === totalPages ? (isDark ? '#71717a' : '#94a3b8') : colors.textPrimary },
                    ]}
                  >
                    Next
                  </Text>
                  <ChevronRight size={16} color={currentPage === totalPages ? (isDark ? '#71717a' : '#94a3b8') : colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </LoadingView>

      {/* User Profile View (Matches exact multi-tab user profile pages) */}
      {userDetailItem && (
        <UserProfileView
          visible={!!userDetailItem}
          user={userDetailItem}
          onClose={() => setUserDetailItem(null)}
        />
      )}

      {/* Sale Detail Modal */}
      {detailItem && (
        <DetailModal
          title={`Order ORD-${String(detailItem.id).padStart(3, '0')}`}
          subtitle={`Fulfilled for ${detailItem.customer}`}
          data={{
            'Order Reference': `ORD-${String(detailItem.id).padStart(3, '0')}`,
            'Customer Name': detailItem.customer,
            'Product SKU': detailItem.productName || 'Standard Item',
            Category: detailItem.category || 'Retail',
            'Order Amount': `₹${detailItem.amount.toLocaleString('en-IN')}`,
            'Order Date': detailItem.date,
            Territory: detailItem.region,
            'Fulfillment Status':
              detailItem.status === 'Completed' ? 'Approved' : detailItem.status,
          }}
          onClose={() => setDetailItem(null)}
        />
      )}

      {/* Add Sale Modal */}
      <AddSaleModal
        visible={addModalVisible}
        onClose={() => setAddModalVisible(false)}
        onSuccess={() => {
          fetchData(true, true);
        }}
      />

      {/* Comprehensive Sales Analytics Details Modal */}
      <Modal
        visible={detailsModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setDetailsModalOpen(false)}
      >
        <View style={styles.modalBackdropOverlay}>
          <View
            style={[
              styles.detailsModalCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radiusValues.lg,
              },
            ]}
          >
            {/* Modal Header */}
            <View style={[styles.detailsModalHeader, { borderBottomColor: colors.border }]}>
              <View>
                <Text style={[styles.detailsModalTitle, { color: colors.textPrimary }]}>
                  Total Sales Detailed Analytics
                </Text>
                <Text style={[styles.detailsModalSubtitle, { color: colors.textSecondary }]}>
                  Channel fulfillment, order ticket velocity, and revenue share
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.modalCloseBtn, { borderColor: colors.border }]}
                onPress={() => setDetailsModalOpen(false)}
              >
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {/* Modal Body: 4 KPI Tiles */}
            <View style={styles.modalKpiRow}>
              <View style={[styles.modalKpiTile, { backgroundColor: isDark ? '#27272a' : '#f8fafc', borderColor: colors.border }]}>
                <Text style={[styles.modalKpiLabel, { color: colors.textSecondary }]}>Total Realized</Text>
                <Text style={[styles.modalKpiValue, { color: colors.textPrimary }]}>$2,150.00</Text>
                <Text style={[styles.modalKpiTrend, { color: '#16a34a' }]}>+5.0% this cycle</Text>
              </View>

              <View style={[styles.modalKpiTile, { backgroundColor: isDark ? '#27272a' : '#f8fafc', borderColor: colors.border }]}>
                <Text style={[styles.modalKpiLabel, { color: colors.textSecondary }]}>Online Store</Text>
                <Text style={[styles.modalKpiValue, { color: '#008779' }]}>$1,350.00</Text>
                <Text style={[styles.modalKpiSub, { color: colors.textMuted }]}>62.8% of aggregate</Text>
              </View>

              <View style={[styles.modalKpiTile, { backgroundColor: isDark ? '#27272a' : '#f8fafc', borderColor: colors.border }]}>
                <Text style={[styles.modalKpiLabel, { color: colors.textSecondary }]}>Retail POS</Text>
                <Text style={[styles.modalKpiValue, { color: '#f59e0b' }]}>$800.00</Text>
                <Text style={[styles.modalKpiSub, { color: colors.textMuted }]}>37.2% of aggregate</Text>
              </View>

              <View style={[styles.modalKpiTile, { backgroundColor: isDark ? '#27272a' : '#f8fafc', borderColor: colors.border }]}>
                <Text style={[styles.modalKpiLabel, { color: colors.textSecondary }]}>Blended Margin</Text>
                <Text style={[styles.modalKpiValue, { color: '#16a34a' }]}>68.4%</Text>
                <Text style={[styles.modalKpiSub, { color: colors.textMuted }]}>Audited net profit</Text>
              </View>
            </View>

            {/* Channel Comparison Table */}
            <View style={[styles.modalTableBox, { borderColor: colors.border }]}>
              <View style={[styles.modalTableHeader, { borderBottomColor: colors.border, backgroundColor: isDark ? '#1e293b' : '#f8fafc' }]}>
                <Text style={[styles.modalTh, { flex: 2, color: colors.textPrimary }]}>Store Channel</Text>
                <Text style={[styles.modalTh, { flex: 1.5, color: colors.textPrimary, textAlign: 'right' }]}>Revenue</Text>
                <Text style={[styles.modalTh, { flex: 1, color: colors.textPrimary, textAlign: 'right' }]}>Orders</Text>
                <Text style={[styles.modalTh, { flex: 1.2, color: colors.textPrimary, textAlign: 'right' }]}>Avg Ticket</Text>
                <Text style={[styles.modalTh, { flex: 1, color: colors.textPrimary, textAlign: 'right' }]}>Growth</Text>
              </View>

              <View style={[styles.modalTableRow, { borderBottomColor: colors.border }]}>
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Globe size={14} color="#008779" />
                  <Text style={[styles.modalTdBold, { color: colors.textPrimary }]}>Online Store</Text>
                </View>
                <Text style={[styles.modalTd, { flex: 1.5, textAlign: 'right', color: colors.textPrimary }]}>$20,450.00</Text>
                <Text style={[styles.modalTd, { flex: 1, textAlign: 'right', color: colors.textSecondary }]}>342</Text>
                <Text style={[styles.modalTd, { flex: 1.2, textAlign: 'right', color: colors.textPrimary }]}>$59.80</Text>
                <Text style={[styles.modalTd, { flex: 1, textAlign: 'right', color: '#16a34a', fontWeight: '500' }]}>+12.6%</Text>
              </View>

              <View style={styles.modalTableRow}>
                <View style={{ flex: 2, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Store size={14} color="#ff5722" />
                  <Text style={[styles.modalTdBold, { color: colors.textPrimary }]}>Offline Store</Text>
                </View>
                <Text style={[styles.modalTd, { flex: 1.5, textAlign: 'right', color: colors.textPrimary }]}>$19,820.00</Text>
                <Text style={[styles.modalTd, { flex: 1, textAlign: 'right', color: colors.textSecondary }]}>289</Text>
                <Text style={[styles.modalTd, { flex: 1.2, textAlign: 'right', color: colors.textPrimary }]}>$68.58</Text>
                <Text style={[styles.modalTd, { flex: 1, textAlign: 'right', color: '#dc2626', fontWeight: '500' }]}>-4.2%</Text>
              </View>
            </View>

            {/* Modal Footer */}
            <View style={styles.modalFooterRow}>
              <TouchableOpacity
                style={[styles.modalCloseFooterBtn, { backgroundColor: isDark ? '#3f3f46' : '#09090b' }]}
                onPress={() => setDetailsModalOpen(false)}
              >
                <Text style={styles.modalCloseFooterText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </AppShell>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    paddingBottom: 32,
  },

  rowDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  rowMobile: {
    flexDirection: 'column',
  },

  addSaleHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
  },
  addSaleHeaderBtnText: {
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },

  // 1. TOP 6 KPI GRID
  sixKpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  kpiCardItem: {
    flex: 1,
    minWidth: 155,
    borderWidth: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  kpiBigVal: {
    fontSize: 20,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
    letterSpacing: -0.4,
  },
  kpiSubBadgeNegative: {
    fontSize: 12,
    color: '#64748b',
    fontFamily: 'Manrope_500Medium',
  },
  kpiPillBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  kpiPillBadgeText: {
    fontSize: 10.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  kpiSubLabel: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 8,
  },
  kpiCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  kpiBottomMetricRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginTop: 8,
  },
  kpiMetricBottomVal: {
    fontSize: 16,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  kpiTrendPositiveInline: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
    color: '#16a34a',
  },
  kpiMidVal: {
    fontSize: 19,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  kpiIconSquare: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Split Bars (Card 1)
  splitBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 75,
    marginTop: 6,
  },
  splitBarTrack: {
    width: 9,
    alignItems: 'center',
    gap: 4,
    justifyContent: 'flex-end',
  },
  splitBarPillTop: {
    width: '100%',
    backgroundColor: '#52525b',
    borderRadius: 5,
  },
  splitBarPillBottom: {
    width: '100%',
    backgroundColor: '#e4e4e7',
    borderRadius: 5,
  },

  // Orange Bars (Card 2)
  orangeBarsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 65,
    marginTop: 4,
  },
  orangeBarItem: {
    width: 8,
    borderRadius: 4,
  },

  // Sparkline (Card 3)
  sparklineTrack: {
    height: 60,
    marginTop: 6,
    justifyContent: 'center',
  },

  // Donut Gauge (Card 4)
  donutGaugeWrapper: {
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    position: 'relative',
  },
  donutGaugeCenterText: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutVisitorsNum: {
    fontSize: 13,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
    lineHeight: 16,
  },
  donutVisitorsLabel: {
    fontSize: 8.5,
    fontFamily: 'Manrope_500Medium',
  },

  // 2. MID SECTION (TOTAL TRANSACTION + TOTAL SALES)
  midSectionRow: {
    gap: 16,
  },
  leftCombinedCard: {
    borderWidth: 1,
    padding: 18,
  },
  combinedInnerRow: {
    gap: 18,
  },
  transactionChartSubPanel: {
    justifyContent: 'space-between',
  },
  panelHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  panelTitle: {
    fontSize: 15,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  panelSubtitle: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
    marginTop: 1,
  },
  moreBtn: {
    padding: 4,
  },
  transactionBarChartTrack: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
    paddingTop: 10,
  },
  transBarCol: {
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  transBarTopVal: {
    fontSize: 10,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  transBarHolder: {
    height: 95,
    width: 22,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  transBarFill: {
    width: '100%',
    borderRadius: 7,
  },
  transBarLabel: {
    fontSize: 11,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  verticalDivider: {
    width: 1,
    alignSelf: 'stretch',
    marginHorizontal: 4,
  },

  // Report Sub-Panel
  reportSubPanel: {
    justifyContent: 'space-between',
  },
  reportBoxesRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  reportMetricBox: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 4,
  },
  reportIconBox: {
    width: 26,
    height: 26,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reportBoxTimeText: {
    fontSize: 10.5,
    fontFamily: 'Manrope_500Medium',
  },
  reportBoxTrendVal: {
    fontSize: 17,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  reportBottomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  performanceLabel: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
  },
  performanceVal: {
    fontSize: 17,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  viewReportBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  viewReportBtnText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },

  // Right Total Sales Card
  rightTotalSalesCard: {
    borderWidth: 1,
    padding: 18,
    justifyContent: 'space-between',
  },
  salesCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  salesCardTitle: {
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  detailsBtn: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  detailsBtnText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  salesBigMetricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 6,
  },
  salesBigMetricVal: {
    fontSize: 24,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
    letterSpacing: -0.5,
  },
  horizontalDivider: {
    height: 1,
    marginVertical: 8,
  },
  channelsContainer: {
    gap: 8,
    marginVertical: 4,
  },
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  channelName: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
  },
  channelVal: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  channelTrend: {
    fontSize: 10.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  salesChartArea: {
    height: 80,
    marginTop: 10,
    position: 'relative',
    justifyContent: 'flex-end',
  },
  salesBarBackdrop: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    top: 0,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  backdropBar: {
    width: 14,
    borderRadius: 3,
  },
  salesLineOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 20,
    top: 0,
  },
  chartTimeLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  timeLabelText: {
    fontSize: 9.5,
    fontFamily: 'Manrope_400Regular',
  },

  // 3. TABLE SECTION
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
    minWidth: 900,
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
  territoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 4,
    borderWidth: 1,
  },
  territoryBadgeText: {
    fontSize: 10.5,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  saleAmountText: {
    fontSize: 11.5,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  statusPill: {
    paddingHorizontal: 7,
    paddingVertical: 2.5,
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

  // Interactive Chart Context Menus & Hover Banners
  chartContextMenu: {
    position: 'absolute',
    top: 28,
    right: 0,
    width: 190,
    borderWidth: 1,
    borderRadius: 8,
    padding: 6,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    gap: 4,
  },
  contextMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 6,
  },
  contextMenuText: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  chartHoverPillBanner: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 10,
  },
  hoverPillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  hoverDotTeal: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#52525b',
  },
  hoverPillMainText: {
    fontSize: 11.5,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  hoverPillSubText: {
    fontSize: 11,
    fontFamily: 'Manrope_500Medium',
  },
  salesHoverTextRow: {
    minHeight: 18,
    marginVertical: 4,
  },
  salesHoverTextActive: {
    fontSize: 11.5,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  salesHoverTextMuted: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
  },

  // Details Modal Styles
  modalBackdropOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  detailsModalCard: {
    width: '100%',
    maxWidth: 620,
    borderWidth: 1,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12,
    gap: 18,
  },
  detailsModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    paddingBottom: 14,
  },
  detailsModalTitle: {
    fontSize: 17,
    fontWeight: '400',
    fontFamily: 'Manrope_400Regular',
  },
  detailsModalSubtitle: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    marginTop: 2,
  },
  modalCloseBtn: {
    borderWidth: 1,
    borderRadius: 6,
    padding: 6,
  },
  modalKpiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  modalKpiTile: {
    flex: 1,
    minWidth: 125,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 3,
  },
  modalKpiLabel: {
    fontSize: 11,
    fontFamily: 'Manrope_500Medium',
  },
  modalKpiValue: {
    fontSize: 18,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  modalKpiTrend: {
    fontSize: 10.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  modalKpiSub: {
    fontSize: 10.5,
    fontFamily: 'Manrope_400Regular',
  },
  modalTableBox: {
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  modalTh: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  modalTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  modalTdBold: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  modalTd: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
  },
  modalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  modalCloseFooterBtn: {
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 6,
  },
  modalCloseFooterText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },

  // Shadcn Data Table Styles
  shadcnCheckbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thTextShadcn: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  tableRowShadcn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    minHeight: 52,
    backgroundColor: '#ffffff',
  },
  shadcnAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadcnAvatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadcnAvatarText: {
    fontSize: 11.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  shadcnUserName: {
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  shadcnUserSub: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
    marginTop: 1,
  },
  shadcnCellBold: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  shadcnCellText: {
    fontSize: 12,
    fontFamily: 'Manrope_500Medium',
  },
  shadcnAmountText: {
    fontSize: 12.5,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  shadcnStatusPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  shadcnStatusPillText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: 'Manrope_500Medium',
  },
  shadcnActionIcon: {
    padding: 3,
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

