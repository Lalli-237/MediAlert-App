import { Medication, DoseLog, EmergencyContact, AppSettings, UserSession } from '../types';
import { DEFAULT_MEDICATIONS, DEFAULT_EMERGENCY_CONTACT, DEFAULT_SETTINGS, generateInitialDoseLogs } from './defaults';
import { encryptData, decryptData, isEncrypted } from './encryption';

const STORAGE_KEYS = {
  MEDICATIONS: 'smart_med_medications_v2',
  DOSE_LOGS: 'smart_med_dose_logs_v2',
  EMERGENCY_CONTACT: 'smart_med_emergency_contact_v2',
  SETTINGS: 'smart_med_settings_v2',
  SNOOZED: 'smart_med_snoozed_v2',
  USER_SESSION: 'smart_med_user_session_v2'
};

export const DEFAULT_USER_SESSION: UserSession = {
  isLoggedIn: false,
  loginMethod: 'gmail',
  email: '',
  phone: '',
  displayName: '',
  notifyOnMissed: true,
  lastLoginAt: new Date().toISOString()
};

export function loadUserSession(): UserSession | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.USER_SESSION);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.isLoggedIn) {
        return parsed;
      }
    }
    return null;
  } catch (e) {
    console.warn('Failed to load user session:', e);
    return null;
  }
}

export function saveUserSession(session: UserSession | null): void {
  try {
    if (session) {
      localStorage.setItem(STORAGE_KEYS.USER_SESSION, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEYS.USER_SESSION);
    }
  } catch (e) {
    console.warn('Failed to save user session:', e);
  }
}

const DEFAULT_VAULT_PASS = 'local_vault_aes_gcm_passphrase_key';

export async function loadStorageData(): Promise<{
  medications: Medication[];
  doseLogs: DoseLog[];
  emergencyContact: EmergencyContact;
  settings: AppSettings;
  snoozedDoses: Record<string, number>;
}> {
  let settings = DEFAULT_SETTINGS;
  try {
    const rawSettings = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (rawSettings) {
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(rawSettings) };
    }
  } catch (e) {
    console.warn('Failed to load settings:', e);
  }

  let medications = DEFAULT_MEDICATIONS;
  try {
    const rawMeds = localStorage.getItem(STORAGE_KEYS.MEDICATIONS);
    if (rawMeds) {
      const decrypted = isEncrypted(rawMeds)
        ? await decryptData(rawMeds, DEFAULT_VAULT_PASS)
        : rawMeds;
      medications = JSON.parse(decrypted);
    }
  } catch (e) {
    console.warn('Failed to load medications:', e);
  }

  let doseLogs: DoseLog[] = [];
  try {
    const rawLogs = localStorage.getItem(STORAGE_KEYS.DOSE_LOGS);
    if (rawLogs) {
      const decrypted = isEncrypted(rawLogs)
        ? await decryptData(rawLogs, DEFAULT_VAULT_PASS)
        : rawLogs;
      const parsedLogs = JSON.parse(decrypted);
      if (Array.isArray(parsedLogs)) {
        // Discard legacy sample logs (log-X-Y) and ensure only logs for currently active user medicines are retained
        const userMedIds = new Set(medications.map(m => m.id));
        doseLogs = parsedLogs.filter(log => !/^log-\d+-\d+$/.test(log.id) && userMedIds.has(log.medicationId));
      }
    }
  } catch (e) {
    console.warn('Failed to load dose logs:', e);
  }

  let emergencyContact = DEFAULT_EMERGENCY_CONTACT;
  try {
    const rawContact = localStorage.getItem(STORAGE_KEYS.EMERGENCY_CONTACT);
    if (rawContact) {
      const decrypted = isEncrypted(rawContact)
        ? await decryptData(rawContact, DEFAULT_VAULT_PASS)
        : rawContact;
      emergencyContact = JSON.parse(decrypted);
      // Remove any legacy default/placeholder caregiver data so it stays empty until the user enters a name
      if (emergencyContact.name === 'Rajesh Kumar') {
        emergencyContact.name = '';
      }
      if (emergencyContact.relationship === 'Primary Caregiver' && !emergencyContact.name) {
        emergencyContact.relationship = '';
      }
    }
  } catch (e) {
    console.warn('Failed to load emergency contact:', e);
  }

  let snoozedDoses: Record<string, number> = {};
  try {
    const rawSnoozed = localStorage.getItem(STORAGE_KEYS.SNOOZED);
    if (rawSnoozed) {
      snoozedDoses = JSON.parse(rawSnoozed);
    }
  } catch (e) {
    console.warn('Failed to load snoozed doses:', e);
  }

  return {
    medications,
    doseLogs,
    emergencyContact,
    settings,
    snoozedDoses
  };
}

export async function saveStorageData(
  medications: Medication[],
  doseLogs: DoseLog[],
  emergencyContact: EmergencyContact,
  settings: AppSettings,
  snoozedDoses: Record<string, number>
): Promise<void> {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    localStorage.setItem(STORAGE_KEYS.SNOOZED, JSON.stringify(snoozedDoses));

    if (settings.encryptionEnabled) {
      const encMeds = await encryptData(JSON.stringify(medications), DEFAULT_VAULT_PASS);
      const encLogs = await encryptData(JSON.stringify(doseLogs), DEFAULT_VAULT_PASS);
      const encContact = await encryptData(JSON.stringify(emergencyContact), DEFAULT_VAULT_PASS);

      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, encMeds);
      localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, encLogs);
      localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACT, encContact);
    } else {
      localStorage.setItem(STORAGE_KEYS.MEDICATIONS, JSON.stringify(medications));
      localStorage.setItem(STORAGE_KEYS.DOSE_LOGS, JSON.stringify(doseLogs));
      localStorage.setItem(STORAGE_KEYS.EMERGENCY_CONTACT, JSON.stringify(emergencyContact));
    }
  } catch (err) {
    console.error('Error saving storage data:', err);
  }
}
