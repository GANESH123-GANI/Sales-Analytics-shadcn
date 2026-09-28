import React, { createContext, useContext, useState, useEffect } from 'react';
import { Platform } from 'react-native';

export type ThemePreset = 'default' | 'blue' | 'violet' | 'rose' | 'orange' | 'green' | 'slate';
export type FontFamilyChoice = 'Manrope' | 'Inter' | 'System';
export type ColorMode = 'light' | 'dark' | 'system';
export type RadiusOption = 'none' | 'sm' | 'md' | 'lg';
export type ContentLayout = 'compact' | 'full';
export type ScaleOption = 'sm' | 'md' | 'lg';
export type SidebarVariant = 'flush' | 'inset' | 'floating';
export type SidebarMode = 'expanded' | 'icon' | 'hidden';

export interface ThemeColors {
  background: string;
  foreground: string;
  surface: string;
  card: string;
  cardForeground: string;
  cardHover: string;
  border: string;
  borderSubtle: string;
  borderDarker: string;
  input: string;
  ring: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryForeground: string;
  primaryHover: string;
  secondary: string;
  secondaryForeground: string;
  muted: string;
  mutedForeground: string;
  accent: string;
  accentForeground: string;
  destructive: string;
  destructiveForeground: string;
  popover: string;
  popoverForeground: string;
  // Chart Colors
  chartHighlight: string;
  chartLavender: string;
  chartOrange: string;
  chartOrangePastel: string;
  chartPurple: string;
  chartPink: string;
  chartTeal: string;
  chartEmerald: string;
}

const PRESET_ACCENTS: Record<ThemePreset, { primary: string; primaryForeground: string; highlight: string; dot: string }> = {
  default: { primary: '#09090b', primaryForeground: '#ffffff', highlight: '#2563eb', dot: '#09090b' },
  blue:    { primary: '#2563eb', primaryForeground: '#ffffff', highlight: '#3b82f6', dot: '#2563eb' },
  violet:  { primary: '#7c3aed', primaryForeground: '#ffffff', highlight: '#8b5cf6', dot: '#7c3aed' },
  rose:    { primary: '#e11d48', primaryForeground: '#ffffff', highlight: '#f43f5e', dot: '#e11d48' },
  orange:  { primary: '#ea580c', primaryForeground: '#ffffff', highlight: '#f97316', dot: '#ea580c' },
  green:   { primary: '#16a34a', primaryForeground: '#ffffff', highlight: '#22c55e', dot: '#16a34a' },
  slate:   { primary: '#475569', primaryForeground: '#ffffff', highlight: '#64748b', dot: '#475569' },
};

export interface ThemeContextType {
  themePreset: ThemePreset;
  setThemePreset: (preset: ThemePreset) => void;
  fontFamily: FontFamilyChoice;
  setFontFamily: (font: FontFamilyChoice) => void;
  colorMode: ColorMode;
  setColorMode: (mode: ColorMode) => void;
  radius: RadiusOption;
  setRadius: (r: RadiusOption) => void;
  contentLayout: ContentLayout;
  setContentLayout: (layout: ContentLayout) => void;
  scale: ScaleOption;
  setScale: (scale: ScaleOption) => void;
  sidebarVariant: SidebarVariant;
  setSidebarVariant: (variant: SidebarVariant) => void;
  sidebarMode: SidebarMode;
  setSidebarMode: (mode: SidebarMode) => void;
  isDark: boolean;
  colors: ThemeColors;
  radiusValues: {
    base: number;
    button: number;
    card: number;
    badge: number;
    sm: number;
    md: number;
    lg: number;
  };
  customizerOpen: boolean;
  setCustomizerOpen: (open: boolean) => void;
  toggleCustomizer: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'sales_analytics_theme_settings';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreset, setThemePreset] = useState<ThemePreset>('default');
  const [fontFamily, setFontFamily] = useState<FontFamilyChoice>('Manrope');
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  const [radius, setRadius] = useState<RadiusOption>('sm');
  const [contentLayout, setContentLayout] = useState<ContentLayout>('compact');
  const [scale, setScale] = useState<ScaleOption>('md');
  const [sidebarVariant, setSidebarVariant] = useState<SidebarVariant>('floating');
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>('expanded');
  const [customizerOpen, setCustomizerOpen] = useState<boolean>(false);

  // Load persisted theme preferences
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.themePreset) setThemePreset(parsed.themePreset);
          if (parsed.fontFamily) setFontFamily(parsed.fontFamily);
          if (parsed.colorMode) setColorMode(parsed.colorMode);
          if (parsed.radius) setRadius(parsed.radius);
          if (parsed.contentLayout) setContentLayout(parsed.contentLayout);
          if (parsed.scale) setScale(parsed.scale);
          if (parsed.sidebarVariant) setSidebarVariant(parsed.sidebarVariant);
          if (parsed.sidebarMode) setSidebarMode(parsed.sidebarMode);
        }
      } catch (e) {
        // Ignore read error
      }
    }
  }, []);

  // Save changes to localStorage and inject Google Font Manrope if on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const payload = {
          themePreset,
          fontFamily,
          colorMode,
          radius,
          contentLayout,
          scale,
          sidebarVariant,
          sidebarMode,
        };
        window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(payload));
      } catch (e) {
        // Ignore save error
      }
    }
  }, [themePreset, fontFamily, colorMode, radius, contentLayout, scale, sidebarVariant, sidebarMode]);

  const isDark = colorMode === 'dark';

  // Compute Radius values
  const radiusMap: Record<
    RadiusOption,
    { base: number; button: number; card: number; badge: number; sm: number; md: number; lg: number }
  > = {
    none: { base: 0, button: 0, card: 0, badge: 0, sm: 0, md: 0, lg: 0 },
    sm:   { base: 6, button: 6, card: 10, badge: 4, sm: 4, md: 8, lg: 12 },
    md:   { base: 8, button: 8, card: 12, badge: 6, sm: 6, md: 10, lg: 16 },
    lg:   { base: 12, button: 10, card: 16, badge: 8, sm: 8, md: 14, lg: 20 },
  };
  const radiusValues = radiusMap[radius];

  const presetConf = PRESET_ACCENTS[themePreset] || PRESET_ACCENTS.default;

  // Compute theme colors
  const colors: ThemeColors = isDark
    ? {
        background: '#09090b',
        foreground: '#f8fafc',
        surface: '#121215',
        card: '#18181b',
        cardForeground: '#f8fafc',
        cardHover: '#27272a',
        border: '#27272a',
        borderSubtle: '#1f1f23',
        borderDarker: '#3f3f46',
        input: '#27272a',
        ring: '#a1a1aa',
        textPrimary: '#f8fafc',
        textSecondary: '#a1a1aa',
        textMuted: '#71717a',
        primary: presetConf.primary === '#09090b' ? '#f8fafc' : presetConf.primary,
        primaryForeground: presetConf.primary === '#09090b' ? '#09090b' : '#ffffff',
        primaryHover: '#52525b',
        secondary: '#27272a',
        secondaryForeground: '#f8fafc',
        muted: '#18181b',
        mutedForeground: '#a1a1aa',
        accent: '#27272a',
        accentForeground: '#f8fafc',
        destructive: '#ef4444',
        destructiveForeground: '#ffffff',
        popover: '#18181b',
        popoverForeground: '#f8fafc',
        chartHighlight: presetConf.highlight,
        chartLavender: '#312e81',
        chartOrange: '#f97316',
        chartOrangePastel: '#7c2d12',
        chartPurple: '#a855f7',
        chartPink: '#ec4899',
        chartTeal: '#14b8a6',
        chartEmerald: '#10b981',
      }
    : {
        background: '#f8fafc',
        foreground: '#09090b',
        surface: '#ffffff',
        card: '#ffffff',
        cardForeground: '#09090b',
        cardHover: '#fbfcfd',
        border: '#e2e8f0',
        borderSubtle: '#f1f5f9',
        borderDarker: '#cbd5e1',
        input: '#e2e8f0',
        ring: '#09090b',
        textPrimary: '#09090b',
        textSecondary: '#64748b',
        textMuted: '#94a3b8',
        primary: presetConf.primary,
        primaryForeground: presetConf.primaryForeground,
        primaryHover: '#27272a',
        secondary: '#f1f5f9',
        secondaryForeground: '#0f172a',
        muted: '#f8fafc',
        mutedForeground: '#64748b',
        accent: '#f1f5f9',
        accentForeground: '#0f172a',
        destructive: '#ef4444',
        destructiveForeground: '#ffffff',
        popover: '#ffffff',
        popoverForeground: '#09090b',
        chartHighlight: presetConf.highlight,
        chartLavender: '#c7d2fe',
        chartOrange: '#f97316',
        chartOrangePastel: '#ffedd5',
        chartPurple: '#8b5cf6',
        chartPink: '#ec4899',
        chartTeal: '#14b8a6',
        chartEmerald: '#10b981',
      };

  const toggleCustomizer = () => setCustomizerOpen((prev) => !prev);

  return (
    <ThemeContext.Provider
      value={{
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
        isDark,
        colors,
        radiusValues,
        customizerOpen,
        setCustomizerOpen,
        toggleCustomizer,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
