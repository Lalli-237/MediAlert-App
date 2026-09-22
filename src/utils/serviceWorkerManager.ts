import { Medication } from '../types';

export interface NotificationStatus {
  isSupported: boolean;
  permission: NotificationPermission;
  isServiceWorkerReady: boolean;
}

let swRegistration: ServiceWorkerRegistration | null = null;

/**
 * Registers the background service worker and prepares notification capability
 */
export async function registerMediAlertServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });
    swRegistration = registration;

    // Register Periodic Background Sync if supported (Chromium / Android Chrome)
    if ('periodicSync' in registration) {
      try {
        const periodicSync = (registration as unknown as { periodicSync: { register: (tag: string, options: { minInterval: number }) => Promise<void> } }).periodicSync;
        await periodicSync.register('medication-reminder-check', {
          minInterval: 60 * 1000 // Every 1 minute
        });
      } catch {
        // Periodic sync registration can be rejected without permission or standalone mode; non-fatal
      }
    }

    return registration;
  } catch (err) {
    console.warn('[ServiceWorker] Registration warning:', err);
    return null;
  }
}

/**
 * Returns current browser notification permission and support status
 */
export function getNotificationStatus(): NotificationStatus {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return {
      isSupported: false,
      permission: 'denied',
      isServiceWorkerReady: !!swRegistration
    };
  }

  return {
    isSupported: true,
    permission: Notification.permission,
    isServiceWorkerReady: !!swRegistration
  };
}

/**
 * Requests browser notification permission for background alarms
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }

  try {
    const perm = await Notification.requestPermission();
    if (perm === 'granted') {
      await registerMediAlertServiceWorker();
    }
    return perm;
  } catch (err) {
    console.warn('Error requesting notification permission:', err);
    return 'denied';
  }
}

/**
 * Sends active medication timetable to the Service Worker so reminders fire
 * even when the application tab is closed or running in the background.
 */
export async function syncScheduleToServiceWorker(
  medications: Medication[],
  patientName: string = '',
  language: string = 'en'
): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return false;
  }

  try {
    const reg = swRegistration || (await navigator.serviceWorker.ready);
    if (!reg || !reg.active) {
      const newReg = await registerMediAlertServiceWorker();
      if (newReg?.active) {
        newReg.active.postMessage({
          type: 'SYNC_SCHEDULE',
          medications,
          patientName,
          language
        });
        return true;
      }
      return false;
    }

    reg.active.postMessage({
      type: 'SYNC_SCHEDULE',
      medications,
      patientName,
      language
    });
    return true;
  } catch (err) {
    console.warn('Failed to sync schedule with service worker:', err);
    return false;
  }
}

/**
 * Sends a test background notification via the service worker
 */
export async function triggerTestBackgroundNotification(medName: string = 'Morning Medicine'): Promise<boolean> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    const perm = await requestNotificationPermission();
    if (perm !== 'granted') return false;
  }

  try {
    const reg = swRegistration || (await navigator.serviceWorker.ready);
    if (reg && reg.active) {
      reg.active.postMessage({
        type: 'TEST_BACKGROUND_NOTIFICATION',
        medName
      });
      return true;
    }

    // Direct fallback if SW is still initializing
    new Notification('💊 MediAlert: Background Test Notification', {
      body: `Test reminder for ${medName}. Notifications will appear even when the app is in the background or closed.`,
      icon: '/pwa-192x192.png'
    });
    return true;
  } catch (e) {
    console.warn('Failed to trigger test background notification:', e);
    return false;
  }
}
