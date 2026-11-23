import { createContext, use, useEffect, useMemo, useState, type ReactNode } from 'react';

import { readJson, writeJson } from './storage';

export type DayStatus = 'sober' | 'drink';
export type DayEntry = { status: DayStatus };
export type DayMap = Record<string, DayEntry>;

const KEY = 'skip.days.v1';

/** Local calendar date as YYYY-MM-DD. Never uses UTC, so a late-night log lands on the right day. */
export function dateKey(date: Date): string {
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${m}-${d}`;
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
  setDay: (key: string, status: DayStatus | null) => void;
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
      setDay: (key, status) => {
        setDays((current) => {
          const next = { ...current };
          if (status) next[key] = { status };
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
