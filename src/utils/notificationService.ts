import { Medication, EmergencyContact, UserSession, MissedAlertNotification } from '../types';

const ALERTS_STORAGE_KEY = 'smart_med_alert_logs_v2';

export function loadMissedAlertLogs(): MissedAlertNotification[] {
  try {
    const raw = localStorage.getItem(ALERTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Failed to load alert logs:', e);
    return [];
  }
}

export function saveMissedAlertLogs(logs: MissedAlertNotification[]): void {
  try {
    localStorage.setItem(ALERTS_STORAGE_KEY, JSON.stringify(logs.slice(0, 50)));
  } catch (e) {
    console.warn('Failed to save alert logs:', e);
  }
}

export interface DispatchAlertResult {
  notification: MissedAlertNotification;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  emailUrl: string;
  smsUrl: string;
  whatsappUrl: string;
  telUrl: string;
  bodyText: string;
}

export function buildMissedDoseAlert(
  medication: Medication,
  timeString: string,
  userSession: UserSession | null,
  emergencyContact: EmergencyContact,
  userName: string = ''
): DispatchAlertResult {
  // Primary recipient of missed dose alerts is the FAMILY MEMBER / CAREGIVER
  const recipientName = emergencyContact.name?.trim() || 'Family Member / Caregiver';
  const recipientPhone = emergencyContact.phone?.trim() || userSession?.phone?.trim() || '';
  const recipientEmail = emergencyContact.email?.trim() || userSession?.email?.trim() || '';

  const memberDisplayName = userName.trim() || userSession?.displayName?.trim() || 'Your family member';

  // Respectful, attractive, caring update message - NO BLAMING AS PATIENT
  const subject = `💙 MediAlert Family Care: Check in with ${memberDisplayName} (${medication.name})`;
  const bodyText = `💙 MediAlert Family Care Update\n\nFamily Member: ${memberDisplayName}\nScheduled Medicine: ${medication.name} (${medication.dosage})\nScheduled Time: ${timeString}\nFood Guidance: ${medication.foodCondition.replace('_', ' ')}\n\nThis scheduled dose was not marked as taken. Please check in with ${memberDisplayName} with a quick call or message.\n\nFamily Contact: ${recipientName} (${recipientPhone || 'Not configured'})\nSent with care via MediAlert.`;

  const cleanPhone = recipientPhone.replace(/[^0-9+]/g, '');
  const digitsOnly = recipientPhone.replace(/[^0-9]/g, '');

  const emailUrl = recipientEmail 
    ? `mailto:${encodeURIComponent(recipientEmail)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}` 
    : '';
  const smsUrl = cleanPhone 
    ? `sms:${cleanPhone}?body=${encodeURIComponent(bodyText)}` 
    : '';
  const whatsappUrl = digitsOnly 
    ? `https://wa.me/${digitsOnly}?text=${encodeURIComponent(bodyText)}` 
    : '';
  const telUrl = cleanPhone 
    ? `tel:${cleanPhone}` 
    : '';

  const notification: MissedAlertNotification = {
    id: `alert-${Date.now()}-${medication.id}`,
    medicationId: medication.id,
    medicationName: medication.name,
    dosage: medication.dosage,
    scheduledTime: timeString,
    recipientEmail,
    recipientPhone,
    messageText: bodyText,
    sentAt: new Date().toISOString(),
    method: 'both',
    status: 'sent'
  };

  // Persist to local alert history
  const currentLogs = loadMissedAlertLogs();
  saveMissedAlertLogs([notification, ...currentLogs]);

  // Push notification if permitted
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      if (Notification.permission === 'granted') {
        new Notification(`💙 MediAlert: Check in with ${memberDisplayName}`, {
          body: `${medication.name} (${medication.dosage}) scheduled for ${timeString} was not taken. Family alert prepared for ${recipientName}.`,
          icon: '/favicon.ico'
        });
      } else if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    } catch {
      // Ignore notification policy errors
    }
  }

  return {
    notification,
    recipientName,
    recipientPhone,
    recipientEmail,
    emailUrl,
    smsUrl,
    whatsappUrl,
    telUrl,
    bodyText
  };
}

export function sendMissedDoseAlert(
  medication: Medication,
  timeString: string,
  userSession: UserSession | null,
  emergencyContact: EmergencyContact,
  userName: string = ''
): MissedAlertNotification {
  const result = buildMissedDoseAlert(
    medication,
    timeString,
    userSession,
    emergencyContact,
    userName
  );
  return result.notification;
}

export function launchDirectPhoneCall(phone: string): boolean {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (!cleanPhone) return false;
  
  try {
    window.location.href = `tel:${cleanPhone}`;
    return true;
  } catch {
    window.open(`tel:${cleanPhone}`, '_top');
    return true;
  }
}

export function launchDirectSms(phone: string, message: string): boolean {
  if (!phone) return false;
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  if (!cleanPhone) return false;

  const encodedBody = encodeURIComponent(message);
  const smsUrl = `sms:${cleanPhone}?body=${encodedBody}`;
  
  try {
    window.location.href = smsUrl;
    return true;
  } catch {
    window.open(smsUrl, '_top');
    return true;
  }
}

export function launchDirectWhatsApp(phone: string, message: string): boolean {
  if (!phone) return false;
  const digitsOnly = phone.replace(/[^0-9]/g, '');
  if (!digitsOnly) return false;

  const encodedText = encodeURIComponent(message);
  const waUrl = `https://wa.me/${digitsOnly}?text=${encodedText}`;
  window.open(waUrl, '_blank');
  return true;
}
