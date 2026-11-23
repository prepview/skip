import { addDays, dateKey, parseKey, soberStreak, weekOf, type DayMap } from './days';
import { gramsOf } from './drinks';

export type Stats = {
  logged: number;
  sober: number;
  drink: number;
  currentStreak: number;
  longestSober: number;
  longestDrink: number;
  /** Share of logged days that were alcohol-free, 0 to 100. */
  soberPercent: number;
  weekDrinkDays: number;
  monthSober: number;
  /** Alcohol-free days per month of the current year, January first, up to the current month. */
  perMonth: number[];
  /** Drinking days per weekday, Monday first. */
  perWeekday: number[];
  /** Index into perWeekday of the heaviest weekday, or -1 when there is no drinking day. */
  topWeekday: number;
  soberPerWeek: number;
  drinkPerWeek: number;
  gramsPerDrinkDay: number;
  gramsPerDay: number;
};

/** Every number on the Stats screen, derived from the day log. Days nobody logged break a run. */
export function computeStats(days: DayMap, today: Date): Stats {
  const keys = Object.keys(days).sort();
  const perMonth = Array.from({ length: today.getMonth() + 1 }, () => 0);
  const perWeekday = [0, 0, 0, 0, 0, 0, 0];
  let sober = 0;
  let drink = 0;
  let grams = 0;
  let longestSober = 0;
  let longestDrink = 0;

  const first = keys.length ? parseKey(keys[0]) : null;
  if (first) {
    let soberRun = 0;
    let drinkRun = 0;
    for (let cursor = first; cursor <= today; cursor = addDays(cursor, 1)) {
      const entry = days[dateKey(cursor)];
      if (entry?.status === 'sober') {
        sober += 1;
        soberRun += 1;
        drinkRun = 0;
        if (cursor.getFullYear() === today.getFullYear()) perMonth[cursor.getMonth()] += 1;
      } else if (entry?.status === 'drink') {
        drink += 1;
        drinkRun += 1;
        soberRun = 0;
        grams += gramsOf(entry.drinks);
        perWeekday[(cursor.getDay() + 6) % 7] += 1;
      } else {
        soberRun = 0;
        drinkRun = 0;
      }
      longestSober = Math.max(longestSober, soberRun);
      longestDrink = Math.max(longestDrink, drinkRun);
    }
  }

  const logged = sober + drink;
  const weeks = logged / 7;
  const topCount = Math.max(...perWeekday);
  return {
    logged,
    sober,
    drink,
    currentStreak: soberStreak(days, today),
    longestSober,
    longestDrink,
    soberPercent: logged ? Math.round((sober / logged) * 100) : 0,
    weekDrinkDays: weekOf(today).filter((d) => days[dateKey(d)]?.status === 'drink').length,
    monthSober: perMonth[today.getMonth()],
    perMonth,
    perWeekday,
    topWeekday: topCount > 0 ? perWeekday.indexOf(topCount) : -1,
    soberPerWeek: weeks ? sober / weeks : 0,
    drinkPerWeek: weeks ? drink / weeks : 0,
    gramsPerDrinkDay: drink ? grams / drink : 0,
    gramsPerDay: logged ? grams / logged : 0,
  };
}
