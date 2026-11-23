import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { readJson, writeJson } from '@/data/storage';

import de from './locales/de.json';
import en from './locales/en.json';
import es from './locales/es.json';
import fr from './locales/fr.json';

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'de', name: 'Deutsch' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
] as const;

export type LanguageCode = (typeof languages)[number]['code'];

const KEY = 'skip.language.v1';
const supported = languages.map((l) => l.code) as readonly string[];

function deviceLanguage(): LanguageCode {
  const code = getLocales()[0]?.languageCode ?? 'en';
  return (supported.includes(code) ? code : 'en') as LanguageCode;
}

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    de: { translation: de },
    es: { translation: es },
    fr: { translation: fr },
  },
  lng: deviceLanguage(),
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
});

/**
 * Locale for formatting dates. Uses the phone's own regional variant (en-GB, de-AT, ...)
 * when it matches the app language, so day and month order follow local habit.
 */
export function dateLocale(): string {
  const device = getLocales()[0];
  return device?.languageCode === i18n.language && device.languageTag ? device.languageTag : i18n.language;
}

/** Applies a language the user picked earlier, if any. Called once at start-up. */
export async function restoreLanguage(): Promise<void> {
  const stored = await readJson<string | null>(KEY, null);
  if (stored && supported.includes(stored) && stored !== i18n.language) {
    await i18n.changeLanguage(stored);
  }
}

export function setLanguage(code: LanguageCode): void {
  i18n.changeLanguage(code);
  writeJson(KEY, code);
}

export default i18n;
