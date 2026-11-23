import { getLocales } from 'expo-localization';
import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';

import { regionFromCountry, type Region } from './drinks';
import { readJson, writeJson } from './storage';

export type Intent = 'less' | 'break' | 'habits';
export type Reminder = 'evening' | 'morning' | 'off';

export type Settings = {
  region: Region;
  /** False until the first-run questions are finished. */
  onboarded: boolean;
  intent: Intent;
  /** Drinking days a week before starting, as the user estimated it. Null if never asked. */
  baselineDays: number | null;
  /** Most drinking days a week the user wants. Null means no goal is set. */
  weeklyGoal: number | null;
  /** Usual planned drinking days, as Monday-first weekday indexes (0 = Monday). */
  plannedWeekdays: number[];
  /** Planned days for specific weeks, keyed by that week's Monday. Overrides plannedWeekdays. */
  weekPlans: Record<string, number[]>;
  reminder: Reminder;
  /** What the user said they want more of, from the first-run questions. */
  motives: string[];
};

type SettingsValue = Settings & { ready: boolean; update: (patch: Partial<Settings>) => void };

const KEY = 'skip.settings.v1';
const SettingsContext = createContext<SettingsValue | null>(null);

function defaults(): Settings {
  return {
    // Until the user chooses, drink sizes follow the country the phone is set to.
    region: regionFromCountry(getLocales()[0]?.regionCode),
    onboarded: false,
    intent: 'less',
    baselineDays: null,
    weeklyGoal: null,
    plannedWeekdays: [],
    weekPlans: {},
    reminder: 'off',
    motives: [],
  };
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaults);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    readJson<Partial<Settings>>(KEY, {}).then((stored) => {
      setSettings((current) => ({ ...current, ...stored }));
      setReady(true);
    });
  }, []);

  const value = useMemo<SettingsValue>(
    () => ({
      ...settings,
      ready,
      update: (patch) => {
        setSettings((current) => {
          const next = { ...current, ...patch };
          writeJson(KEY, next);
          return next;
        });
      },
    }),
    [settings, ready],
  );

  return <SettingsContext value={value}>{children}</SettingsContext>;
}

export function useSettings(): SettingsValue {
  const value = use(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}
