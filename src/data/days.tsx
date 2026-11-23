import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';

import type { DrinkLine } from './drinks';
import { readJson, writeJson } from './storage';

export type DayStatus = 'sober' | 'drink';
export type Mood = 'great' | 'good' | 'okay' | 'rough';
export type Tag = 'social' | 'food' | 'celebration' | 'stress' | 'habit' | 'bored';

export const moods: readonly Mood[] = ['great', 'good', 'okay', 'rough'];
export const tags: readonly Tag[] = ['social', 'food', 'celebration', 'stress', 'habit', 'bored'];

export type DayEntry = {
  status: DayStatus;
  drinks?: DrinkLine[];
  mood?: Mood;
  tags?: Tag[];
  note?: string;
  /** File name of the day's photo, resolved through data/photos. */
  photo?: string;
};
export type DayMap = Record<string, DayEntry>;

const KEY = 'skip.days.v1';

/** Local calendar date as YYYY-MM-DD. Never uses UTC, so a late-night log lands on the right day. */
export function dateKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
}

/** Turns a YYYY-MM-DD key back into a local date. Returns null for anything malformed. */
export function parseKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return dateKey(date) === key ? date : null;
}

export function addDays(date: Date, amount: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + amount);
  return next;
}

/** Monday-first week containing the given date. */
export function weekOf(date: Date): Date[] {
  const mondayOffset = (date.getDay() + 6) % 7;
  const monday = addDays(date, -mondayOffset);
  return Array.from({ length: 7 }, (_, i) => addDays(monday, i));
}

/**
 * Consecutive alcohol-free days ending today. If today is not logged yet the
 * count runs up to yesterday, so the streak does not drop to zero overnight.
 */
export function soberStreak(days: DayMap, today: Date): number {
  let cursor = days[dateKey(today)] ? today : addDays(today, -1);
  let count = 0;
  while (days[dateKey(cursor)]?.status === 'sober') {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

type DaysValue = {
  ready: boolean;
  days: DayMap;
  setDay: (key: string, entry: DayEntry | null) => void;
};

const DaysContext = createContext<DaysValue | null>(null);

export function DaysProvider({ children }: { children: ReactNode }) {
  const [days, setDays] = useState<DayMap>({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    readJson<DayMap>(KEY, {}).then((stored) => {
      setDays(stored);
      setReady(true);
    });
  }, []);

  const value = useMemo<DaysValue>(
    () => ({
      ready,
      days,
      setDay: (key, entry) => {
        setDays((current) => {
          const next = { ...current };
          if (entry) next[key] = entry;
          else delete next[key];
          writeJson(KEY, next);
          return next;
        });
      },
    }),
    [days, ready],
  );

  return <DaysContext value={value}>{children}</DaysContext>;
}

export function useDays(): DaysValue {
  const value = use(DaysContext);
  if (!value) throw new Error('useDays must be used inside DaysProvider');
  return value;
}
