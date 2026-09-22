import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Pill, 
  Plus, 
  Clock, 
  Check, 
  AlertCircle,
  Camera,
  Volume2,
  Calendar as CalendarIcon
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  Medication, 
  DoseLog, 
  EmergencyContact, 
  AppSettings, 
  NextDose,
  AppTab,
  PatientProfile,
  UserSession,
  MissedAlertNotification
} from './types';
import { 
  loadStorageData, 
  saveStorageData,
  loadUserSession,
  saveUserSession,
  DEFAULT_USER_SESSION
} from './utils/storage';
import { 
  calculateNextDose, 
  calculateWeeklyCompliance, 
  getTodayDateString,
  findMissedDosesToday,
  getTomorrowEarliestDose
} from './utils/scheduler';
import { 
  translations, 
  getLocalizedHiGreeting 
} from './utils/translations';
import { audioAlarm } from './utils/audioAlarm';
import { speakMedicationAlert, stopSpeaking } from './utils/speech';
import { sendMissedDoseAlert } from './utils/notificationService';
import { 
  registerMediAlertServiceWorker, 
  syncScheduleToServiceWorker,
  requestNotificationPermission 
} from './utils/serviceWorkerManager';

// Components
import { HeaderBar } from './components/HeaderBar';
import { BottomNavBar } from './components/BottomNavBar';
import { NextMedicineCard } from './components/NextMedicineCard';
import { FullScreenAlarm } from './components/FullScreenAlarm';
import { WeeklyComplianceTracker } from './components/WeeklyComplianceTracker';
import { MedicationManagerModal } from './components/MedicationManagerModal';
import { ProfileView } from './components/ProfileView';
import { ManageView } from './components/ManageView';
import { FoodConditionBadge } from './components/FoodConditionBadge';
import { AuthModal } from './components/AuthModal';
import { FamilyAlertModal } from './components/FamilyAlertModal';
import { PWAInstallButton } from './components/PWAInstallButton';
import { FloatingVoiceButton } from './components/FloatingVoiceButton';
import { VoiceCommandModal } from './components/VoiceCommandModal';
import { FamilyVoiceRecorderModal } from './components/FamilyVoiceRecorderModal';
import { speakMedicationDetails } from './utils/speech';
import { generateIcsCalendar, downloadIcsFile, connectToGoogleCalendar } from './utils/calendarExport';
import { 
  DEFAULT_MEDICATIONS, 
  DEFAULT_EMERGENCY_CONTACT, 
  DEFAULT_SETTINGS,
  SAMPLE_MEDICATIONS,
  SAMPLE_EMERGENCY_CONTACT,
  generateInitialDoseLogs 
} from './utils/defaults';

export default function App() {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentTab, setCurrentTab] = useState<AppTab>('home');
  const [medications, setMedications] = useState<Medication[]>(DEFAULT_MEDICATIONS);
  const [doseLogs, setDoseLogs] = useState<DoseLog[]>([]);
  const [emergencyContact, setEmergencyContact] = useState<EmergencyContact>(DEFAULT_EMERGENCY_CONTACT);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [snoozedDoses, setSnoozedDoses] = useState<Record<string, number>>({});

  // Slots that have already alarmed today (to guarantee alarm sounds at exact minute, without duplicate spam)
  const [alertedSlotsToday, setAlertedSlotsToday] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('medialert_alerted_slots_today');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.date === getTodayDateString() && Array.isArray(parsed.slots)) {
          return new Set(parsed.slots);
        }
      }
    } catch {}
    return new Set<string>();
  });

  // Persist alerted slots
  useEffect(() => {
    try {
      localStorage.setItem('medialert_alerted_slots_today', JSON.stringify({
        date: getTodayDateString(),
        slots: Array.from(alertedSlotsToday)
      }));
    } catch {}
  }, [alertedSlotsToday]);

  // Senior User Authentication (Gmail / Phone Number)
  const [userSession, setUserSession] = useState<UserSession | null>(() => loadUserSession());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [missedAlerts, setMissedAlerts] = useState<MissedAlertNotification[]>([]);
  const [notifiedMissedKeys, setNotifiedMissedKeys] = useState<Set<string>>(new Set());

  // Active full-screen alarm state
  const [alarmPayload, setAlarmPayload] = useState<{
    medication: Medication;
    scheduledTime: string;
  } | null>(null);

  // Medication modal state
  const [isMedsModalOpen, setIsMedsModalOpen] = useState<boolean>(false);
  const [isAddModeInitial, setIsAddModeInitial] = useState<boolean>(false);
  const [editingMedication, setEditingMedication] = useState<Medication | null>(null);
  const [isFamilyAlertOpen, setIsFamilyAlertOpen] = useState<boolean>(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState<boolean>(false);
  const [isFamilyVoiceModalOpen, setIsFamilyVoiceModalOpen] = useState<boolean>(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  }, []);

  // Direct 1-Click Connect to Google Account Calendar
  const handleConnectToCalendar = useCallback(() => {
    try {
      const activeName = userSession?.displayName || settings.patientProfile?.name || 'User';
      const success = connectToGoogleCalendar(
        medications,
        activeName,
        settings.language
      );
      const now = new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      localStorage.setItem('medialert_calendar_connected_time', now);
      localStorage.setItem('medialert_google_calendar_connected', 'true');
      showToast('✓ Connected to Google Account Calendar! Medicine alarms synced.');
    } catch (err) {
      console.error('Google calendar connect error:', err);
      showToast('Connecting to Google Account Calendar...');
    }
  }, [medications, userSession?.displayName, settings.patientProfile?.name, settings.language, showToast]);

  // Load initial data from local storage & Register Service Worker
  useEffect(() => {
    async function init() {
      try {
        const data = await loadStorageData();
        setMedications(data.medications);
        setDoseLogs(data.doseLogs);
        setEmergencyContact(data.emergencyContact);
        setSettings({
          ...DEFAULT_SETTINGS,
          ...data.settings,
          patientProfile: data.settings.patientProfile || DEFAULT_SETTINGS.patientProfile
        });
        setSnoozedDoses(data.snoozedDoses);
        
        // Register Service Worker for closed-app & background reminders
        registerMediAlertServiceWorker().catch(() => {});

        // Check session - if not logged in, prompt modal immediately
        const session = loadUserSession();
        setUserSession(session);
        if (!session || !session.isLoggedIn) {
          setIsAuthModalOpen(true);
        }
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  // Auto-persist changes to local storage
  useEffect(() => {
    if (!isLoading) {
      saveStorageData(medications, doseLogs, emergencyContact, settings, snoozedDoses);
    }
  }, [medications, doseLogs, emergencyContact, settings, snoozedDoses, isLoading]);

  // Priority calculation for Flagship Smart Next Medicine Card
  const nextDose: NextDose | null = useMemo(() => {
    return calculateNextDose(medications, doseLogs, snoozedDoses);
  }, [medications, doseLogs, snoozedDoses]);

  // If all doses today are completed, calculate earliest dose for tomorrow
  const tomorrowEarliestDose = useMemo(() => {
    if (nextDose) return null;
    return getTomorrowEarliestDose(medications);
  }, [nextDose, medications]);

  // Weekly compliance statistics
  const complianceStats = useMemo(() => {
    return calculateWeeklyCompliance(medications, doseLogs);
  }, [medications, doseLogs]);

  // Active language translation strings
  const t = translations[settings.language] || translations.en;
  const patientName = userSession?.displayName || settings.patientProfile?.name || '';

  // Synchronize medication schedule with Service Worker for closed-app notifications
  useEffect(() => {
    if (!isLoading) {
      syncScheduleToServiceWorker(medications, patientName, settings.language);
    }
  }, [medications, patientName, settings.language, isLoading]);

  // Handle opening directly to a due dose if launched from a Service Worker notification click
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const doseDueId = params.get('doseDue');
      if (doseDueId && medications.length > 0) {
        const targetMed = medications.find(m => m.id === doseDueId);
        if (targetMed) {
          setAlarmPayload({
            medication: targetMed,
            scheduledTime: targetMed.scheduledTimes[0] || '08:00'
          });
          // Clean URL param without page reload
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    }
  }, [medications]);

  // Daily low stock reminder check (triggers daily once when 5 or fewer left)
  useEffect(() => {
    const todayStr = getTodayDateString();
    let hasAlertedToday = false;

    medications.forEach(med => {
      if (!med.isActive) return;
      if (med.remindDailyLowStock === false) return;

      const stock = typeof med.inventoryCount === 'number' ? med.inventoryCount : 0;

      // The daily reminder of medicine stock must trigger when there are 5 left (stock <= 5)
      if (stock <= 5) {
        if (med.lastDailyStockRemindedDate !== todayStr && !hasAlertedToday) {
          hasAlertedToday = true;
          showToast(
            stock <= 0
              ? `🚨 Stock Alert: "${med.name}" is OUT OF STOCK! (0 left)`
              : `⚠️ Stock Alert: Only ${stock} left of "${med.name}"! Please restock.`
          );

          // Update lastDailyStockRemindedDate for this medication
          setMedications(prev => prev.map(m => m.id === med.id ? { ...m, lastDailyStockRemindedDate: todayStr } : m));
        }
      }
    });
  }, [medications, showToast]);

  // Dynamic greeting based on current local hour
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return t.greetingMorning;
    if (hour < 17) return t.greetingAfternoon;
    return t.greetingEvening;
  }, [t]);

  // Auto-Alarm Monitor: checks if a dose has become due right now (current device time equals reminder time) or snooze expired
  useEffect(() => {
    const checkAlarmInterval = setInterval(() => {
      if (alarmPayload) return;

      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const todayStr = getTodayDateString();

      for (const med of medications) {
        if (!med.isActive) continue;

        for (const timeStr of med.scheduledTimes) {
          const [schedH, schedM] = timeStr.split(':').map(Number);
          const isTimeEqual = currentH === schedH && currentM === schedM;
          const slotKey = `${med.id}_${timeStr}_${todayStr}`;

          // Check if already taken or skipped today
          const isTakenOrSkipped = doseLogs.some(log => {
            const logDateStr = log.scheduledTime.split('T')[0];
            const logTimeStr = log.scheduledTime.split('T')[1]?.substring(0, 5);
            return (
              log.medicationId === med.id &&
              logDateStr === todayStr &&
              logTimeStr === timeStr &&
              (log.status === 'taken' || log.status === 'skipped')
            );
          });

          if (isTakenOrSkipped) continue;

          // Check if snoozed
          const snoozeExpiry = snoozedDoses[slotKey];
          const isSnoozedInFuture = snoozeExpiry && snoozeExpiry > now.getTime();
          if (isSnoozedInFuture) continue;

          const isSnoozeDue = snoozeExpiry && snoozeExpiry <= now.getTime() && (now.getTime() - snoozeExpiry) <= 60000;

          // When the current time in user device is equal to reminder time, then and only then reminder is triggered
          if ((isTimeEqual && !alertedSlotsToday.has(slotKey)) || isSnoozeDue) {
            setAlertedSlotsToday(prev => {
              const next = new Set(prev);
              next.add(slotKey);
              return next;
            });
            setAlarmPayload({
              medication: med,
              scheduledTime: timeStr
            });
            return;
          }
        }
      }
    }, 2000);

    return () => clearInterval(checkAlarmInterval);
  }, [medications, doseLogs, snoozedDoses, alertedSlotsToday, alarmPayload]);

  // Action: Take Dose
  const handleTakeDose = useCallback((medicationId: string, scheduledTime: string) => {
    const todayStr = getTodayDateString();
    const med = medications.find(m => m.id === medicationId);
    if (!med) return;

    const newLog: DoseLog = {
      id: `log-${Date.now()}`,
      medicationId,
      medicationName: med.name,
      dosage: med.dosage,
      foodCondition: med.foodCondition,
      scheduledTime: `${todayStr}T${scheduledTime}:00`,
      loggedTime: new Date().toISOString(),
      status: 'taken',
      imageUrl: med.imageUrl
    };

    setDoseLogs(prev => [newLog, ...prev]);

    // Decrement stock inventory for this medication
    setMedications(prev => prev.map(m => {
      if (m.id === medicationId && typeof m.inventoryCount === 'number') {
        return {
          ...m,
          inventoryCount: Math.max(0, m.inventoryCount - 1)
        };
      }
      return m;
    }));

    // Clean snooze state for this slot
    const slotKey = `${medicationId}_${scheduledTime}_${todayStr}`;
    setSnoozedDoses(prev => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });

    // Close alarm if it was open
    setAlarmPayload(null);
    audioAlarm.stopAlarm();
    stopSpeaking();
    showToast(`✓ ${med.name} dose recorded! Adherence tracked.`);
  }, [medications, showToast]);

  // Action: Snooze 5 Minutes
  const handleSnooze5Min = useCallback((medicationId: string, scheduledTime: string) => {
    const todayStr = getTodayDateString();
    const slotKey = `${medicationId}_${scheduledTime}_${todayStr}`;
    const snoozeUntil = Date.now() + 5 * 60 * 1000; // 5 minutes in milliseconds

    setSnoozedDoses(prev => ({
      ...prev,
      [slotKey]: snoozeUntil
    }));

    // Record snooze log
    const med = medications.find(m => m.id === medicationId);
    if (med) {
      const newLog: DoseLog = {
        id: `log-snooze-${Date.now()}`,
        medicationId,
        medicationName: med.name,
        dosage: med.dosage,
        foodCondition: med.foodCondition,
        scheduledTime: `${todayStr}T${scheduledTime}:00`,
        loggedTime: new Date().toISOString(),
        status: 'snoozed',
        imageUrl: med.imageUrl
      };
      setDoseLogs(prev => [newLog, ...prev]);
    }

    setAlarmPayload(null);
    audioAlarm.stopAlarm();
    stopSpeaking();
    showToast(`⏰ Snoozed ${med?.name || 'dose'} for 5 minutes.`);
  }, [medications, showToast]);

  // Action: Cancel Snooze / Reset
  const handleCancelSnooze = useCallback((medicationId: string, scheduledTime: string) => {
    const todayStr = getTodayDateString();
    const slotKey = `${medicationId}_${scheduledTime}_${todayStr}`;
    setSnoozedDoses(prev => {
      const next = { ...prev };
      delete next[slotKey];
      return next;
    });
    showToast('Snooze ended. Medicine schedule resumed.');
  }, [showToast]);

  // Action: Trigger Alarm Preview & Acoustic Buzzer Sound
  const handleTriggerAlarmPreview = () => {
    const sampleTestMed: Medication = {
      id: 'test-med-alarm',
      name: 'Scheduled Tablet',
      dosage: '1 Tablet',
      type: 'tablet',
      foodCondition: 'after_food',
      scheduledTimes: ['08:00'],
      color: '#5e35b1',
      instructions: 'Take with warm water',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    const medToAlert = nextDose ? nextDose.medication : (medications[0] || sampleTestMed);
    const timeToAlert = nextDose ? nextDose.timeString : '08:00';

    if (settings.soundEnabled) {
      audioAlarm.startAlarm(settings.soundVolume ?? 0.85);
    }
    setAlarmPayload({
      medication: medToAlert,
      scheduledTime: timeToAlert
    });
  };

  // Senior Authentication Handlers
  const handleLogin = (session: UserSession) => {
    setUserSession(session);
    saveUserSession(session);
    setIsAuthModalOpen(false);
    if (session.displayName) {
      const updatedProfile: PatientProfile = {
        ...(settings.patientProfile || DEFAULT_SETTINGS.patientProfile!),
        name: session.displayName
      };
      setSettings(prev => ({
        ...prev,
        patientProfile: updatedProfile
      }));
    }
    // Automatically request notification permissions for background reminders
    requestNotificationPermission().catch(() => {});
    showToast(`✓ Saved details for ${session.displayName}. Reminders active.`);
  };

  const handleLogout = () => {
    setUserSession(null);
    saveUserSession(null);
    showToast('Logged out of account.');
  };

  // Test Missed-Dose Email & SMS Dispatch
  const handleTriggerMissedAlertTest = useCallback(() => {
    const sampleTestMed: Medication = {
      id: 'test-med-alert',
      name: 'Sample Medicine',
      dosage: '1 Tablet',
      type: 'tablet',
      foodCondition: 'after_food',
      scheduledTimes: ['08:00'],
      color: '#5e35b1',
      instructions: 'Take 1 tablet with warm water',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    const med = medications[0] || sampleTestMed;
    const activeSession = userSession || DEFAULT_USER_SESSION;
    const notification = sendMissedDoseAlert(
      med,
      '08:00',
      activeSession,
      emergencyContact,
      settings.language
    );
    setMissedAlerts(prev => [notification, ...prev]);
    const target = activeSession.email || activeSession.phone || 'configured contact';
    showToast(`✉️ Alert dispatched to ${target}`);
  }, [medications, userSession, emergencyContact, settings.language, showToast]);

  // Automated Background Missed Medicine Monitor & Dispatch
  useEffect(() => {
    if (!userSession?.notifyOnMissed || medications.length === 0) return;

    const checkMissedInterval = setInterval(() => {
      const missed = findMissedDosesToday(medications, doseLogs, snoozedDoses, 30);
      const todayStr = getTodayDateString();

      missed.forEach(item => {
        const alertKey = `${item.medication.id}_${item.timeString}_${todayStr}`;
        if (notifiedMissedKeys.has(alertKey)) return;

        const notification = sendMissedDoseAlert(
          item.medication,
          item.timeString,
          userSession,
          emergencyContact,
          settings.language
        );

        setNotifiedMissedKeys(prev => new Set(prev).add(alertKey));
        setMissedAlerts(prev => [notification, ...prev]);
        showToast(`⚠️ Urgent missed dose alert sent to ${userSession.email || userSession.phone}`);
      });
    }, 15000);

    return () => clearInterval(checkMissedInterval);
  }, [medications, doseLogs, snoozedDoses, userSession, emergencyContact, settings.language, notifiedMissedKeys, showToast]);

  // Medication handlers
  const handleSaveMedication = (med: Medication) => {
    setMedications(prev => {
      const idx = prev.findIndex(m => m.id === med.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = med;
        return next;
      }
      return [...prev, med];
    });
    showToast(`Prescription "${med.name}" saved.`);
  };

  const handleDeleteMedication = (medId: string) => {
    setMedications(prev => prev.filter(m => m.id !== medId));
    showToast('Prescription removed.');
  };

  // Open Add modal specifically
  const handleOpenAddMedicine = () => {
    setEditingMedication(null);
    setIsAddModeInitial(true);
    setIsMedsModalOpen(true);
  };

  // Export data as JSON file
  const handleExportData = () => {
    const backup = {
      medications,
      doseLogs,
      emergencyContact,
      settings,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medialert-backup-${getTodayDateString()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast('Backup file downloaded.');
  };

  // Import data from JSON file
  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.medications) setMedications(data.medications);
        if (data.doseLogs) setDoseLogs(data.doseLogs);
        if (data.emergencyContact) setEmergencyContact(data.emergencyContact);
        if (data.settings) setSettings(prev => ({ ...prev, ...data.settings }));
        showToast('Data successfully restored!');
      } catch (err) {
        showToast('Invalid backup file format.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetSampleData = () => {
    setMedications(SAMPLE_MEDICATIONS);
    setDoseLogs(generateInitialDoseLogs());
    setEmergencyContact(SAMPLE_EMERGENCY_CONTACT);
    setSettings(DEFAULT_SETTINGS);
    setSnoozedDoses({});
    showToast('Sample medical schedule loaded.');
  };

  // Update Settings
  const handleUpdateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Update Patient Profile & keep connected account in sync
  const handleUpdatePatientProfile = (newProfile: PatientProfile) => {
    setSettings(prev => ({
      ...prev,
      patientProfile: newProfile
    }));
    if (userSession && newProfile.name && userSession.displayName !== newProfile.name) {
      const updatedSession: UserSession = {
        ...userSession,
        displayName: newProfile.name
      };
      setUserSession(updatedSession);
      saveUserSession(updatedSession);
    }
    showToast('Personal health profile updated.');
  };

  // Synchronize text-size and dark-mode on root document element for app-wide accessibility
  useEffect(() => {
    document.documentElement.setAttribute('data-text-size', settings.textSize);
    document.body.setAttribute('data-text-size', settings.textSize);
    const sizeMap: Record<string, string> = {
      normal: '16px',
      large: '19px',
      'extra-large': '22px',
      xlarge: '22px'
    };
    const targetSize = sizeMap[settings.textSize] || '16px';
    document.documentElement.style.setProperty('font-size', targetSize, 'important');

    // Toggle dark mode class on html and body for high-contrast visible colors
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
    }
  }, [settings.textSize, settings.darkMode]);

  // Senior accessibility scale class
  const textSizeClass = {
    normal: 'text-scale-normal text-base',
    large: 'text-scale-large text-lg',
    'extra-large': 'text-scale-xlarge text-xl',
    xlarge: 'text-scale-xlarge text-xl'
  }[settings.textSize] || 'text-base';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#0E0F1A] flex items-center justify-center p-6 text-center">
        <div className="space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#5e35b1] text-white flex items-center justify-center mx-auto animate-pulse shadow-lg shadow-purple-600/30">
            <Pill className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-slate-800">
            Loading MediAlert...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${settings.darkMode ? 'dark' : ''} bg-white dark:bg-[#0E0F1A] text-slate-900 dark:text-slate-100 transition-colors ${textSizeClass}`}>
      {/* Toast Notification */}
      {toastMessage && (
        <div 
          id="toast-notification"
          className="fixed top-18 left-1/2 transform -translate-x-1/2 z-50 bg-slate-900/95 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs sm:text-sm font-bold border border-slate-700 animate-in fade-in duration-200"
        >
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header Bar matching Screenshot */}
      <HeaderBar
        settings={settings}
        userSession={userSession}
        onUpdateSettings={handleUpdateSettings}
        onOpenProfile={() => setCurrentTab('profile')}
        onTriggerAlarmTest={handleTriggerAlarmPreview}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onConnectToCalendar={handleConnectToCalendar}
      />

      {/* Main Container */}
      <main className="w-full max-w-lg mx-auto px-3.5 py-4 sm:px-6 space-y-5 sm:space-y-6">
        {/* TAB 1: HOME VIEW */}
        {currentTab === 'home' && (
          <div className="space-y-6 pb-24">
            {/* Greeting Block in Selected Language */}
            <div className="space-y-2">
              <div>
                <span className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wider">
                  {greetingText}
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-0.5">
                  {getLocalizedHiGreeting(settings.language, patientName)}
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                  {t.tagline}
                </p>
              </div>
            </div>

            {/* Wide "+ Add Medicine" Button matching reference screenshot */}
            <div>
              <button
                id="btn-home-add-medicine-prominent"
                onClick={handleOpenAddMedicine}
                className="w-full min-h-[54px] py-3.5 px-6 rounded-2xl bg-[#5e35b1] hover:bg-[#512da8] active:scale-[0.98] text-white font-extrabold text-base sm:text-lg flex items-center justify-center gap-2.5 shadow-lg shadow-purple-600/30 transition-all focus:outline-none focus:ring-4 focus:ring-purple-300 cursor-pointer"
              >
                <span>{t.addMedicineBtn}</span>
              </button>
            </div>

            {/* Next Medicine Priority Card matching reference screenshot */}
            <section aria-label="Next Medicine Priority">
              <div className="flex items-center justify-between mb-2.5">
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {t.nextMedicine}
                </h2>
              </div>

              <NextMedicineCard
                nextDose={nextDose}
                tomorrowDose={tomorrowEarliestDose}
                hasMedications={medications.length > 0}
                language={settings.language}
                patientName={patientName}
                onTakeDose={handleTakeDose}
                onSnooze5Min={handleSnooze5Min}
                onCancelSnooze={handleCancelSnooze}
                onOpenAddModal={handleOpenAddMedicine}
              />
            </section>

            {/* Today's Medicines Checklist for Seniors */}
            <section aria-label="Today's Medicine Schedule" className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-slate-800">
                    Today's Schedule
                  </h3>
                  <span className="text-xs text-slate-500 font-medium">
                    {medications.length} medicines
                  </span>
                </div>
              </div>

              {medications.length === 0 ? (
                <div 
                  id="card-schedule-empty"
                  className="bg-white p-6 rounded-2xl border border-slate-200/80 text-center shadow-xs space-y-2"
                >
                  <p className="text-sm font-bold text-slate-700">No medicines scheduled for today</p>
                  <p className="text-xs text-slate-400">Add your first medicine above to start your daily timetable.</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {medications.map((med) => {
                    const todayStr = getTodayDateString();
                    const isTakenToday = doseLogs.some(
                      l => l.medicationId === med.id && l.scheduledTime.startsWith(todayStr) && l.status === 'taken'
                    );

                    return (
                      <div
                        key={med.id}
                        className={`bg-white p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                          isTakenToday 
                            ? 'border-emerald-200 bg-emerald-50/20' 
                            : 'border-slate-100 shadow-2xs hover:border-purple-200'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {med.imageUrl ? (
                            <img
                              src={med.imageUrl}
                              alt={med.name}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                              isTakenToday ? 'bg-emerald-100 text-emerald-700' : 'bg-purple-100 text-[#5e35b1]'
                            }`}>
                              <Pill className="w-5 h-5" />
                            </div>
                          )}

                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className={`text-sm font-extrabold ${isTakenToday ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                                {med.name}
                              </h4>
                              <span className="text-[11px] font-semibold text-slate-500">
                                {med.dosage}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {med.scheduledTimes.join(', ')}
                              </span>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                                {t.foodConditions[med.foodCondition]?.title}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Take Button or Done Checkmark */}
                        <div>
                          {isTakenToday ? (
                            <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              Taken
                            </span>
                          ) : (
                            <button
                              id={`btn-take-today-${med.id}`}
                              onClick={() => handleTakeDose(med.id, med.scheduledTimes[0] || '08:00')}
                              className="px-3 py-1.5 rounded-xl bg-[#5e35b1] hover:bg-[#512da8] text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
                            >
                              Take
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Senior Voice Activated Command FAB on Home Screen */}
            <FloatingVoiceButton
              onClick={() => setIsVoiceModalOpen(true)}
              language={settings.language}
              onQuickSpeakNextDose={() => {
                if (nextDose?.medication) {
                  speakMedicationDetails(nextDose.medication, settings.language);
                  showToast(`Speaking ${nextDose.medication.name} details in ${settings.language.toUpperCase()}`);
                } else if (medications.length > 0) {
                  speakMedicationDetails(medications[0], settings.language);
                  showToast(`Speaking ${medications[0].name} details in ${settings.language.toUpperCase()}`);
                } else {
                  showToast('No medicines added yet.');
                }
              }}
            />
          </div>
        )}

        {/* TAB 2: TRACKER VIEW */}
        {currentTab === 'tracker' && (
          <div className="space-y-6 pb-24">
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {t.weeklyProgress}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Track your health discipline, daily streaks, and adherence rate
              </p>
            </div>

            <WeeklyComplianceTracker
              days={complianceStats.days}
              weeklyRate={complianceStats.weeklyRate}
              streakDays={complianceStats.streakDays}
              totalTakenThisWeek={complianceStats.totalTakenThisWeek}
              totalScheduledThisWeek={complianceStats.totalScheduledThisWeek}
              doseLogs={doseLogs}
              medications={medications}
              language={settings.language}
              hasMedications={medications.length > 0}
              onOpenAddModal={handleOpenAddMedicine}
              onUpdateMedication={handleSaveMedication}
            />
          </div>
        )}

        {/* TAB 3: MANAGE / REMINDER VIEW */}
        {currentTab === 'manage' && (
          <ManageView
            medications={medications}
            language={settings.language}
            patientName={patientName}
            familyVoice={settings.familyVoice}
            onOpenAddModal={handleOpenAddMedicine}
            onOpenFamilyVoice={() => setIsFamilyVoiceModalOpen(true)}
            onEditMedication={(med) => {
              setEditingMedication(med);
              setIsAddModeInitial(false);
              setIsMedsModalOpen(true);
            }}
            onDeleteMedication={handleDeleteMedication}
            onTriggerAlarmTest={handleTriggerAlarmPreview}
            onConnectToCalendar={handleConnectToCalendar}
          />
        )}

        {/* TAB 4: PROFILE VIEW */}
        {currentTab === 'profile' && (
          <ProfileView
            emergencyContact={emergencyContact}
            patientProfile={settings.patientProfile || DEFAULT_SETTINGS.patientProfile!}
            settings={settings}
            userSession={userSession}
            missedAlerts={missedAlerts}
            onOpenAuthModal={() => setIsAuthModalOpen(true)}
            onLogout={handleLogout}
            onUpdateEmergencyContact={(contact) => {
              setEmergencyContact(contact);
              showToast('Emergency Caregiver updated.');
            }}
            onUpdatePatientProfile={handleUpdatePatientProfile}
            onUpdateSettings={handleUpdateSettings}
            onExportData={handleExportData}
            onImportData={handleImportData}
            onResetData={handleResetSampleData}
            onTriggerAlarmTest={handleTriggerAlarmPreview}
            onTriggerMissedAlertTest={handleTriggerMissedAlertTest}
            onConnectToCalendar={handleConnectToCalendar}
            onOpenFamilyVoice={() => setIsFamilyVoiceModalOpen(true)}
          />
        )}
      </main>

      {/* Bottom 5-Tab Navigation Bar */}
      <BottomNavBar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenAddModal={handleOpenAddMedicine}
        language={settings.language}
      />

      {/* FullScreen Alarm & 5-Minute Snooze Modal */}
      <FullScreenAlarm
        isOpen={alarmPayload !== null}
        medication={alarmPayload ? alarmPayload.medication : null}
        scheduledTime={alarmPayload ? alarmPayload.scheduledTime : ''}
        language={settings.language}
        patientName={patientName}
        soundEnabled={settings.soundEnabled}
        familyVoice={settings.familyVoice}
        onTakeDose={handleTakeDose}
        onSnooze5Min={handleSnooze5Min}
        onDismiss={() => {
          setAlarmPayload(null);
          audioAlarm.stopAlarm();
          stopSpeaking();
        }}
        onOpenEmergency={() => {
          setAlarmPayload(null);
          setIsFamilyAlertOpen(true);
        }}
      />

      {/* Medication Manager Modal (with Camera / Image Support) */}
      <MedicationManagerModal
        isOpen={isMedsModalOpen}
        medications={medications}
        language={settings.language}
        initialAddMode={isAddModeInitial}
        initialEditingMedication={editingMedication}
        onSaveMedication={handleSaveMedication}
        onDeleteMedication={handleDeleteMedication}
        onClose={() => {
          setIsMedsModalOpen(false);
          setIsAddModeInitial(false);
          setEditingMedication(null);
        }}
      />

      {/* Senior User Authentication Modal (Gmail / Phone Number) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          if (userSession?.isLoggedIn) {
            setIsAuthModalOpen(false);
          }
        }}
        onLogin={handleLogin}
        currentSession={userSession}
        isRequired={!userSession || !userSession.isLoggedIn}
      />

      {/* Senior Family Alert & SOS Hub Modal */}
      <FamilyAlertModal
        isOpen={isFamilyAlertOpen}
        onClose={() => setIsFamilyAlertOpen(false)}
        emergencyContact={emergencyContact}
        onUpdateEmergencyContact={(contact) => {
          setEmergencyContact(contact);
          showToast('Family caregiver contact saved.');
        }}
        userSession={userSession}
        userName={patientName}
        medication={alarmPayload ? alarmPayload.medication : (medications[0] || null)}
        scheduledTime={alarmPayload ? alarmPayload.scheduledTime : '08:00'}
      />

      {/* Senior Voice Activated Commands Modal */}
      <VoiceCommandModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        medications={medications}
        nextDose={nextDose}
        language={settings.language}
        onTakeDose={(medId, time) => {
          handleTakeDose(medId, time);
          showToast('Medicine marked as taken by voice command!');
        }}
        onSnoozeDose={(medId, time) => {
          handleSnooze5Min(medId, time);
          showToast('Medicine snoozed for 5 minutes.');
        }}
        onOpenAddMedicine={() => {
          setIsVoiceModalOpen(false);
          handleOpenAddMedicine();
        }}
        onNavigateToTab={(tab) => {
          setIsVoiceModalOpen(false);
          setCurrentTab(tab);
        }}
      />

      {/* Family Voice Recorder Modal */}
      <FamilyVoiceRecorderModal
        isOpen={isFamilyVoiceModalOpen}
        onClose={() => setIsFamilyVoiceModalOpen(false)}
        settings={settings}
        medications={medications}
        onUpdateSettings={handleUpdateSettings}
        onUpdateMedications={(updated) => setMedications(updated)}
        onShowToast={showToast}
      />
    </div>
  );
}
