import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/Chip';
import { Icon } from '@/components/Icon';
import { levelColors } from '@/components/levels';
import { Segmented } from '@/components/Segmented';
import { Text } from '@/components/Text';
import { dateKey, moods, parseKey, tags, useDays, type DayEntry, type DayStatus, type Mood, type Tag } from '@/data/days';
import { countOf, drinkTypes, gramsOf, levelOf, regions, type DrinkLine, type DrinkType, type Size } from '@/data/drinks';
import { dropPhoto, keepPhoto, photoUri } from '@/data/photos';
import { useSettings } from '@/data/settings';
import { dateLocale } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

type Line = { ml: number; abv: number; count: number; sizeIndex: number };
type Lines = Record<DrinkType, Line>;

export default function LogScreen() {
  const { date } = useLocalSearchParams<{ date: string }>();
  const day = parseKey(date ?? '');
  const today = new Date();
  // Only real, non-future days can be logged.
  if (!day || dateKey(day) > dateKey(today)) return <Redirect href="/" />;
  return <LogForm day={day} />;
}

function LogForm({ day }: { day: Date }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { days, setDay } = useDays();
  const { region } = useSettings();
  const profile = regions[region];
  const key = dateKey(day);
  const saved = days[key];
  const locale = dateLocale();

  const [status, setStatus] = useState<DayStatus>(saved?.status ?? 'drink');
  const [lines, setLines] = useState<Lines>(() => initialLines(profile.sizes, saved?.drinks));
  const [mood, setMood] = useState<Mood | undefined>(saved?.mood);
  const [picked, setPicked] = useState<Tag[]>(saved?.tags ?? []);
  const [note, setNote] = useState(saved?.note ?? '');
  const [photo, setPhoto] = useState<string | undefined>(saved?.photo);

  const drinks: DrinkLine[] = drinkTypes
    .filter((type) => lines[type].count > 0)
    .map((type) => ({ type, ml: lines[type].ml, abv: lines[type].abv, count: lines[type].count }));
  const grams = gramsOf(drinks);
  const total = countOf(drinks);
  const units = grams / profile.gramsPerUnit;
  const level = total > 0 ? levelColors(levelOf(grams), colors) : null;

  const change = (type: DrinkType, patch: Partial<Line>) =>
    setLines((current) => ({ ...current, [type]: { ...current[type], ...patch } }));

  const cycleSize = (type: DrinkType) => {
    const sizes = profile.sizes[type];
    const next = (lines[type].sizeIndex + 1) % sizes.length;
    change(type, { sizeIndex: next, ml: sizes[next].ml, abv: sizes[next].abv });
  };

  const sizeText = (type: DrinkType, line: Line) => {
    const size: Size = profile.sizes[type][line.sizeIndex] ?? { ml: line.ml, abv: line.abv };
    const volume = size.oz ? `${size.oz.toLocaleString(locale)} fl oz` : `${size.ml} ml`;
    if (type === 'cocktail' && size.name) return `${t(`sizes.${size.name}`)}, ${volume}`;
    const base = size.name === 'pint' || size.name === 'halfPint' ? t(`sizes.${size.name}`) : volume;
    return `${base} · ${size.abv.toLocaleString(locale)}%`;
  };

  const pickPhoto = async () => {
    let result: ImagePicker.ImagePickerResult | undefined;
    if (Platform.OS !== 'web') {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (permission.granted) result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.7 });
    }
    // No camera (browser) or camera access declined: choose from the photo library instead.
    result ??= await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.7 });
    if (result.canceled || !result.assets[0]) return;
    if (photo && photo !== saved?.photo) dropPhoto(photo);
    setPhoto(keepPhoto(result.assets[0].uri, key));
  };

  const save = () => {
    const trimmed = note.trim();
    const entry: DayEntry = { status };
    if (mood) entry.mood = mood;
    if (trimmed) entry.note = trimmed;
    if (status === 'drink') {
      if (drinks.length) entry.drinks = drinks;
      if (picked.length) entry.tags = picked;
      if (photo) entry.photo = photo;
    }
    // A photo that was replaced, removed or left behind by switching to alcohol-free is deleted.
    if (saved?.photo && saved.photo !== entry.photo) dropPhoto(saved.photo);
    if (photo && photo !== entry.photo) dropPhoto(photo);
    setDay(key, entry);
    router.back();
  };

  const clear = () => {
    if (saved?.photo) dropPhoto(saved.photo);
    setDay(key, null);
    router.back();
  };

  const title = new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long' }).format(day);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 28 }]}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
        <Icon name="back" color={colors.accent} strokeWidth={1.75} />
        <Text variant="bodyStrong" color={colors.accent} style={styles.backLabel}>
          {t('log.back')}
        </Text>
      </Pressable>

      <Text variant="headline" accessibilityRole="header" style={styles.title}>
        {title}
      </Text>

      <Segmented
        label={title}
        value={status}
        onChange={setStatus}
        options={[
          { value: 'sober', label: t('log.sober') },
          { value: 'drink', label: t('log.drink') },
        ]}
      />

      {status === 'sober' ? (
        <View style={[styles.card, styles.soberCard, { backgroundColor: colors.surface }]}>
          <View style={[styles.soberDot, { backgroundColor: colors.accent }]}>
            <Icon name="check" color={colors.onAccent} strokeWidth={2.25} />
          </View>
          <Text style={styles.flex}>{t('log.soberNote')}</Text>
        </View>
      ) : (
        <>
          <View style={[styles.card, styles.rows, { backgroundColor: colors.surface }]}>
            {drinkTypes.map((type, index) => {
              const line = lines[type];
              const name = t(`drinks.${type}`);
              return (
                <View key={type} style={[styles.row, index > 0 && { borderTopWidth: 1, borderTopColor: colors.line }]}>
                  <View style={[styles.rowIcon, { backgroundColor: colors.surfaceRaised }]}>
                    <Icon name={type} color={colors.text} />
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('log.changeSize', { drink: name })}
                    accessibilityValue={{ text: sizeText(type, line) }}
                    onPress={() => cycleSize(type)}
                    style={styles.rowText}>
                    <Text variant="bodyStrong" style={styles.rowName}>
                      {name}
                    </Text>
                    <Text variant="small" muted style={styles.sizeText}>
                      {sizeText(type, line)}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('log.less', { drink: name })}
                    disabled={line.count === 0}
                    onPress={() => change(type, { count: Math.max(0, line.count - 1) })}
                    style={styles.step}>
                    <Icon name="minus" size={20} color={line.count === 0 ? colors.textMuted : colors.text} strokeWidth={1.75} />
                  </Pressable>
                  <Text style={styles.count}>{line.count}</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t('log.more', { drink: name })}
                    onPress={() => change(type, { count: line.count + 1 })}
                    style={styles.step}>
                    <Icon name="plus" size={20} color={colors.text} strokeWidth={1.75} />
                  </Pressable>
                </View>
              );
            })}
          </View>

          <View style={[styles.card, styles.total, { backgroundColor: colors.surface }]}>
            <View style={styles.flex}>
              <Text style={styles.totalValue}>
                {units.toLocaleString(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}{' '}
                {t(`units.${profile.unitKey}`, { count: units })}
              </Text>
              <Text variant="small" muted>
                {t('log.drinks', { count: total })}, {t('log.grams', { grams: Math.round(grams) })}
              </Text>
            </View>
            <View style={[styles.level, { backgroundColor: level?.fill ?? colors.surfaceRaised }]}>
              <Text variant="small" color={level?.on ?? colors.text} style={styles.levelText}>
                {total > 0 ? t(`log.${levelOf(grams)}`) : t('log.nothing')}
              </Text>
            </View>
          </View>

          {photo ? (
            <View style={styles.photoWrap}>
              <Image source={{ uri: photoUri(photo) }} style={styles.photo} contentFit="cover" accessibilityLabel={t('log.photo')} />
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  if (photo !== saved?.photo) dropPhoto(photo);
                  setPhoto(undefined);
                }}
                style={styles.textButton}>
                <Text variant="bodyStrong" color={colors.accent}>
                  {t('log.removePhoto')}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable accessibilityRole="button" onPress={pickPhoto} style={[styles.photoButton, { borderColor: colors.lineStrong }]}>
              <Icon name="camera" color={colors.text} />
              <Text variant="bodyStrong">{t('log.addPhoto')}</Text>
            </Pressable>
          )}

          <View style={styles.group}>
            <Text variant="label" muted style={styles.groupLabel}>
              {t('log.occasion')}
            </Text>
            <View style={styles.wrap}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={t(`tags.${tag}`)}
                  selected={picked.includes(tag)}
                  onPress={() => setPicked((current) => (current.includes(tag) ? current.filter((x) => x !== tag) : [...current, tag]))}
                />
              ))}
            </View>
          </View>
        </>
      )}

      <View style={styles.group}>
        <Text variant="label" muted style={styles.groupLabel}>
          {t('log.feel')}
        </Text>
        <View style={styles.moods}>
          {moods.map((value) => (
            <Chip
              key={value}
              grow
              label={t(`moods.${value}`)}
              selected={mood === value}
              onPress={() => setMood((current) => (current === value ? undefined : value))}
            />
          ))}
        </View>
      </View>

      <View style={styles.group}>
        <Text variant="label" muted style={styles.groupLabel}>
          {t('log.note')}
        </Text>
        <TextInput
          accessibilityLabel={t('log.note')}
          value={note}
          onChangeText={setNote}
          multiline
          placeholder={t('log.notePlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={[styles.note, { backgroundColor: colors.surface, borderColor: colors.line, color: colors.text }]}
        />
      </View>

      <Pressable accessibilityRole="button" onPress={save} style={[styles.save, { backgroundColor: colors.inverse }]}>
        <Text variant="bodyStrong" color={colors.onInverse} style={styles.saveLabel}>
          {t('log.save')}
        </Text>
      </Pressable>

      {saved && (
        <Pressable accessibilityRole="button" onPress={clear} style={styles.textButton}>
          <Text variant="bodyStrong" muted>
            {t('log.clear')}
          </Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

/** Starts every drink type at its regional default size, then applies what was saved for this day. */
function initialLines(sizes: Record<DrinkType, Size[]>, saved: DrinkLine[] | undefined): Lines {
  const lines = {} as Lines;
  for (const type of drinkTypes) {
    const first = sizes[type][0];
    lines[type] = { ml: first.ml, abv: first.abv, count: 0, sizeIndex: 0 };
  }
  for (const line of saved ?? []) {
    // A size saved under another region has no match here; -1 keeps its stored volume until the user cycles.
    const sizeIndex = sizes[line.type].findIndex((size) => size.ml === line.ml && size.abv === line.abv);
    lines[line.type] = { ml: line.ml, abv: line.abv, count: line.count, sizeIndex };
  }
  return lines;
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 16 },
  flex: { flex: 1 },
  back: { flexDirection: 'row', alignItems: 'center', minHeight: 44, alignSelf: 'flex-start', paddingRight: 12 },
  backLabel: { fontSize: 16 },
  title: { paddingHorizontal: 4 },
  card: { borderRadius: 20 },
  soberCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 },
  soberDot: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rows: { paddingLeft: 14, paddingRight: 8 },
  row: { flexDirection: 'row', alignItems: 'center', minHeight: 64, gap: 4 },
  rowIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  rowText: { flex: 1, minHeight: 48, justifyContent: 'center' },
  rowName: { fontSize: 16 },
  sizeText: { textDecorationLine: 'underline', textDecorationStyle: 'dotted' },
  step: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  count: { width: 26, textAlign: 'center', fontFamily: fonts.light, fontSize: 20, lineHeight: 26 },
  total: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 16, paddingHorizontal: 18 },
  totalValue: { fontFamily: fonts.light, fontSize: 24, lineHeight: 30 },
  level: { borderRadius: 15, paddingVertical: 7, paddingHorizontal: 12 },
  levelText: { fontFamily: fonts.medium },
  photoButton: {
    minHeight: 56,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 16,
  },
  photoWrap: { gap: 4 },
  photo: { width: '100%', height: 200, borderRadius: 20 },
  textButton: { minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  group: { gap: 8 },
  groupLabel: { paddingHorizontal: 4 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moods: { flexDirection: 'row', gap: 8 },
  note: {
    minHeight: 96,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fonts.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
  save: { minHeight: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  saveLabel: { fontSize: 16 },
});
