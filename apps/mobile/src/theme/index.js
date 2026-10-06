// Canonical BloodLink design tokens. Legacy aliases remain available so the
// existing onboarding screens keep their current behavior until Phase 2.
export const colors = {
  primary: '#C0272D',
  primaryDark: '#981F24',
  primaryPressed: '#981F24',
  primaryTint: '#FCEBEC',
  background: '#F8F9FB',
  bg: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceMuted: '#F2F4F7',
  textPrimary: '#17181C',
  text: '#1B1B1F',
  textSecondary: '#667085',
  textMuted: '#6B6B76',
  textTertiary: '#98A2B3',
  border: '#E4E7EC',
  borderStrong: '#D0D5DD',
  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(17, 24, 39, 0.48)',
  disabled: '#D0D5DD',
  success: '#168A55',
  successSoft: '#EAF8F1',
  verified: '#168A55',
  warning: '#C87912',
  warningSoft: '#FFF5E5',
  info: '#2767C5',
  infoSoft: '#EDF4FF',
  critical: '#B4232D',
  criticalSoft: '#FDEDEE',
  error: '#B4232D',
};

export const typography = {
  fontFamily: 'System',
  sizes: { display: 32, title: 24, sectionTitle: 18, body: 16, supporting: 14, label: 13, caption: 12 },
  lineHeights: { display: 38, title: 30, sectionTitle: 24, body: 24, supporting: 20, label: 18, caption: 16 },
  weights: { regular: '400', medium: '500', semibold: '600', bold: '700', extrabold: '800' },
  bodySize: 16,
  headingSize: 24,
};

export const spacing = { none: 0, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 40 };
export const radius = { sm: 8, md: 12, lg: 16, xl: 20, pill: 999 };

export const shadows = {
  card: { shadowColor: '#101828', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  floating: { shadowColor: '#101828', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 4 },
  modal: { shadowColor: '#101828', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.16, shadowRadius: 24, elevation: 10 },
};

export const iconSizes = { small: 16, medium: 20, navigation: 24, large: 32, state: 56 };
export const controlHeights = { touchTarget: 44, button: 52, buttonCompact: 44, input: 52, otpCell: 48, bottomNavigation: 68 };
export const layout = { screenPadding: 20, cardPadding: 16, sectionGap: 24, contentMaxWidth: 600 };

export const theme = { colors, typography, spacing, radius, shadows, iconSizes, controlHeights, layout };
export default theme;
