import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import {
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  Sparkles,
  CheckCircle2,
  Server,
  Fingerprint,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

export const AdminLoginScreen: React.FC = () => {
  const { adminLogin, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated as admin
  React.useEffect(() => {
    if (isAuthenticated && isAdmin) {
      router.replace('/admin' as any);
    }
  }, [isAuthenticated, isAdmin]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleFillAdminCredentials = () => {
    setEmail('admin@enterprise.com');
    setPassword('Admin@123');
    setErrorMessage('');
  };

  const handleAdminAuth = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please provide both administrator email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin(email, password);
      if (!res.success) {
        setErrorMessage(
          res.message ||
            'Access Denied: Administrator privileges required to enter this portal.'
        );
      } else {
        setSuccessMessage('Administrator authenticated. Loading Admin Console...');
        setTimeout(() => {
          router.replace('/admin' as any);
        }, 300);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed due to a server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screenContainer}
    >
      {/* Background ambient pattern */}
      <View style={styles.ambientGlow} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Navigation Bar / Ghost Return Button */}
        <View style={styles.navTopRow}>
          <TouchableOpacity
            style={styles.ghostNavBtn}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.7}
          >
            <ArrowLeft size={14} color="#71717a" />
            <Text style={styles.ghostNavBtnText}>Back to User Login</Text>
          </TouchableOpacity>

          <View style={styles.sslBadge}>
            <View style={styles.pulseDot} />
            <Text style={styles.sslBadgeText}>TLS 1.3 SECURE</Text>
          </View>
        </View>

        {/* ─── SHADCN UI CARD ─── */}
        <View style={styles.shadcnCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerIconRow}>
              <View style={styles.iconSquircle}>
                <ShieldCheck size={22} color="#09090b" />
              </View>
              <View style={styles.outlineBadge}>
                <Sparkles size={11} color="#6366f1" style={{ marginRight: 4 }} />
                <Text style={styles.outlineBadgeText}>SYSTEM CONSOLE</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>Admin Authentication</Text>
            <Text style={styles.cardDescription}>
              Enter your elevated credentials to manage multi-tenant security, user directories, and system audit logs.
            </Text>
          </View>

          {/* Quick-Fill Helper Callout (Shadcn Alert style) */}
          <View style={styles.alertHelper}>
            <View style={styles.alertHelperLeft}>
              <Fingerprint size={16} color="#6366f1" style={{ marginTop: 2 }} />
              <View style={{ flex: 1 }}>
                <Text style={styles.alertHelperTitle}>Default System Credentials</Text>
                <Text style={styles.alertHelperDesc}>
                  admin@enterprise.com • Admin@123
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.autoFillBtn}
              onPress={handleFillAdminCredentials}
              activeOpacity={0.7}
            >
              <Text style={styles.autoFillBtnText}>Auto-fill</Text>
            </TouchableOpacity>
          </View>

          {/* Error Alert */}
          {errorMessage ? (
            <View style={styles.alertDestructive}>
              <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />
              <Text style={styles.alertDestructiveText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Success Alert */}
          {successMessage ? (
            <View style={styles.alertSuccess}>
              <CheckCircle2 size={15} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} />
              <Text style={styles.alertSuccessText}>{successMessage}</Text>
            </View>
          ) : null}

          {/* Card Content: Form Controls */}
          <View style={styles.cardContent}>
            {/* Email Label + Input */}
            <View style={styles.formItem}>
              <Text style={styles.formLabel}>Admin Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={15} color="#a1a1aa" style={styles.inputLeadingIcon} />
                <TextInput
                  style={styles.shadcnInput}
                  placeholder="admin@enterprise.com"
                  placeholderTextColor="#a1a1aa"
                  value={email}
                  onChangeText={(val) => {
                    setEmail(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password Label + Input */}
            <View style={styles.formItem}>
              <View style={styles.labelRow}>
                <Text style={styles.formLabel}>Master Password</Text>
                <Text style={styles.labelHint}>Bcrypt verified</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Lock size={15} color="#a1a1aa" style={styles.inputLeadingIcon} />
                <TextInput
                  style={[styles.shadcnInput, { paddingRight: 40 }]}
                  placeholder="••••••••••••"
                  placeholderTextColor="#a1a1aa"
                  value={password}
                  onChangeText={(val) => {
                    setPassword(val);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={handleAdminAuth}
                />
                <TouchableOpacity
                  style={styles.eyeToggle}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {showPassword ? (
                    <EyeOff size={15} color="#71717a" />
                  ) : (
                    <Eye size={15} color="#71717a" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Shadcn Primary Action Button */}
            <TouchableOpacity
              style={[styles.shadcnPrimaryBtn, loading && styles.btnDisabled]}
              onPress={handleAdminAuth}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.shadcnPrimaryBtnText}>Enter Admin Console</Text>
                  <ArrowRight size={15} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Separator / Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>SECURITY VERIFICATION</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Card Footer: Security Policy */}
          <View style={styles.cardFooter}>
            <View style={styles.securityPill}>
              <Server size={13} color="#71717a" />
              <Text style={styles.securityPillText}>
                Restricted to verified <Text style={styles.codeText}>role === 'admin'</Text> tokens. Standard accounts are halted.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer Links */}
        <View style={styles.screenFooter}>
          <TouchableOpacity
            style={styles.userSwitchBtn}
            onPress={() => router.push('/login' as any)}
            activeOpacity={0.7}
          >
            <Text style={styles.userSwitchText}>
              Not an administrator? <Text style={styles.userSwitchHighlight}>Sign in as Standard User →</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  ambientGlow: {
    position: 'absolute',
    top: -120,
    alignSelf: 'center',
    width: 600,
    height: 350,
    borderRadius: 300,
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 36,
  },
  navTopRow: {
    width: '100%',
    maxWidth: 440,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  ghostNavBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  ghostNavBtnText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#52525b',
  },
  sslBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 9999,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10b981',
  },
  sslBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#52525b',
    letterSpacing: 0.5,
  },

  // ── Shadcn Card
  shadcnCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e4e4e7',
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 2,
  },

  // ── Card Header
  cardHeader: {
    marginBottom: 18,
  },
  headerIconRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconSquircle: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f3ff',
    borderWidth: 1,
    borderColor: '#ddd6fe',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  outlineBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#6366f1',
    letterSpacing: 0.5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#09090b',
    letterSpacing: -0.4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#71717a',
    marginTop: 4,
    lineHeight: 18,
  },

  // ── Alert Callout (Shadcn Alert)
  alertHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  alertHelperLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 9,
    flex: 1,
    paddingRight: 8,
  },
  alertHelperTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#18181b',
  },
  alertHelperDesc: {
    fontSize: 11,
    color: '#71717a',
    marginTop: 1,
    fontFamily: 'monospace',
  },
  autoFillBtn: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d4d4d8',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  autoFillBtnText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#18181b',
  },

  // ── Destructive & Success Alerts
  alertDestructive: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff1f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  alertDestructiveText: {
    fontSize: 12,
    color: '#e11d48',
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },
  alertSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  alertSuccessText: {
    fontSize: 12,
    color: '#047857',
    flex: 1,
    lineHeight: 16,
    fontWeight: '500',
  },

  // ── Card Content: Inputs
  cardContent: {
    gap: 14,
  },
  formItem: {
    gap: 5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formLabel: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#09090b',
  },
  labelHint: {
    fontSize: 10.5,
    color: '#a1a1aa',
    fontFamily: 'monospace',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 6,
    height: 38,
    paddingHorizontal: 10,
  },
  inputLeadingIcon: {
    marginRight: 8,
  },
  shadcnInput: {
    flex: 1,
    height: '100%',
    fontSize: 13,
    color: '#09090b',
  },
  eyeToggle: {
    position: 'absolute',
    right: 10,
    padding: 4,
  },

  // ── Action Button
  shadcnPrimaryBtn: {
    backgroundColor: '#18181b',
    height: 40,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  shadcnPrimaryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: 0.1,
  },

  // ── Separator
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#f4f4f5',
  },
  dividerText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#a1a1aa',
    letterSpacing: 0.6,
  },

  // ── Card Footer
  cardFooter: {
    paddingTop: 2,
  },
  securityPill: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#f4f4f5',
    padding: 10,
    borderRadius: 6,
  },
  securityPillText: {
    fontSize: 11,
    color: '#71717a',
    lineHeight: 16,
    flex: 1,
  },
  codeText: {
    fontFamily: 'monospace',
    color: '#18181b',
    backgroundColor: '#e4e4e7',
    fontSize: 10.5,
  },

  // ── Screen Footer
  screenFooter: {
    marginTop: 18,
    alignItems: 'center',
  },
  userSwitchBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  userSwitchText: {
    fontSize: 12.5,
    color: '#71717a',
  },
  userSwitchHighlight: {
    color: '#18181b',
    fontWeight: '500',
  },
});
