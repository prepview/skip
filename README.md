# Skip

A calm tracker for drinking less. iOS first, built with Expo (React Native) so Android can follow from the same code.

## Status

Stages 1 and 2 of the v1 build.

- Today screen with one-tap logging, the alcohol-free streak and the week strip.
- Day logging: drink types with regional serving sizes (Europe, UK, US), a photo, mood, occasion tags and a note. Totals are shown in local units and grams of pure alcohol.
- Calendar with month and year views, coloured by how heavy each day was.
- Stats: streaks, monthly totals, an average week, the heaviest weekday and average amounts.
- Dark, light and system themes.
- English, German, Spanish and French. The app follows the phone's language and can be switched in Profile.
- Everything is stored on the device. Accounts and sync come in a later stage.
- The Journey tab is a placeholder until its stage lands.

## Run it

```bash
npm install
```

```bash
npx expo start
```

Press `w` for the browser preview, or scan the QR code with Expo Go on a phone.

## Check it

```bash
npx tsc --noEmit
```

## Layout

- `src/app` holds the screens (Expo Router). `(tabs)` is the four-tab area; `profile.tsx` opens on top of it.
- `src/components` holds shared pieces such as the tab bar icons, the sunrise backdrop and the week strip.
- `src/theme` holds colour and type tokens and the theme setting.
- `src/i18n` holds the language setup and one JSON file per language.
- `src/data` holds on-device storage, the day log, drink sizes and the statistics maths.
