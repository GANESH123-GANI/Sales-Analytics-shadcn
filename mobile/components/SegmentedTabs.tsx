import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, useWindowDimensions } from 'react-native';
import { THEME } from '../constants/theme';

interface SegmentedTabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  scrollable?: boolean;
}

export const SegmentedTabs: React.FC<SegmentedTabsProps> = ({
  tabs,
  activeTab,
  onTabChange,
  scrollable = false,
}) => {
  const { width: screenWidth } = useWindowDimensions();
  const shouldScroll = scrollable || screenWidth < 520 || tabs.length > 3;

  const content = (
    <>
      {tabs.map((tab) => {
        const isActive = tab === activeTab;
        return (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, isActive && styles.activeTab]}
            onPress={() => onTabChange(tab)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, isActive && styles.activeTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        );
      })}
    </>
  );

  if (shouldScroll) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.scrollWrapper}
        contentContainerStyle={styles.scrollContainer}
      >
        {content}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {content}
    </View>
  );
};

const styles = StyleSheet.create({
  scrollWrapper: {
    marginBottom: 10,
    flexGrow: 0,
    flexShrink: 0,
    height: 38,
    maxHeight: 38,
  },
  scrollContainer: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.secondary,
    borderRadius: THEME.radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    alignSelf: 'flex-start',
    gap: 2,
    alignItems: 'center',
  },
  container: {
    flexDirection: 'row',
    backgroundColor: THEME.colors.secondary,
    borderRadius: THEME.radius.md,
    padding: 3,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: THEME.colors.border,
    marginBottom: 10,
    gap: 2,
    flexGrow: 0,
    flexShrink: 0,
    alignItems: 'center',
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: THEME.radius.sm,
  },
  activeTab: {
    backgroundColor: THEME.colors.card,
    elevation: 2,
    ...(Platform.OS === 'web'
      ? { boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)' }
      : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        }),
  },
  tabText: {
    fontSize: THEME.fontSize.base,
    fontWeight: '500',
    fontFamily: THEME.fontFamily.medium,
    color: THEME.colors.textSecondary,
  },
  activeTabText: {
    fontWeight: '600',
    fontFamily: THEME.fontFamily.semibold,
    color: THEME.colors.textPrimary,
  },
});
