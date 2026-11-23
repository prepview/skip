import type { Reminder } from './settings';

/** The browser preview has no scheduled notifications; the choice is saved and nothing else happens. */
export async function setReminder(_reminder: Reminder, _text: { title: string; body: string }): Promise<boolean> {
  return true;
}
