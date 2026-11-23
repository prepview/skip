import Constants from 'expo-constants';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { Segmented } from '@/components/Segmented';
import { Text } from '@/components/Text';
import type { Region } from '@/data/drinks';
import { useSettings } from '@/data/settings';
import { languages, setLanguage, type LanguageCode } from '@/i18n';
import { useTheme, type ThemePreference } from '@/theme/ThemeProvider';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { colors, preference, setPreference } = useTheme();
  const insets = useSafeAreaInsets();
  const { region, setRegion } = useSettings();

  const regionOptions: { value: Region; label: string }[] = [
    { value: 'eu', label: t('profile.regions.eu') },
    { value: 'uk', label: t('profile.regions.uk') },
    { value: 'us', label: t('profile.regions.us') },
  ];
  const appearance: { value: ThemePreference; label: string }[] = [
    { value: 'system', label: t('profile.system') },
    { value: 'light', label: t('profile.light') },
    { value: 'dark', label: t('profile.dark') },
  ];
  const current = (languages.find((l) => l.code === i18n.language)?.code ?? 'en') as LanguageCode;

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 8, paddingBottom: insets.bottom + 32 }]}>
      <Pressable accessibilityRole="button" onPress={() => router.back()} style={styles.back}>
        <Icon name="back" color={colors.accent} strokeWidth={1.75} />
        <Text variant="bodyStrong" color={colors.accent} style={styles.backLabel}>
          {t('profile.back')}
        </Text>
      </Pressable>

      <Text variant="display" accessibilityRole="header">
        {t('profile.title')}
      </Text>

      <View style={styles.group}>
        <Text variant="label" muted style={styles.groupLabel}>
          {t('profile.appearance')}
        </Text>
        <Segmented label={t('profile.appearance')} options={appearance} value={preference} onChange={setPreference} />
      </View>

      <View style={styles.group}>
        <Text variant="label" muted style={styles.groupLabel}>
          {t('profile.language')}
        </Text>
        <View style={[styles.list, { backgroundColor: colors.surface }]}>
          {languages.map((language, index) => {
            const selected = language.code === current;
            return (
              <Pressable
                key={language.code}
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => setLanguage(language.code)}
                style={[styles.row, index > 0 && { borderTopWidth: 1, borderTopColor: colors.line }]}>
                <Text style={styles.rowLabel}>{language.name}</Text>
                {selected && <Icon name="check" size={20} color={colors.accent} strokeWidth={2} />}
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.group}>
        <Text variant="label" muted style={styles.groupLabel}>
          {t('profile.region')}
        </Text>
        <Segmented label={t('profile.region')} options={regionOptions} value={region} onChange={setRegion} />
      </View>

      <Text variant="small" muted style={styles.version}>
        {t('profile.version', { version: Constants.expoConfig?.version ?? '0.1.0' })}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 20 },
  back: { flexDirection: 'row', alignItems: 'center', minHeight: 44, alignSelf: 'flex-start', paddingRight: 12 },
  backLabel: { fontSize: 16 },
  group: { gap: 8 },
  groupLabel: { paddingHorizontal: 4 },
  list: { borderRadius: 20, paddingHorizontal: 16 },
  row: { minHeight: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowLabel: { fontSize: 16 },
  version: { textAlign: 'center' },
});
