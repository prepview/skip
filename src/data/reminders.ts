import * as Notifications from 'expo-notifications';

import type { Reminder } from './settings';

const times: Record<Exclude<Reminder, 'off'>, { hour: number; minute: number }> = {
  evening: { hour: 21, minute: 30 },
  morning: { hour: 8, minute: 0 },
};

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

/**
 * Replaces the daily check-in reminder. Returns false when the user has not allowed
 * notifications, so the caller can show the setting as off instead of pretending.
 */
export async function setReminder(reminder: Reminder, text: { title: string; body: string }): Promise<boolean> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (reminder === 'off') return true;
  const permission = await Notifications.requestPermissionsAsync();
  if (!permission.granted) return false;
  await Notifications.scheduleNotificationAsync({
    content: { title: text.title, body: text.body },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, ...times[reminder] },
  });
  return true;
}
