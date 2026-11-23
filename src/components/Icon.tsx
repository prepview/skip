import Svg, { Circle, Path, Rect } from 'react-native-svg';

import { extra, type IconName } from './Icon.paths';

export type { IconName };

type Props = { name: IconName; size?: number; color: string; strokeWidth?: number };

export function Icon({ name, size = 22, color, strokeWidth = 1.5 }: Props) {
  const stroke = { stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round', fill: 'none' } as const;
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'today' && (
        <>
          <Circle cx={12} cy={12} r={8} {...stroke} />
          <Circle cx={12} cy={12} r={2.5} {...stroke} />
        </>
      )}
      {name === 'calendar' && (
        <>
          <Rect x={4} y={5.5} width={16} height={14.5} rx={2.5} {...stroke} />
          <Path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" {...stroke} />
        </>
      )}
      {name === 'journey' && (
        <>
          <Path d="M12 20v-8" {...stroke} />
          <Path d="M12 12c0-3.5 2.5-6 7-6 0 3.5-2.5 6-7 6z" {...stroke} />
          <Path d="M12 14c0-2.5-2-4.5-6-4.5 0 2.5 2 4.5 6 4.5z" {...stroke} />
        </>
      )}
      {name === 'stats' && <Path d="M6 20v-7M12 20V5M18 20V10" {...stroke} />}
      {name === 'check' && <Path d="M5 12.5l4.5 4.5L19 7.5" {...stroke} />}
      {name === 'glass' && (
        <>
          <Path d="M7 3h10c0 5-1.5 9-5 9s-5-4-5-9z" {...stroke} />
          <Path d="M12 12v8M8.5 20h7" {...stroke} />
        </>
      )}
      {name === 'person' && (
        <>
          <Circle cx={12} cy={8.5} r={3.5} {...stroke} />
          <Path d="M5 20c.8-3.6 3.5-5.5 7-5.5s6.2 1.9 7 5.5" {...stroke} />
        </>
      )}
      {name === 'back' && <Path d="M14.5 6l-6 6 6 6" {...stroke} />}
      {extra[name]?.map((d) => <Path key={d} d={d} {...stroke} />)}
    </Svg>
  );
}
