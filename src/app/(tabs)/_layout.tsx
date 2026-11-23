import { Redirect } from 'expo-router';
import { TabList, TabSlot, TabTrigger, Tabs, type TabListProps, type TabTriggerSlotProps } from 'expo-router/ui';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { Text } from '@/components/Text';
import { useSettings } from '@/data/settings';
import { useTheme } from '@/theme/ThemeProvider';

/** Height the floating tab bar takes up, so screens can pad their content past it. */
export const TAB_BAR_SPACE = 92;

export default function TabsLayout() {
  const { t } = useTranslation();
  const { onboarded } = useSettings();
  if (!onboarded) return <Redirect href="/onboarding" />;
  return (
    <Tabs>
      <TabSlot />
      <TabList asChild>
        <Bar>
          <TabTrigger name="index" href="/" asChild>
            <TabButton icon="today" label={t('tabs.today')} />
          </TabTrigger>
          <TabTrigger name="calendar" href="/calendar" asChild>
            <TabButton icon="calendar" label={t('tabs.calendar')} />
          </TabTrigger>
          <TabTrigger name="journey" href="/journey" asChild>
            <TabButton icon="journey" label={t('tabs.journey')} />
          </TabTrigger>
          <TabTrigger name="stats" href="/stats" asChild>
            <TabButton icon="stats" label={t('tabs.stats')} />
          </TabTrigger>
        </Bar>
      </TabList>
    </Tabs>
  );
}

/**
 * The floating pill. TabList hands its own props (including a style) to this child;
 * the style is replaced on purpose so the bar looks the same on every platform.
 */
function Bar(props: TabListProps) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View
      {...props}
      style={[styles.bar, { bottom: Math.max(insets.bottom, 12), backgroundColor: colors.tabBar, borderColor: colors.line }]}
    />
  );
}

type TabButtonProps = TabTriggerSlotProps & { icon: IconName; label: string };

function TabButton({ icon, label, isFocused, ...rest }: TabButtonProps) {
  // expo-router types the slot's ref for a View; Pressable accepts the same props at runtime.
  const props = rest as PressableProps;
  const { colors } = useTheme();
  const color = isFocused ? colors.text : colors.textMuted;
  return (
    <Pressable {...props} accessibilityRole="tab" accessibilityState={{ selected: !!isFocused }} style={styles.button}>
      <Icon name={icon} color={color} />
      <Text variant="small" color={color} numberOfLines={1} style={styles.label}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 16,
    right: 16,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  button: { flex: 1, minHeight: 48, alignItems: 'center', justifyContent: 'center', gap: 3 },
  label: { fontSize: 11, lineHeight: 14 },
});
