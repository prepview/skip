import type { DayEntry } from '@/data/days';
import { gramsOf, levelOf, type Level } from '@/data/drinks';
import type { Palette } from '@/theme/tokens';

export function entryLevel(entry: DayEntry | undefined): Level | null {
  if (!entry) return null;
  return entry.status === 'sober' ? 'sober' : levelOf(gramsOf(entry.drinks));
}

/** Fill and text colour for a day of the given level. Amber and red fills always carry dark text. */
export function levelColors(level: Level, colors: Palette): { fill: string; on: string } {
  if (level === 'sober') return { fill: colors.accent, on: colors.onAccent };
  if (level === 'light') return { fill: colors.light, on: '#0C1114' };
  if (level === 'moderate') return { fill: colors.moderate, on: '#0C1114' };
  return { fill: colors.heavy, on: colors.heavy === '#B3261E' ? '#FFFFFF' : '#0C1114' };
}
