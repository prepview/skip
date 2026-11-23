import { Link } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { SunriseScene } from '@/components/SunriseScene';
import { Text } from '@/components/Text';
import { WeekStrip } from '@/components/WeekStrip';
import { addDays, dateKey, soberStreak, useDays } from '@/data/days';
import { dateLocale } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, scene } from '@/theme/tokens';

import { TAB_BAR_SPACE } from './_layout';

export default function TodayScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { days, setDay } = useDays();

  const today = new Date();
  const todayKey = dateKey(today);
  const todayStatus = days[todayKey]?.status;
  const streak = soberStreak(days, today);
  const lastLogged = days[todayKey] ?? days[dateKey(addDays(today, -1))];

  const dateLabel = new Intl.DateTimeFormat(dateLocale(), { weekday: 'long', day: 'numeric', month: 'long' }).format(today);

  // Three states: a running streak, a fresh start after a drinking day, or nothing logged yet.
  const headline =
    streak > 0
      ? t('today.headlineStreak', { count: streak })
      : lastLogged?.status === 'drink'
        ? t('today.headlineReset')
        : t('today.headlineStart');
  const body =
    streak > 0 ? t('today.bodyStreak') : lastLogged?.status === 'drink' ? t('today.bodyReset') : t('today.bodyStart');

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
          <Text variant="headline" color={scene.text} style={styles.headline}>
            {headline}
          </Text>
          <Text color={scene.textSoft} style={styles.body}>
            {body}
          </Text>
        </View>
      </SunriseScene>

      <View style={[styles.sheet, { backgroundColor: colors.background }]}>
        <WeekStrip days={days} today={today} />

        {todayStatus ? (
          <View style={styles.checkin}>
            <Text variant="title" style={styles.checkinTitle}>
              {todayStatus === 'sober' ? t('today.loggedSober') : t('today.loggedDrink')}
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setDay(todayKey, null)}
              style={[styles.button, { borderWidth: 1, borderColor: colors.line }]}>
              <Text variant="bodyStrong">{t('today.undo')}</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.checkin}>
            <Text variant="title" style={styles.checkinTitle}>
              {t('today.checkinTitle')}
            </Text>
            <View style={styles.buttons}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDay(todayKey, 'sober')}
                style={[styles.button, styles.half, { backgroundColor: colors.accent }]}>
                <Text variant="bodyStrong" color={colors.onAccent} numberOfLines={1} adjustsFontSizeToFit>
                  {t('today.sober')}
                </Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={() => setDay(todayKey, 'drink')}
                style={[styles.button, styles.half, { borderWidth: 1, borderColor: colors.lineStrong }]}>
                <Text variant="bodyStrong" numberOfLines={1} adjustsFontSizeToFit>
                  {t('today.drink')}
                </Text>
              </Pressable>
            </View>
          </View>
        )}
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
  headline: { textAlign: 'center', marginTop: 16, maxWidth: 320 },
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
