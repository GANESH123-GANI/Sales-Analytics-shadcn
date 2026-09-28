import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  useTheme,
  ThemePreset,
  FontFamilyChoice,
  ColorMode,
  RadiusOption,
  ContentLayout,
  ScaleOption,
  SidebarVariant,
  SidebarMode,
} from '../context/ThemeContext';
import { ChevronDown, Check, X } from 'lucide-react-native';

const PRESETS: { id: ThemePreset; label: string; dotColor: string }[] = [
  { id: 'default', label: 'Default', dotColor: '#09090b' },
  { id: 'blue', label: 'Blue', dotColor: '#2563eb' },
  { id: 'violet', label: 'Violet', dotColor: '#7c3aed' },
  { id: 'rose', label: 'Rose', dotColor: '#e11d48' },
  { id: 'orange', label: 'Orange', dotColor: '#ea580c' },
  { id: 'green', label: 'Green', dotColor: '#16a34a' },
  { id: 'slate', label: 'Slate', dotColor: '#475569' },
];

const FONTS: FontFamilyChoice[] = ['Manrope', 'Inter', 'System'];

export const ThemeCustomizerModal: React.FC = () => {
  const {
    themePreset,
    setThemePreset,
    fontFamily,
    setFontFamily,
    colorMode,
    setColorMode,
    radius,
    setRadius,
    contentLayout,
    setContentLayout,
    scale,
    setScale,
    sidebarVariant,
    setSidebarVariant,
    sidebarMode,
    setSidebarMode,
    customizerOpen,
    setCustomizerOpen,
    colors,
    isDark,
  } = useTheme();

  const [presetDropdownOpen, setPresetDropdownOpen] = useState(false);
  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);

  if (!customizerOpen) return null;

  const currentPreset = PRESETS.find((p) => p.id === themePreset) || PRESETS[0];

  return (
    <>
      <TouchableWithoutFeedback onPress={() => setCustomizerOpen(false)}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.popover,
            borderColor: colors.border,
            ...(Platform.OS === 'web'
              ? ({
                  boxShadow: isDark
                    ? '0 20px 45px -10px rgba(0, 0, 0, 0.6), 0 0 0 1px #27272a'
                    : '0 20px 45px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px #e2e8f0',
                } as any)
              : {}),
          },
        ]}
      >
        <View style={[styles.headerRow, { borderBottomColor: colors.borderSubtle }]}>
          <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>Appearance Settings</Text>
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={() => setCustomizerOpen(false)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X size={15} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
          {/* 1. Theme Preset */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Theme Preset</Text>
            <TouchableOpacity
              style={[
                styles.selectInput,
                { backgroundColor: isDark ? '#27272a' : '#ffffff', borderColor: colors.border },
              ]}
              onPress={() => {
                setPresetDropdownOpen(!presetDropdownOpen);
                setFontDropdownOpen(false);
              }}
              activeOpacity={0.8}
            >
              <View style={styles.selectValueRow}>
                <View
                  style={[
                    styles.presetDot,
                    { backgroundColor: currentPreset.dotColor },
                    themePreset === 'default' && isDark && { backgroundColor: '#ffffff' },
                  ]}
                />
                <Text style={[styles.selectText, { color: colors.textPrimary }]}>
                  {currentPreset.label}
                </Text>
              </View>
              <ChevronDown size={14} color={colors.textMuted} />
            </TouchableOpacity>

            {presetDropdownOpen && (
              <View
                style={[
                  styles.dropdownMenu,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                {PRESETS.map((p) => {
                  const selected = p.id === themePreset;
                  return (
                    <TouchableOpacity
                      key={p.id}
                      style={[
                        styles.dropdownItem,
                        selected && { backgroundColor: isDark ? '#27272a' : '#f1f5f9' },
                      ]}
                      onPress={() => {
                        setThemePreset(p.id);
                        setPresetDropdownOpen(false);
                      }}
                    >
                      <View style={styles.selectValueRow}>
                        <View
                          style={[
                            styles.presetDot,
                            { backgroundColor: p.dotColor },
                            p.id === 'default' && isDark && { backgroundColor: '#ffffff' },
                          ]}
                        />
                        <Text style={[styles.dropdownItemText, { color: colors.textPrimary }]}>
                          {p.label}
                        </Text>
                      </View>
                      {selected && <Check size={13} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* 2. Font */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Font</Text>
            <TouchableOpacity
              style={[
                styles.selectInput,
                { backgroundColor: isDark ? '#27272a' : '#ffffff', borderColor: colors.border },
              ]}
              onPress={() => {
                setFontDropdownOpen(!fontDropdownOpen);
                setPresetDropdownOpen(false);
              }}
              activeOpacity={0.8}
            >
              <Text style={[styles.selectText, { color: colors.textPrimary }]}>{fontFamily}</Text>
              <ChevronDown size={14} color={colors.textMuted} />
            </TouchableOpacity>

            {fontDropdownOpen && (
              <View
                style={[
                  styles.dropdownMenu,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                {FONTS.map((f) => {
                  const selected = f === fontFamily;
                  return (
                    <TouchableOpacity
                      key={f}
                      style={[
                        styles.dropdownItem,
                        selected && { backgroundColor: isDark ? '#27272a' : '#f1f5f9' },
                      ]}
                      onPress={() => {
                        setFontFamily(f);
                        setFontDropdownOpen(false);
                      }}
                    >
                      <Text style={[styles.dropdownItemText, { color: colors.textPrimary }]}>{f}</Text>
                      {selected && <Check size={13} color={colors.primary} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* 3. Color Mode */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Color Mode</Text>
            <View
              style={[
                styles.segmentedTrack,
                { backgroundColor: isDark ? '#27272a' : '#f1f5f9', borderColor: colors.border },
              ]}
            >
              {(['light', 'dark', 'system'] as ColorMode[]).map((mode) => {
                const active = colorMode === mode;
                return (
                  <TouchableOpacity
                    key={mode}
                    style={[
                      styles.segmentBtn,
                      active && [
                        styles.segmentBtnActive,
                        {
                          backgroundColor: isDark ? '#3f3f46' : '#ffffff',
                          borderColor: isDark ? '#52525b' : '#e2e8f0',
                        },
                      ],
                    ]}
                    onPress={() => setColorMode(mode)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.segmentBtnText,
                        { color: active ? colors.textPrimary : colors.textSecondary },
                        active && styles.segmentBtnTextActive,
                      ]}
                    >
                      {mode.charAt(0).toUpperCase() + mode.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 4. Radius */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Radius</Text>
            <View
              style={[
                styles.segmentedTrack,
                { backgroundColor: isDark ? '#27272a' : '#f1f5f9', borderColor: colors.border },
              ]}
            >
              {(
                [
                  { id: 'none', label: '⊘' },
                  { id: 'sm', label: 'SM' },
                  { id: 'md', label: 'MD' },
                  { id: 'lg', label: 'LG' },
                ] as { id: RadiusOption; label: string }[]
              ).map((item) => {
                const active = radius === item.id;
                return (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.segmentBtn,
                      active && [
                        styles.segmentBtnActive,
                        {
                          backgroundColor: isDark ? '#3f3f46' : '#ffffff',
                          borderColor: isDark ? '#52525b' : '#e2e8f0',
                        },
                      ],
                    ]}
                    onPress={() => setRadius(item.id)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.segmentBtnText,
                        { color: active ? colors.textPrimary : colors.textSecondary },
                        active && styles.segmentBtnTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 5. Content Layout */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Content Layout</Text>
            <View
              style={[
                styles.segmentedTrack,
                { backgroundColor: isDark ? '#27272a' : '#f1f5f9', borderColor: colors.border },
              ]}
            >
              {(['compact', 'full'] as ContentLayout[]).map((layout) => {
                const active = contentLayout === layout;
                return (
                  <TouchableOpacity
                    key={layout}
                    style={[
                      styles.segmentBtn,
                      active && [
                        styles.segmentBtnActive,
                        {
                          backgroundColor: isDark ? '#3f3f46' : '#ffffff',
                          borderColor: isDark ? '#52525b' : '#e2e8f0',
                        },
                      ],
                    ]}
                    onPress={() => setContentLayout(layout)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.segmentBtnText,
                        { color: active ? colors.textPrimary : colors.textSecondary },
                        active && styles.segmentBtnTextActive,
                      ]}
                    >
                      {layout === 'compact' ? 'Compact' : 'Full'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 6. Scale */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Scale</Text>
            <View
              style={[
                styles.segmentedTrack,
                { backgroundColor: isDark ? '#27272a' : '#f1f5f9', borderColor: colors.border },
              ]}
            >
              {(['sm', 'md', 'lg'] as ScaleOption[]).map((sc) => {
                const active = scale === sc;
                return (
                  <TouchableOpacity
                    key={sc}
                    style={[
                      styles.segmentBtn,
                      active && [
                        styles.segmentBtnActive,
                        {
                          backgroundColor: isDark ? '#3f3f46' : '#ffffff',
                          borderColor: isDark ? '#52525b' : '#e2e8f0',
                        },
                      ],
                    ]}
                    onPress={() => setScale(sc)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.segmentBtnText,
                        { color: active ? colors.textPrimary : colors.textSecondary },
                        active && styles.segmentBtnTextActive,
                      ]}
                    >
                      {sc.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 7. Sidebar Variant */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Sidebar Variant</Text>
            <View
              style={[
                styles.segmentedTrack,
                { backgroundColor: isDark ? '#27272a' : '#f1f5f9', borderColor: colors.border },
              ]}
            >
              {(['flush', 'inset', 'floating'] as SidebarVariant[]).map((v) => {
                const active = sidebarVariant === v;
                return (
                  <TouchableOpacity
                    key={v}
                    style={[
                      styles.segmentBtn,
                      active && [
                        styles.segmentBtnActive,
                        {
                          backgroundColor: isDark ? '#3f3f46' : '#ffffff',
                          borderColor: isDark ? '#52525b' : '#e2e8f0',
                        },
                      ],
                    ]}
                    onPress={() => setSidebarVariant(v)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.segmentBtnText,
                        { color: active ? colors.textPrimary : colors.textSecondary },
                        active && styles.segmentBtnTextActive,
                      ]}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* 8. Sidebar Mode */}
          <View style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Sidebar Mode</Text>
            <View
              style={[
                styles.segmentedTrack,
                { backgroundColor: isDark ? '#27272a' : '#f1f5f9', borderColor: colors.border },
              ]}
            >
              {(['expanded', 'icon', 'hidden'] as SidebarMode[]).map((m) => {
                const active = sidebarMode === m;
                return (
                  <TouchableOpacity
                    key={m}
                    style={[
                      styles.segmentBtn,
                      active && [
                        styles.segmentBtnActive,
                        {
                          backgroundColor: isDark ? '#3f3f46' : '#ffffff',
                          borderColor: isDark ? '#52525b' : '#e2e8f0',
                        },
                      ],
                    ]}
                    onPress={() => setSidebarMode(m)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.segmentBtnText,
                        { color: active ? colors.textPrimary : colors.textSecondary },
                        active && styles.segmentBtnTextActive,
                      ]}
                    >
                      {m.charAt(0).toUpperCase() + m.slice(1)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 998,
  },
  container: {
    position: 'absolute',
    top: 70,
    right: 18,
    width: 290,
    maxHeight: 560,
    borderRadius: 14,
    borderWidth: 1,
    zIndex: 999,
    overflow: 'hidden',
    elevation: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 13,
    fontWeight: '500',
    letterSpacing: -0.2,
  },
  closeBtn: {
    padding: 4,
    borderRadius: 4,
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 16,
  },
  sectionBlock: {
    gap: 6,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: -0.1,
  },
  selectInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 34,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
  },
  selectValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectText: {
    fontSize: 12.5,
    fontWeight: '500',
  },
  presetDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dropdownMenu: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: 6,
    overflow: 'hidden',
    elevation: 4,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dropdownItemText: {
    fontSize: 12,
    fontWeight: '500',
  },
  segmentedTrack: {
    flexDirection: 'row',
    padding: 2.5,
    borderRadius: 7,
    borderWidth: 1,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
  },
  segmentBtnActive: {
    borderWidth: 1,
    elevation: 1,
  },
  segmentBtnText: {
    fontSize: 11.5,
    fontWeight: '500',
  },
  segmentBtnTextActive: {
    fontWeight: '500',
  },
});
