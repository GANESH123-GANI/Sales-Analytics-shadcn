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
  SafeAreaView,
} from 'react-native';
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
} from 'lucide-react-native';

export type NavTabKey = 'Overview' | 'Sales' | 'Fleet sales' | 'Customers' | 'Reports';

interface NavItemConfig {
  key: NavTabKey;
  label: string;
  route: string;
  icon: any;
}

const NAV_ITEMS: NavItemConfig[] = [
  { key: 'Overview',    label: 'Overview',    route: '/',          icon: LayoutDashboard },
  { key: 'Sales',       label: 'Sales',       route: '/sales',     icon: ShoppingBag },
  { key: 'Fleet sales', label: 'Fleet sales', route: '/products',  icon: Package },
  { key: 'Customers',   label: 'Customers',   route: '/customers', icon: Users },
  { key: 'Reports',     label: 'Reports',     route: '/reports',   icon: BarChart3 },
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
  searchPlaceholder = 'Search sales, clients, products...',
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
      {/* Logo */}
      <View style={styles.sidebarHeader}>
        <View style={styles.logoBadge}>
          <Layers size={15} color="#ffffff" />
        </View>
        <Text style={styles.logoTitle}>SalesAnalytics</Text>
        {!isDesktop && (
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setMobileMenuOpen(false)}
          >
            <X size={18} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Nav section label */}
      <Text style={styles.navSectionLabel}>MAIN MENU</Text>

      {/* Navigation List */}
      <View style={styles.navList}>
        {NAV_ITEMS.map((item) => {
          const IconComponent = item.icon;
          const isActive = item.key === activeTab;
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
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom: Settings */}
      <View style={styles.sidebarFooter}>
        <TouchableOpacity
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => setSettingsVisible(true)}
        >
          <Settings size={16} color={THEME.colors.textSecondary} />
          <Text style={styles.navItemText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.root}>
        {/* ── Sidebar ── */}
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

              {/* Global Search */}
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
              </View>
            </View>

            {/* Top Bar Right */}
            <View style={styles.topBarRight}>
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={() => setNotifVisible(true)}
              >
                <Bell size={16} color={THEME.colors.textSecondary} />
                <View style={styles.notifDot} />
              </TouchableOpacity>

              <View style={styles.userProfile}>
                <View style={styles.userAvatar}>
                  <Text style={styles.userAvatarText}>JD</Text>
                </View>
                {isDesktop && <Text style={styles.userName}>James Doe</Text>}
              </View>
            </View>
          </View>

          {/* Page Content */}
          <ScrollView
            style={styles.contentScrollView}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
          >
            {title && (
              <View style={styles.pageHeader}>
                <View style={styles.pageHeaderLeft}>
                  <Text style={styles.pageTitle}>{title}</Text>
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
    elevation: 10,
    width: 264,
    boxShadow: '4px 0 16px rgba(0, 0, 0, 0.12)',
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
    gap: 10,
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
