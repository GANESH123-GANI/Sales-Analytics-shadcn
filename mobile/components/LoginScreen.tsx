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
  Layers,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Sparkles,
} from 'lucide-react-native';
import { THEME } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export const LoginScreen: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setErrorMessage('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMessage(res.message || 'Invalid email or password.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMessage('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screenContainer}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.card}>
          {/* Brand Header */}
          <View style={styles.header}>
            <View style={styles.logoBadge}>
              <Layers size={22} color={THEME.colors.primaryForeground} />
            </View>
            <View style={styles.brandRow}>
              <Text style={styles.brandTitle}>Enterprise Corp</Text>
              <View style={styles.proTag}>
                <Text style={styles.proTagText}>Pro</Text>
              </View>
            </View>
            <Text style={styles.subTitle}>Sales Analytics Platform</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>Sign in to your account</Text>
            <Text style={styles.welcomeSub}>Enter your enterprise credentials below</Text>

            {/* Error banner */}
            {errorMessage ? (
              <View style={styles.errorBox}>
                <AlertCircle size={15} color="#ef4444" />
                <Text style={styles.errorText}>{errorMessage}</Text>
              </View>
            ) : null}

            {/* Email Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={16} color={THEME.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="name@enterprise.com"
                  placeholderTextColor={THEME.colors.textMuted}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  {...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {})}
                />
              </View>
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.inputLabel}>Password</Text>
                <Text style={styles.forgotText}>Encrypted (Neon SSL)</Text>
              </View>
              <View style={styles.inputWrapper}>
                <Lock size={16} color={THEME.colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, { paddingRight: 40 }]}
                  placeholder="Enter your password"
                  placeholderTextColor={THEME.colors.textMuted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (errorMessage) setErrorMessage('');
                  }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onSubmitEditing={handleLogin}
                  {...(Platform.OS === 'web' ? ({ outlineStyle: 'none' } as any) : {})}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  {showPassword ? (
                    <EyeOff size={16} color={THEME.colors.textMuted} />
                  ) : (
                    <Eye size={16} color={THEME.colors.textMuted} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <View style={styles.submitBtnContent}>
                  <Text style={styles.submitBtnText}>Sign In</Text>
                  <ArrowRight size={15} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>

            {/* Demo Accounts Quick-Fill Section */}
            <View style={styles.demoSection}>
              <View style={styles.demoDividerRow}>
                <View style={styles.demoDividerLine} />
                <View style={styles.demoDividerPill}>
                  <Sparkles size={11} color={THEME.colors.textMuted} />
                  <Text style={styles.demoDividerText}>1-Click Demo Accounts</Text>
                </View>
                <View style={styles.demoDividerLine} />
              </View>

              <View style={styles.demoChipsRow}>
                <TouchableOpacity
                  style={styles.demoChip}
                  onPress={() => fillDemo('admin@enterprise.com', 'admin123')}
                  activeOpacity={0.75}
                >
                  <Text style={styles.demoChipTitle}>Admin</Text>
                  <Text style={styles.demoChipSub}>Ganesh Paidi</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.demoChip}
                  onPress={() => fillDemo('manager@enterprise.com', 'manager123')}
                  activeOpacity={0.75}
                >
                  <Text style={styles.demoChipTitle}>Sales Manager</Text>
                  <Text style={styles.demoChipSub}>Aditya Rao</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Footer Security Badge */}
          <View style={styles.footer}>
            <ShieldCheck size={14} color="#059669" />
            <Text style={styles.footerText}>
              Protected by JWT & Neon PostgreSQL Encryption
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 32,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.xl,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    padding: 28,
    ...THEME.shadow.card,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 44,
    height: 44,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    ...THEME.shadow.card,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
  },
  proTag: {
    backgroundColor: THEME.colors.secondary,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: THEME.radius.xs,
    borderWidth: 1,
    borderColor: THEME.colors.border,
  },
  proTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: THEME.colors.textSecondary,
    fontFamily: THEME.fontFamily.semibold,
  },
  subTitle: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontFamily: THEME.fontFamily.medium,
    marginTop: 2,
  },
  formContainer: {
    width: '100%',
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
  welcomeSub: {
    fontSize: 12,
    color: THEME.colors.textMuted,
    fontFamily: THEME.fontFamily.regular,
    marginTop: 2,
    marginBottom: 18,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
    borderRadius: THEME.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 12,
    color: '#b91c1c',
    fontFamily: THEME.fontFamily.medium,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
    color: THEME.colors.textSecondary,
    marginBottom: 6,
  },
  forgotText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontFamily: THEME.fontFamily.medium,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    backgroundColor: THEME.colors.card,
    position: 'relative',
  },
  inputIcon: {
    marginLeft: 12,
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    height: 40,
    fontSize: 13,
    color: THEME.colors.textPrimary,
    fontFamily: THEME.fontFamily.regular,
    paddingRight: 12,
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  submitBtn: {
    backgroundColor: THEME.colors.primary,
    borderRadius: THEME.radius.md,
    height: 42,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 6,
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  submitBtnText: {
    color: THEME.colors.primaryForeground,
    fontSize: 13,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
  },
  demoSection: {
    marginTop: 22,
  },
  demoDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  demoDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: THEME.colors.border,
  },
  demoDividerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
  },
  demoDividerText: {
    fontSize: 11,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
    color: THEME.colors.textMuted,
  },
  demoChipsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  demoChip: {
    flex: 1,
    backgroundColor: THEME.colors.muted,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    borderRadius: THEME.radius.md,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
  },
  demoChipTitle: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
  demoChipSub: {
    fontSize: 10,
    color: THEME.colors.textMuted,
    fontFamily: THEME.fontFamily.medium,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: THEME.colors.borderSubtle,
  },
  footerText: {
    fontSize: 11,
    color: THEME.colors.textMuted,
    fontFamily: THEME.fontFamily.medium,
  },
});
