export type MedicationType = 'pill' | 'tablet' | 'capsule' | 'liquid' | 'injection' | 'inhaler' | 'drops';

export type FoodCondition = 'before_food' | 'after_food' | 'with_food' | 'anytime';

export type DoseStatus = 'taken' | 'snoozed' | 'skipped' | 'pending' | 'missed';

export type LanguageCode = 'en' | 'hi' | 'ta' | 'te' | 'kn' | 'bn' | 'mr' | 'ml' | 'gu' | 'es' | 'fr' | 'de' | 'ja';

export type TextSize = 'normal' | 'large' | 'extra-large' | 'xlarge';

export type AppTab = 'home' | 'tracker' | 'manage' | 'profile';

export interface UserSession {
  isLoggedIn: boolean;
  loginMethod: 'gmail' | 'phone';
  email: string;
  phone: string;
  displayName: string;
  avatarUrl?: string;
  notifyOnMissed: boolean;
  lastLoginAt: string;
}

export interface MissedAlertNotification {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  recipientEmail: string;
  recipientPhone: string;
  messageText: string;
  sentAt: string;
  method: 'email' | 'sms' | 'both';
  status: 'sent' | 'pending';
}

export interface PatientProfile {
  name: string;
  age: string;
  bloodGroup: string;
  doctorName?: string;
  doctorPhone?: string;
  notes?: string;
}

export interface Medication {
  id: string;
  name: string;
  dosage: string;
  type: MedicationType;
  foodCondition: FoodCondition;
  scheduledTimes: string[]; // e.g. ["08:00", "20:00"]
  color: string;
  instructions: string;
  prescribedFor?: string;
  inventoryCount?: number;
  remindDailyLowStock?: boolean;
  lastDailyStockRemindedDate?: string;
  isActive: boolean;
  hasFamilyVoice?: boolean; // Custom family voice reminder assigned to this medicine
  createdAt: string;
  imageUrl?: string; // base64 or picture url
}

export interface DoseLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  foodCondition: FoodCondition;
  scheduledTime: string; // ISO date-time string
  loggedTime: string;    // ISO date-time string
  status: DoseStatus;
  notes?: string;
  imageUrl?: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  notes?: string;
}

export interface AppSettings {
  language: LanguageCode;
  textSize: TextSize;
  soundEnabled: boolean;
  soundVolume: number;
  speechRate?: number;
  patientProfile?: PatientProfile;
  encryptionEnabled: boolean;
  isLocked: boolean;
  lastSyncTime?: string;
  darkMode?: boolean;
  calendarConnected?: boolean;
  familyVoice?: {
    enabled: boolean;
    audioDataUrl?: string;
    recordedAt?: string;
    familyMemberName?: string;
    relationship?: string;
    customNote?: string;
    maxDurationSeconds?: 10 | 15;
    targetScope?: 'all' | 'selected';
    selectedMedicationIds?: string[];
  };
}

export interface NextDose {
  medication: Medication;
  scheduledDateTime: Date;
  timeString: string;
  minutesDiff: number; // negative = overdue, 0 = now, positive = future
  isOverdue: boolean;
  isDueNow: boolean;
  isSnoozed?: boolean;
  snoozedUntil?: Date;
}

export interface DailyAdherence {
  dateStr: string; // YYYY-MM-DD
  dayLabel: string; // e.g. Mon, Tue
  totalScheduled: number;
  totalTaken: number;
  complianceRate: number; // 0 to 100
  isTracked?: boolean; // false if date is before the user began using the app
}

export interface NearbyPharmacy {
  id: string;
  name: string;
  brand?: string;
  distanceKm: number;
  distanceFormatted: string;
  address: string;
  phone?: string;
  lat: number;
  lng: number;
  isOpenNow: boolean;
  openingHours?: string;
  is24Hours?: boolean;
  hasDelivery: boolean;
  rating?: number;
}
