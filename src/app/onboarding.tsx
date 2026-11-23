import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { OptionCard } from '@/components/OptionCard';
import { Stepper } from '@/components/Stepper';
import { SunriseScene } from '@/components/SunriseScene';
import { Text } from '@/components/Text';
import { setReminder } from '@/data/reminders';
import { useSettings, type Intent, type Reminder } from '@/data/settings';
import { dateLocale } from '@/i18n';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, scene } from '@/theme/tokens';

const QUESTIONS = 7;
const SUMMARY = QUESTIONS + 1;
const intents: Intent[] = ['less', 'break', 'habits'];
const amounts = ['a', 'b', 'c', 'd'] as const;
const motives = ['sleep', 'energy', 'head', 'fitness', 'family'] as const;
const reminders: Reminder[] = ['evening', 'morning', 'off'];

export default function OnboardingScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const settings = useSettings();
  const locale = dateLocale();

  const [step, setStep] = useState(0);
  const [intent, setIntent] = useState<Intent>('less');
  const [nowDays, setNowDays] = useState(4);
  const [amount, setAmount] = useState<(typeof amounts)[number]>('b');
  const [why, setWhy] = useState<string[]>(['sleep']);
  const [target, setTarget] = useState(2);
  const [planned, setPlanned] = useState<number[]>([5]);
  const [reminder, setReminderChoice] = useState<Reminder>('evening');

  const chosen = planned.slice(0, target);
  // 5 January 2026 is a Monday, which gives the weekday names in Monday-first order.
  const weekday = (index: number, style: 'short' | 'long') =>
    new Intl.DateTimeFormat(locale, { weekday: style }).format(new Date(2026, 0, 5 + index));

  const togglePlanned = (index: number) => {
    const next = chosen.includes(index) ? chosen.filter((i) => i !== index) : [...chosen, index];
    setPlanned(next.slice(Math.max(0, next.length - target)));
  };

  const finish = async () => {
    // If notifications are refused, the reminder is saved as off so the setting tells the truth.
    const allowed = await setReminder(reminder, {
      title: 'Skip',
      body: reminder === 'morning' ? t('reminder.morningSub') : t('reminder.eveningSub'),
    }).catch(() => false);
    settings.update({
      onboarded: true,
      intent,
      baselineDays: nowDays,
      weeklyGoal: target,
      plannedWeekdays: [...chosen].sort((a, b) => a - b),
      reminder: allowed ? reminder : 'off',
      motives: why,
    });
    router.replace('/');
  };

  if (step === 0) {
    return (
      <SunriseScene style={[styles.welcome, { paddingTop: insets.top + 72, paddingBottom: insets.bottom + 24 }]}>
        <Text variant="label" color={scene.text} style={styles.brand}>
          Skip
        </Text>
        <Text color={scene.text} style={styles.welcomeTitle} accessibilityRole="header">
          {t('onboarding.welcomeTitle')}
        </Text>
        <Text color={scene.textSoft} style={styles.welcomeBody}>
          {t('onboarding.welcomeBody')}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => setStep(1)} style={[styles.primary, styles.welcomeButton, { backgroundColor: '#F3F5F4' }]}>
          <Text variant="bodyStrong" color="#0C1114" style={styles.primaryLabel}>
            {t('onboarding.start')}
          </Text>
        </Pressable>
      </SunriseScene>
    );
  }

  const heavy = nowDays >= 6 && (amount === 'c' || amount === 'd');
  const moreDays = (nowDays - target) * 52;
  const title = step === SUMMARY ? t('onboarding.summaryTitle') : t(`onboarding.q${step}.title`);
  const sub =
    step === SUMMARY
      ? moreDays > 0
        ? t('onboarding.summaryMore', { count: moreDays })
        : t('onboarding.summaryFlat')
      : t(`onboarding.q${step}.sub`, { count: target });

  return (
    <View style={[styles.root, { backgroundColor: colors.background, paddingTop: insets.top + 8, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.top}>
        <Pressable accessibilityRole="button" accessibilityLabel={t('onboarding.back')} onPress={() => setStep(step - 1)} style={styles.backButton}>
          <Icon name="back" size={24} color={colors.text} strokeWidth={1.75} />
        </Pressable>
        {step <= QUESTIONS && (
          <View
            accessible
            accessibilityRole="progressbar"
            accessibilityLabel={t('onboarding.progress', { step })}
            style={[styles.track, { backgroundColor: colors.line }]}>
            <View style={[styles.fill, { backgroundColor: colors.text, width: `${(step / QUESTIONS) * 100}%` }]} />
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <View style={styles.head}>
          <Text variant="headline" accessibilityRole="header">
            {title}
          </Text>
          <Text muted>{sub}</Text>
        </View>

        {step === 1 && (
          <View style={styles.options}>
            {intents.map((value) => (
              <OptionCard
                key={value}
                label={t(`onboarding.intent.${value}`)}
                sub={t(`onboarding.intent.${value}Sub`)}
                selected={intent === value}
                onPress={() => setIntent(value)}
              />
            ))}
          </View>
        )}

        {step === 2 && (
          <>
            <Stepper value={nowDays} min={0} max={7} unit={t('onboarding.q2.unit')} lessLabel={t('plan.fewer')} moreLabel={t('plan.more')} onChange={setNowDays} />
            <Text muted>{t('onboarding.q2.note')}</Text>
          </>
        )}

        {step === 3 && (
          <View style={styles.options}>
            {amounts.map((value) => (
              <OptionCard key={value} label={t(`onboarding.amount.${value}`)} selected={amount === value} onPress={() => setAmount(value)} />
            ))}
          </View>
        )}

        {step === 4 && (
          <View style={styles.options}>
            {motives.map((value) => (
              <OptionCard
                key={value}
                label={t(`onboarding.why.${value}`)}
                selected={why.includes(value)}
                onPress={() => setWhy((current) => (current.includes(value) ? current.filter((x) => x !== value) : [...current, value]))}
              />
            ))}
          </View>
        )}

        {step === 5 && (
          <>
            <Stepper value={target} min={0} max={7} unit={t('onboarding.q5.unit')} lessLabel={t('plan.fewer')} moreLabel={t('plan.more')} onChange={setTarget} />
            <Text muted>
              {target === 0 ? t('plan.zero') : t('onboarding.q5.leaves', { count: 7 - target })}
              {nowDays > target ? ` ${t('onboarding.q5.fewer', { count: nowDays - target })}` : ''}
            </Text>
          </>
        )}

        {step === 6 && (
          <>
            {target === 0 ? (
              <Text muted>{t('plan.zero')}</Text>
            ) : (
              <>
                <View style={styles.weekdays}>
                  {Array.from({ length: 7 }, (_, index) => {
                    const on = chosen.includes(index);
                    return (
                      <Pressable
                        key={index}
                        accessibilityRole="button"
                        accessibilityLabel={weekday(index, 'long')}
                        accessibilityState={{ selected: on }}
                        onPress={() => togglePlanned(index)}
                        style={[
                          styles.weekdayButton,
                          { backgroundColor: colors.surface },
                          on ? { borderColor: colors.planned, borderStyle: 'dashed' } : { borderColor: colors.surface },
                        ]}>
                        <Text variant="small" color={on ? colors.planned : colors.text} numberOfLines={1} style={styles.weekdayLabel}>
                          {weekday(index, 'short')}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
                <Text muted>{t('plan.counter', { count: chosen.length, goal: target })}</Text>
              </>
            )}
            <View style={[styles.note, { backgroundColor: colors.surface }]}>
              <Text variant="small">{t('onboarding.q6.explain')}</Text>
            </View>
          </>
        )}

        {step === 7 && (
          <View style={styles.options}>
            {reminders.map((value) => (
              <OptionCard
                key={value}
                label={t(`reminder.${value}`)}
                sub={t(`reminder.${value}Sub`)}
                selected={reminder === value}
                onPress={() => setReminderChoice(value)}
              />
            ))}
          </View>
        )}

        {step === SUMMARY && (
          <>
            <LinearGradient colors={[scene.sky[1], scene.sky[2]]} style={styles.compare}>
              <View>
                <Text variant="label" color={scene.textSoft}>
                  {t('onboarding.now')}
                </Text>
                <Text color={scene.text} style={styles.compareValue}>
                  {nowDays}
                </Text>
              </View>
              <Icon name="forward" size={28} color={scene.text} />
              <View style={styles.right}>
                <Text variant="label" color={scene.textSoft}>
                  {t('onboarding.goal')}
                </Text>
                <Text color={scene.text} style={styles.compareValue}>
                  {target}
                </Text>
              </View>
            </LinearGradient>
            <Text variant="small" muted style={styles.center}>
              {t('onboarding.perWeek')}
            </Text>
            <View style={[styles.rows, { backgroundColor: colors.surface }]}>
              <View style={styles.row}>
                <Text muted>{t('onboarding.rowPlanned')}</Text>
                <Text style={styles.rowValue}>
                  {chosen.length ? [...chosen].sort((a, b) => a - b).map((i) => weekday(i, 'short')).join(', ') : t('onboarding.none')}
                </Text>
              </View>
              <View style={[styles.row, { borderTopWidth: 1, borderTopColor: colors.line }]}>
                <Text muted>{t('onboarding.rowCheckin')}</Text>
                <Text style={styles.rowValue}>{t(`reminder.${reminder}`)}</Text>
              </View>
            </View>
            {heavy && (
              <View style={[styles.note, { borderWidth: 1, borderColor: colors.lineStrong }]}>
                <Text variant="small">{t('onboarding.heavy')}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <Pressable
        accessibilityRole="button"
        onPress={step === SUMMARY ? finish : () => setStep(step + 1)}
        style={[styles.primary, { backgroundColor: step === SUMMARY ? colors.accent : colors.inverse }]}>
        <Text variant="bodyStrong" color={step === SUMMARY ? colors.onAccent : colors.onInverse} style={styles.primaryLabel}>
          {step === SUMMARY ? t('onboarding.finish') : t('onboarding.continue')}
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, paddingHorizontal: 20, gap: 16 },
  welcome: { flex: 1, paddingHorizontal: 28, gap: 16 },
  brand: { fontSize: 13, letterSpacing: 3.2 },
  welcomeTitle: { fontFamily: fonts.serif, fontSize: 50, lineHeight: 54 },
  welcomeBody: { fontSize: 17, lineHeight: 25, maxWidth: 300 },
  welcomeButton: { marginTop: 'auto' },
  top: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  backButton: { width: 44, height: 44, justifyContent: 'center' },
  track: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden', marginRight: 44 },
  fill: { height: 4, borderRadius: 2 },
  body: { gap: 20, paddingBottom: 12 },
  head: { gap: 8 },
  options: { gap: 10 },
  weekdays: { flexDirection: 'row', gap: 4 },
  weekdayButton: { flex: 1, height: 64, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  weekdayLabel: { fontFamily: fonts.medium, fontSize: 14 },
  note: { borderRadius: 18, paddingVertical: 14, paddingHorizontal: 16 },
  compare: { borderRadius: 20, padding: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  compareValue: { fontFamily: fonts.thin, fontSize: 44, lineHeight: 48 },
  right: { alignItems: 'flex-end' },
  center: { textAlign: 'center', marginTop: -8 },
  rows: { borderRadius: 20, paddingHorizontal: 16 },
  row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  rowValue: { flexShrink: 1, textAlign: 'right' },
  primary: { minHeight: 54, borderRadius: 27, alignItems: 'center', justifyContent: 'center' },
  primaryLabel: { fontSize: 16 },
});
