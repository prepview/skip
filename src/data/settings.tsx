import { getLocales } from 'expo-localization';
import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';

import { regionFromCountry, type Region } from './drinks';
import { readJson, writeJson } from './storage';

type Settings = { region: Region };
type SettingsValue = Settings & { setRegion: (region: Region) => void };

const KEY = 'skip.settings.v1';
const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Until the user chooses, drink sizes follow the country the phone is set to.
  const [settings, setSettings] = useState<Settings>(() => ({ region: regionFromCountry(getLocales()[0]?.regionCode) }));

  useEffect(() => {
    readJson<Partial<Settings>>(KEY, {}).then((stored) => setSettings((current) => ({ ...current, ...stored })));
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({
      ...settings,
      setRegion: (region) => {
        const next = { ...settings, region };
        setSettings(next);
        writeJson(KEY, next);
      },
    }),
    [settings],
  );

  return <SettingsContext value={value}>{children}</SettingsContext>;
}

export function useSettings(): SettingsValue {
  const value = use(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}
