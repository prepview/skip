import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

import { Text } from './Text';

type Props = { label: string; sub?: string; selected: boolean; onPress: () => void };

/** A full-width choice with an optional second line, used in the first-run questions. */
export function OptionCard({ label, sub, selected, onPress }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.surface, borderColor: selected ? colors.accent : colors.surface }]}>
      <Text variant="title">{label}</Text>
      {!!sub && (
        <Text variant="small" muted>
          {sub}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { minHeight: 60, borderRadius: 18, borderWidth: 1.5, paddingVertical: 10, paddingHorizontal: 18, justifyContent: 'center', gap: 2 },
});
