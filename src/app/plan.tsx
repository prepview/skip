import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Stepper } from '@/components/Stepper';
import { Text } from '@/components/Text';
import { Toggle } from '@/components/Toggle';
import { dateKey, useDays, weekOf } from '@/data/days';
import { plannedFor, weekKey } from '@/data/plan';
import { useSettings } from '@/data/settings';
import { dateLocale } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';

export default function PlanScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { days } = useDays();
  const settings = useSettings();
  const locale = dateLocale();

  const today = new Date();
  const todayKey = dateKey(today);
  const week = weekOf(today);

  const [goal, setGoal] = useState(settings.weeklyGoal ?? 2);
  const [planned, setPlanned] = useState<number[]>(() => plannedFor(today, { ...settings, weeklyGoal: settings.weeklyGoal ?? 2 }));
  const [repeat, setRepeat] = useState(true);
  const chosen = planned.slice(0, goal);

  const toggle = (index: number) => {
    // Picking one more than the goal allows drops the earliest pick, so the count never exceeds the goal.
    const next = chosen.includes(index) ? chosen.filter((i) => i !== index) : [...chosen, index];
    setPlanned(next.slice(Math.max(0, next.length - goal)));
  };

  const save = () => {
    settings.update({
      weeklyGoal: goal,
      weekPlans: { ...settings.weekPlans, [weekKey(today)]: chosen },
      ...(repeat ? { plannedWeekdays: chosen } : {}),
    });
    router.back();
  };

  const range = `${new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(week[0])} – ${new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(week[6])}`;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 }]}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
        <Icon name="back" color={colors.accent} strokeWidth={1.75} />
        <Text variant="bodyStrong" color={colors.accent} style={styles.backLabel}>
          {t('plan.back')}
        </Text>
      </Pressable>

      <View style={styles.head}>
        <Text variant="headline" accessibilityRole="header">
          {t('plan.title')}
        </Text>
        <Text muted>{t('plan.intro')}</Text>
      </View>

      <Stepper
        value={goal}
        min={0}
        max={7}
        unit={t('plan.goalLabel')}
        lessLabel={t('plan.fewer')}
        moreLabel={t('plan.more')}
        onChange={setGoal}
      />

      <View style={styles.rangeRow}>
        <Text variant="label" muted style={styles.flex}>
          {range}
        </Text>
        <Text variant="small">{goal === 0 ? '' : t('plan.counter', { count: chosen.length, goal })}</Text>
      </View>

      {goal === 0 ? (
        <Text muted style={styles.zero}>
          {t('plan.zero')}
        </Text>
      ) : (
        <View style={[styles.list, { backgroundColor: colors.surface }]}>
          {week.map((date, index) => {
            const key = dateKey(date);
            const status = days[key]?.status;
            const on = chosen.includes(index);
            const isToday = key === todayKey;
            return (
              <View key={key} style={[styles.row, index > 0 && { borderTopWidth: 1, borderTopColor: colors.line }]}>
                <View style={styles.flex}>
                  <Text variant="bodyStrong" style={styles.dayName}>
                    {new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(date)}
                  </Text>
                  <Text variant="small" muted>
                    {isToday ? t('plan.today') : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short' }).format(date)}
                  </Text>
                </View>
                {status ? (
                  <Text variant="small" color={status === 'sober' ? colors.accent : colors.text}>
                    {status === 'sober' ? t('plan.sober') : t('plan.drink')}
                  </Text>
                ) : key < todayKey ? null : (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityState={{ selected: on }}
                    onPress={() => toggle(index)}
                    style={[
                      styles.pick,
                      on ? { borderColor: colors.planned, borderStyle: 'dashed', borderWidth: 1.5 } : { borderColor: colors.line, borderWidth: 1 },
                    ]}>
                    <Text variant="bodyStrong" color={on ? colors.planned : colors.text} style={styles.pickLabel}>
                      {on ? t('plan.planned') : t('plan.plan')}
                    </Text>
                  </Pressable>
                )}
              </View>
            );
          })}
        </View>
      )}

      {goal > 0 && (
        <View style={[styles.list, styles.repeat, { backgroundColor: colors.surface }]}>
          <View style={styles.flex}>
            <Text style={styles.dayName}>{t('plan.repeat')}</Text>
            <Text variant="small" muted>
              {t('plan.repeatSub')}
            </Text>
          </View>
          <Toggle value={repeat} label={t('plan.repeat')} onChange={setRepeat} />
        </View>
      )}

      <View style={[styles.how, { borderColor: colors.line }]}>
        <Text variant="label" muted>
          {t('plan.howTitle')}
        </Text>
        <Text variant="small">{t('plan.how1')}</Text>
        <Text variant="small">{t('plan.how2')}</Text>
        <Text variant="small">{t('plan.how3')}</Text>
      </View>

      <Pressable accessibilityRole="button" onPress={save} style={[styles.save, { backgroundColor: colors.inverse }]}>
        <Text variant="bodyStrong" color={colors.onInverse} style={styles.saveLabel}>
          {t('plan.save')}
        </Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 16 },
  flex: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', minHeight: 44, alignSelf: 'flex-start', paddingRight: 12 },
  backLabel: { fontSize: 16 },
  head: { paddingHorizontal: 4, gap: 6 },
  rangeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 4, gap: 12 },
  zero: { paddingHorizontal: 4 },
  list: { borderRadius: 20, paddingHorizontal: 16 },
  row: { minHeight: 60, flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayName: { fontSize: 16 },
  pick: { minHeight: 44, minWidth: 104, borderRadius: 22, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  pickLabel: { fontSize: 14 },
  repeat: { minHeight: 64, flexDirection: 'row', alignItems: 'center', gap: 12 },
  how: { borderWidth: 1, borderRadius: 20, padding: 16, gap: 8 },
  save: { minHeight: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  saveLabel: { fontSize: 16 },
});
