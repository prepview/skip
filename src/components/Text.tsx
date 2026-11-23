import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

const variants = {
  body: { fontFamily: fonts.regular, fontSize: 15, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.medium, fontSize: 15, lineHeight: 22 },
  small: { fontFamily: fonts.regular, fontSize: 13, lineHeight: 18 },
  label: { fontFamily: fonts.medium, fontSize: 11, lineHeight: 14, letterSpacing: 1.2, textTransform: 'uppercase' },
  title: { fontFamily: fonts.medium, fontSize: 17, lineHeight: 22 },
  headline: { fontFamily: fonts.serif, fontSize: 36, lineHeight: 40 },
  display: { fontFamily: fonts.serif, fontSize: 44, lineHeight: 48 },
} satisfies Record<string, TextStyle>;

type Props = RNTextProps & {
  variant?: keyof typeof variants;
  muted?: boolean;
  color?: string;
};

export function Text({ variant = 'body', muted, color, style, ...rest }: Props) {
  const { colors } = useTheme();
  return (
    <RNText
      {...rest}
      style={[variants[variant], { color: color ?? (muted ? colors.textMuted : colors.text) }, style]}
    />
  );
}
