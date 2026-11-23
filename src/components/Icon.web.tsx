import type { IconName } from './Icon';

type Props = { name: IconName; size?: number; color: string; strokeWidth?: number };

const paths: Record<IconName, string[]> = {
  today: ['M4 12a8 8 0 1 0 16 0a8 8 0 1 0 -16 0', 'M9.5 12a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0'],
  calendar: ['M6.5 5.5h11a2.5 2.5 0 0 1 2.5 2.5v9.5a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5V8a2.5 2.5 0 0 1 2.5-2.5z', 'M4 10h16M8.5 3.5v4M15.5 3.5v4'],
  journey: ['M12 20v-8', 'M12 12c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6z', 'M12 14c0-2.5-2-4.5-6-4.5 0 2.5 2 4.5 6 4.5z'],
  stats: ['M6 20v-7M12 20V5M18 20V10'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  glass: ['M7 3h10c0 5-1.5 9-5 9s-5-4-5-9z', 'M12 12v8M8.5 20h7'],
  person: ['M8.5 8.5a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0 -7 0', 'M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5'],
  back: ['M14.5 6l-6 6 6 6'],
};

/**
 * Browser version of the icon set. The app targets phones; this file exists so the
 * web preview does not depend on react-native-svg's browser support.
 */
export function Icon({ name, size = 22, color, strokeWidth = 1.5 }: Props) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round">
      {paths[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
