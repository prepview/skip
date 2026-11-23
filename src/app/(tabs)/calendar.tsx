import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { entryLevel, levelColors } from '@/components/levels';
import { Text } from '@/components/Text';
import { dateKey, useDays, type DayMap } from '@/data/days';
import { countOf, gramsOf, regions, type Level } from '@/data/drinks';
import { useSettings } from '@/data/settings';
import { dateLocale } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

import { TAB_BAR_SPACE } from './_layout';

const LEVELS: Level[] = ['sober', 'light', 'moderate', 'heavy'];

/** Cells of a Monday-first month grid: null for the blanks before day 1. */
function monthCells(year: number, month: number): (Date | null)[] {
  const blanks = (new Date(year, month, 1).getDay() + 6) % 7;
  const count = new Date(year, month + 1, 0).getDate();
  return [...Array.from({ length: blanks }, () => null), ...Array.from({ length: count }, (_, i) => new Date(year, month, i + 1))];
}

export default function CalendarScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { days } = useDays();
  const { region } = useSettings();
  const locale = dateLocale();

  const today = new Date();
  const todayKey = dateKey(today);
  const [mode, setMode] = useState<'month' | 'year'>('month');
  const [cursor, setCursor] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selected, setSelected] = useState(todayKey);

  const monthName = (year: number, month: number, style: 'long' | 'short' = 'long') =>
    new Intl.DateTimeFormat(locale, { month: style }).format(new Date(year, month, 1));
  // 5 January 2026 is a Monday, which gives the weekday names in Monday-first order.
  const weekdayNames = Array.from({ length: 7 }, (_, i) =>
    new Intl.DateTimeFormat(locale, { weekday: 'short' }).format(new Date(2026, 0, 5 + i)),
  );

  const shift = (months: number) => {
    const next = new Date(cursor.year, cursor.month + months, 1);
    setCursor({ year: next.getFullYear(), month: next.getMonth() });
  };

  const frame = { backgroundColor: colors.background };
  const padding = { paddingTop: insets.top + 12, paddingBottom: TAB_BAR_SPACE + insets.bottom + 16 };

  if (mode === 'year') {
    return (
      <ScrollView style={frame} contentContainerStyle={[styles.content, padding]}>
        <View style={styles.header}>
          <Text variant="display" accessibilityRole="header" style={styles.flex}>
            {cursor.year}
          </Text>
          <NavButton icon="back" label={t('calendar.prevYear')} onPress={() => setCursor({ ...cursor, year: cursor.year - 1 })} />
          <NavButton icon="forward" label={t('calendar.nextYear')} onPress={() => setCursor({ ...cursor, year: cursor.year + 1 })} />
        </View>
        <View style={styles.yearGrid}>
          {Array.from({ length: 12 }, (_, month) => {
            const isCurrent = cursor.year === today.getFullYear() && month === today.getMonth();
            return (
              <Pressable
                key={month}
                accessibilityRole="button"
                accessibilityLabel={t('calendar.open', { month: monthName(cursor.year, month) })}
                onPress={() => {
                  setCursor({ year: cursor.year, month });
                  setMode('month');
                }}
                style={styles.miniMonth}>
                <Text variant="bodyStrong" color={isCurrent ? colors.accent : colors.text} style={isCurrent && { fontFamily: fonts.bold }}>
                  {monthName(cursor.year, month)}
                </Text>
                <View style={styles.miniGrid}>
                  {monthCells(cursor.year, month).map((date, index) => {
                    const level = date ? entryLevel(days[dateKey(date)]) : null;
                    const isToday = !!date && dateKey(date) === todayKey;
                    return (
                      <View
                        key={index}
                        style={[
                          styles.miniDot,
                          date && { backgroundColor: level ? levelColors(level, colors).fill : colors.surfaceRaised },
                          isToday && !level && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.text },
                        ]}
                      />
                    );
                  })}
                </View>
              </Pressable>
            );
          })}
        </View>
        <Legend />
      </ScrollView>
    );
  }

  const cells = monthCells(cursor.year, cursor.month);
  const monthEntries = cells.filter((d): d is Date => !!d).map((d) => days[dateKey(d)]);
  const soberCount = monthEntries.filter((e) => e?.status === 'sober').length;
  const drinkCount = monthEntries.filter((e) => e?.status === 'drink').length;

  return (
    <ScrollView style={frame} contentContainerStyle={[styles.content, padding]}>
      <Pressable accessibilityRole="button" accessibilityLabel={t('calendar.showYear')} onPress={() => setMode('year')} style={styles.yearLink}>
        <Icon name="back" color={colors.accent} strokeWidth={1.75} />
        <Text variant="bodyStrong" color={colors.accent} style={styles.yearLinkLabel}>
          {cursor.year}
        </Text>
      </Pressable>

      <View style={styles.header}>
        <Text variant="display" accessibilityRole="header" style={styles.flex} numberOfLines={1} adjustsFontSizeToFit>
          {monthName(cursor.year, cursor.month)}
        </Text>
        <NavButton icon="back" label={t('calendar.prev')} onPress={() => shift(-1)} />
        <NavButton icon="forward" label={t('calendar.next')} onPress={() => shift(1)} />
      </View>

      <View>
        <View style={styles.weekRow}>
          {weekdayNames.map((name) => (
            <Text key={name} variant="label" muted style={styles.weekName}>
              {name}
            </Text>
          ))}
        </View>
        <View style={styles.grid}>
          {cells.map((date, index) => {
            if (!date) return <View key={index} style={styles.cell} />;
            const key = dateKey(date);
            const level = entryLevel(days[key]);
            const paint = level ? levelColors(level, colors) : null;
            const future = key > todayKey;
            const isToday = key === todayKey;
            const isSelected = key === selected;
            const state = level ? t(`calendar.level.${level}`) : future ? t('calendar.upcoming') : t('calendar.notLogged');
            return (
              <Pressable
                key={key}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(date)}, ${state}`}
                onPress={() => setSelected(key)}
                style={styles.cell}>
                <View style={[styles.ring, isSelected && { borderColor: colors.text }]}>
                  <View
                    style={[
                      styles.dayDot,
                      paint && { backgroundColor: paint.fill },
                      isToday && !paint && { borderWidth: 1.5, borderColor: colors.text },
                    ]}>
                    <Text variant="bodyStrong" color={paint ? paint.on : future ? colors.textMuted : colors.text}>
                      {date.getDate()}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      <Legend />

      <View style={styles.tiles}>
        <Tile value={soberCount} label={t('calendar.soberDays', { count: soberCount })} accent />
        <Tile value={drinkCount} label={t('calendar.drinkDays', { count: drinkCount })} />
      </View>

      <DayCard dayKey={selected} days={days} todayKey={todayKey} gramsPerUnit={regions[region].gramsPerUnit} unitKey={regions[region].unitKey} />
    </ScrollView>
  );
}

function NavButton({ icon, label, onPress }: { icon: 'back' | 'forward'; label: string; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress} style={[styles.nav, { borderColor: colors.line }]}>
      <Icon name={icon} size={20} color={colors.text} strokeWidth={1.75} />
    </Pressable>
  );
}

function Legend() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <View style={styles.legend}>
      {LEVELS.map((level) => (
        <View key={level} style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: levelColors(level, colors).fill }]} />
          <Text variant="small" muted>
            {t(`calendar.level.${level}`)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function Tile({ value, label, accent }: { value: number; label: string; accent?: boolean }) {
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

type DayCardProps = { dayKey: string; days: DayMap; todayKey: string; gramsPerUnit: number; unitKey: 'standard' | 'uk' };

/** Details of the selected day, with a way into the logging screen. */
function DayCard({ dayKey: key, days, todayKey, gramsPerUnit, unitKey }: DayCardProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const locale = dateLocale();
  const entry = days[key];
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const future = key > todayKey;
  const level = entryLevel(entry);
  const grams = gramsOf(entry?.drinks);
  const units = grams / gramsPerUnit;

  const summary = entry?.drinks?.length
    ? entry.drinks.map((line) => `${line.count} × ${t(`drinks.${line.type}`)}`).join(', ')
    : entry?.status === 'drink'
      ? t('calendar.noDetail')
      : entry?.status === 'sober'
        ? t('calendar.noAlcohol')
        : future
          ? t('calendar.upcoming')
          : t('calendar.nothingYet');

  return (
    <View style={[styles.dayCard, { backgroundColor: colors.surface }]}>
      <View style={styles.dayCardHead}>
        <Text style={[styles.dayCardTitle, styles.flex]}>
          {new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(date)}
        </Text>
        {level && (
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: levelColors(level, colors).fill }]} />
            <Text variant="small">{t(`calendar.level.${level}`)}</Text>
          </View>
        )}
      </View>
      <Text>{summary}</Text>
      {(countOf(entry?.drinks) > 0 || !!entry?.tags?.length || !!entry?.mood) && (
        <View style={styles.pills}>
          {countOf(entry?.drinks) > 0 && (
            <Pill label={`${units.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} ${t(`units.${unitKey}`, { count: units })}`} />
          )}
          {entry?.tags?.map((tag) => <Pill key={tag} label={t(`tags.${tag}`)} />)}
          {entry?.mood && <Pill label={t(`moods.${entry.mood}`)} />}
        </View>
      )}
      {!!entry?.note && (
        <Text variant="small" muted style={[styles.note, { borderTopColor: colors.line }]}>
          {entry.note}
        </Text>
      )}
      {!future && (
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push(`/log/${key}`)}
          style={[styles.action, entry ? { borderWidth: 1, borderColor: colors.lineStrong } : { backgroundColor: colors.inverse }]}>
          <Text variant="bodyStrong" color={entry ? colors.text : colors.onInverse}>
            {entry ? t('calendar.edit') : t('calendar.logDay')}
          </Text>
        </Pressable>
      )}
    </View>
  );
}

function Pill({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.pill, { backgroundColor: colors.surfaceRaised }]}>
      <Text variant="small">{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 16 },
  flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 4 },
  nav: { width: 44, height: 44, borderRadius: 22, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  yearLink: { flexDirection: 'row', alignItems: 'center', minHeight: 44, alignSelf: 'flex-start', paddingRight: 12, marginBottom: -12 },
  yearLinkLabel: { fontSize: 16 },
  weekRow: { flexDirection: 'row', marginBottom: 4 },
  weekName: { flex: 1, textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, height: 48, alignItems: 'center', justifyContent: 'center' },
  ring: { width: 46, height: 46, borderRadius: 23, borderWidth: 1.5, borderColor: 'transparent', alignItems: 'center', justifyContent: 'center' },
  dayDot: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 6, paddingHorizontal: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  tiles: { flexDirection: 'row', gap: 10 },
  tile: { flex: 1, borderRadius: 16, paddingVertical: 12, paddingHorizontal: 14, gap: 2 },
  tileValue: { fontFamily: fonts.light, fontSize: 28, lineHeight: 34 },
  dayCard: { borderRadius: 20, padding: 18, gap: 10 },
  dayCardHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dayCardTitle: { fontFamily: fonts.serif, fontSize: 24, lineHeight: 28 },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { borderRadius: 14, paddingVertical: 6, paddingHorizontal: 12 },
  note: { borderTopWidth: 1, paddingTop: 10 },
  action: { minHeight: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  yearGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 20, paddingHorizontal: 4 },
  miniMonth: { width: `${100 / 3}%`, gap: 8 },
  miniGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 98, gap: 4 },
  miniDot: { width: 10, height: 10, borderRadius: 5 },
});
