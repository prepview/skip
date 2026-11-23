import { Pressable, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';

type Props = { value: boolean; label: string; onChange: (value: boolean) => void };

/** An on/off switch drawn the same way on every platform. */
export function Toggle({ value, label, onChange }: Props) {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={styles.hit}>
      <View style={[styles.track, { backgroundColor: value ? colors.accent : colors.lineStrong, justifyContent: value ? 'flex-end' : 'flex-start' }]}>
        <View style={styles.thumb} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  hit: { height: 44, justifyContent: 'center' },
  track: { width: 52, height: 32, borderRadius: 16, padding: 3, flexDirection: 'row' },
  thumb: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#FFFFFF' },
});
