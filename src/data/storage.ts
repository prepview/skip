import AsyncStorage from '@react-native-async-storage/async-storage';

/** Small JSON wrapper around on-device storage. Failures fall back to the default. */
export async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw == null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable (private browsing on web); the app keeps working in memory.
  }
}
