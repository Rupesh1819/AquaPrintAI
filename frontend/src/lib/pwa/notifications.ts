// ─── Notification Permission ─────────────────────────────────

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  if (Notification.permission === 'granted') return 'granted';
  if (Notification.permission === 'denied') return 'denied';
  return Notification.requestPermission();
}

export function canSendNotifications(): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) return false;
  return Notification.permission === 'granted';
}

// ─── Local Notification Sender ───────────────────────────────

export function sendLocalNotification(
  title: string,
  options?: NotificationOptions
): void {
  if (!canSendNotifications()) return;

  const defaultOptions: NotificationOptions = {
    icon: '/icons/icon.svg',
    badge: '/icons/icon.svg',
    tag: 'aquaprint-notification',
    ...options,
  };

  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, defaultOptions);
    });
  } else {
    new Notification(title, defaultOptions);
  }
}

// ─── Notification Types ──────────────────────────────────────

export function notifyChallengeReminder(challengeName: string): void {
  sendLocalNotification('Challenge Reminder 🏆', {
    body: `Don't forget to complete "${challengeName}"!`,
    tag: 'challenge-reminder',
  });
}

export function notifyDailyStreak(streakDays: number): void {
  sendLocalNotification(`${streakDays}-Day Streak! 🔥`, {
    body: 'Keep scanning to maintain your streak and earn bonus XP.',
    tag: 'daily-streak',
  });
}

export function notifyGoalCompletion(goalName: string): void {
  sendLocalNotification('Goal Completed! 🎉', {
    body: `Congratulations! You've completed "${goalName}".`,
    tag: 'goal-completion',
  });
}

export function notifyWeeklySummary(waterSaved: number): void {
  sendLocalNotification('Weekly Summary 📊', {
    body: `This week you saved ${waterSaved}L of water. Keep up the great work!`,
    tag: 'weekly-summary',
  });
}

export function notifySyncComplete(count: number): void {
  sendLocalNotification('Sync Complete ✅', {
    body: `${count} queued item${count !== 1 ? 's' : ''} synced successfully.`,
    tag: 'sync-complete',
  });
}
