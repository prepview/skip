# Skip

A calm tracker for drinking less. iOS first, built with Expo (React Native) so Android can follow from the same code.

## Status

Stage 1 of the v1 build: the app shell.

- Today screen with one-tap logging, the alcohol-free streak and the week strip. Days are stored on the device.
- Dark, light and system themes.
- English, German, Spanish and French. The app follows the phone's language and can be switched in Profile.
- Calendar, Journey and Stats tabs are placeholders until their stages land.

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
- `src/data` holds on-device storage and the day log.
