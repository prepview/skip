import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';

import { Text } from './Text';

type Props = { title: string; description: string };

/** Stand-in for a tab whose real screen has not been built yet. */
export function ComingSoon({ title, description }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + 24 }]}>
      <Text variant="display" accessibilityRole="header">
        {title}
      </Text>
      <View style={[styles.card, { borderColor: colors.line }]}>
        <Text variant="label" muted>
          {t('soon.title')}
        </Text>
        <Text>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, gap: 20 },
  card: { borderWidth: 1, borderRadius: 20, padding: 18, gap: 8 },
});
