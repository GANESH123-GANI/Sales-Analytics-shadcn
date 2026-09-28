import React, { useState, useEffect } from 'react';
import { NotificationModal, InfoModal } from './ActionModal';
import { ProfileModal } from './ProfileModal';
import { AdminPortal } from './AdminPortal';
import { DedicatedAdminPanel } from './DedicatedAdminPanel';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useWindowDimensions,
  Platform,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { THEME } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import { ThemeCustomizerModal } from './ThemeCustomizerModal';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  BarChart3,
  Settings,
  Search,
  Bell,
  Layers,
  Menu,
  X,
  Building2,
  ChevronsUpDown,
  ChevronRight,
  Database,
  LogOut,
  ShieldCheck,
  PanelLeft,
  Activity,
  Moon,
  Sun,
  Palette,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';

export type NavTabKey = 'Overview' | 'Sales' | 'Fleet sales' | 'Products' | 'Customers' | 'Reports' | 'Admin';

interface NavItemConfig {
  key: NavTabKey;
  label: string;
  route: string;
  icon: any;
  badge?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  { key: 'Overview', label: 'Overview', route: '/', icon: LayoutDashboard },
  { key: 'Sales', label: 'Sales', route: '/sales', icon: ShoppingBag, badge: '15' },
  { key: 'Products', label: 'Products', route: '/products', icon: Package, badge: '12' },
  { key: 'Customers', label: 'Customers', route: '/customers', icon: Users, badge: '8' },
  { key: 'Reports', label: 'Reports', route: '/reports', icon: BarChart3, badge: 'P&L' },
];

interface AppShellProps {
  activeTab: NavTabKey;
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeTab,
  title,
  subtitle,
  headerRight,
  children,
  onSearch,
  searchPlaceholder = 'Search sales, products, customers...',
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;
  const isCompact = width < 720;

  const { user, logout, isAdmin } = useAuth();
  const userInitials = user?.name
    ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [notifVisible, setNotifVisible] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [profileVisible, setProfileVisible] = useState(false);
  const [showAdminPortal, setShowAdminPortal] = useState(false);

  useEffect(() => {
    setShowAdminPortal(false);
  }, [pathname]);

  const {
    colors,
    isDark,
    setColorMode,
    colorMode,
    radiusValues,
    sidebarVariant,
    sidebarMode,
    setSidebarMode,
    contentLayout,
    toggleCustomizer,
  } = useTheme();

  const handleNavigate = (route: string) => {
    setShowAdminPortal(false);
    setMobileMenuOpen(false);
    if (pathname !== route) router.push(route as any);
  };

  const handleSearchChange = (text: string) => {
    setSearchVal(text);
    if (onSearch) onSearch(text);
  };

  // Render standalone Dedicated Admin Panel for administrators
  if (showAdminPortal && isAdmin) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
        <DedicatedAdminPanel onSwitchToUserView={() => setShowAdminPortal(false)} />
      </SafeAreaView>
    );
  }

  // ─── Sidebar ────────────────────────────────────────────────────────────────
  const Sidebar = () => (
    <View style={[styles.sidebar, !isDesktop && styles.mobileSidebarOverlay]}>
      {/* Workspace / Org Switcher & Mobile Close Button */}
      <View style={styles.sidebarHeaderRow}>
        <View style={styles.workspaceSwitcher}>
          <View style={styles.workspaceIconBox}>
            <Building2 size={16} color="#ffffff" />
          </View>
          <View style={styles.workspaceInfo}>
            <Text style={styles.workspaceName}>Enterprise Corp</Text>
            <Text style={styles.workspacePlan}>{isAdmin ? 'Admin Workspace' : 'User Workspace'}</Text>
          </View>
          <ChevronsUpDown size={14} color={THEME.colors.textMuted} />
        </View>

        {!isDesktop && (
          <TouchableOpacity
            style={styles.mobileCloseBtn}
            onPress={() => setMobileMenuOpen(false)}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={18} color={THEME.colors.textPrimary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Nav section label */}
      <Text style={styles.navSectionLabel}>PLATFORM</Text>

      {/* Navigation List */}
      <View style={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = !showAdminPortal && (item.key === activeTab || (item.key === 'Fleet sales' && activeTab === 'Fleet sales'));
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={() => handleNavigate(item.route)}
              activeOpacity={0.7}
            >
              <IconComponent
                size={16}
                color={isActive ? THEME.colors.textPrimary : THEME.colors.textSecondary}
              />
              <Text style={[styles.navItemText, isActive && styles.navItemTextActive]}>
                {item.label}
              </Text>
              {item.badge && (
                <View style={[styles.navBadge, isActive && styles.navBadgeActive]}>
                  <Text style={[styles.navBadgeText, isActive && styles.navBadgeTextActive]}>
                    {item.badge}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {/* Dedicated Admin Portal Item (Visible only to administrators) */}
        {isAdmin && (
          <TouchableOpacity
            style={[
              styles.navItem,
              showAdminPortal && styles.navItemActive,
              showAdminPortal && { backgroundColor: '#ede9fe' },
            ]}
            onPress={() => {
              setShowAdminPortal(true);
              setMobileMenuOpen(false);
            }}
            activeOpacity={0.7}
          >
            <ShieldCheck
              size={16}
              color={showAdminPortal ? '#6d28d9' : THEME.colors.textSecondary}
            />
            <Text
              style={[
                styles.navItemText,
                showAdminPortal && { color: '#6d28d9', fontWeight: '500' },
              ]}
            >
              Admin Portal
            </Text>
            <View style={[styles.navBadge, { backgroundColor: '#6d28d9' }]}>
              <Text style={[styles.navBadgeText, { color: '#ffffff' }]}>ADMIN</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Footer: Settings & Sign Out */}
      <View style={styles.sidebarFooter}>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => setSettingsVisible(true)}
        >
          <Settings size={16} color={THEME.colors.textSecondary} />
          <Text style={styles.navItemText}>Preferences</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navItem, { marginTop: 2 }]}
          activeOpacity={0.7}
          onPress={logout}
        >
          <LogOut size={16} color="#ef4444" />
          <Text style={[styles.navItemText, { color: '#ef4444', fontWeight: '500' }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        {/* ── Sidebar & Mobile Backdrop ── */}
        {!isDesktop && mobileMenuOpen && (
          <TouchableOpacity
            style={styles.drawerBackdrop}
            activeOpacity={1}
            onPress={() => setMobileMenuOpen(false)}
          />
        )}
        {(isDesktop || mobileMenuOpen) && <Sidebar />}

        {/* ── Main content ── */}
        <View style={styles.mainViewport}>
          {/* Floating Island Navigation Bar matching screenshot */}
          <View style={[styles.floatingIslandBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {/* Left side */}
            <View style={styles.floatingIslandLeft}>
              {/* Sidebar toggle button [|] */}
              <TouchableOpacity
                style={styles.floatingSidebarToggle}
                onPress={() => {
                  if (isDesktop) {
                    setSidebarMode(sidebarMode === 'hidden' ? 'expanded' : sidebarMode === 'expanded' ? 'icon' : 'hidden');
                  } else {
                    setMobileMenuOpen(!mobileMenuOpen);
                  }
                }}
                activeOpacity={0.7}
                accessibilityLabel="Toggle Sidebar"
              >
                <PanelLeft size={18} color={colors.textPrimary} />
              </TouchableOpacity>

              {/* Vertical divider | */}
              <View style={[styles.floatingVerticalDivider, { backgroundColor: colors.border }]} />

              {/* Search trigger */}
              <View style={styles.floatingSearchWrapper}>
                <Search size={14} color={colors.textMuted} style={styles.floatingSearchIcon} />
                <TextInput
                  style={[styles.floatingSearchInput, { color: colors.textPrimary }]}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  value={searchVal}
                  onChangeText={handleSearchChange}
                  {...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {})}
                />
                <View style={[styles.floatingCmdBadge, { backgroundColor: isDark ? '#27272a' : '#f1f5f9', borderColor: colors.border }]}>
                  <Text style={[styles.floatingCmdBadgeText, { color: colors.textMuted }]}>⌘K</Text>
                </View>
              </View>
            </View>

            {/* Right side items */}
            <View style={styles.floatingIslandRight}>
              {/* 1. Pulse / Activity Wave */}
              <TouchableOpacity
                style={styles.floatingIconBtn}
                activeOpacity={0.7}
                onPress={() => router.push('/')}
                accessibilityLabel="Analytics Activity"
              >
                <Activity size={18} color={colors.textPrimary} />
              </TouchableOpacity>

              {/* 2. Notifications Bell with Red Badge Dot */}
              <TouchableOpacity
                style={styles.floatingIconBtn}
                activeOpacity={0.7}
                onPress={() => setNotifVisible(true)}
                accessibilityLabel="Notifications"
              >
                <Bell size={18} color={colors.textPrimary} />
                <View style={[styles.floatingRedDot, { borderColor: colors.surface }]} />
              </TouchableOpacity>

              {/* 3. Dark/Light Mode Toggle */}
              <TouchableOpacity
                style={styles.floatingIconBtn}
                activeOpacity={0.7}
                onPress={() => setColorMode(isDark ? 'light' : 'dark')}
                accessibilityLabel="Toggle Dark Mode"
              >
                {isDark ? (
                  <Sun size={18} color="#f59e0b" />
                ) : (
                  <Moon size={18} color={colors.textPrimary} />
                )}
              </TouchableOpacity>

              {/* 4. Palette / Theme Customizer */}
              <TouchableOpacity
                style={styles.floatingIconBtn}
                activeOpacity={0.7}
                onPress={toggleCustomizer}
                accessibilityLabel="Theme Customizer"
              >
                <Palette size={18} color={colors.textPrimary} />
              </TouchableOpacity>

              {/* 5. User Profile Avatar with Green Online Dot */}
              <TouchableOpacity
                style={styles.floatingAvatarBtn}
                activeOpacity={0.8}
                onPress={() => setProfileVisible(true)}
                accessibilityLabel="User Profile"
              >
                <Image
                  source={{ uri: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80' }}
                  style={styles.floatingAvatarImage}
                />
                <View style={[styles.floatingGreenOnlineDot, { borderColor: colors.surface }]} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Theme Customizer Drawer/Popover */}
          <ThemeCustomizerModal />

          {/* Page Content */}
          <ScrollView
            style={styles.contentScrollView}
            contentContainerStyle={[
              styles.contentContainer,
              { paddingHorizontal: isDesktop ? 20 : 12, paddingTop: isDesktop ? 20 : 12 },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {showAdminPortal && isAdmin ? (
              <AdminPortal />
            ) : (
              <>
                {title && (
                  <View style={styles.pageHeader}>
                    <View style={styles.pageHeaderLeft}>
                      <Text style={[styles.pageTitle, !isDesktop && styles.pageTitleMobile]}>{title}</Text>
                      {subtitle && <Text style={styles.pageSubtitle}>{subtitle}</Text>}
                    </View>
                    {headerRight && <View style={styles.pageHeaderRight}>{headerRight}</View>}
                  </View>
                )}
                {children}
              </>
            )}
          </ScrollView>
        </View>
      </View>

      {/* Modals */}
      <ProfileModal visible={profileVisible} onClose={() => setProfileVisible(false)} />
      <NotificationModal visible={notifVisible} onClose={() => setNotifVisible(false)} />
      <InfoModal
        visible={settingsVisible}
        title="Settings"
        message="Settings panel coming soon. You can configure app preferences, data sync intervals, and notification rules here."
        confirmLabel="Got it"
        cancelLabel="Close"
        onConfirm={() => setSettingsVisible(false)}
        onCancel={() => setSettingsVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.colors.card,
  },
  root: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: THEME.colors.background,
  },

  // ─── Sidebar ───────────────────────────────────────────────────────────────
  sidebar: {
    width: 224,
    backgroundColor: THEME.colors.card,
    borderRightWidth: 1,
    borderRightColor: THEME.colors.border,
    paddingHorizontal: 14,
    paddingTop: 20,
    paddingBottom: 20,
    justifyContent: 'space-between',
  },
  mobileSidebarOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 999,
    elevation: 12,
    width: 275,
    ...(Platform.OS === 'web' ? { boxShadow: '4px 0 24px rgba(0, 0, 0, 0.16)' } : {}),
  },
  drawerBackdrop: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    zIndex: 998,
  },
  sidebarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  mobileCloseBtn: {
    padding: 6,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.secondary,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  sidebarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 24,
  },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoTitle: {
    fontSize: THEME.fontSize.base,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
    letterSpacing: -0.3,
    flex: 1,
  },
  closeBtn: {
    padding: 4,
    borderRadius: THEME.radius.sm,
  },
  navSectionLabel: {
    fontSize: THEME.fontSize.xs,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
    paddingHorizontal: 12,
  },
  navList: {
    gap: 2,
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderRadius: THEME.radius.md,
    position: 'relative',
  },
  navItemActive: {
    backgroundColor: THEME.colors.secondary,
  },
  activeIndicator: {
    position: 'absolute',
    right: 10,
    width: 5,
    height: 5,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.primary,
  },
  navItemText: {
    fontSize: THEME.fontSize.base,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
    color: THEME.colors.textSecondary,
  },
  navItemTextActive: {
    fontWeight: '500',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
  sidebarFooter: {
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle,
    paddingTop: 10,
    marginTop: 10,
    gap: 8,
  },
  workspaceSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 8,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.muted,
    marginBottom: 20,
  },
  workspaceIconBox: {
    width: 28,
    height: 28,
    borderRadius: THEME.radius.sm,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workspaceInfo: {
    flex: 1,
  },
  workspaceName: {
    fontSize: THEME.fontSize.base,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
  workspacePlan: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontFamily: THEME.fontFamily.medium,
  },
  navBadge: {
    marginLeft: 'auto',
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  navBadgeActive: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  navBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textSecondary,
  },
  navBadgeTextActive: {
    color: THEME.colors.primaryForeground,
  },
  dbStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#ecfdf5',
    borderRadius: THEME.radius.full,
    borderWidth: 1,
    borderColor: '#a7f3d0',
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  dbLiveDot: {
    width: 6,
    height: 6,
    borderRadius: THEME.radius.full,
    backgroundColor: '#059669',
  },
  dbStatusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#047857',
    fontFamily: THEME.fontFamily.semibold,
  },

  // ─── Main Viewport ─────────────────────────────────────────────────────────
  mainViewport: {
    flex: 1,
    minWidth: 0,
    backgroundColor: THEME.colors.background,
  },

  // ─── Floating Island Navigation Bar (Screenshot Match) ──────────────────────
  floatingIslandBar: {
    height: 52,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    ...(Platform.OS === 'web'
      ? ({
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.02)',
        } as any)
      : {
          elevation: 2,
        }),
  },
  floatingIslandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    maxWidth: 420,
  },
  floatingSidebarToggle: {
    padding: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  floatingVerticalDivider: {
    width: 1,
    height: 18,
    marginHorizontal: 10,
  },
  floatingSearchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  floatingSearchIcon: {
    marginRight: 6,
  },
  floatingSearchInput: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4,
    outlineWidth: 0,
  },
  floatingCmdBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    marginLeft: 6,
  },
  floatingCmdBadgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  floatingIslandRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  floatingIconBtn: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  floatingRedDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#ef4444',
    borderWidth: 1.5,
  },
  floatingAvatarBtn: {
    position: 'relative',
    marginLeft: 4,
  },
  floatingAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
  },
  floatingGreenOnlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#22c55e',
    borderWidth: 2,
  },

  // ─── Top Bar ──────────────────────────────────────────────────────────────
  topBar: {
    minHeight: 52,
    backgroundColor: THEME.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: THEME.colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    minWidth: 0,
    gap: 14,
  },
  breadcrumbBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginRight: 6,
  },
  breadcrumbRoot: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textMuted,
    fontFamily: THEME.fontFamily.medium,
  },
  breadcrumbActive: {
    fontSize: THEME.fontSize.sm,
    color: THEME.colors.textPrimary,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.semibold,
  },
  cmdShortcutBadge: {
    backgroundColor: THEME.colors.card,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: THEME.radius.xs,
  },
  cmdShortcutText: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.semibold,
  },
  liveCloudBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 9,
    paddingVertical: 4,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: THEME.radius.full,
  },
  livePulseDot: {
    width: 6,
    height: 6,
    borderRadius: THEME.radius.full,
    backgroundColor: '#10b981',
  },
  liveCloudText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#047857',
    fontFamily: THEME.fontFamily.semibold,
  },
  userInfoCol: {
    gap: 1,
  },
  userRole: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontFamily: THEME.fontFamily.regular,
  },
  menuToggle: {
    padding: 6,
    borderRadius: THEME.radius.md,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.muted,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    paddingHorizontal: 10,
    height: 36,
    maxWidth: 380,
    flex: 1,
    minWidth: 0,
  },
  searchBarCompact: {
    maxWidth: 220,
  },
  searchIcon: {
    marginRight: 7,
  },
  searchInput: {
    flex: 1,
    fontSize: THEME.fontSize.base,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textPrimary,
    outlineWidth: 0,
  },
  searchInputCompact: {
    fontSize: THEME.fontSize.sm,
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: THEME.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: THEME.colors.muted,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  notifDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.status.cancelledText,
    borderWidth: 1.5,
    borderColor: THEME.colors.card,
  },
  userProfile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userAvatar: {
    width: 30,
    height: 30,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: THEME.colors.primaryForeground,
    fontSize: THEME.fontSize.xs,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.bold,
  },
  userName: {
    fontSize: THEME.fontSize.base,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },

  // ─── Content Area ─────────────────────────────────────────────────────────
  contentScrollView: {
    flex: 1,
    width: '100%',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    width: '100%',
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 6,
  },
  pageHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  pageTitle: {
    fontSize: THEME.fontSize['4xl'],
    fontWeight: '500',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
    letterSpacing: -0.8,
    lineHeight: 36,
  },
  pageTitleMobile: {
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: -0.4,
  },
  pageSubtitle: {
    fontSize: THEME.fontSize.md,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textSecondary,
    fontWeight: '400',
    letterSpacing: -0.1,
  },
  pageHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  adminConsoleHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0f172a',
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  adminConsoleHeaderBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500',
  },
});
