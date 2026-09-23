import React from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { THEME } from '../constants/theme';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  placeholder?: string;
  filterOptions?: string[];
  selectedFilter?: string;
  onSelectFilter?: (filter: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search...',
  filterOptions,
  selectedFilter,
  onSelectFilter,
}) => {
  return (
    <View style={styles.container}>
      {/* Search Input Box */}
      <View style={styles.searchBox}>
        <Search size={16} color={THEME.colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={THEME.colors.textMuted}
          value={searchQuery}
          onChangeText={onSearchChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            onPress={() => onSearchChange('')}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.clearButton}
          >
            <X size={14} color={THEME.colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Pills */}
      {filterOptions && filterOptions.length > 0 && onSelectFilter && (
        <View style={styles.pillsContainer}>
          {filterOptions.map(option => {
            const isSelected = selectedFilter === option;
            return (
              <TouchableOpacity
                key={option}
                onPress={() => onSelectFilter(option)}
                style={[styles.pill, isSelected ? styles.activePill : styles.inactivePill]}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.pillText,
                    isSelected ? styles.activePillText : styles.inactivePillText,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 14,
    gap: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.colors.card,
    borderRadius: THEME.radius.md,
    borderWidth: 1,
    borderColor: THEME.colors.border,
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: THEME.colors.textPrimary,
    height: '100%',
  },
  clearButton: {
    padding: 4,
    borderRadius: THEME.radius.full,
    backgroundColor: '#f1f5f9',
  },
  pillsContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: THEME.radius.full,
    borderWidth: 1,
  },
  activePill: {
    backgroundColor: THEME.colors.primary,
    borderColor: THEME.colors.primary,
  },
  inactivePill: {
    backgroundColor: THEME.colors.card,
    borderColor: THEME.colors.border,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  activePillText: {
    color: THEME.colors.primaryForeground,
  },
  inactivePillText: {
    color: THEME.colors.textSecondary,
  },
});
