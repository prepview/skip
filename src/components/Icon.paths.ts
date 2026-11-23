export type IconName =
  | 'today' | 'calendar' | 'journey' | 'stats' | 'check' | 'glass' | 'person' | 'back'
  | 'forward' | 'plus' | 'minus' | 'camera' | 'beer' | 'wine' | 'spirits' | 'cocktail' | 'sparkling';

/** Icons drawn from plain paths. Shared with the browser version of this file. */
export const extra: Partial<Record<IconName, string[]>> = {
  forward: ['M9.5 6l6 6-6 6'],
  plus: ['M12 6v12M6 12h12'],
  minus: ['M6 12h12'],
  camera: ['M4 8h3l1.5-2h7L17 8h3v11H4V8z', 'M8.5 13.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0'],
  beer: ['M6 6h9v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6z', 'M15 9h2.5a1.5 1.5 0 0 1 1.5 1.5v4a1.5 1.5 0 0 1-1.5 1.5H15M9 10v6M12 10v6'],
  wine: ['M7 3h10c0 5-1.5 9-5 9s-5-4-5-9z', 'M12 12v8M8.5 20h7'],
  spirits: ['M7 5h10l-1.2 14H8.2L7 5z', 'M7.6 12h8.8'],
  cocktail: ['M4 5h16l-8 8-8-8z', 'M12 13v7M8.5 20h7'],
  sparkling: ['M9 3h6l-.5 8a2.5 2.5 0 0 1-5 0L9 3z', 'M12 13.5V20M9.5 20h5'],
};
