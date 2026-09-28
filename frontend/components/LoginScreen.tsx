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
  User as UserIcon,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';

interface LoginScreenProps {
  initialMode?: 'login' | 'register';
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ initialMode = 'login' }) => {
  const { login, register, isAuthenticated } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated]);

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAuth = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMessage('Full name is required.');
        return;
      }
      if (password.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage('Passwords do not match.');
        return;
      }

      setLoading(true);
      try {
        const res = await register(name, email, password, confirmPassword);
        if (!res.success) {
          setErrorMessage(res.message || 'Registration failed.');
        } else {
          setSuccessMessage('Account registered successfully! Logging you in...');
          setTimeout(() => {
            router.replace('/');
          }, 400);
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'An error occurred during registration.');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(true);
      try {
        const res = await login(email, password);
        if (!res.success) {
          if (res.isSuspended) {
            setErrorMessage(res.message || 'Account access suspended. Please contact your administrator.');
          } else {
            setErrorMessage(res.message || 'Invalid email or password.');
          }
        } else {
          router.replace('/');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'An error occurred during authentication.');
      } finally {
        setLoading(false);
      }
    }
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
        {/* ─── SHADCN UI CARD ─── */}
        <View style={styles.shadcnCard}>
          {/* Card Header */}
          <View style={styles.cardHeader}>
            <View style={styles.headerTopRow}>
              <View style={styles.logoSquircle}>
                <Layers size={20} color="#09090b" />
              </View>
              <View style={styles.platformBadge}>
                <Sparkles size={10} color="#09090b" style={{ marginRight: 4 }} />
                <Text style={styles.platformBadgeText}>ENTERPRISE CLOUD</Text>
              </View>
            </View>

            <Text style={styles.cardTitle}>
              {mode === 'login' ? 'Sign In to Workspace' : 'Create an Account'}
            </Text>
            <Text style={styles.cardDescription}>
              {mode === 'login'
                ? 'Enter your email and password below to access your sales analytics.'
                : 'Enter your details below to create your tenant analytics account.'}
            </Text>
          </View>

          {/* Shadcn Tabs List (Segmented Toggle) */}
          <View style={styles.tabsList}>
            <TouchableOpacity
              style={[styles.tabsTrigger, mode === 'login' && styles.tabsTriggerActive]}
              onPress={() => {
                setMode('login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabsTriggerText, mode === 'login' && styles.tabsTriggerTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabsTrigger, mode === 'register' && styles.tabsTriggerActive]}
              onPress={() => {
                setMode('register');
                setErrorMessage('');
                setSuccessMessage('');
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabsTriggerText, mode === 'register' && styles.tabsTriggerTextActive]}>
                Sign Up
              </Text>
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

          {/* Form Content */}
          <View style={styles.cardContent}>
            {/* Name Field (Register Mode Only) */}
            {mode === 'register' && (
              <View style={styles.formItem}>
                <Text style={styles.formLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <UserIcon size={15} color="#a1a1aa" style={styles.inputLeadingIcon} />
                  <TextInput
                    style={styles.shadcnInput}
                    placeholder="John Doe"
                    placeholderTextColor="#a1a1aa"
                    value={name}
                    onChangeText={(val) => {
                      setName(val);
                      if (errorMessage) setErrorMessage('');
                    }}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

            {/* Email Field */}
            <View style={styles.formItem}>
              <Text style={styles.formLabel}>Email Address</Text>
              <View style={styles.inputWrapper}>
                <Mail size={15} color="#a1a1aa" style={styles.inputLeadingIcon} />
                <TextInput
                  style={styles.shadcnInput}
                  placeholder="name@example.com"
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

            {/* Password Field */}
            <View style={styles.formItem}>
              <View style={styles.labelRow}>
                <Text style={styles.formLabel}>Password</Text>
                {mode === 'register' && (
                  <Text style={styles.labelHint}>Min 6 characters</Text>
                )}
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
                  onSubmitEditing={handleAuth}
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

            {/* Confirm Password Field (Register Mode Only) */}
            {mode === 'register' && (
              <View style={styles.formItem}>
                <Text style={styles.formLabel}>Confirm Password</Text>
                <View style={styles.inputWrapper}>
                  <Lock size={15} color="#a1a1aa" style={styles.inputLeadingIcon} />
                  <TextInput
                    style={styles.shadcnInput}
                    placeholder="••••••••••••"
                    placeholderTextColor="#a1a1aa"
                    value={confirmPassword}
                    onChangeText={(val) => {
                      setConfirmPassword(val);
                      if (errorMessage) setErrorMessage('');
                    }}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    onSubmitEditing={handleAuth}
                  />
                </View>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.shadcnPrimaryBtn, loading && styles.btnDisabled]}
              onPress={handleAuth}
              disabled={loading}
              activeOpacity={0.88}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <View style={styles.btnContent}>
                  <Text style={styles.shadcnPrimaryBtnText}>
                    {mode === 'login' ? 'Sign In to Workspace' : 'Create Account'}
                  </Text>
                  <ArrowRight size={15} color="#ffffff" />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Separator */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Switch Mode Prompt */}
          <View style={styles.switchRow}>
            <Text style={styles.switchText}>
              {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMessage('');
                setSuccessMessage('');
              }}
            >
              <Text style={styles.switchLink}>
                {mode === 'login' ? 'Sign up now' : 'Sign in here'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Dedicated Admin Portal Link */}
        <View style={styles.adminLinkContainer}>
          <TouchableOpacity
            style={styles.adminOutlineBtn}
            onPress={() => router.push('/admin/login' as any)}
            activeOpacity={0.7}
          >
            <ShieldCheck size={14} color="#52525b" />
            <Text style={styles.adminOutlineBtnText}>
              Enterprise Administrator Gateway →
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    paddingVertical: 36,
  },

  // ── Shadcn Card
  shadcnCard: {
    width: '100%',
    maxWidth: 420,
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
    marginBottom: 16,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logoSquircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  platformBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 9999,
  },
  platformBadgeText: {
    fontSize: 9.5,
    fontWeight: '500',
    color: '#09090b',
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

  // ── Shadcn Segmented Tabs
  tabsList: {
    flexDirection: 'row',
    backgroundColor: '#f4f4f5',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    borderRadius: 8,
    padding: 3,
    marginBottom: 16,
    gap: 3,
  },
  tabsTrigger: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  tabsTriggerActive: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  tabsTriggerText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#71717a',
  },
  tabsTriggerTextActive: {
    color: '#09090b',
    fontWeight: '500',
  },

  // ── Alerts
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

  // ── Form
  cardContent: {
    gap: 13,
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
    fontSize: 11,
    color: '#a1a1aa',
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

  // ── Primary Action Button
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
  },

  // ── Separator
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
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

  // ── Switch Row
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 5,
  },
  switchText: {
    fontSize: 12.5,
    color: '#71717a',
  },
  switchLink: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#09090b',
    textDecorationLine: 'underline',
  },

  // ── Admin Gateway Link
  adminLinkContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  adminOutlineBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e4e4e7',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  adminOutlineBtnText: {
    fontSize: 12.5,
    fontWeight: '500',
    color: '#3f3f46',
  },
});
