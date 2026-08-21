export const Colors = {
  light: {
    background: '#F8FAFC',
    bg2: '#F1F5F9',
    surface: '#FFFFFF',
    surface2: '#F1F5F9',
    surface3: '#E2E8F0',
    border: 'rgba(0, 0, 0, 0.08)',
    borderStrong: 'rgba(0, 0, 0, 0.16)',
    text: '#0F172A',
    text2: '#64748B',
    text3: '#94A3B8',
    brand: '#6366F1',
    brand2: '#818CF8',
    brandGlow: 'rgba(99, 102, 241, 0.18)',
    pink: '#EC4899',
    pinkGlow: 'rgba(236, 72, 153, 0.18)',
    green: '#10B981',
    yellow: '#F59E0B',
    primary: '#6366F1',
    secondary: '#64748B',
    card: '#FFFFFF',
    inputBg: '#F1F5F9',
    inputBorder: 'rgba(0, 0, 0, 0.12)',
  },
  dark: {
    background: '#090A12',
    bg2: '#0F111A',
    surface: '#141722',
    surface2: '#1B2031',
    surface3: '#252B40',
    border: 'rgba(255, 255, 255, 0.08)',
    borderStrong: 'rgba(255, 255, 255, 0.15)',
    text: '#F0F2FA',
    text2: '#9499B3',
    text3: '#565A75',
    brand: '#6366F1',
    brand2: '#818CF8',
    brandGlow: 'rgba(99, 102, 241, 0.25)',
    pink: '#EC4899',
    pinkGlow: 'rgba(236, 72, 153, 0.25)',
    green: '#10B981',
    yellow: '#F59E0B',
    primary: '#6366F1',
    secondary: '#9499B3',
    card: '#141722',
    inputBg: '#1B2031',
    inputBorder: 'rgba(255, 255, 255, 0.12)',
  },
};

export type ThemeColors = {
  background: string;
  bg2: string;
  surface: string;
  surface2: string;
  surface3: string;
  border: string;
  borderStrong: string;
  text: string;
  text2: string;
  text3: string;
  brand: string;
  brand2: string;
  brandGlow: string;
  pink: string;
  pinkGlow: string;
  green: string;
  yellow: string;
  primary: string;
  secondary: string;
  card: string;
  inputBg: string;
  inputBorder: string;
};

export const Gradients = {
  brand: ['#6366F1', '#EC4899'] as const,
  brandHover: ['#818CF8', '#F472B6'] as const,
  brandSubtleDark: ['rgba(99, 102, 241, 0.15)', 'rgba(236, 72, 153, 0.1)'] as const,
  brandSubtleLight: ['rgba(99, 102, 241, 0.08)', 'rgba(236, 72, 153, 0.05)'] as const,
  cardDark: ['rgba(20, 23, 34, 0.95)', 'rgba(27, 32, 49, 0.85)'] as const,
  cardLight: ['rgba(255, 255, 255, 0.95)', 'rgba(241, 245, 249, 0.9)'] as const,
  storySeen: ['#252B40', '#1B2031'] as const,
  avatarPlaceholder: ['#6366F1', '#8B5CF6'] as const,
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
} as const;

export const MaxContentWidth = 640;
