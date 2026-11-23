import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { readJson, writeJson } from '@/data/storage';

import { palettes, type Palette, type Scheme } from './tokens';

export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeValue = {
  scheme: Scheme;
  colors: Palette;
  preference: ThemePreference;
  setPreference: (next: ThemePreference) => void;
};

const KEY = 'skip.theme.v1';
const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    readJson<ThemePreference>(KEY, 'system').then(setPreferenceState);
  }, []);

  const value = useMemo<ThemeValue>(() => {
    // The design is dark-first, so an unknown system setting falls back to dark.
    const scheme: Scheme = preference === 'system' ? (system === 'light' ? 'light' : 'dark') : preference;
    return {
      scheme,
      colors: palettes[scheme],
      preference,
      setPreference: (next) => {
        setPreferenceState(next);
        writeJson(KEY, next);
      },
    };
  }, [preference, system]);

  return <ThemeContext value={value}>{children}</ThemeContext>;
}

export function useTheme(): ThemeValue {
  const value = use(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
