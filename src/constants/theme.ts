export const PALETTE = {
  // WhatsApp & Stitch Primary Colors
  primary: '#00453d',
  primaryContainer: '#075e54',
  primaryLight: '#128c7e',
  primaryDark: '#00332d',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#8dd5c8',
  primaryFixed: '#a8f0e3',
  primaryFixedDim: '#8cd4c7',

  // Secondary Teal / Mint
  secondary: '#006b5f',
  secondaryContainer: '#8cf1e1',
  secondaryLight: '#26a69a',
  secondaryDark: '#004d40',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#006f64',
  secondaryFixed: '#8ff4e3',
  secondaryFixedDim: '#72d8c8',

  // Accent & WhatsApp Green
  accentGreen: '#25d366',
  accentTeal: '#128c7e',
  accentBlue: '#34b7f1',
  whatsappBusiness: '#1b8a7a',

  // Tertiary
  tertiary: '#00471c',
  tertiaryContainer: '#006129',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#3fe374',
  tertiaryFixed: '#25d366',
  tertiaryFixedDim: '#3de273',
  onTertiaryFixed: '#002109',

  // Error / Delete
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#93000a',

  // Surfaces & Backgrounds
  background: '#fbf9f8',
  backgroundDark: '#111b21',
  surface: '#fbf9f8',
  surfaceDim: '#dcd9d9',
  surfaceBright: '#ffffff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerLow: '#f6f3f2',
  surfaceContainer: '#f0eded',
  surfaceContainerHigh: '#eae8e7',
  surfaceContainerHighest: '#e4e2e1',
  surfaceVariant: '#e4e2e1',
  surfaceTint: '#1c695f',

  // Borders & Text
  outline: '#6f7976',
  outlineVariant: '#bec9c5',
  onBackground: '#1b1c1c',
  onSurface: '#1b1c1c',
  onSurfaceVariant: '#3f4946',
  white: '#ffffff',
  black: '#000000',
  overlayDark: 'rgba(0, 0, 0, 0.65)',
  overlayLight: 'rgba(255, 255, 255, 0.25)',

  neutral: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
};

export const TYPOGRAPHY = {
  headlineLg: {
    fontFamily: 'Inter',
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  headlineMd: {
    fontFamily: 'Inter',
    fontSize: 22,
    fontWeight: '600' as const,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
  headlineSm: {
    fontFamily: 'Inter',
    fontSize: 18,
    fontWeight: '700' as const,
    lineHeight: 24,
  },
  titleLg: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '600' as const,
    lineHeight: 22,
  },
  titleMd: {
    fontFamily: 'Inter',
    fontSize: 15,
    fontWeight: '600' as const,
    lineHeight: 20,
  },
  bodyLg: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400' as const,
    lineHeight: 22,
  },
  bodyMd: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },
  bodySm: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
  },
  labelLg: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 18,
    letterSpacing: 0.2,
  },
  labelMd: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.2,
  },
  labelSm: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 0.4,
  },
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};
