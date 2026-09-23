import React, { useState } from 'react';
import { NotificationModal, InfoModal } from './ActionModal';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  useWindowDimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, usePathname } from 'expo-router';
import { THEME } from '../constants/theme';
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
} from 'lucide-react-native';

export type NavTabKey = 'Overview' | 'Sales' | 'Fleet sales' | 'Customers' | 'Reports';

interface NavItemConfig {
  key: NavTabKey;
  label: string;
  route: string;
  icon: any;
  badge?: string;
}

const NAV_ITEMS: NavItemConfig[] = [
  { key: 'Overview',    label: 'Overview',    route: '/',          icon: LayoutDashboard },
  { key: 'Sales',       label: 'Sales',       route: '/sales',     icon: ShoppingBag,   badge: '15' },
  { key: 'Fleet sales', label: 'Products',    route: '/products',  icon: Package,       badge: '12' },
  { key: 'Customers',   label: 'Customers',   route: '/customers', icon: Users,         badge: '8' },
  { key: 'Reports',     label: 'Reports',     route: '/reports',   icon: BarChart3,     badge: 'P&L' },
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
  const router   = useRouter();
  const pathname = usePathname();
  const { width } = useWindowDimensions();
  const isDesktop = width >= 860;
  const isCompact = width < 720;

  const [mobileMenuOpen,   setMobileMenuOpen]   = useState(false);
  const [searchVal,        setSearchVal]        = useState('');
  const [notifVisible,     setNotifVisible]     = useState(false);
  const [settingsVisible,  setSettingsVisible]  = useState(false);

  const handleNavigate = (route: string) => {
    setMobileMenuOpen(false);
    if (pathname !== route) router.push(route as any);
  };

  const handleSearchChange = (text: string) => {
    setSearchVal(text);
    if (onSearch) onSearch(text);
  };

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
            <Text style={styles.workspacePlan}>Analytics Pro</Text>
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
          const isActive = item.key === activeTab || (item.key === 'Fleet sales' && activeTab === 'Fleet sales');
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
      </View>

      {/* Bottom Footer: Database Status & Settings */}
      <View style={styles.sidebarFooter}>
        <View style={styles.dbStatusPill}>
          <View style={styles.dbLiveDot} />
          <Text style={styles.dbStatusText}>Neon PostgreSQL</Text>
        </View>

        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => setSettingsVisible(true)}
        >
          <Settings size={16} color={THEME.colors.textSecondary} />
          <Text style={styles.navItemText}>Preferences</Text>
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
          {/* Top Bar */}
          <View style={styles.topBar}>
            <View style={styles.topBarLeft}>
              {!isDesktop && (
                <TouchableOpacity
                  style={styles.menuToggle}
                  onPress={() => setMobileMenuOpen(true)}
                >
                  <Menu size={20} color={THEME.colors.textPrimary} />
                </TouchableOpacity>
              )}

              {/* Breadcrumb path (shadcn style) */}
              {isDesktop && (
                <View style={styles.breadcrumbBar}>
                  <Text style={styles.breadcrumbRoot}>Dashboard</Text>
                  <ChevronRight size={13} color={THEME.colors.textMuted} />
                  <Text style={styles.breadcrumbActive}>
                    {activeTab === 'Fleet sales' ? 'Products' : activeTab}
                  </Text>
                </View>
              )}

              {/* Global Search with ⌘K Badge */}
              <View style={[styles.searchBarContainer, isCompact && styles.searchBarCompact]}>
                <Search size={14} color={THEME.colors.textMuted} style={styles.searchIcon} />
                <TextInput
                  style={[styles.searchInput, isCompact && styles.searchInputCompact]}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={THEME.colors.textMuted}
                  value={searchVal}
                  onChangeText={handleSearchChange}
                  {...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {})}
                />
                {!isCompact && (
                  <View style={styles.cmdShortcutBadge}>
                    <Text style={styles.cmdShortcutText}>⌘K</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Top Bar Right */}
            <View style={styles.topBarRight}>
              {/* Live Status Badge (Hidden on very small screens to prevent crowding) */}
              {!isCompact && (
                <View style={styles.liveCloudBadge}>
                  <View style={styles.livePulseDot} />
                  <Text style={styles.liveCloudText}>Connected</Text>
                </View>
              )}

              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={() => setNotifVisible(true)}
              >
                <Bell size={16} color={THEME.colors.textSecondary} />
                <View style={styles.notifDot} />
              </TouchableOpacity>

              {/* User Profile */}
              <View style={styles.userProfile}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>GP</Text>
                </View>
                {isDesktop && (
                  <View style={styles.userInfoCol}>
                    <Text style={styles.userName}>Ganesh Paidi</Text>
                    <Text style={styles.userRole}>Admin</Text>
                  </View>
                )}
              </View>
            </View>
          </View>

          {/* Page Content */}
          <ScrollView
            style={styles.contentScrollView}
            contentContainerStyle={[
              styles.contentContainer,
              { paddingHorizontal: isDesktop ? 20 : 12, paddingTop: isDesktop ? 20 : 12 },
            ]}
            showsVerticalScrollIndicator={false}
          >
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
          </ScrollView>
        </View>
      </View>

      {/* Modals */}
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
    fontWeight: '700',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
    color: '#047857',
    fontFamily: THEME.fontFamily.semibold,
  },

  // ─── Main Viewport ─────────────────────────────────────────────────────────
  mainViewport: {
    flex: 1,
    minWidth: 0,
    backgroundColor: THEME.colors.background,
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '600',
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
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
  },
  userName: {
    fontSize: THEME.fontSize.base,
    fontWeight: '600',
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
    paddingTop: 20,
    paddingBottom: 32,
    width: '100%',
    minHeight: '100%',
    flexGrow: 1,
  },
  pageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    flexWrap: 'wrap',
    gap: 8,
  },
  pageHeaderLeft: {
    flex: 1,
    gap: 4,
  },
  pageTitle: {
    fontSize: THEME.fontSize['4xl'],
    fontWeight: '700',
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
});
