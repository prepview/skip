import { Link, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { SunriseScene } from '@/components/SunriseScene';
import { Text } from '@/components/Text';
import { WeekStrip } from '@/components/WeekStrip';
import { addDays, dateKey, soberStreak, useDays } from '@/data/days';
import { journeyEntries } from '@/data/journey';
import { planStatus, plannedFor } from '@/data/plan';
import { useSettings } from '@/data/settings';
import { computeStats } from '@/data/stats';
import { dateLocale } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, scene } from '@/theme/tokens';

import { TAB_BAR_SPACE } from './_layout';

export default function TodayScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { days, setDay } = useDays();
  const settings = useSettings();

  const today = new Date();
  const todayKey = dateKey(today);
  const todayStatus = days[todayKey]?.status;
  const streak = soberStreak(days, today);
  const lastLogged = days[todayKey] ?? days[dateKey(addDays(today, -1))];

  const goal = settings.weeklyGoal;
  const planned = plannedFor(today, settings);
  const plan = goal == null ? null : planStatus(days, goal, today);
  const weekdayShort = new Intl.DateTimeFormat(dateLocale(), { weekday: 'long' });
  const plannedNames = [...planned].sort((a, b) => a - b).map((i) => weekdayShort.format(new Date(2026, 0, 5 + i)));

  // The tip is the newest Journey entry already reached. After a drinking day it becomes a neutral prompt instead.
  const reached = computeStats(days, today).longestSober;
  const tip = [...journeyEntries].reverse().find((entry) => reached >= entry.day);
  const noteDay = todayStatus === 'drink' ? todayKey : lastLogged?.status === 'drink' ? dateKey(addDays(today, -1)) : null;

  // Link passes its child's style straight to the browser, which rejects style arrays, so this one is flattened.
  const tipStyle = StyleSheet.flatten([styles.tip, { backgroundColor: colors.surface }]);

  const dateLabel = new Intl.DateTimeFormat(dateLocale(), { weekday: 'long', day: 'numeric', month: 'long' }).format(today);

  // Four states: a running streak, a drink logged today, a fresh start after yesterday's drink, or nothing logged yet.
  const state = streak > 0 ? 'Streak' : todayStatus === 'drink' ? 'DrinkToday' : lastLogged?.status === 'drink' ? 'Reset' : 'Start';
  const headline = t(`today.headline${state}`, { count: streak });
  const body = t(`today.body${state}`);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE + insets.bottom }}
      bounces={false}>
      <SunriseScene style={[styles.scene, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topBar}>
          <Text variant="bodyStrong" color={scene.text} style={styles.date}>
            {dateLabel}
          </Text>
          <Link href="/profile" asChild>
            <Pressable accessibilityRole="button" accessibilityLabel={t('today.profile')} style={styles.profile}>
              <Icon name="person" color={scene.text} />
            </Pressable>
          </Link>
        </View>

        <View style={styles.hero}>
          <Text variant="label" color={scene.textSoft} style={styles.heroLabel}>
            {t('today.streakLabel')}
          </Text>
          <Text color={scene.text} style={styles.number}>
            {streak}
          </Text>
          <Text variant="label" color={scene.textSoft} style={styles.heroLabel}>
            {t('today.days', { count: streak })}
          </Text>
          {plan && (
            <View style={styles.marker}>
              {plan.onPlan && <Icon name="check" size={14} color={scene.text} strokeWidth={2.5} />}
              <Text variant="small" color={scene.text} style={styles.markerText}>
                {!plan.onPlan ? t('today.overPlan') : plan.weeks > 1 ? t('today.onPlanWeeks', { count: plan.weeks }) : t('today.onPlan')}
              </Text>
            </View>
          )}
          <Text variant="headline" color={scene.text} style={styles.headline}>
            {headline}
          </Text>
          <Text color={scene.textSoft} style={styles.body}>
            {body}
          </Text>
        </View>
      </SunriseScene>

      <View style={[styles.sheet, { backgroundColor: colors.background }]}>
        <View style={[styles.weekCard, { backgroundColor: colors.surface }]}>
          <WeekStrip days={days} today={today} planned={planned} />
          <Link href="/plan" asChild>
            <Pressable accessibilityRole="button" style={styles.planLink}>
              <Text variant="small" muted style={styles.planText}>
                {goal == null ? '' : plannedNames.length ? t('today.plannedList', { days: plannedNames.join(', ') }) : t('today.plannedNone')}{' '}
                <Text variant="small" color={colors.accent} style={styles.planAction}>
                  {goal == null ? t('today.setGoal') : t('today.planLink')}
                </Text>
              </Text>
            </Pressable>
          </Link>
        </View>

        {todayStatus ? (
          <View style={styles.checkin}>
            <Text variant="title" style={styles.checkinTitle}>
              {todayStatus === 'sober' ? t('today.loggedSober') : t('today.loggedDrink')}
            </Text>
            <View style={styles.buttons}>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(`/log/${todayKey}`)}
                style={[styles.button, styles.half, { borderWidth: 1, borderColor: colors.lineStrong }]}>
                <Text variant="bodyStrong" numberOfLines={1} adjustsFontSizeToFit>
                  {t('today.details')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDay(todayKey, null)}
                style={[styles.button, styles.half, { borderWidth: 1, borderColor: colors.line }]}>
                <Text variant="bodyStrong" numberOfLines={1} adjustsFontSizeToFit>
                  {t('today.undo')}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <View style={styles.checkin}>
            <Text variant="title" style={styles.checkinTitle}>
              {t('today.checkinTitle')}
            </Text>
            <View style={styles.buttons}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDay(todayKey, { status: 'sober' })}
                style={[styles.button, styles.half, { backgroundColor: colors.accent }]}>
                <Text variant="bodyStrong" color={colors.onAccent} numberOfLines={1} adjustsFontSizeToFit>
                  {t('today.sober')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push(`/log/${todayKey}`)}
                style={[styles.button, styles.half, { borderWidth: 1, borderColor: colors.lineStrong }]}>
                <Text variant="bodyStrong" numberOfLines={1} adjustsFontSizeToFit>
                  {t('today.drink')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}

        {noteDay ? (
          <Link href={`/log/${noteDay}`} asChild>
            <Pressable accessibilityRole="button" style={tipStyle}>
              <View style={styles.tipText}>
                <Text variant="label" muted>
                  {t('today.tipNoteLabel')}
                </Text>
                <Text>{t('today.tipNote')}</Text>
              </View>
              <Icon name="forward" size={20} color={colors.textMuted} strokeWidth={1.75} />
            </Pressable>
          </Link>
        ) : tip ? (
          <Link href="/journey" asChild>
            <Pressable accessibilityRole="button" style={tipStyle}>
              <View style={styles.tipText}>
                <Text variant="label" muted>
                  {t('today.tipDay', { count: tip.day })} · {t(`journey.topics.${tip.topic}`)}
                </Text>
                <Text>{t(`journey.entries.${tip.id}.title`)}</Text>
              </View>
              <Icon name="forward" size={20} color={colors.textMuted} strokeWidth={1.75} />
            </Pressable>
          </Link>
        ) : null}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scene: { minHeight: 580, paddingHorizontal: 20, paddingBottom: 120 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, gap: 12 },
  date: { flex: 1 },
  profile: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: scene.glassLine,
    backgroundColor: scene.glass,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hero: { alignItems: 'center', marginTop: 40 },
  heroLabel: { letterSpacing: 1.8 },
  number: { fontFamily: fonts.thin, fontSize: 120, lineHeight: 124, marginTop: 4 },
  marker: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minHeight: 26,
    paddingHorizontal: 12,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: scene.glassLine,
    backgroundColor: scene.glass,
    marginTop: 10,
  },
  markerText: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  headline: { textAlign: 'center', marginTop: 16, maxWidth: 320 },
  weekCard: { borderRadius: 20 },
  planLink: { minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12, paddingBottom: 6 },
  planText: { textAlign: 'center' },
  planAction: { fontFamily: fonts.medium },
  tip: { borderRadius: 20, paddingVertical: 14, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  tipText: { flex: 1, gap: 4 },
  body: { textAlign: 'center', marginTop: 8, maxWidth: 290 },
  sheet: {
    marginTop: -28,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 16,
  },
  checkin: { gap: 12 },
  checkinTitle: { paddingHorizontal: 4 },
  buttons: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  button: { minHeight: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 14 },
});
