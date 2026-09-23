import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react-native';
import { THEME } from '../constants/theme';

interface LoadingViewProps {
  isLoading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  onRetry?: () => void;
  children?: React.ReactNode;
}

export const LoadingView: React.FC<LoadingViewProps> = ({
  isLoading,
  error,
  isEmpty,
  emptyTitle = 'No data found',
  emptyMessage = 'There are no records matching your current filter.',
  onRetry,
  children,
}) => {
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading analytics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.errorIconBadge}>
          <AlertCircle size={26} color={THEME.colors.status.cancelledText} />
        </View>
        <Text style={styles.errorTitle}>Unable to load data</Text>
        <Text style={styles.errorDescription}>{error}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.retryButton} onPress={onRetry} activeOpacity={0.8}>
            <RefreshCw size={14} color={THEME.colors.primaryForeground} style={{ marginRight: 6 }} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (isEmpty) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.emptyIconBadge}>
          <Inbox size={28} color={THEME.colors.textMuted} />
        </View>
        <Text style={styles.emptyTitle}>{emptyTitle}</Text>
        <Text style={styles.emptyDescription}>{emptyMessage}</Text>
        {onRetry && (
          <TouchableOpacity style={styles.secondaryButton} onPress={onRetry} activeOpacity={0.8}>
            <Text style={styles.secondaryButtonText}>Refresh</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  return <>{children}</>;
};

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    minHeight: 280,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 14,
    fontSize: THEME.fontSize.md,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
    color: THEME.colors.textSecondary,
  },
  errorIconBadge: {
    width: 56,
    height: 56,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.status.cancelledBg,
    borderWidth: 1,
    borderColor: THEME.colors.status.cancelledBorder,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  errorTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: '700',
    fontFamily: THEME.fontFamily.bold,
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  errorDescription: {
    fontSize: THEME.fontSize.base,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 20,
    maxWidth: 300,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: THEME.radius.md,
  },
  retryButtonText: {
    color: THEME.colors.primaryForeground,
    fontSize: THEME.fontSize.base,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
  },
  emptyIconBadge: {
    width: 60,
    height: 60,
    borderRadius: THEME.radius.full,
    backgroundColor: THEME.colors.secondary,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: THEME.fontSize.lg,
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: THEME.fontSize.base,
    fontFamily: THEME.fontFamily.regular,
    color: THEME.colors.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
  },
  secondaryButton: {
    marginTop: 16,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    backgroundColor: THEME.colors.card,
  },
  secondaryButtonText: {
    color: THEME.colors.textPrimary,
    fontSize: THEME.fontSize.base,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
  },
});
