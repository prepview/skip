/** Colour and type tokens for both themes. Screens read these through useTheme(). */

export const palettes = {
  dark: {
    background: '#0C1114',
    surface: '#151C20',
    surfaceRaised: '#222C32',
    tabBar: '#1A2327',
    line: '#26323A',
    lineStrong: '#5E6C73',
    text: '#F3F5F4',
    textMuted: '#A3AEB2',
    accent: '#5BCF9F',
    onAccent: '#0C1114',
    light: '#F2C58F',
    moderate: '#EE8E5C',
    heavy: '#E0554A',
    planned: '#EE8E5C',
    inverse: '#F3F5F4',
    onInverse: '#0C1114',
  },
  light: {
    background: '#F4F5F3',
    surface: '#FFFFFF',
    surfaceRaised: '#E9EEEB',
    tabBar: '#FFFFFF',
    line: '#DDE2E0',
    lineStrong: '#8A9692',
    text: '#10181B',
    textMuted: '#566267',
    accent: '#17794E',
    onAccent: '#FFFFFF',
    light: '#F0B585',
    moderate: '#E0703F',
    heavy: '#B3261E',
    planned: '#C2541F',
    inverse: '#10181B',
    onInverse: '#FFFFFF',
  },
} as const;

export type Scheme = keyof typeof palettes;
export type Palette = { [K in keyof (typeof palettes)['dark']]: string };

/** The sunrise scene keeps the same colours in both themes. */
export const scene = {
  sky: ['#081E26', '#0E3440', '#1C5360', '#3F7F84', '#86AC9E'] as const,
  skyStops: [0, 0.42, 0.76, 0.94, 1] as const,
  water: ['#1B4B56', '#0C2A33'] as const,
  sun: '#FFE7C2',
  text: '#FFFFFF',
  textSoft: 'rgba(255,255,255,0.84)',
  glass: 'rgba(255,255,255,0.14)',
  glassLine: 'rgba(255,255,255,0.28)',
};

export const fonts = {
  thin: 'HankenGrotesk_200ExtraLight',
  light: 'HankenGrotesk_300Light',
  regular: 'HankenGrotesk_400Regular',
  medium: 'HankenGrotesk_500Medium',
  bold: 'HankenGrotesk_700Bold',
  serif: 'InstrumentSerif_400Regular',
} as const;

export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 28 } as const;
export const radius = { card: 20, pill: 999, sheet: 28 } as const;
