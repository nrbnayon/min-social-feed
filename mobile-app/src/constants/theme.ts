/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](http://www.nativewind.dev/), [Tamagui](http://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '../../global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1C1C1C',
    background: '#F8F7F4',
    primary: '#0F766E',
    secondary: '#78716C',
    backgroundElement: '#F0FDFA',
    backgroundSelected: '#CCFBF1',
    textSecondary: '#78716C',
    inputBorder: '#44403C',
    inputBg: '#F0FDFA',
  },
  dark: {
    text: '#F5F5F4',
    background: '#0D0D0D',
    primary: '#0F766E',
    secondary: '#78716C',
    backgroundElement: '#1C1917',
    backgroundSelected: '#292524',
    textSecondary: '#78716C',
    inputBorder: '#44403C',
    inputBg: '#1C1917',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'Poppins_400Regular',
    plus: 'PlusJakartaSans_400Regular',
    serif: 'PlusJakartaSans_400Regular',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'Poppins_400Regular',
    plus: 'PlusJakartaSans_400Regular',
    serif: 'PlusJakartaSans_400Regular',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-poppins)',
    plus: 'var(--font-plus)',
    serif: 'var(--font-plus)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
