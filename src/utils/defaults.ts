import { Medication, DoseLog, EmergencyContact, AppSettings } from '../types';

export const DEFAULT_MEDICATIONS: Medication[] = [];

export const SAMPLE_MEDICATIONS: Medication[] = [
  {
    id: 'med-1',
    name: 'Metformin Hydrochloride',
    dosage: '500 mg',
    type: 'tablet' as const,
    foodCondition: 'after_food',
    scheduledTimes: ['08:30', '20:30'],
    color: '#059669', // Emerald
    instructions: 'Take immediately after breakfast & dinner to reduce GI upset.',
    prescribedFor: 'Blood Sugar Regulation',
    inventoryCount: 45,
    isActive: true,
    createdAt: new Date().toISOString(),
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><radialGradient id="g1" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="%23ffffff"/><stop offset="70%" stop-color="%23f1f5f9"/><stop offset="100%" stop-color="%23cbd5e1"/></radialGradient><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="%230f172a" flood-opacity="0.25"/></filter></defs><circle cx="100" cy="100" r="82" fill="%2394a3b8" filter="url(%23s)"/><circle cx="100" cy="98" r="80" fill="url(%23g1)"/><circle cx="100" cy="98" r="70" fill="none" stroke="%23e2e8f0" stroke-width="2"/><line x1="100" y1="35" x2="100" y2="161" stroke="%23cbd5e1" stroke-width="3" stroke-linecap="round"/><text x="100" y="103" font-family="Arial,sans-serif" font-size="15" font-weight="900" fill="%2364748b" text-anchor="middle" letter-spacing="1">M 500</text></svg>'
  },
  {
    id: 'med-2',
    name: 'Levothyroxine',
    dosage: '75 mcg',
    type: 'tablet' as const,
    foodCondition: 'before_food',
    scheduledTimes: ['07:00'],
    color: '#d97706', // Amber
    instructions: 'Take on an empty stomach with a full glass of water, 30-60 min before breakfast.',
    prescribedFor: 'Thyroid Hormone Replacement',
    inventoryCount: 28,
    isActive: true,
    createdAt: new Date().toISOString(),
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><radialGradient id="g2" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="%23fef3c7"/><stop offset="70%" stop-color="%23fde68a"/><stop offset="100%" stop-color="%23f59e0b"/></radialGradient><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="%230f172a" flood-opacity="0.25"/></filter></defs><circle cx="100" cy="100" r="82" fill="%23d97706" filter="url(%23s)"/><circle cx="100" cy="98" r="80" fill="url(%23g2)"/><circle cx="100" cy="98" r="70" fill="none" stroke="%23fef08a" stroke-width="2"/><line x1="100" y1="35" x2="100" y2="161" stroke="%23d97706" stroke-width="2.5" stroke-linecap="round"/><text x="100" y="103" font-family="Arial,sans-serif" font-size="16" font-weight="900" fill="%23b45309" text-anchor="middle">75</text></svg>'
  },
  {
    id: 'med-3',
    name: 'Lisinopril',
    dosage: '10 mg',
    type: 'capsule' as const,
    foodCondition: 'anytime',
    scheduledTimes: ['09:00'],
    color: '#3b82f6', // Blue
    instructions: 'Take at the same time each morning. Maintain adequate hydration.',
    prescribedFor: 'Blood Pressure Control',
    inventoryCount: 30,
    isActive: true,
    createdAt: new Date().toISOString(),
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><radialGradient id="g3" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="%23ffe4e6"/><stop offset="70%" stop-color="%23fecdd3"/><stop offset="100%" stop-color="%23fb7185"/></radialGradient><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="%230f172a" flood-opacity="0.25"/></filter></defs><circle cx="100" cy="100" r="82" fill="%23e11d48" filter="url(%23s)"/><circle cx="100" cy="98" r="80" fill="url(%23g3)"/><circle cx="100" cy="98" r="70" fill="none" stroke="%23ffe4e6" stroke-width="2"/><text x="100" y="104" font-family="Arial,sans-serif" font-size="18" font-weight="900" fill="%23be123c" text-anchor="middle">L 10</text></svg>'
  },
  {
    id: 'med-4',
    name: 'Omega-3 Pure EPA/DHA',
    dosage: '1000 mg',
    type: 'capsule' as const,
    foodCondition: 'with_food',
    scheduledTimes: ['13:00'],
    color: '#0284c7', // Cyan/Sky
    instructions: 'Take in the middle of a meal for optimal fatty acid absorption.',
    prescribedFor: 'Cardiovascular Support',
    inventoryCount: 60,
    isActive: true,
    createdAt: new Date().toISOString(),
    imageUrl: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fef08a"/><stop offset="40%" stop-color="%23f59e0b"/><stop offset="100%" stop-color="%23b45309"/></linearGradient><filter id="s" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="%230f172a" flood-opacity="0.25"/></filter></defs><rect x="35" y="70" width="130" height="60" rx="30" fill="%2392400e" filter="url(%23s)"/><rect x="35" y="68" width="130" height="60" rx="30" fill="url(%23g4)"/><rect x="42" y="73" width="116" height="20" rx="10" fill="%23ffffff" fill-opacity="0.35"/><text x="100" y="104" font-family="Arial,sans-serif" font-size="13" font-weight="900" fill="%2378350f" text-anchor="middle">1000mg</text></svg>'
  }
];

export const DEFAULT_EMERGENCY_CONTACT: EmergencyContact = {
  name: '',
  relationship: '',
  phone: '',
  email: '',
  notes: ''
};

export const SAMPLE_EMERGENCY_CONTACT: EmergencyContact = {
  name: '',
  relationship: '',
  phone: '',
  email: '',
  notes: ''
};

export const DEFAULT_SETTINGS: AppSettings = {
  language: 'en',
  textSize: 'normal',
  soundEnabled: true,
  soundVolume: 0.8,
  speechRate: 0.88,
  patientProfile: {
    name: '',
    age: '',
    bloodGroup: '',
    doctorName: '',
    doctorPhone: '',
    notes: ''
  },
  encryptionEnabled: true,
  isLocked: false,
  lastSyncTime: new Date().toISOString(),
  darkMode: false,
  calendarConnected: false
};

/**
 * Generates initial dose history (empty by default so only user-added medicines are tracked)
 */
export function generateInitialDoseLogs(): DoseLog[] {
  return [];
}
