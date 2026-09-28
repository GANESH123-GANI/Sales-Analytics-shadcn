import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ShieldAlert, ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../../context/AuthContext';
import { DedicatedAdminPanel } from '../../components/DedicatedAdminPanel';
import { AdminLoginScreen } from '../../components/AdminLoginScreen';

export default function AdminPage() {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();
  const router = useRouter();

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
      </View>
    );
  }

  // If not logged in, show the Dedicated Admin Login Screen
  if (!isAuthenticated) {
    return <AdminLoginScreen />;
  }

  // If logged in as standard user, block access with 403 Forbidden
  if (!isAdmin) {
    return (
      <View style={styles.forbiddenContainer}>
        <View style={styles.forbiddenCard}>
          <View style={styles.shieldBox}>
            <ShieldAlert size={36} color="#ef4444" />
          </View>
          <Text style={styles.forbiddenTitle}>403 — Administrator Access Required</Text>
          <Text style={styles.forbiddenDesc}>
            Your current account is authenticated as a standard user. You do not have permissions to access the enterprise governance console.
          </Text>

          <TouchableOpacity
            style={styles.returnBtn}
            onPress={() => router.replace('/')}
            activeOpacity={0.8}
          >
            <ArrowLeft size={16} color="#ffffff" />
            <Text style={styles.returnBtnText}>Return to User Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Authenticated as Administrator
  return <DedicatedAdminPanel onSwitchToUserView={() => router.push('/')} />;
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  forbiddenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  forbiddenCard: {
    maxWidth: 440,
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    padding: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  shieldBox: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecdd3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  forbiddenTitle: {
    fontSize: 17,
    fontWeight: '400',
    color: '#0f172a',
    textAlign: 'center',
    marginBottom: 8,
  },
  forbiddenDesc: {
    fontSize: 12.5,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  returnBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  returnBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '500',
  },
});
