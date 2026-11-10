import { Platform, type TextStyle, type ViewStyle } from 'react-native';

export type ColorSchemeName = 'light' | 'dark';

export type ThemeMode = 'light' | 'dark' | 'system';

export type ThemeColors = {
  background: string;
  surface: string;
  surfaceAlt: string;
  elevated: string;
  border: string;
  borderStrong: string;
  text: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  primarySoft: string;
  onPrimarySoft: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  danger: string;
  dangerSoft: string;
  onDanger: string;
  success: string;
  successSoft: string;
  inputBackground: string;
  placeholder: string;
  overlay: string;
  transparent: string;
  skeleton: string;
  skeletonHighlight: string;
};

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

export const touch = { min: 44, button: 48, control: 40 } as const;

export const hitSlop = { top: 6, bottom: 6, left: 6, right: 6 } as const;

export const duration = { fast: 120, normal: 200, slow: 320 } as const;

type TypographyToken = Pick<TextStyle, 'fontSize' | 'lineHeight' | 'fontWeight' | 'letterSpacing'>;

export const typography = {
  display: { fontSize: 28, lineHeight: 34, fontWeight: '800', letterSpacing: 0.2 },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '800', letterSpacing: 0.2 },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  subheading: { fontSize: 16, lineHeight: 22, fontWeight: '700' },
  body: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  bodyStrong: { fontSize: 15, lineHeight: 21, fontWeight: '600' },
  label: { fontSize: 14, lineHeight: 18, fontWeight: '600' },
  caption: { fontSize: 12, lineHeight: 16, fontWeight: '500' },
  price: { fontSize: 18, lineHeight: 24, fontWeight: '800' },
} as const satisfies Record<string, TypographyToken>;

export type TypographyVariant = keyof typeof typography;

const lightColors: ThemeColors = {
  background: '#F4F7F8',
  surface: '#FFFFFF',
  surfaceAlt: '#EDF3F4',
  elevated: '#FFFFFF',
  border: '#D3DEE1',
  borderStrong: '#AFC1C6',
  text: '#10262E',
  textMuted: '#556B73',
  textInverse: '#FFFFFF',
  primary: '#0F4C5C',
  primaryPressed: '#0B3B48',
  onPrimary: '#FFFFFF',
  primarySoft: '#D8E7EB',
  onPrimarySoft: '#0B3B48',
  accent: '#A9560A',
  accentSoft: '#FBE9D5',
  onAccent: '#FFFFFF',
  danger: '#B3372A',
  dangerSoft: '#F8E1DD',
  onDanger: '#FFFFFF',
  success: '#2E6B3F',
  successSoft: '#DFEEDF',
  inputBackground: '#F8FBFC',
  placeholder: '#7C8F96',
  overlay: 'rgba(6, 20, 26, 0.45)',
  transparent: 'transparent',
  skeleton: '#E2EAEC',
  skeletonHighlight: '#F0F5F6',
};

const darkColors: ThemeColors = {
  background: '#0A1418',
  surface: '#12232A',
  surfaceAlt: '#162A32',
  elevated: '#1A3038',
  border: '#24383F',
  borderStrong: '#3A5560',
  text: '#E8F1F3',
  textMuted: '#9DB2B9',
  textInverse: '#0A1418',
  primary: '#7FC4D4',
  primaryPressed: '#9AD4E1',
  onPrimary: '#062830',
  primarySoft: '#16323A',
  onPrimarySoft: '#B7E1EA',
  accent: '#F0A75E',
  accentSoft: '#3A2A18',
  onAccent: '#2A1808',
  danger: '#F08C7C',
  dangerSoft: '#3A1F1B',
  onDanger: '#2A0F0A',
  success: '#8ED3A1',
  successSoft: '#17301F',
  inputBackground: '#102028',
  placeholder: '#7B9199',
  overlay: 'rgba(0, 0, 0, 0.6)',
  transparent: 'transparent',
  skeleton: '#1B3138',
  skeletonHighlight: '#244049',
};

const IOS_SHADOW: Record<ColorSchemeName, Record<1 | 2 | 3, ViewStyle>> = {
  light: {
    1: { shadowColor: '#0B2530', shadowOpacity: 0.08, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
    2: { shadowColor: '#0B2530', shadowOpacity: 0.14, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
    3: { shadowColor: '#0B2530', shadowOpacity: 0.2, shadowRadius: 22, shadowOffset: { width: 0, height: 10 } },
  },
  dark: {
    1: { shadowColor: '#000000', shadowOpacity: 0.34, shadowRadius: 8, shadowOffset: { width: 0, height: 3 } },
    2: { shadowColor: '#000000', shadowOpacity: 0.44, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
    3: { shadowColor: '#000000', shadowOpacity: 0.54, shadowRadius: 22, shadowOffset: { width: 0, height: 10 } },
  },
};

const ANDROID_ELEVATION: Record<1 | 2 | 3, number> = { 1: 2, 2: 6, 3: 12 };

export function elevation(level: 1 | 2 | 3, scheme: ColorSchemeName): ViewStyle {
  return Platform.OS === 'android' ? { elevation: ANDROID_ELEVATION[level] } : IOS_SHADOW[scheme][level];
}

export type Theme = {
  scheme: ColorSchemeName;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
  touch: typeof touch;
  duration: typeof duration;
};

export function createTheme(scheme: ColorSchemeName): Theme {
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    spacing,
    radius,
    typography,
    touch,
    duration,
  };
}
