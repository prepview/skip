import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Text } from '@/components/Text';
import { useDays } from '@/data/days';
import { regions } from '@/data/drinks';
import { useSettings } from '@/data/settings';
import { computeStats } from '@/data/stats';
import { dateLocale } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

import { TAB_BAR_SPACE } from './_layout';

export default function StatsScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { days } = useDays();
  const { region } = useSettings();
  const profile = regions[region];
  const locale = dateLocale();

  const today = new Date();
  const stats = computeStats(days, today);
  const one = (value: number) => value.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const month = new Intl.DateTimeFormat(locale, { month: 'long' }).format(today);
  const monthInitials = stats.perMonth.map((_, i) =>
    new Intl.DateTimeFormat(locale, { month: 'narrow' }).format(new Date(today.getFullYear(), i, 1)),
  );
  // 5 January 2026 is a Monday, which gives the weekday names in Monday-first order.
  const weekday = (index: number, style: 'short' | 'long') =>
    new Intl.DateTimeFormat(locale, { weekday: style }).format(new Date(2026, 0, 5 + index));
  const perDrinkDay = stats.gramsPerDrinkDay / profile.gramsPerUnit;
  const perDay = stats.gramsPerDay / profile.gramsPerUnit;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: TAB_BAR_SPACE + insets.bottom + 16 }]}>
      <View style={styles.head}>
        <Text variant="display" accessibilityRole="header">
          {t('tabs.stats')}
        </Text>
        <Text variant="small" muted>
          {stats.logged ? t('stats.subtitle') : t('stats.empty')}
        </Text>
      </View>

      <View style={styles.tiles}>
        <Tile value={String(stats.weekDrinkDays)} label={t('stats.weekDrink', { count: stats.weekDrinkDays })} />
        <Tile value={String(stats.monthSober)} label={t('stats.monthSober', { month, count: stats.monthSober })} accent />
        <Tile value={String(stats.currentStreak)} label={t('stats.currentStreak', { count: stats.currentStreak })} accent />
        <Tile value={String(stats.longestSober)} label={t('stats.longestSober', { count: stats.longestSober })} />
        <Tile value={String(stats.longestDrink)} label={t('stats.longestDrink', { count: stats.longestDrink })} />
        <Tile value={`${stats.soberPercent}%`} label={t('stats.percent')} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text variant="title">{t('stats.perMonth')}</Text>
        <Bars values={stats.perMonth} labels={monthInitials} max={31} color={colors.accent} />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text variant="title">{t('stats.avgWeek')}</Text>
        <View style={styles.pair}>
          <Figure value={one(stats.soberPerWeek)} label={t('stats.avgSober')} accent />
          <Figure value={one(stats.drinkPerWeek)} label={t('stats.avgDrink')} divided />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        {stats.topWeekday >= 0 && <Text style={styles.serif}>{t('stats.weekdayTitle', { day: weekday(stats.topWeekday, 'long') })}</Text>}
        <Text variant={stats.topWeekday >= 0 ? 'small' : 'title'} muted={stats.topWeekday >= 0}>
          {t('stats.weekdaySub')}
        </Text>
        <Bars
          values={stats.perWeekday}
          labels={stats.perWeekday.map((_, i) => weekday(i, 'short'))}
          max={Math.max(1, ...stats.perWeekday)}
          color={colors.moderate}
        />
      </View>

      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text variant="title">{t('stats.howMuch')}</Text>
        <View style={styles.pair}>
          <Figure value={one(perDrinkDay)} label={t('stats.perDrinkDay', { unit: t(`units.${profile.unitKey}`, { count: perDrinkDay }) })} />
          <Figure value={one(perDay)} label={t('stats.perDay', { unit: t(`units.${profile.unitKey}`, { count: perDay }) })} divided />
        </View>
      </View>
    </ScrollView>
  );
}

function Tile({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.tile, { backgroundColor: colors.surface }]}>
      <Text color={accent ? colors.accent : colors.text} style={styles.tileValue}>
        {value}
      </Text>
      <Text variant="small" muted>
        {label}
      </Text>
    </View>
  );
}

function Figure({ value, label, accent, divided }: { value: string; label: string; accent?: boolean; divided?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.figure, divided && { borderLeftWidth: 1, borderLeftColor: colors.line, paddingLeft: 14 }]}>
      <Text color={accent ? colors.accent : colors.text} style={styles.figureValue}>
        {value}
      </Text>
      <Text variant="small" muted>
        {label}
      </Text>
    </View>
  );
}

type BarsProps = { values: number[]; labels: string[]; max: number; color: string };

/** A small single-series bar chart. Every bar carries its value, so nothing depends on colour or hover. */
function Bars({ values, labels, max, color }: BarsProps) {
  const { colors } = useTheme();
  const HEIGHT = 96;
  return (
    <View>
      <View style={[styles.bars, { borderBottomColor: colors.lineStrong }]}>
        {values.map((value, index) => (
          <View key={index} style={styles.barColumn} accessible accessibilityLabel={`${labels[index]}: ${value}`}>
            <Text variant="small" style={styles.barValue}>
              {value}
            </Text>
            <View style={[styles.bar, { backgroundColor: color, height: value > 0 ? Math.max(3, (value / max) * HEIGHT) : 0 }]} />
          </View>
        ))}
      </View>
      <View style={styles.barLabels}>
        {labels.map((label, index) => (
          <Text key={index} variant="small" muted style={styles.barLabel} numberOfLines={1}>
            {label}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 14 },
  head: { paddingHorizontal: 4, gap: 2 },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: { width: '48.5%', flexGrow: 1, borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, gap: 2 },
  tileValue: { fontFamily: fonts.light, fontSize: 32, lineHeight: 38 },
  card: { borderRadius: 20, padding: 18, gap: 12 },
  serif: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 30 },
  pair: { flexDirection: 'row', gap: 12 },
  figure: { flex: 1, gap: 2 },
  figureValue: { fontFamily: fonts.light, fontSize: 28, lineHeight: 34 },
  bars: { flexDirection: 'row', alignItems: 'flex-end', height: 124, gap: 2, borderBottomWidth: 1 },
  barColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', gap: 4 },
  barValue: { fontSize: 11, lineHeight: 14 },
  bar: { width: '100%', maxWidth: 26, borderTopLeftRadius: 4, borderTopRightRadius: 4 },
  barLabels: { flexDirection: 'row', gap: 2, marginTop: 6 },
  barLabel: { flex: 1, textAlign: 'center', fontSize: 11, lineHeight: 14 },
});
