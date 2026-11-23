import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

import { Icon } from './Icon';
import { Text } from './Text';

type Props = {
  value: number;
  min: number;
  max: number;
  unit: string;
  lessLabel: string;
  moreLabel: string;
  onChange: (value: number) => void;
};

/** A large number with minus and plus buttons, for picking days per week. */
export function Stepper({ value, min, max, unit, lessLabel, moreLabel, onChange }: Props) {
  const { colors } = useTheme();
  const button = (icon: 'minus' | 'plus', label: string, next: number, disabled: boolean) => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange(next)}
      style={[styles.button, { borderColor: colors.line }]}>
      <Icon name={icon} size={24} color={disabled ? colors.textMuted : colors.text} strokeWidth={1.75} />
    </Pressable>
  );
  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {button('minus', lessLabel, value - 1, value <= min)}
      <View style={styles.middle} accessible accessibilityLabel={`${value} ${unit}`}>
        <Text style={styles.value}>{value}</Text>
        <Text variant="label" muted style={styles.unit}>
          {unit}
        </Text>
      </View>
      {button('plus', moreLabel, value + 1, value >= max)}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 24, paddingVertical: 20, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
  button: { width: 60, height: 60, borderRadius: 30, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  middle: { flex: 1, alignItems: 'center', gap: 2 },
  value: { fontFamily: fonts.thin, fontSize: 88, lineHeight: 92 },
  unit: { textAlign: 'center' },
});
