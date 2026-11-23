import {
  HankenGrotesk_200ExtraLight,
  HankenGrotesk_300Light,
  HankenGrotesk_400Regular,
  HankenGrotesk_500Medium,
  HankenGrotesk_700Bold,
} from '@expo-google-fonts/hanken-grotesk';
import { InstrumentSerif_400Regular } from '@expo-google-fonts/instrument-serif';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';

import { DaysProvider } from '@/data/days';
import { SettingsProvider, useSettings } from '@/data/settings';
import { restoreLanguage } from '@/i18n';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    HankenGrotesk_200ExtraLight,
    HankenGrotesk_300Light,
    HankenGrotesk_400Regular,
    HankenGrotesk_500Medium,
    HankenGrotesk_700Bold,
    InstrumentSerif_400Regular,
  });
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    restoreLanguage().finally(() => setLanguageReady(true));
  }, []);

  // A font that fails to load must not leave the app stuck on the splash screen.
  const ready = (fontsLoaded || fontError != null) && languageReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <ThemeProvider>
      <SettingsProvider>
        <DaysProvider>
          <Shell />
        </DaysProvider>
      </SettingsProvider>
    </ThemeProvider>
  );
}

function Shell() {
  const { colors } = useTheme();
  const { ready } = useSettings();
  // Settings decide whether the first-run questions are shown, so nothing renders until they are read.
  if (!ready) return null;
  return (
    <>
      {/* The Today screen opens on a dark scene in both themes, so the status bar stays light there. */}
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
    </>
  );
}
