import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
  Switch,
  Platform,
  useWindowDimensions,
} from 'react-native';
import {
  X,
  ChevronLeft,
  Search,
  MoreVertical,
  Check,
  CheckSquare,
  Layers,
  Shield,
  CreditCard,
  Bell,
  Link as LinkIcon,
  User as UserIcon,
  Mail,
  Laptop,
  Smartphone,
  ChevronRight,
  ExternalLink,
  Lock,
  Calendar,
  Building,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';

export interface UserProfileData {
  id?: number | string;
  name?: string;
  email?: string;
  role?: string;
  plan?: string;
  billing?: string;
  status?: string;
  avatar?: string;
  username?: string;
  taxId?: string;
  country?: string;
  company?: string;
}

interface UserProfileViewProps {
  visible: boolean;
  user: UserProfileData | null;
  onClose: () => void;
}

type TabKey = 'Account' | 'Security' | 'Billing & Plans' | 'Notifications' | 'Connections';

interface ProjectItem {
  id: number;
  name: string;
  tech: string;
  leader: string;
  teamCount: number;
  progress: number;
  iconBg: string;
  iconLetter: string;
}

const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 1,
    name: 'BGC eCommerce App',
    tech: 'React Project',
    leader: 'Eileen',
    teamCount: 2,
    progress: 45,
    iconBg: '#f43f5e',
    iconLetter: 'B',
  },
  {
    id: 2,
    name: 'Falcon Logo Design',
    tech: 'Figma Project',
    leader: 'James',
    teamCount: 3,
    progress: 52,
    iconBg: '#18181b',
    iconLetter: 'N',
  },
  {
    id: 3,
    name: 'Dashboard Design',
    tech: 'Vue Project',
    leader: 'Sarah',
    teamCount: 4,
    progress: 59,
    iconBg: '#ef4444',
    iconLetter: 'D',
  },
  {
    id: 4,
    name: 'Foodista Mobile App',
    tech: 'Angular Project',
    leader: 'Marcus',
    teamCount: 2,
    progress: 66,
    iconBg: '#3b82f6',
    iconLetter: 'F',
  },
];

export const UserProfileView: React.FC<UserProfileViewProps> = ({ visible, user, onClose }) => {
  const { width } = useWindowDimensions();
  const isDesktop = width >= 980;
  const { colors, isDark, radiusValues } = useTheme();

  const [activeTab, setActiveTab] = useState<TabKey>('Account');

  // Search in Account tab
  const [projectSearch, setProjectSearch] = useState('');

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [savedSecurityMsg, setSavedSecurityMsg] = useState(false);

  // Notifications tab state
  const [notifState, setNotifState] = useState({
    newForYou: { email: true, browser: true, app: false },
    accountActivity: { email: true, browser: true, app: false },
    newBrowser: { email: true, browser: true, app: true },
    newDevice: { email: true, browser: true, app: false },
  });
  const [savedNotifMsg, setSavedNotifMsg] = useState(false);

  // Connections tab state
  const [connections, setConnections] = useState({
    google: true,
    slack: false,
    github: true,
    mailchimp: false,
    asana: false,
  });

  if (!user) return null;

  const displayName = user.name || 'Zsasza McCleverty';
  const displayEmail = user.email || 'zmcclevertye@soundcloud.com';
  const username = user.username || (user.email ? user.email.split('@')[0] : 'zsaszamccleverty');
  const role = user.role || 'Maintainer';
  const plan = user.plan || 'Enterprise';
  const status = user.status || 'Pending';
  const avatarUrl =
    user.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face';

  const filteredProjects = INITIAL_PROJECTS.filter(
    (p) =>
      p.name.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.tech.toLowerCase().includes(projectSearch.toLowerCase()) ||
      p.leader.toLowerCase().includes(projectSearch.toLowerCase())
  );

  const TABS: TabKey[] = ['Account', 'Security', 'Billing & Plans', 'Notifications', 'Connections'];

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={[styles.rootContainer, { backgroundColor: isDark ? '#09090b' : '#f8fafc' }]}>
        {/* Top Navigation Bar */}
        <View
          style={[
            styles.topNavBar,
            {
              backgroundColor: colors.surface,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity style={styles.navBackBtn} onPress={onClose} activeOpacity={0.7}>
            <ChevronLeft size={18} color={colors.textPrimary} />
            <Text style={[styles.navBackText, { color: colors.textPrimary }]}>Back to Sales</Text>
          </TouchableOpacity>

          <View style={styles.navCenterTitle}>
            <Text style={[styles.navTitleText, { color: colors.textPrimary }]}>User Profile</Text>
            <Text style={[styles.navSubtitleText, { color: colors.textMuted }]}>
              {user.name} • {user.email}
            </Text>
          </View>

          <TouchableOpacity style={styles.closeBtn} onPress={onClose} activeOpacity={0.7}>
            <X size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Main Content Layout */}
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={[styles.mainScrollContent, !isDesktop && { flexDirection: 'column' }]}
          showsVerticalScrollIndicator={false}
        >
          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* LEFT COLUMN: USER PROFILE CARD (EXACT SCREENSHOT 3)                  */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <View
            style={[
              styles.leftSidebarCard,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                borderRadius: radiusValues.md,
                width: isDesktop ? 310 : '100%',
              },
            ]}
          >
            {/* Avatar & Name */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarWrapper}>
                <Image source={{ uri: avatarUrl }} style={styles.avatarImage} />
              </View>
              <Text style={[styles.userName, { color: colors.textPrimary }]}>{user.name}</Text>
              <View style={[styles.roleBadge, { backgroundColor: isDark ? '#27272a' : '#f4f4f5' }]}>
                <Text style={[styles.roleBadgeText, { color: colors.textSecondary }]}>{role}</Text>
              </View>
            </View>

            {/* Quick Stats: 800 Task Done | 200 Project Done */}
            <View style={styles.quickStatsRow}>
              <View
                style={[
                  styles.quickStatBox,
                  { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.border },
                ]}
              >
                <CheckSquare size={16} color={colors.textSecondary} style={{ marginBottom: 6 }} />
                <Text style={[styles.quickStatNumber, { color: colors.textPrimary }]}>800</Text>
                <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>Task Done</Text>
              </View>

              <View
                style={[
                  styles.quickStatBox,
                  { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.border },
                ]}
              >
                <Layers size={16} color={colors.textSecondary} style={{ marginBottom: 6 }} />
                <Text style={[styles.quickStatNumber, { color: colors.textPrimary }]}>200</Text>
                <Text style={[styles.quickStatLabel, { color: colors.textMuted }]}>Project Done</Text>
              </View>
            </View>

            {/* Details Section */}
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsHeading, { color: colors.textPrimary }]}>Details</Text>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textSecondary }]}>Username</Text>
                <Text style={[styles.detailVal, { color: colors.textPrimary }]}>{username}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textSecondary }]}>Email</Text>
                <Text style={[styles.detailVal, { color: colors.textPrimary }]} numberOfLines={1}>
                  {user.email}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textSecondary }]}>Status</Text>
                <View style={styles.statusRow}>
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: status === 'Active' ? '#16a34a' : '#f59e0b' },
                    ]}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      { color: status === 'Active' ? '#16a34a' : '#f59e0b' },
                    ]}
                  >
                    {status}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textSecondary }]}>Role</Text>
                <Text style={[styles.detailVal, { color: colors.textPrimary }]}>{role}</Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: colors.textSecondary }]}>Tax ID</Text>
                <Text style={[styles.detailVal, { color: colors.textPrimary }]}>Tax-8800</Text>
              </View>
            </View>
          </View>

          {/* ═════════════════════════════════════════════════════════════════════ */}
          {/* RIGHT COLUMN: 5 TABS + PAGE CONTENT                                 */}
          {/* ═════════════════════════════════════════════════════════════════════ */}
          <View style={[styles.rightContentArea, isDesktop && { flex: 1 }]}>
            {/* Top Segmented Navigation Tabs */}
            <View
              style={[
                styles.tabsHeaderContainer,
                {
                  backgroundColor: isDark ? '#18181b' : '#f4f4f5',
                  borderColor: colors.border,
                },
              ]}
            >
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.tabsRow}>
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab;
                    return (
                      <TouchableOpacity
                        key={tab}
                        style={[
                          styles.segmentedTabBtn,
                          isActive && [
                            styles.segmentedTabBtnActive,
                            { backgroundColor: colors.surface, borderColor: colors.border },
                          ],
                        ]}
                        onPress={() => setActiveTab(tab)}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.segmentedTabText,
                            {
                              color: isActive ? colors.textPrimary : colors.textSecondary,
                              fontFamily: isActive ? 'Manrope_500Medium' : 'Manrope_400Regular',
                            },
                          ]}
                        >
                          {tab}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* TAB 1: ACCOUNT (SCREENSHOT 3)                                     */}
            {/* ───────────────────────────────────────────────────────────────── */}
            {activeTab === 'Account' && (
              <View style={styles.tabContentBlock}>
                {/* Projects List Card */}
                <View
                  style={[
                    styles.contentCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radiusValues.md,
                    },
                  ]}
                >
                  <View style={styles.projectListHeader}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Projects List</Text>
                    <View
                      style={[
                        styles.projectSearchBox,
                        { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.border },
                      ]}
                    >
                      <TextInput
                        style={[styles.projectSearchInput, { color: colors.textPrimary }]}
                        placeholder="Search project"
                        placeholderTextColor={colors.textMuted}
                        value={projectSearch}
                        onChangeText={setProjectSearch}
                      />
                    </View>
                  </View>

                  {/* Projects Table */}
                  <View style={styles.tableWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                      <View style={styles.projectTable}>
                        {/* Table Header */}
                        <View style={[styles.projectTableHeader, { borderBottomColor: colors.border }]}>
                          <View style={{ width: 34, alignItems: 'center' }}>
                            <View style={[styles.checkboxOutline, { borderColor: colors.border }]} />
                          </View>
                          <Text style={[styles.pThText, { width: 220, color: colors.textMuted }]}>PROJECT</Text>
                          <Text style={[styles.pThText, { width: 100, color: colors.textMuted }]}>LEADER</Text>
                          <Text style={[styles.pThText, { width: 110, color: colors.textMuted }]}>TEAM</Text>
                          <Text style={[styles.pThText, { width: 150, color: colors.textMuted }]}>PROGRESS</Text>
                          <Text style={[styles.pThText, { width: 60, color: colors.textMuted, textAlign: 'center' }]}>ACTION</Text>
                        </View>

                        {/* Table Rows */}
                        {filteredProjects.map((item) => (
                          <View
                            key={item.id}
                            style={[styles.projectTableRow, { borderBottomColor: colors.border }]}
                          >
                            <View style={{ width: 34, alignItems: 'center' }}>
                              <View style={[styles.checkboxOutline, { borderColor: colors.border }]} />
                            </View>

                            {/* Project Name + Icon */}
                            <View style={[styles.pTdProjectCell, { width: 220 }]}>
                              <View style={[styles.projectLogoBadge, { backgroundColor: item.iconBg }]}>
                                <Text style={styles.projectLogoText}>{item.iconLetter}</Text>
                              </View>
                              <View>
                                <Text style={[styles.pItemTitle, { color: colors.textPrimary }]}>{item.name}</Text>
                                <Text style={[styles.pItemSub, { color: colors.textSecondary }]}>{item.tech}</Text>
                              </View>
                            </View>

                            {/* Leader */}
                            <Text style={[styles.pLeaderText, { width: 100, color: colors.textSecondary }]}>
                              {item.leader}
                            </Text>

                            {/* Team Avatar Stack */}
                            <View style={[styles.teamStackRow, { width: 110 }]}>
                              <View style={[styles.miniAvatar, { backgroundColor: '#64748b' }]}>
                                <Text style={styles.miniAvatarText}>AI</Text>
                              </View>
                              <View style={[styles.miniAvatarCount, { backgroundColor: isDark ? '#27272a' : '#f1f5f9' }]}>
                                <Text style={[styles.miniAvatarCountText, { color: colors.textSecondary }]}>
                                  +{item.teamCount}
                                </Text>
                              </View>
                            </View>

                            {/* Progress Bar */}
                            <View style={[styles.progressCell, { width: 150 }]}>
                              <View style={styles.progressTrack}>
                                <View
                                  style={[
                                    styles.progressFill,
                                    {
                                      width: `${item.progress}%`,
                                      backgroundColor:
                                        item.progress > 60 ? '#f97316' : item.progress > 50 ? '#0284c7' : '#0d9488',
                                    },
                                  ]}
                                />
                              </View>
                              <Text style={[styles.progressPctText, { color: colors.textSecondary }]}>
                                {item.progress}%
                              </Text>
                            </View>

                            {/* Action */}
                            <TouchableOpacity style={{ width: 60, alignItems: 'center' }} activeOpacity={0.7}>
                              <MoreVertical size={15} color={colors.textSecondary} />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Pagination Footer */}
                  <View style={[styles.pPaginationFooter, { borderTopColor: colors.border }]}>
                    <Text style={[styles.pEntriesText, { color: colors.textMuted }]}>
                      Showing 1 to {filteredProjects.length} of {filteredProjects.length} entries
                    </Text>
                    <View style={styles.pPageNav}>
                      <TouchableOpacity style={styles.pNavBtn} activeOpacity={0.7}>
                        <Text style={[styles.pNavBtnText, { color: colors.textSecondary }]}>{'< Previous'}</Text>
                      </TouchableOpacity>
                      <View style={[styles.pPageNumber, { backgroundColor: '#09090b' }]}>
                        <Text style={styles.pPageNumberText}>1</Text>
                      </View>
                      <TouchableOpacity style={styles.pNavBtn} activeOpacity={0.7}>
                        <Text style={[styles.pNavBtnText, { color: colors.textSecondary }]}>{'Next >'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* User Activity Timeline Card */}
                <View
                  style={[
                    styles.contentCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radiusValues.md,
                      marginTop: 16,
                    },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary, marginBottom: 16 }]}>User Activity Timeline</Text>

                  <View style={styles.timelineList}>
                    <View style={styles.timelineItem}>
                      <View style={[styles.timelineBullet, { backgroundColor: '#09090b' }]} />
                      <View style={styles.timelineContent}>
                        <Text style={[styles.timelineTitle, { color: colors.textPrimary }]}>
                          12 Invoices have been paid
                        </Text>
                        <Text style={[styles.timelineSub, { color: colors.textSecondary }]}>
                          Invoices have been paid to the company.
                        </Text>
                      </View>
                      <Text style={[styles.timelineTime, { color: colors.textMuted }]}>12 min ago</Text>
                    </View>

                    <View style={styles.timelineItem}>
                      <View style={[styles.timelineBullet, { backgroundColor: '#71717a' }]} />
                      <View style={styles.timelineContent}>
                        <Text style={[styles.timelineTitle, { color: colors.textPrimary }]}>
                          Client meeting with React team
                        </Text>
                        <Text style={[styles.timelineSub, { color: colors.textSecondary }]}>
                          Project kickoff scheduled for enterprise client.
                        </Text>
                      </View>
                      <Text style={[styles.timelineTime, { color: colors.textMuted }]}>45 min ago</Text>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end', marginTop: 16 }}>
                    <TouchableOpacity style={styles.buyNowBtn} activeOpacity={0.85}>
                      <Text style={styles.buyNowBtnText}>Buy Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* TAB 2: SECURITY (SCREENSHOT 1)                                    */}
            {/* ───────────────────────────────────────────────────────────────── */}
            {activeTab === 'Security' && (
              <View style={styles.tabContentBlock}>
                {/* Change Password Card */}
                <View
                  style={[
                    styles.contentCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radiusValues.md,
                    },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Change Password</Text>

                  <View style={styles.pwInputsGrid}>
                    <View style={[styles.inputGroup, isDesktop && { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Current Password</Text>
                      <TextInput
                        style={[
                          styles.textInputField,
                          { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.border, color: colors.textPrimary },
                        ]}
                        secureTextEntry
                        placeholder="••••••••••"
                        placeholderTextColor={colors.textMuted}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                      />
                    </View>

                    <View style={[styles.inputGroup, isDesktop && { flex: 1 }]}>
                      <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>New Password</Text>
                      <TextInput
                        style={[
                          styles.textInputField,
                          { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.border, color: colors.textPrimary },
                        ]}
                        secureTextEntry
                        placeholder="••••••••••"
                        placeholderTextColor={colors.textMuted}
                        value={newPassword}
                        onChangeText={setNewPassword}
                      />
                    </View>
                  </View>

                  <View style={[styles.inputGroup, { marginTop: 12 }]}>
                    <Text style={[styles.inputLabel, { color: colors.textPrimary }]}>Confirm New Password</Text>
                    <TextInput
                      style={[
                        styles.textInputField,
                        { backgroundColor: isDark ? '#18181b' : '#fafafa', borderColor: colors.border, color: colors.textPrimary, maxWidth: 440 },
                      ]}
                      secureTextEntry
                      placeholder="••••••••••"
                      placeholderTextColor={colors.textMuted}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                    />
                  </View>

                  {/* Bullet Criteria */}
                  <View style={styles.bulletRulesList}>
                    <View style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={[styles.bulletRuleText, { color: colors.textSecondary }]}>
                        Minimum 8 characters long — the more, the better
                      </Text>
                    </View>
                    <View style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={[styles.bulletRuleText, { color: colors.textSecondary }]}>
                        At least one lowercase & one uppercase character
                      </Text>
                    </View>
                    <View style={styles.bulletRow}>
                      <View style={styles.bulletDot} />
                      <Text style={[styles.bulletRuleText, { color: colors.textSecondary }]}>
                        At least one number, symbol, or whitespace character
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[styles.saveChangesBtn, { backgroundColor: '#09090b' }]}
                    onPress={() => {
                      setSavedSecurityMsg(true);
                      setTimeout(() => setSavedSecurityMsg(false), 2500);
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.saveChangesBtnText}>Save Changes</Text>
                  </TouchableOpacity>

                  {savedSecurityMsg && (
                    <Text style={{ marginTop: 8, color: '#16a34a', fontSize: 12, fontFamily: 'Manrope_400Regular' }}>
                      ✓ Password updated successfully.
                    </Text>
                  )}
                </View>

                {/* Two-steps verification Card */}
                <View
                  style={[
                    styles.contentCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radiusValues.md,
                      marginTop: 16,
                    },
                  ]}
                >
                  <View style={styles.twoStepHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Two-steps verification</Text>
                      <Text style={[styles.cardSubText, { color: colors.textSecondary, marginTop: 4 }]}>
                        Keep your account secure with authentication step.
                      </Text>
                    </View>
                    <Switch
                      value={twoFactorEnabled}
                      onValueChange={setTwoFactorEnabled}
                      trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                      thumbColor="#ffffff"
                    />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 }}>
                    <Text style={[styles.cardSubText, { color: colors.textMuted }]}>
                      {twoFactorEnabled ? 'Two-factor authentication is active.' : 'Two-factor authentication is not enabled yet.'}
                    </Text>
                    <TouchableOpacity style={styles.buyNowBtn} activeOpacity={0.85}>
                      <Text style={styles.buyNowBtnText}>Buy Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* TAB 3: BILLING & PLANS (SCREENSHOT 2)                             */}
            {/* ───────────────────────────────────────────────────────────────── */}
            {activeTab === 'Billing & Plans' && (
              <View style={styles.tabContentBlock}>
                {/* Current Plan Card */}
                <View
                  style={[
                    styles.contentCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radiusValues.md,
                    },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Current Plan</Text>

                  <View style={styles.planHeaderRow}>
                    <View>
                      <Text style={[styles.planNameTitle, { color: colors.textPrimary }]}>{plan}</Text>
                      <Text style={[styles.planSubDesc, { color: colors.textSecondary }]}>
                        {plan} plan · Auto Debit
                      </Text>
                    </View>

                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                        <Text style={[styles.planPriceNumber, { color: colors.textPrimary }]}>$499</Text>
                        <Text style={[styles.planPriceUnit, { color: colors.textSecondary }]}>/month</Text>
                      </View>
                      <TouchableOpacity
                        style={[styles.upgradePlanBtn, { borderColor: colors.border }]}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.upgradePlanBtnText, { color: colors.textPrimary }]}>Upgrade Plan</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Days progress bar */}
                  <View style={styles.planDaysBlock}>
                    <View style={styles.planDaysLabelRow}>
                      <Text style={[styles.planDaysLabel, { color: colors.textSecondary }]}>Days</Text>
                      <Text style={[styles.planDaysCount, { color: colors.textPrimary }]}>8 of 30 Days</Text>
                    </View>
                    <View style={styles.planDaysTrack}>
                      <View style={[styles.planDaysFill, { width: '27%', backgroundColor: '#09090b' }]} />
                    </View>
                    <Text style={[styles.planDaysPercentText, { color: colors.textMuted }]}>
                      27% of billing period used
                    </Text>
                  </View>

                  {/* Features Checklist */}
                  <View style={styles.featuresChecklistGrid}>
                    <View style={styles.featureItem}>
                      <Check size={14} color="#16a34a" />
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>Unlimited Users</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={14} color="#16a34a" />
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>1TB storage</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={14} color="#16a34a" />
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>24/7 Support</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={14} color="#16a34a" />
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>Advanced Analytics</Text>
                    </View>
                    <View style={styles.featureItem}>
                      <Check size={14} color="#16a34a" />
                      <Text style={[styles.featureText, { color: colors.textSecondary }]}>SLA</Text>
                    </View>
                  </View>
                </View>

                {/* Billing Details Card */}
                <View
                  style={[
                    styles.contentCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radiusValues.md,
                      marginTop: 16,
                    },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Billing Details</Text>

                  <View style={styles.billingGrid}>
                    <View style={[styles.billingCol, isDesktop && { flex: 1 }]}>
                      <Text style={[styles.billingLabel, { color: colors.textSecondary }]}>Company</Text>
                      <Text style={[styles.billingValue, { color: colors.textPrimary }]}>Skinder PVT LTD</Text>
                    </View>
                    <View style={[styles.billingCol, isDesktop && { flex: 1 }]}>
                      <Text style={[styles.billingLabel, { color: colors.textSecondary }]}>Billing Email</Text>
                      <Text style={[styles.billingValue, { color: colors.textPrimary }]}>{displayEmail}</Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 12 }}>
                    <View style={[styles.billingGrid, { flex: 1, marginTop: 0 }]}>
                      <View style={[styles.billingCol, isDesktop && { flex: 1 }]}>
                        <Text style={[styles.billingLabel, { color: colors.textSecondary }]}>Tax ID</Text>
                        <Text style={[styles.billingValue, { color: colors.textPrimary }]}>Tax-8800</Text>
                      </View>
                      <View style={[styles.billingCol, isDesktop && { flex: 1 }]}>
                        <Text style={[styles.billingLabel, { color: colors.textSecondary }]}>Country</Text>
                        <Text style={[styles.billingValue, { color: colors.textPrimary }]}>United States</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.buyNowBtn} activeOpacity={0.85}>
                      <Text style={styles.buyNowBtnText}>Buy Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* TAB 4: NOTIFICATIONS (SCREENSHOT 5)                               */}
            {/* ───────────────────────────────────────────────────────────────── */}
            {activeTab === 'Notifications' && (
              <View style={styles.tabContentBlock}>
                <View
                  style={[
                    styles.contentCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radiusValues.md,
                    },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Notifications</Text>
                  <Text style={[styles.cardSubText, { color: colors.textSecondary, marginTop: 4, marginBottom: 16 }]}>
                    Choose how {user.name} receives notifications for account activity.
                  </Text>

                  {/* Channel Matrix Table */}
                  <View style={styles.notifMatrixTable}>
                    {/* Header */}
                    <View style={[styles.notifMatrixHeader, { borderBottomColor: colors.border }]}>
                      <Text style={[styles.notifColHeader, { flex: 1, color: colors.textMuted }]}>Type</Text>
                      <View style={styles.channelCol}>
                        <Mail size={14} color={colors.textSecondary} />
                        <Text style={[styles.channelColText, { color: colors.textSecondary }]}>Email</Text>
                      </View>
                      <View style={styles.channelCol}>
                        <Laptop size={14} color={colors.textSecondary} />
                        <Text style={[styles.channelColText, { color: colors.textSecondary }]}>Browser</Text>
                      </View>
                      <View style={styles.channelCol}>
                        <Smartphone size={14} color={colors.textSecondary} />
                        <Text style={[styles.channelColText, { color: colors.textSecondary }]}>App</Text>
                      </View>
                    </View>

                    {/* Row 1 */}
                    <View style={[styles.notifMatrixRow, { borderBottomColor: colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.notifRowTitle, { color: colors.textPrimary }]}>New for you</Text>
                        <Text style={[styles.notifRowSub, { color: colors.textSecondary }]}>
                          Email when someone follows you or mentions you.
                        </Text>
                      </View>
                      <View style={styles.channelSwitchCol}>
                        <Switch
                          value={notifState.newForYou.email}
                          onValueChange={(val) =>
                            setNotifState((p) => ({ ...p, newForYou: { ...p.newForYou, email: val } }))
                          }
                          trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                          thumbColor="#ffffff"
                        />
                      </View>
                      <View style={styles.channelSwitchCol}>
                        <Switch
                          value={notifState.newForYou.browser}
                          onValueChange={(val) =>
                            setNotifState((p) => ({ ...p, newForYou: { ...p.newForYou, browser: val } }))
                          }
                          trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                          thumbColor="#ffffff"
                        />
                      </View>
                      <View style={styles.channelSwitchCol}>
                        <Switch
                          value={notifState.newForYou.app}
                          onValueChange={(val) =>
                            setNotifState((p) => ({ ...p, newForYou: { ...p.newForYou, app: val } }))
                          }
                          trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                          thumbColor="#ffffff"
                        />
                      </View>
                    </View>

                    {/* Row 2 */}
                    <View style={[styles.notifMatrixRow, { borderBottomColor: colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.notifRowTitle, { color: colors.textPrimary }]}>Account activity</Text>
                        <Text style={[styles.notifRowSub, { color: colors.textSecondary }]}>
                          Email when your account has new activity or security alerts.
                        </Text>
                      </View>
                      <View style={styles.channelSwitchCol}>
                        <Switch
                          value={notifState.accountActivity.email}
                          onValueChange={(val) =>
                            setNotifState((p) => ({ ...p, accountActivity: { ...p.accountActivity, email: val } }))
                          }
                          trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                          thumbColor="#ffffff"
                        />
                      </View>
                      <View style={styles.channelSwitchCol}>
                        <Switch
                          value={notifState.accountActivity.browser}
                          onValueChange={(val) =>
                            setNotifState((p) => ({ ...p, accountActivity: { ...p.accountActivity, browser: val } }))
                          }
                          trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                          thumbColor="#ffffff"
                        />
                      </View>
                      <View style={styles.channelSwitchCol}>
                        <Switch
                          value={notifState.accountActivity.app}
                          onValueChange={(val) =>
                            setNotifState((p) => ({ ...p, accountActivity: { ...p.accountActivity, app: val } }))
                          }
                          trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                          thumbColor="#ffffff"
                        />
                      </View>
                    </View>

                    {/* Row 3 */}
                    <View style={[styles.notifMatrixRow, { borderBottomColor: colors.border }]}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.notifRowTitle, { color: colors.textPrimary }]}>A new browser used to sign in</Text>
                        <Text style={[styles.notifRowSub, { color: colors.textSecondary }]}>
                          Email when a new browser is used to sign in.
                        </Text>
                      </View>
                      <View style={styles.channelSwitchCol}>
                        <Switch
                          value={notifState.newBrowser.email}
                          onValueChange={(val) =>
                            setNotifState((p) => ({ ...p, newBrowser: { ...p.newBrowser, email: val } }))
                          }
                          trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                          thumbColor="#ffffff"
                        />
                      </View>
                      <View style={styles.channelSwitchCol}>
                        <Switch
                          value={notifState.newBrowser.browser}
                          onValueChange={(val) =>
                            setNotifState((p) => ({ ...p, newBrowser: { ...p.newBrowser, browser: val } }))
                          }
                          trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                          thumbColor="#ffffff"
                        />
                      </View>
                      <View style={styles.channelSwitchCol}>
                        <Switch
                          value={notifState.newBrowser.app}
                          onValueChange={(val) =>
                            setNotifState((p) => ({ ...p, newBrowser: { ...p.newBrowser, app: val } }))
                          }
                          trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                          thumbColor="#ffffff"
                        />
                      </View>
                    </View>

                    {/* Row 4 */}
                    <View style={styles.notifMatrixRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.notifRowTitle, { color: colors.textPrimary }]}>A new device is linked</Text>
                        <Text style={[styles.notifRowSub, { color: colors.textSecondary }]}>
                          Email when a new device is linked to your account.
                        </Text>
                      </View>
                      <View style={styles.channelSwitchCol}>
                        <Switch
                          value={notifState.newDevice.email}
                          onValueChange={(val) =>
                            setNotifState((p) => ({ ...p, newDevice: { ...p.newDevice, email: val } }))
                          }
                          trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                          thumbColor="#ffffff"
                        />
                      </View>
                      <View style={styles.channelSwitchCol}>
                        <Switch
                          value={notifState.newDevice.browser}
                          onValueChange={(val) =>
                            setNotifState((p) => ({ ...p, newDevice: { ...p.newDevice, browser: val } }))
                          }
                          trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                          thumbColor="#ffffff"
                        />
                      </View>
                      <View style={styles.channelSwitchCol}>
                        <Switch
                          value={notifState.newDevice.app}
                          onValueChange={(val) =>
                            setNotifState((p) => ({ ...p, newDevice: { ...p.newDevice, app: val } }))
                          }
                          trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                          thumbColor="#ffffff"
                        />
                      </View>
                    </View>
                  </View>

                  <View style={{ alignItems: 'flex-end', marginTop: 16 }}>
                    <TouchableOpacity
                      style={[styles.saveChangesBtn, { backgroundColor: '#09090b' }]}
                      onPress={() => {
                        setSavedNotifMsg(true);
                        setTimeout(() => setSavedNotifMsg(false), 2500);
                      }}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.saveChangesBtnText}>Save Changes</Text>
                    </TouchableOpacity>
                  </View>

                  {savedNotifMsg && (
                    <Text style={{ marginTop: 8, color: '#16a34a', fontSize: 12, fontFamily: 'Manrope_400Regular', textAlign: 'right' }}>
                      ✓ Notification preferences saved.
                    </Text>
                  )}
                </View>

                {/* Buy Now Button below card matching screenshot 5 */}
                <View style={{ alignItems: 'flex-end', marginTop: 16 }}>
                  <TouchableOpacity style={styles.buyNowBtn} activeOpacity={0.85}>
                    <Text style={styles.buyNowBtnText}>Buy Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* ───────────────────────────────────────────────────────────────── */}
            {/* TAB 5: CONNECTIONS (SCREENSHOT 4)                                 */}
            {/* ───────────────────────────────────────────────────────────────── */}
            {activeTab === 'Connections' && (
              <View style={styles.tabContentBlock}>
                {/* Connected Accounts Card */}
                <View
                  style={[
                    styles.contentCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radiusValues.md,
                    },
                  ]}
                >
                  <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Connected Accounts</Text>
                  <Text style={[styles.cardSubText, { color: colors.textSecondary, marginTop: 4, marginBottom: 16 }]}>
                    Display content from your connected accounts on your site
                  </Text>

                  {/* Google */}
                  <View style={[styles.connectionRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.connectionIconBadge}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#ea4335' }}>G</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.connectionTitle, { color: colors.textPrimary }]}>Google</Text>
                      <Text style={[styles.connectionSub, { color: colors.textSecondary }]}>Calendar and contacts</Text>
                    </View>
                    <Switch
                      value={connections.google}
                      onValueChange={(val) => setConnections((p) => ({ ...p, google: val }))}
                      trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  {/* Slack */}
                  <View style={[styles.connectionRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.connectionIconBadge}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#4a154b' }}>#</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.connectionTitle, { color: colors.textPrimary }]}>Slack</Text>
                      <Text style={[styles.connectionSub, { color: colors.textSecondary }]}>Communication</Text>
                    </View>
                    <Switch
                      value={connections.slack}
                      onValueChange={(val) => setConnections((p) => ({ ...p, slack: val }))}
                      trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  {/* Github */}
                  <View style={[styles.connectionRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.connectionIconBadge}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#18181b' }}>git</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.connectionTitle, { color: colors.textPrimary }]}>Github</Text>
                      <Text style={[styles.connectionSub, { color: colors.textSecondary }]}>Manage your Git repository</Text>
                    </View>
                    <Switch
                      value={connections.github}
                      onValueChange={(val) => setConnections((p) => ({ ...p, github: val }))}
                      trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  {/* Mailchimp */}
                  <View style={[styles.connectionRow, { borderBottomColor: colors.border }]}>
                    <View style={styles.connectionIconBadge}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#ffe01b' }}>🐒</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.connectionTitle, { color: colors.textPrimary }]}>Mailchimp</Text>
                      <Text style={[styles.connectionSub, { color: colors.textSecondary }]}>Email marketing service</Text>
                    </View>
                    <Switch
                      value={connections.mailchimp}
                      onValueChange={(val) => setConnections((p) => ({ ...p, mailchimp: val }))}
                      trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                      thumbColor="#ffffff"
                    />
                  </View>

                  {/* Asana */}
                  <View style={styles.connectionRow}>
                    <View style={styles.connectionIconBadge}>
                      <Text style={{ fontSize: 14, fontWeight: '500', color: '#f06a6a' }}>•••</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.connectionTitle, { color: colors.textPrimary }]}>Asana</Text>
                      <Text style={[styles.connectionSub, { color: colors.textSecondary }]}>Communication</Text>
                    </View>
                    <Switch
                      value={connections.asana}
                      onValueChange={(val) => setConnections((p) => ({ ...p, asana: val }))}
                      trackColor={{ false: '#e4e4e7', true: '#09090b' }}
                      thumbColor="#ffffff"
                    />
                  </View>
                </View>

                {/* Social Accounts Card */}
                <View
                  style={[
                    styles.contentCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radiusValues.md,
                      marginTop: 16,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    },
                  ]}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.cardTitle, { color: colors.textPrimary }]}>Social Accounts</Text>
                    <Text style={[styles.cardSubText, { color: colors.textSecondary, marginTop: 4 }]}>
                      Display content from social accounts on your site
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.buyNowBtn} activeOpacity={0.85}>
                    <Text style={styles.buyNowBtnText}>Buy Now</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
  },
  topNavBar: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  navBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  navBackText: {
    fontSize: 13,
    fontFamily: 'Manrope_400Regular',
  },
  navCenterTitle: {
    alignItems: 'center',
  },
  navTitleText: {
    fontSize: 14,
    fontFamily: 'Manrope_500Medium',
  },
  navSubtitleText: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
  },
  closeBtn: {
    padding: 6,
    borderRadius: 4,
  },

  mainScrollView: {
    flex: 1,
  },
  mainScrollContent: {
    padding: 20,
    flexDirection: 'row',
    gap: 20,
  },

  // ── Left Sidebar Profile Card
  leftSidebarCard: {
    borderWidth: 1,
    padding: 20,
    alignSelf: 'flex-start',
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 90,
    height: 90,
    borderRadius: 45,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userName: {
    fontSize: 16,
    fontFamily: 'Manrope_500Medium',
    marginBottom: 6,
    textAlign: 'center',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 6,
  },
  roleBadgeText: {
    fontSize: 11,
    fontFamily: 'Manrope_500Medium',
  },

  quickStatsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  quickStatBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  quickStatNumber: {
    fontSize: 18,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 2,
  },
  quickStatLabel: {
    fontSize: 10.5,
    fontFamily: 'Manrope_400Regular',
  },

  detailsSection: {
    gap: 12,
  },
  detailsHeading: {
    fontSize: 13,
    fontFamily: 'Manrope_500Medium',
    marginBottom: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailKey: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
  },
  detailVal: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    maxWidth: 160,
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
  },

  // ── Right Content Area
  rightContentArea: {
    minWidth: 320,
  },
  tabsHeaderContainer: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 3,
    marginBottom: 16,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  segmentedTabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  segmentedTabBtnActive: {
    borderWidth: 1,
    elevation: 1,
  },
  segmentedTabText: {
    fontSize: 12.5,
  },

  tabContentBlock: {
    gap: 16,
  },
  contentCard: {
    borderWidth: 1,
    padding: 20,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'Manrope_500Medium',
  },
  cardSubText: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
  },

  // Project List Table
  projectListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'wrap',
    gap: 10,
  },
  projectSearchBox: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 180,
  },
  projectSearchInput: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    padding: 0,
  },
  tableWrapper: {
    borderWidth: 0,
    marginBottom: 12,
  },
  projectTable: {
    minWidth: 680,
  },
  projectTableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  checkboxOutline: {
    width: 15,
    height: 15,
    borderWidth: 1,
    borderRadius: 3,
  },
  pThText: {
    fontSize: 10.5,
    fontFamily: 'Manrope_400Regular',
    letterSpacing: 0.4,
    paddingHorizontal: 8,
  },
  projectTableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  pTdProjectCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 8,
  },
  projectLogoBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectLogoText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  pItemTitle: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
  },
  pItemSub: {
    fontSize: 10.5,
    fontFamily: 'Manrope_400Regular',
  },
  pLeaderText: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
    paddingHorizontal: 8,
  },
  teamStackRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  miniAvatar: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniAvatarText: {
    color: '#ffffff',
    fontSize: 9,
  },
  miniAvatarCount: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -6,
  },
  miniAvatarCountText: {
    fontSize: 9,
  },
  progressCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#f4f4f5',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressPctText: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
    width: 32,
  },
  pPaginationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
    flexWrap: 'wrap',
    gap: 10,
  },
  pEntriesText: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
  },
  pPageNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pNavBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pNavBtnText: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
  },
  pPageNumber: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  pPageNumberText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500',
  },

  // Activity Timeline
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  buyNowBtn: {
    backgroundColor: '#09090b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  buyNowBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '500',
  },
  timelineList: {
    gap: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  timelineBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 5,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 12.5,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 2,
  },
  timelineSub: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
  },
  timelineTime: {
    fontSize: 10.5,
    fontFamily: 'Manrope_400Regular',
  },

  // Security
  pwInputsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  inputGroup: {
    minWidth: 200,
  },
  inputLabel: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 6,
  },
  textInputField: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
  },
  bulletRulesList: {
    marginVertical: 14,
    gap: 6,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#94a3b8',
  },
  bulletRuleText: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
  },
  saveChangesBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  saveChangesBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '500',
  },
  twoStepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // Billing & Plans
  planHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 14,
    marginBottom: 16,
  },
  planNameTitle: {
    fontSize: 17,
    fontFamily: 'Manrope_500Medium',
  },
  planSubDesc: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
    marginTop: 2,
  },
  planPriceNumber: {
    fontSize: 22,
    fontFamily: 'Manrope_400Regular',
  },
  planPriceUnit: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
  },
  upgradePlanBtn: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
  },
  upgradePlanBtnText: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
  },
  planDaysBlock: {
    marginBottom: 16,
  },
  planDaysLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  planDaysLabel: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
  },
  planDaysCount: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
  },
  planDaysTrack: {
    height: 6,
    backgroundColor: '#f4f4f5',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  planDaysFill: {
    height: '100%',
    borderRadius: 3,
  },
  planDaysPercentText: {
    fontSize: 10.5,
    fontFamily: 'Manrope_400Regular',
  },
  featuresChecklistGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f5',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: 160,
  },
  featureText: {
    fontSize: 11.5,
    fontFamily: 'Manrope_400Regular',
  },
  billingGrid: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 12,
    flexWrap: 'wrap',
  },
  billingCol: {
    minWidth: 180,
  },
  billingLabel: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 2,
  },
  billingValue: {
    fontSize: 12.5,
    fontFamily: 'Manrope_400Regular',
  },

  // Notifications
  notifMatrixTable: {
    borderWidth: 0,
  },
  notifMatrixHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
  },
  notifColHeader: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
  },
  channelCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    width: 80,
    justifyContent: 'center',
  },
  channelColText: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
  },
  notifMatrixRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  notifRowTitle: {
    fontSize: 12,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 2,
  },
  notifRowSub: {
    fontSize: 10.5,
    fontFamily: 'Manrope_400Regular',
  },
  channelSwitchCol: {
    width: 80,
    alignItems: 'center',
  },

  // Connections
  connectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    paddingVertical: 12,
    gap: 12,
  },
  connectionIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f4f4f5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  connectionTitle: {
    fontSize: 12.5,
    fontFamily: 'Manrope_400Regular',
    marginBottom: 1,
  },
  connectionSub: {
    fontSize: 11,
    fontFamily: 'Manrope_400Regular',
  },
});
