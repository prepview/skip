import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Chip } from '@/components/Chip';
import { Text } from '@/components/Text';
import { useDays } from '@/data/days';
import { journeyEntries, topics, type Topic } from '@/data/journey';
import { computeStats } from '@/data/stats';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, scene } from '@/theme/tokens';

import { TAB_BAR_SPACE } from './_layout';

export default function JourneyScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { days } = useDays();
  const [topic, setTopic] = useState<Topic | 'all'>('all');

  const stats = computeStats(days, new Date());
  // Entries open on the longest run ever reached, so a logged drink never closes one.
  const reached = stats.longestSober;
  const shown = journeyEntries.filter((entry) => topic === 'all' || entry.topic === topic);

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + 24, paddingBottom: TAB_BAR_SPACE + insets.bottom + 16 }]}>
      <View style={styles.head}>
        <Text variant="display" accessibilityRole="header">
          {t('tabs.journey')}
        </Text>
        <Text muted>{t('journey.intro')}</Text>
      </View>

      <LinearGradient colors={[scene.sky[1], scene.sky[2]]} style={styles.here}>
        <View style={styles.flex}>
          <Text variant="label" color={scene.textSoft}>
            {t('journey.here')}
          </Text>
          <Text color={scene.text} style={styles.hereValue}>
            {t('journey.day', { count: stats.currentStreak })}
          </Text>
        </View>
        <Text variant="small" color={scene.textSoft}>
          {t('journey.best', { count: reached })}
        </Text>
      </LinearGradient>

      <View style={styles.chips}>
        {(['all', ...topics] as const).map((value) => (
          <Chip key={value} label={t(`journey.topics.${value}`)} selected={topic === value} onPress={() => setTopic(value)} />
        ))}
      </View>

      {shown.map((entry) =>
        reached >= entry.day ? (
          <View key={entry.id} style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={styles.meta}>
              <Text variant="label" muted>
                {t('journey.day', { count: entry.day })}
              </Text>
              <Text variant="label" muted>
                {t(`journey.topics.${entry.topic}`)}
              </Text>
            </View>
            <Text style={styles.cardTitle}>{t(`journey.entries.${entry.id}.title`)}</Text>
            <Text>{t(`journey.entries.${entry.id}.body`)}</Text>
          </View>
        ) : (
          <View key={entry.id} style={[styles.locked, { borderColor: colors.line }]}>
            <Text style={styles.lockedTitle}>{t(`journey.entries.${entry.id}.title`)}</Text>
            <Text variant="small" muted>
              {t('journey.opensAt', { count: entry.day })} · {t(`journey.topics.${entry.topic}`)}
            </Text>
          </View>
        ),
      )}

      <Text variant="small" muted style={styles.disclaimer}>
        {t('journey.disclaimer')}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: 16, gap: 14 },
  flex: { flex: 1 },
  head: { paddingHorizontal: 4, gap: 6 },
  here: { borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  hereValue: { fontFamily: fonts.serif, fontSize: 30, lineHeight: 34 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  card: { borderRadius: 20, paddingVertical: 16, paddingHorizontal: 18, gap: 8 },
  meta: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  cardTitle: { fontFamily: fonts.serif, fontSize: 26, lineHeight: 30 },
  locked: { borderWidth: 1, borderRadius: 20, paddingVertical: 14, paddingHorizontal: 18, gap: 2 },
  lockedTitle: { fontSize: 16 },
  disclaimer: { paddingHorizontal: 4 },
});
