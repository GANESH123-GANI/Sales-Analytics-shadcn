/**
 * Sales Analytics — shadcn/ui-aligned Design Tokens
 *
 * This file is the single source of truth for the entire design system.
 * Colors match the shadcn/ui semantic naming convention.
 * Font scale, spacing scale, and radius scale are consistent with shadcn conventions.
 */
export const THEME = {
  // ─── Typography ────────────────────────────────────────────────────────────
  fontFamily: {
    regular:   'Inter_400Regular',
    medium:    'Inter_500Medium',
    semibold:  'Inter_600SemiBold',
    bold:      'Inter_700Bold',
    extrabold: 'Inter_800ExtraBold',
    // Aliases
    sans:      'Inter_400Regular',
    ui:        'Inter_500Medium',
  },

  // ─── Font Size Scale ───────────────────────────────────────────────────────
  fontSize: {
    xs:   11,
    sm:   12,
    base: 13,
    md:   14,
    lg:   15,
    xl:   17,
    '2xl': 20,
    '3xl': 24,
    '4xl': 30,
  },

  // ─── Spacing Scale ─────────────────────────────────────────────────────────
  spacing: {
    0:   0,
    1:   4,
    2:   8,
    3:   12,
    4:   16,
    5:   20,
    6:   24,
    8:   32,
    10:  40,
  },

  // ─── Semantic Color Tokens (Light Mode) ───────────────────────────────────
  colors: {
    // Canvas & Containers
    background:       '#f8fafc',
    foreground:       '#09090b',
    surface:          '#ffffff',
    card:             '#ffffff',
    cardForeground:   '#09090b',
    cardHover:        '#fbfcfd',

    // Borders
    border:           '#e2e8f0',
    borderSubtle:     '#f1f5f9',
    borderDarker:     '#cbd5e1',
    input:            '#e2e8f0',

    // Focus ring
    ring:             '#09090b',

    // Text hierarchy
    textPrimary:      '#09090b',
    textSecondary:    '#64748b',
    textMuted:        '#94a3b8',

    // Primary (action color — dark)
    primary:          '#09090b',
    primaryForeground:'#ffffff',
    primaryHover:     '#27272a',

    // Secondary
    secondary:        '#f1f5f9',
    secondaryForeground: '#0f172a',

    // Muted
    muted:            '#f8fafc',
    mutedForeground:  '#64748b',

    // Accent
    accent:           '#f1f5f9',
    accentForeground: '#0f172a',

    // Destructive
    destructive:      '#ef4444',
    destructiveForeground: '#ffffff',

    // Utility
    buttonDark:       '#09090b',
    buttonDarkHover:  '#27272a',

    // ─── Sidebar ─────────────────────────────────────────────────────────────
    sidebar: {
      bg:              '#ffffff',
      border:          '#e2e8f0',
      itemHover:       '#f1f5f9',
      itemActiveBg:    '#f1f5f9',
      itemActiveText:  '#09090b',
      itemInactiveText:'#64748b',
    },

    // ─── Status / Badge Colors ─────────────────────────────────────────────
    status: {
      completedBg:     '#ecfdf5',
      completedText:   '#047857',
      completedBorder: '#a7f3d0',

      pendingBg:       '#fffbeb',
      pendingText:     '#b45309',
      pendingBorder:   '#fde68a',

      cancelledBg:     '#fef2f2',
      cancelledText:   '#b91c1c',
      cancelledBorder: '#fecaca',

      successBg:       '#f0fdf4',
      successText:     '#15803d',
      successBorder:   '#bbf7d0',

      neutralBg:       '#f1f5f9',
      neutralText:     '#475569',
      neutralBorder:   '#cbd5e1',

      infoBg:          '#f0f9ff',
      infoText:        '#0369a1',
      infoBorder:      '#bae6fd',
    },

    // ─── Chart Palette ─────────────────────────────────────────────────────
    chart: {
      blue:        '#2563eb',
      indigo:      '#6366f1',
      emerald:     '#10b981',
      amber:       '#f59e0b',
      rose:        '#ef4444',
      purple:      '#8b5cf6',
      teal:        '#14b8a6',
      slate:       '#64748b',
      track:       '#e2e8f0',
      trackActive: '#64748b',
    },
  },

  // ─── Border Radius ─────────────────────────────────────────────────────────
  // Matches shadcn/ui's --radius CSS variable pattern
  radius: {
    none: 0,
    xs:   4,
    sm:   6,   // rounded-sm
    md:   8,   // rounded-md (shadcn default input/button)
    lg:   12,  // rounded-lg (shadcn card)
    xl:   16,
    '2xl': 20,
    full: 9999,
  },

  // ─── Shadows ───────────────────────────────────────────────────────────────
  shadow: {
    none: {},
    card: {
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.03)',
      elevation: 1,
    },
    md: {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
      elevation: 3,
    },
    dropdown: {
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.08)',
      elevation: 3,
    },
    modal: {
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      elevation: 10,
    },
  },
};

// ─── Shorthand alias ─────────────────────────────────────────────────────────
export const C  = THEME.colors;
export const R  = THEME.radius;
export const F  = THEME.fontFamily;
export const FS = THEME.fontSize;
export const S  = THEME.spacing;
