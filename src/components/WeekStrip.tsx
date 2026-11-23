import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { dateKey, weekOf, type DayMap } from '@/data/days';
import { dateLocale } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

import { Icon } from './Icon';
import { Text } from './Text';

type Props = { days: DayMap; today: Date };

/** Monday-to-Sunday overview of the current week. */
export function WeekStrip({ days, today }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const todayKey = dateKey(today);
  const shortName = new Intl.DateTimeFormat(dateLocale(), { weekday: 'short' });
  const longName = new Intl.DateTimeFormat(dateLocale(), { weekday: 'long' });

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      {weekOf(today).map((date) => {
        const key = dateKey(date);
        const status = days[key]?.status;
        const isToday = key === todayKey;
        const state = status === 'sober' ? t('today.daySober') : status === 'drink' ? t('today.dayDrink') : t('today.dayOpen');
        const label = [longName.format(date), isToday ? t('today.dayToday') : null, state].filter(Boolean).join(', ');
        return (
          <View key={key} style={styles.day} accessible accessibilityLabel={label}>
            <Text variant="label" color={isToday ? colors.text : colors.textMuted} style={isToday && { fontFamily: fonts.bold }}>
              {shortName.format(date)}
            </Text>
            <View
              style={[
                styles.dot,
                status === 'sober' && { backgroundColor: colors.accent },
                status === 'drink' && { backgroundColor: colors.light },
                !status && { borderWidth: isToday ? 1.5 : 1, borderColor: isToday ? colors.text : colors.line },
              ]}>
              {status === 'sober' && <Icon name="check" size={18} color={colors.onAccent} strokeWidth={2.25} />}
              {status === 'drink' && <Icon name="glass" size={17} color="#0C1114" strokeWidth={1.75} />}
              {!status && (
                <Text variant="bodyStrong" color={isToday ? colors.text : colors.textMuted}>
                  {date.getDate()}
                </Text>
              )}
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', borderRadius: 20, paddingVertical: 14, paddingHorizontal: 6 },
  day: { flex: 1, alignItems: 'center', gap: 8 },
  dot: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
});
