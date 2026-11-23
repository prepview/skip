import { addDays, dateKey, weekOf, type DayMap } from './days';
import type { Settings } from './settings';

type PlanSettings = Pick<Settings, 'weeklyGoal' | 'plannedWeekdays' | 'weekPlans'>;

/** Key of the Monday that starts the week containing the given date. */
export function weekKey(date: Date): string {
  return dateKey(weekOf(date)[0]);
}

/** Planned drinking days for a week, as Monday-first indexes, never more than the weekly goal allows. */
export function plannedFor(date: Date, settings: PlanSettings): number[] {
  if (settings.weeklyGoal == null) return [];
  const chosen = settings.weekPlans[weekKey(date)] ?? settings.plannedWeekdays;
  return chosen.slice(0, settings.weeklyGoal);
}

function drinkDays(days: DayMap, week: Date[]): number {
  return week.filter((d) => days[dateKey(d)]?.status === 'drink').length;
}

export type PlanStatus = {
  /** True while this week's drinking days are within the goal. */
  onPlan: boolean;
  used: number;
  /** Consecutive weeks on plan, counting this week when it is on plan. */
  weeks: number;
};

/**
 * Whether the user is doing what they decided to do. A past week counts when it has
 * at least one logged day and no more drinking days than the goal; an unlogged week ends the run.
 */
export function planStatus(days: DayMap, goal: number, today: Date): PlanStatus {
  const thisWeek = weekOf(today);
  const used = drinkDays(days, thisWeek);
  const onPlan = used <= goal;
  let weeks = onPlan ? 1 : 0;
  if (onPlan) {
    for (let monday = addDays(thisWeek[0], -7); weeks < 520; monday = addDays(monday, -7)) {
      const week = weekOf(monday);
      const logged = week.some((d) => days[dateKey(d)]);
      if (!logged || drinkDays(days, week) > goal) break;
      weeks += 1;
    }
  }
  return { onPlan, used, weeks };
}
