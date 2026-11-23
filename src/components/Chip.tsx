import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

import { Text } from './Text';

type Props = { label: string; selected: boolean; onPress: () => void; grow?: boolean };

/** A toggleable pill, used for moods and occasions. */
export function Chip({ label, selected, onPress, grow }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        grow && styles.grow,
        { borderColor: selected ? colors.inverse : colors.line, backgroundColor: selected ? colors.inverse : 'transparent' },
      ]}>
      <Text variant="small" color={selected ? colors.onInverse : colors.text} numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: { minHeight: 44, borderRadius: 22, borderWidth: 1, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  grow: { flex: 1, paddingHorizontal: 6 },
  label: { fontSize: 14 },
});
