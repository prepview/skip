/** Drink types, regional serving sizes and the alcohol maths shared by logging, calendar and stats. */

export type DrinkType = 'beer' | 'wine' | 'spirits' | 'cocktail' | 'sparkling';
export type Region = 'eu' | 'uk' | 'us';
export type Level = 'sober' | 'light' | 'moderate' | 'heavy';

export const drinkTypes: readonly DrinkType[] = ['beer', 'wine', 'spirits', 'cocktail', 'sparkling'];

/** One line of a day's log. Volume and strength are stored, so later region changes never rewrite history. */
export type DrinkLine = { type: DrinkType; ml: number; abv: number; count: number };

export type Size = {
  ml: number;
  abv: number;
  /** US sizes are shown in fluid ounces. */
  oz?: number;
  /** Sizes with a spoken name instead of a volume. */
  name?: 'pint' | 'halfPint' | 'single' | 'double';
};

type RegionProfile = { gramsPerUnit: number; unitKey: 'standard' | 'uk'; sizes: Record<DrinkType, Size[]> };

/** The first size of each type is the default. */
export const regions: Record<Region, RegionProfile> = {
  eu: {
    gramsPerUnit: 10,
    unitKey: 'standard',
    sizes: {
      beer: [{ ml: 330, abv: 5 }, { ml: 500, abv: 5 }, { ml: 250, abv: 5 }],
      wine: [{ ml: 150, abv: 12.5 }, { ml: 100, abv: 12.5 }, { ml: 200, abv: 12.5 }],
      spirits: [{ ml: 40, abv: 40 }, { ml: 20, abv: 40 }, { ml: 50, abv: 40 }],
      cocktail: [{ ml: 40, abv: 40, name: 'single' }, { ml: 80, abv: 40, name: 'double' }],
      sparkling: [{ ml: 125, abv: 12 }],
    },
  },
  uk: {
    gramsPerUnit: 8,
    unitKey: 'uk',
    sizes: {
      beer: [{ ml: 568, abv: 4.5, name: 'pint' }, { ml: 284, abv: 4.5, name: 'halfPint' }, { ml: 330, abv: 4.5 }],
      wine: [{ ml: 175, abv: 12.5 }, { ml: 125, abv: 12.5 }, { ml: 250, abv: 12.5 }],
      spirits: [{ ml: 25, abv: 40 }, { ml: 50, abv: 40 }],
      cocktail: [{ ml: 25, abv: 40, name: 'single' }, { ml: 50, abv: 40, name: 'double' }],
      sparkling: [{ ml: 125, abv: 12 }],
    },
  },
  us: {
    gramsPerUnit: 14,
    unitKey: 'standard',
    sizes: {
      beer: [{ ml: 355, abv: 5, oz: 12 }, { ml: 473, abv: 5, oz: 16 }],
      wine: [{ ml: 148, abv: 12, oz: 5 }, { ml: 177, abv: 12, oz: 6 }, { ml: 266, abv: 12, oz: 9 }],
      spirits: [{ ml: 44, abv: 40, oz: 1.5 }, { ml: 89, abv: 40, oz: 3 }],
      cocktail: [{ ml: 44, abv: 40, oz: 1.5, name: 'single' }, { ml: 89, abv: 40, oz: 3, name: 'double' }],
      sparkling: [{ ml: 118, abv: 12, oz: 4 }],
    },
  },
};

/** Ethanol weighs 0.789 g per millilitre. */
const ETHANOL_DENSITY = 0.789;

export function gramsOf(lines: readonly DrinkLine[] | undefined): number {
  if (!lines) return 0;
  return lines.reduce((sum, line) => sum + line.count * line.ml * (line.abv / 100) * ETHANOL_DENSITY, 0);
}

export function countOf(lines: readonly DrinkLine[] | undefined): number {
  return lines ? lines.reduce((sum, line) => sum + line.count, 0) : 0;
}

/**
 * How heavy a drinking day was. A day marked as drinking with no amounts counts as light,
 * because a one-tap log should never be shown as worse than it was.
 */
export function levelOf(grams: number): Exclude<Level, 'sober'> {
  if (grams < 30) return 'light';
  if (grams <= 60) return 'moderate';
  return 'heavy';
}

export function regionFromCountry(code: string | null | undefined): Region {
  if (code === 'GB') return 'uk';
  if (code === 'US') return 'us';
  return 'eu';
}
