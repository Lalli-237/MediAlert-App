import React, { useState, useEffect } from 'react';
import { 
  User, 
  Phone, 
  MessageSquare, 
  Heart, 
  Edit3, 
  Check, 
  Plus,
  Globe, 
  Type, 
  Volume2, 
  VolumeX,
  UserCheck,
  Bell,
  Mail,
  ShieldCheck,
  Send,
  LogOut,
  Play,
  Square,
  Moon,
  Sun,
  Mic
} from 'lucide-react';
import { EmergencyContact, PatientProfile, AppSettings, LanguageCode, UserSession, MissedAlertNotification } from '../types';
import { translations } from '../utils/translations';
import { audioAlarm } from '../utils/audioAlarm';
import { speakMedicationAlert } from '../utils/speech';
import { FamilyAlertModal } from './FamilyAlertModal';
import { 
  launchDirectPhoneCall, 
  launchDirectSms, 
  launchDirectWhatsApp 
} from '../utils/notificationService';
import { Calendar as CalendarIcon } from 'lucide-react';
import { SlideToConnectCalendar } from './SlideToConnectCalendar';

interface Props {
  emergencyContact: EmergencyContact;
  patientProfile: PatientProfile;
  settings: AppSettings;
  userSession: UserSession | null;
  missedAlerts?: MissedAlertNotification[];
  onOpenAuthModal: () => void;
  onLogout?: () => void;
  onUpdateEmergencyContact: (contact: EmergencyContact) => void;
  onUpdatePatientProfile: (profile: PatientProfile) => void;
  onUpdateSettings: (settings: Partial<AppSettings>) => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
  onTriggerAlarmTest: () => void;
  onTriggerMissedAlertTest?: () => void;
  onOpenCalendarExport?: () => void;
  onConnectToCalendar?: () => void;
  onOpenFamilyVoice?: () => void;
}

export const ProfileView: React.FC<Props> = ({
  emergencyContact,
  patientProfile,
  settings,
  userSession,
  missedAlerts = [],
  onOpenAuthModal,
  onLogout,
  onUpdateEmergencyContact,
  onUpdatePatientProfile,
  onUpdateSettings,
  onExportData,
  onImportData,
  onResetData,
  onTriggerAlarmTest,
  onTriggerMissedAlertTest,
  onOpenCalendarExport,
  onConnectToCalendar,
  onOpenFamilyVoice
}) => {
  const t = translations[settings.language] || translations.en;

  const [lastCalendarSync, setLastCalendarSync] = useState<string | null>(() => {
    return localStorage.getItem('medialert_calendar_connected_time');
  });

  const handleDirectCalendarClick = () => {
    if (onConnectToCalendar) {
      onConnectToCalendar();
    } else if (onOpenCalendarExport) {
      onOpenCalendarExport();
    }
    const now = new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    setLastCalendarSync(now);
    localStorage.setItem('medialert_calendar_connected_time', now);
  };

  const [isEditingPatient, setIsEditingPatient] = useState<boolean>(false);
  const [patientForm, setPatientForm] = useState<PatientProfile>({ ...patientProfile });

  const [isEditingContact, setIsEditingContact] = useState<boolean>(false);
  const [contactForm, setContactForm] = useState<EmergencyContact>({ ...emergencyContact });

  // Synchronize internal form state if patient profile or emergency contact prop changes externally (e.g. on account login/switch)
  useEffect(() => {
    setPatientForm({ ...patientProfile });
  }, [patientProfile]);

  useEffect(() => {
    if (userSession?.displayName) {
      setPatientForm(prev => ({
        ...prev,
        name: userSession.displayName
      }));
    }
  }, [userSession?.displayName]);

  useEffect(() => {
    setContactForm({ ...emergencyContact });
  }, [emergencyContact]);

  const [isFamilyAlertModalOpen, setIsFamilyAlertModalOpen] = useState<boolean>(false);
  const [isAlarmBuzzerPlaying, setIsAlarmBuzzerPlaying] = useState<boolean>(false);
  const [copyFeedback, setCopyFeedback] = useState<string>('');

  const indianLanguages: { code: LanguageCode; label: string; scriptName: string; region: string; flag: string }[] = [
    { code: 'hi', label: 'Hindi', scriptName: 'हिन्दी', region: 'India', flag: '🇮🇳' },
    { code: 'ta', label: 'Tamil', scriptName: 'தமிழ்', region: 'Tamil Nadu', flag: '🇮🇳' },
    { code: 'te', label: 'Telugu', scriptName: 'తెలుగు', region: 'Andhra / Telangana', flag: '🇮🇳' },
    { code: 'kn', label: 'Kannada', scriptName: 'ಕನ್ನಡ', region: 'Karnataka', flag: '🇮🇳' },
    { code: 'bn', label: 'Bengali', scriptName: 'বাংলা', region: 'West Bengal', flag: '🇮🇳' },
    { code: 'mr', label: 'Marathi', scriptName: 'मराठी', region: 'Maharashtra', flag: '🇮🇳' },
    { code: 'ml', label: 'Malayalam', scriptName: 'മലയാളം', region: 'Kerala', flag: '🇮🇳' },
    { code: 'gu', label: 'Gujarati', scriptName: 'ગુજરાતી', region: 'Gujarat', flag: '🇮🇳' },
    { code: 'en', label: 'English', scriptName: 'English', region: 'Global', flag: '🌐' },
  ];

  // Diagnostic Loud Buzzer Start/Stop
  const handleToggleBuzzerTest = () => {
    if (isAlarmBuzzerPlaying) {
      audioAlarm.stopAlarm();
      setIsAlarmBuzzerPlaying(false);
    } else {
      audioAlarm.startAlarm(settings.soundVolume || 0.85);
      setIsAlarmBuzzerPlaying(true);
    }
  };

  // Diagnostic Voice Reminder Test
  const handleTestVoiceAnnouncement = () => {
    const sampleMed = {
      id: 'test-med',
      name: 'Levothyroxine',
      dosage: '75 mcg',
      type: 'tablet' as const,
      foodCondition: 'before_food' as const,
      scheduledTimes: ['08:00'],
      color: '#d97706',
      instructions: 'Take with water before food',
      isActive: true,
      createdAt: new Date().toISOString()
    };
    speakMedicationAlert(sampleMed, '08:00', settings.language, patientProfile.name || 'Lakshmi');
  };

  // Full-Screen Alarm Modal Test with synchronous audio trigger
  const handleLaunchAlarmSimulator = () => {
    audioAlarm.startAlarm(settings.soundVolume || 0.85);
    onTriggerAlarmTest();
  };

  const handleSavePatient = () => {
    onUpdatePatientProfile(patientForm);
    setIsEditingPatient(false);
  };

  const handleSaveContact = () => {
    if (!contactForm.name.trim()) {
      alert('Please enter a caregiver or family member name to complete configuration.');
      return;
    }
    onUpdateEmergencyContact(contactForm);
    setIsEditingContact(false);
  };

  const emergencySmsBody = encodeURIComponent(
    `URGENT MediAlert from ${patientProfile.name}: I need assistance with my medication regimen. Please check in with me at your earliest.`
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Page Title */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-[#5e35b1] flex items-center justify-center font-bold text-xl">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              {t.navProfile} &amp; {t.emergencyContact}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Personal health details, trusted caregiver, and senior settings
            </p>
          </div>
        </div>
      </div>

      {/* User Login & Account Information Card */}
      <div 
        id="card-user-account-profile"
        className="bg-gradient-to-br from-purple-50 via-white to-indigo-50/40 rounded-3xl p-6 border border-purple-100 shadow-xs space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md ${
              userSession?.isLoggedIn 
                ? 'bg-[#5e35b1] text-white shadow-purple-600/20' 
                : 'bg-slate-200 text-slate-600'
            }`}>
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5e35b1]">
                  Connected Account
                </span>
                {userSession?.isLoggedIn ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold">
                    <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-extrabold">
                    Logged Out
                  </span>
                )}
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-0.5">
                {userSession?.displayName || patientProfile.name || 'Guest User'}
              </h3>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              id="btn-profile-switch-account"
              onClick={onOpenAuthModal}
              className="text-xs font-bold text-[#5e35b1] bg-white hover:bg-purple-50 border border-purple-200 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{userSession?.isLoggedIn ? 'Switch Account' : 'Log In'}</span>
            </button>

            {userSession?.isLoggedIn && onLogout && (
              <button
                id="btn-profile-logout"
                onClick={onLogout}
                title="Log out of this account"
                className="text-xs font-bold text-rose-600 bg-white hover:bg-rose-50 border border-rose-200 px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5e35b1] flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Alert Gmail / Email</div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                {userSession?.email || 'Not configured'}
              </div>
            </div>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-100 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-[#5e35b1] flex items-center justify-center shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Alert Phone / SMS</div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-800 truncate">
                {userSession?.phone || 'Not configured'}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-emerald-900">
          <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <span>
            <strong>Missed Medicine Alert Active:</strong> If a scheduled medicine is not marked as taken within the grace window, an automatic urgent alert will be dispatched to this email and phone number.
          </span>
        </div>
      </div>

      {/* Patient Information Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-[#5e35b1]" />
            <span>{t.patientDetails}</span>
          </h3>
          <button
            id="btn-edit-patient-profile"
            onClick={() => {
              if (isEditingPatient) {
                handleSavePatient();
              } else {
                setIsEditingPatient(true);
              }
            }}
            className="text-xs font-bold text-[#5e35b1] bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-colors"
          >
            {isEditingPatient ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Save</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </>
            )}
          </button>
        </div>

        {isEditingPatient ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">{t.patientName}</label>
              <input
                id="input-patient-name"
                type="text"
                value={patientForm.name}
                onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">{t.age}</label>
              <input
                id="input-patient-age"
                type="text"
                value={patientForm.age}
                onChange={(e) => setPatientForm({ ...patientForm, age: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">{t.bloodGroup}</label>
              <input
                id="input-patient-blood-group"
                type="text"
                value={patientForm.bloodGroup}
                onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">{t.doctorName}</label>
              <input
                id="input-patient-doctor-name"
                type="text"
                value={patientForm.doctorName}
                onChange={(e) => setPatientForm({ ...patientForm, doctorName: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">{t.doctorPhone}</label>
              <input
                id="input-patient-doctor-phone"
                type="tel"
                value={patientForm.doctorPhone}
                onChange={(e) => setPatientForm({ ...patientForm, doctorPhone: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-purple-400 focus:outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {t.patientName}
              </span>
              <span className="text-base font-extrabold text-slate-800">
                {patientProfile.name || 'Not provided'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {t.age}
              </span>
              <span className="text-base font-extrabold text-slate-800">
                {patientProfile.age ? `${patientProfile.age} yrs` : 'Not set'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {t.bloodGroup}
              </span>
              <span className="text-base font-extrabold text-rose-600">
                {patientProfile.bloodGroup || 'Not set'}
              </span>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                {t.doctorName}
              </span>
              <span className="text-base font-extrabold text-slate-800 truncate block">
                {patientProfile.doctorName || 'Not set'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Emergency Caregiver Contact Card */}
      {(() => {
        const isCaregiverDone = Boolean(emergencyContact.name && emergencyContact.name.trim().length > 0);
        return (
          <div 
            id="card-emergency-caregiver-contact"
            className="bg-gradient-to-br from-rose-50 via-white to-amber-50 rounded-3xl p-6 border-2 border-rose-200 shadow-xs space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-xs">
                  <Heart className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-black text-rose-950">
                      Trusted Family / Caregiver (e.g. Son, Daughter, or else)
                    </h3>
                    {isCaregiverDone ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-[11px] font-black flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 stroke-[3] text-emerald-600" />
                        Done &amp; Configured
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-[11px] font-black flex items-center gap-1">
                        Not Default (Enter Name to Finish)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-rose-700 font-medium">
                    Immediate direct call &amp; SMS alerts in case of missed medicines or urgent assistance
                  </p>
                </div>
              </div>

              {!isEditingContact && (
                <button
                  id="btn-edit-emergency-contact"
                  onClick={() => setIsEditingContact(true)}
                  className="text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-3.5 py-2 rounded-full flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
                >
                  {isCaregiverDone ? (
                    <>
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Name</span>
                    </>
                  )}
                </button>
              )}
            </div>

            {isEditingContact ? (
              <div className="space-y-4 pt-2 bg-white/95 p-4 rounded-2xl border border-rose-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Caregiver / Family Member Name <span className="text-rose-600">* (Required to mark Done)</span>
                  </label>
                  <input
                    id="input-caregiver-name"
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                    placeholder="e.g. Ramesh Kumar (Enter name to activate)"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Caregiver is not enabled by default. Once you type a name and save, it will be marked as Done.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Trusted Family / Caregiver (e.g. Son, Daughter, or else)
                  </label>
                  <input
                    id="input-caregiver-relationship"
                    type="text"
                    value={contactForm.relationship || ''}
                    onChange={(e) => setContactForm({ ...contactForm, relationship: e.target.value })}
                    placeholder="e.g. Son, Daughter, or else"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  />
                  {/* Quick relationship chips */}
                  <div className="flex flex-wrap items-center gap-1.5 mt-2">
                    <span className="text-[10px] uppercase font-bold text-slate-400 mr-1">Quick Select:</span>
                    {['Son', 'Daughter', 'Spouse', 'Caregiver', 'Brother', 'Sister', 'Doctor'].map((rel) => (
                      <button
                        key={rel}
                        type="button"
                        onClick={() => setContactForm({ ...contactForm, relationship: rel })}
                        className={`text-xs px-2.5 py-1 rounded-full border font-bold transition-all cursor-pointer ${
                          contactForm.relationship?.toLowerCase() === rel.toLowerCase()
                            ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (with Country Code)</label>
                  <input
                    id="input-caregiver-phone"
                    type="tel"
                    value={contactForm.phone}
                    onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-rose-400 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-100">
                  <button
                    type="button"
                    onClick={() => {
                      setContactForm({
                        name: emergencyContact.name || '',
                        relationship: emergencyContact.relationship || '',
                        phone: emergencyContact.phone || '',
                        email: emergencyContact.email || '',
                        notes: emergencyContact.notes || ''
                      });
                      setIsEditingContact(false);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    id="btn-save-caregiver"
                    onClick={handleSaveContact}
                    disabled={!contactForm.name.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Save &amp; Mark as Done</span>
                  </button>
                </div>
              </div>
            ) : isCaregiverDone ? (
              <div>
                <div className="bg-white/80 p-4 rounded-2xl border border-rose-100 mb-4 shadow-2xs">
                  <div className="text-xs font-bold text-rose-600 uppercase tracking-wider flex items-center justify-between">
                    <span>Trusted Family / Caregiver</span>
                    {emergencyContact.relationship && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold">
                        {emergencyContact.relationship}
                      </span>
                    )}
                  </div>
                  <div className="text-lg sm:text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
                    <span>{emergencyContact.name}</span>
                    {emergencyContact.relationship && (
                      <span className="text-sm font-bold text-rose-700">
                        ({emergencyContact.relationship})
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-semibold text-slate-600 mt-0.5">
                    {emergencyContact.phone || 'Phone number not set'}
                  </div>
                  <div className="mt-2 text-xs font-medium text-emerald-700 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>Configured and ready: Emergency calls and alerts will reach {emergencyContact.name}.</span>
                  </div>
                </div>

                {/* Quick Action Buttons for Seniors & Family Alerts */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    id="btn-call-caregiver-direct"
                    onClick={() => {
                      if (!emergencyContact.phone) {
                        setIsEditingContact(true);
                      } else {
                        launchDirectPhoneCall(emergencyContact.phone);
                      }
                    }}
                    className="min-h-[52px] py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <Phone className="w-5 h-5 fill-white" />
                    <span>{t.callCaregiver}</span>
                  </button>

                  <button
                    id="btn-sms-caregiver-direct"
                    onClick={() => {
                      setIsFamilyAlertModalOpen(true);
                    }}
                    className="min-h-[52px] py-3.5 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold text-base flex items-center justify-center gap-2.5 shadow-md shadow-rose-600/20 active:scale-95 transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-5 h-5 fill-white" />
                    <span>{t.textCaregiver}</span>
                  </button>
                </div>

                <button
                  id="btn-open-family-alert-hub"
                  onClick={() => setIsFamilyAlertModalOpen(true)}
                  className="w-full mt-3 py-3 px-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 border border-purple-200 text-[#5e35b1] font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Heart className="w-4 h-4 text-[#5e35b1]" />
                  <span>Family Care &amp; WhatsApp / SMS Dispatch Hub</span>
                </button>
              </div>
            ) : (
              <div className="bg-white/80 p-5 rounded-2xl border border-dashed border-rose-300 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                  <Heart className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-extrabold text-slate-900 text-base">
                    No Caregiver Added Yet
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    No family member or caregiver is set by default. Click below to add their name (e.g. Son, Daughter, or else) and phone number. Only after you enter a name will this caregiver be marked as Done and ready for alerts.
                  </p>
                </div>
                <button
                  type="button"
                  id="btn-add-caregiver-initial"
                  onClick={() => setIsEditingContact(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md shadow-rose-600/20 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Add Family Member / Caregiver Name</span>
                </button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Indian Languages Selector Section */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Indian Languages &amp; Voice-Over
            </h3>
            <p className="text-xs text-slate-500">
              Audio reminders speak in your selected native Indian language
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
          {indianLanguages.map((lang) => {
            const isSelected = settings.language === lang.code;
            return (
              <button
                key={lang.code}
                id={`btn-select-lang-${lang.code}`}
                onClick={() => onUpdateSettings({ language: lang.code })}
                className={`p-3 rounded-2xl text-left transition-all border cursor-pointer ${
                  isSelected
                    ? 'bg-[#5e35b1] text-white border-[#5e35b1] shadow-md shadow-purple-600/20 ring-2 ring-purple-300'
                    : 'bg-slate-50 hover:bg-purple-50/60 text-slate-800 border-slate-200/80'
                }`}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className="text-base font-extrabold leading-tight">
                    {lang.scriptName}
                  </div>
                  <span className="text-base" role="img" aria-label={lang.label}>
                    {lang.flag}
                  </span>
                </div>
                <div className={`text-xs ${isSelected ? 'text-purple-200' : 'text-slate-500'}`}>
                  {lang.label} ({lang.region})
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Senior Accessibility Settings */}
      <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Type className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Text &amp; Audio Alarm
            </h3>
            <p className="text-xs text-slate-500">
              Adjust display text size and loud acoustic alarms
            </p>
          </div>
        </div>

        {/* Text Size options */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-600 block">{t.textSize}</label>
            <span className="text-[11px] font-extrabold text-[#5e35b1] bg-purple-50 px-2 py-0.5 rounded-full uppercase">
              {settings.textSize === 'large' 
                ? 'Large Text (115%)' 
                : (settings.textSize === 'extra-large' || settings.textSize === 'xlarge') 
                  ? 'Extra Large Text (135%)' 
                  : 'Normal Text (100%)'}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['normal', 'large', 'extra-large'] as const).map((size) => {
              const isSelected = settings.textSize === size || (size === 'extra-large' && settings.textSize === 'xlarge');
              return (
                <button
                  key={size}
                  id={`btn-text-size-${size}`}
                  onClick={() => onUpdateSettings({ textSize: size })}
                  className={`py-3 px-3 rounded-2xl font-black text-sm border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#5e35b1] text-white border-[#5e35b1] shadow-md shadow-purple-600/25 ring-2 ring-purple-300'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {size === 'normal' && 'A Normal'}
                  {size === 'large' && 'A+ Large'}
                  {size === 'extra-large' && 'A++ Extra'}
                </button>
              );
            })}
          </div>

          {/* Live Text Scaling Preview Box */}
          <div className="p-3 bg-purple-50/70 dark:bg-[#1E1B4B] border border-purple-100 dark:border-purple-800 rounded-2xl flex items-center justify-between gap-2">
            <div className="text-xs text-slate-500 dark:text-slate-300 font-semibold">Live Text Preview:</div>
            <div className="font-extrabold text-[#5e35b1] dark:text-[#FFC400] text-sm">
              08:00 AM • Paracetamol 500mg
            </div>
          </div>
        </div>

        {/* Dark Mode / Night Mode Toggle Option for Senior Eye Comfort */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Moon className="w-4 h-4 text-purple-600 dark:text-[#FFC400]" />
                Dark Mode (Night View)
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                High-contrast dark theme with crystal clear, easy-to-read text &amp; vibrant blocks for seniors.
              </span>
            </div>

            <button
              id="btn-toggle-darkmode-profile"
              type="button"
              onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                settings.darkMode
                  ? 'bg-[#FFC400] text-[#1E1242] ring-2 ring-amber-400'
                  : 'bg-slate-100 text-slate-700 hover:bg-purple-100 hover:text-purple-900 border border-slate-200'
              }`}
            >
              {settings.darkMode ? (
                <>
                  <Sun className="w-3.5 h-3.5 fill-[#1E1242]" />
                  <span>DARK ON</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-purple-700" />
                  <span>LIGHT (OFF)</span>
                </>
              )}
            </button>
          </div>

          {/* Quick theme explanation preview pill */}
          <div className={`p-3 rounded-2xl border text-xs font-semibold flex items-center justify-between transition-colors ${
            settings.darkMode
              ? 'bg-[#1e1b4b] text-white border-purple-500/40'
              : 'bg-slate-50 text-slate-700 border-slate-200'
          }`}>
            <span>Selected Theme Appearance:</span>
            <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${
              settings.darkMode ? 'bg-[#FFC400] text-[#1e1b4b]' : 'bg-purple-100 text-[#5B2FD6] border border-purple-200'
            }`}>
              {settings.darkMode ? '🌙 Dark Mode Active (High Contrast)' : '☀️ Light Mode Active'}
            </span>
          </div>
        </div>

        {/* Family Member Voice Option Card */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                Family Member Voice Reminder
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 block">
                Play recorded voice of a daughter, son, or grandchild when medicine alarm rings.
              </span>
            </div>

            <button
              id="btn-open-family-voice-profile"
              type="button"
              onClick={onOpenFamilyVoice}
              className={`px-3.5 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                settings.familyVoice?.enabled
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 ring-2 ring-rose-400'
                  : 'bg-[#5e35b1] text-white hover:bg-[#4d2c94]'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>{settings.familyVoice?.enabled ? 'VOICE ACTIVE' : '+ ADD VOICE'}</span>
            </button>
          </div>

          {settings.familyVoice?.enabled ? (
            <div className="p-3 bg-rose-50 dark:bg-[#3B1219] border border-rose-200 dark:border-rose-900 rounded-2xl flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-900 flex items-center justify-center text-rose-600 font-bold">
                  ❤️
                </div>
                <div>
                  <div className="font-bold text-rose-900 dark:text-rose-100">
                    Voice: {settings.familyVoice.familyMemberName || 'Family Member'} ({settings.familyVoice.relationship || 'Family'})
                  </div>
                  <div className="text-[11px] text-rose-700 dark:text-rose-300 italic truncate max-w-[240px]">
                    &ldquo;{settings.familyVoice.customNote || 'Remember to take your medicine on time!'}&rdquo;
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenFamilyVoice}
                className="px-2.5 py-1 rounded-xl bg-white dark:bg-[#1E1B4B] text-rose-700 dark:text-rose-300 border border-rose-200 text-xs font-bold hover:bg-rose-50"
              >
                Change
              </button>
            </div>
          ) : (
            <div 
              onClick={onOpenFamilyVoice}
              className="p-3 bg-slate-50 dark:bg-[#1E2138] border border-dashed border-slate-300 dark:border-slate-700 rounded-2xl flex items-center justify-between gap-2 text-xs cursor-pointer hover:border-purple-300 transition-colors"
            >
              <div className="text-slate-600 dark:text-slate-400">
                No family voice recorded yet. Tap to record a warm voice note from loved ones.
              </div>
              <span className="text-[#5e35b1] dark:text-[#FFC400] font-bold shrink-0">
                Record Now →
              </span>
            </div>
          )}
        </div>

        {/* Sound alerts test & Audio Diagnostic Suite */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-slate-800 block">{t.soundAlerts}</span>
              <span className="text-xs text-slate-500">Audible buzzer &amp; synthesizer during alert window</span>
            </div>

            <button
              id="btn-toggle-sound-alerts"
              onClick={() => {
                const nextState = !settings.soundEnabled;
                onUpdateSettings({ soundEnabled: nextState });
                if (nextState) {
                  audioAlarm.playDoseTakenSound();
                } else {
                  audioAlarm.stopAlarm();
                  setIsAlarmBuzzerPlaying(false);
                }
              }}
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition-colors ${
                settings.soundEnabled
                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {settings.soundEnabled ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ENABLED</span>
                </>
              ) : (
                <>
                  <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                  <span>MUTED</span>
                </>
              )}
            </button>
          </div>

          {/* Volume Control */}
          <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#5e35b1]" />
                Alarm Volume Level
              </span>
              <span className="font-mono text-[#5e35b1]">
                {Math.round((settings.soundVolume ?? 0.8) * 100)}%
              </span>
            </div>
            <input
              id="slider-alarm-volume"
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={settings.soundVolume ?? 0.8}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                onUpdateSettings({ soundVolume: val });
                audioAlarm.setVolume(val);
              }}
              className="w-full accent-[#5e35b1] cursor-pointer"
            />
          </div>

          {/* Comprehensive 3-Part Diagnostic Check Suite */}
          <div className="space-y-2.5">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500">
              Alarm Diagnostic Tests
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Test 1: Loud Synthesized Buzzer */}
              <button
                id="btn-test-loud-buzzer"
                onClick={handleToggleBuzzerTest}
                className={`p-3 rounded-2xl border font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all shadow-xs ${
                  isAlarmBuzzerPlaying
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse'
                    : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                {isAlarmBuzzerPlaying ? (
                  <>
                    <Square className="w-5 h-5 fill-white" />
                    <span>🛑 STOP BUZZER</span>
                    <span className="text-[10px] opacity-80">Buzzer is ringing...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-5 h-5 text-amber-600" />
                    <span>1. Sound Buzzer</span>
                    <span className="text-[10px] text-amber-700 font-medium">Test acoustic chime</span>
                  </>
                )}
              </button>

              {/* Test 2: Voice Announcement */}
              <button
                id="btn-test-voice-announcement"
                onClick={handleTestVoiceAnnouncement}
                className="p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Play className="w-5 h-5 text-indigo-600" />
                <span>2. Voice Reminder</span>
                <span className="text-[10px] text-indigo-700 font-medium">Speak in selected language</span>
              </button>

              {/* Test 3: Full-Screen Alarm Simulator */}
              <button
                id="btn-test-fullscreen-alarm"
                onClick={handleLaunchAlarmSimulator}
                className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#5e35b1] font-bold text-xs flex flex-col items-center justify-center gap-2 transition-all shadow-xs"
              >
                <Bell className="w-5 h-5 text-[#5e35b1]" />
                <span>3. Alarm Simulator</span>
                <span className="text-[10px] text-purple-700 font-medium">Full-screen popup preview</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Connect to Google Account Calendar Section (Single Button + Slide Button) */}
      <div 
        id="section-profile-google-calendar"
        className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1a73e8] flex items-center justify-center shrink-0 shadow-2xs">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Google Account Calendar
                </h3>
                {lastCalendarSync ? (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                    <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                    Connected
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[11px] font-bold">
                    Ready to Connect
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 font-medium max-w-lg leading-relaxed">
                Connect your medication schedule directly to your Google Account Calendar. Medicine alarms and alerts will ring reliably even when your phone is closed, screen is off, or another app is running.
              </p>
            </div>
          </div>

          {/* Single Button to Google Account Calendar */}
          <button
            id="btn-single-connect-google-calendar"
            type="button"
            onClick={handleDirectCalendarClick}
            className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-2xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer shrink-0"
          >
            <CalendarIcon className="w-5 h-5 text-white" />
            <span>{lastCalendarSync ? 'Sync Google Calendar Again' : 'Connect to Google Calendar'}</span>
          </button>
        </div>

        {/* Slide Button to Connect Google Calendar */}
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Or Slide to Connect:</span>
            <span className="text-[11px] text-slate-400 font-semibold">Touch &amp; slide handle to the right</span>
          </div>
          <SlideToConnectCalendar
            isConnected={!!lastCalendarSync}
            onConnect={handleDirectCalendarClick}
            accountEmail={userSession?.email || 'lalanalalli2006@gmail.com'}
            lastSyncedAt={lastCalendarSync}
          />
        </div>
      </div>

      {/* Missed Dose Notification Dispatch Center */}
      <div 
        id="section-missed-dose-notifications"
        className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xs space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Missed Dose Alerts to Mail / Phone
              </h3>
              <p className="text-xs text-slate-500">
                Automated urgent caregiver alerts if a medicine is not taken
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-open-family-alert-dispatch"
              onClick={() => setIsFamilyAlertModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Family Alert</span>
            </button>
            {onTriggerMissedAlertTest && (
              <button
                id="btn-test-missed-alert-dispatch"
                onClick={onTriggerMissedAlertTest}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>Log Check</span>
              </button>
            )}
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 sm:p-5 border border-slate-200/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/60 pb-2.5">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                Primary Dispatch Targets (Verified at Login)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-extrabold">
                <Check className="w-3 h-3 text-emerald-700 stroke-[3]" />
                Auto-Monitoring Active
              </span>
              <button
                id="btn-edit-login-dispatch"
                type="button"
                onClick={onOpenAuthModal}
                className="text-[11px] font-bold text-[#5e35b1] hover:underline cursor-pointer"
              >
                Edit Login Details
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
            <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
              <div className="text-[11px] font-extrabold uppercase text-slate-400">Authenticated Member</div>
              <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                <span>{userSession?.displayName || patientProfile.name || 'Active Member'}</span>
                {userSession?.isLoggedIn && (
                  <span className="text-[10px] px-2 py-0.5 bg-purple-100 text-purple-800 rounded-full font-bold">
                    {userSession.loginMethod === 'gmail' ? 'Gmail / Google' : 'Phone / Mobile'}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                Logged in: {userSession?.lastLoginAt ? new Date(userSession.lastLoginAt).toLocaleString() : 'Current Active Session'}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
              <div className="text-[11px] font-extrabold uppercase text-slate-400">Primary Dispatch Email</div>
              <div className="font-bold text-slate-900 truncate">
                {userSession?.email ? userSession.email : 'No email entered during login'}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                {userSession?.email ? 'Direct email notifications enabled' : 'Click "Edit Login Details" to configure'}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
              <div className="text-[11px] font-extrabold uppercase text-slate-400">Primary Dispatch Mobile / SMS</div>
              <div className="font-bold text-slate-900">
                {userSession?.phone ? userSession.phone : 'No phone entered during login'}
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                <Check className="w-3 h-3" />
                {userSession?.phone ? 'Urgent SMS dispatch active' : 'Click "Edit Login Details" to configure'}
              </div>
            </div>

            <div className="p-3 bg-white rounded-xl border border-slate-200/70 space-y-1">
              <div className="text-[11px] font-extrabold uppercase text-slate-400">Trusted Caregiver Dispatch</div>
              <div className="font-bold text-slate-900">
                {emergencyContact.name ? (
                  <span>
                    {emergencyContact.name} {emergencyContact.relationship ? `(${emergencyContact.relationship})` : ''}
                  </span>
                ) : (
                  <span className="text-slate-400 font-medium">Not configured</span>
                )}
              </div>
              <div className="text-[11px] text-slate-500">
                {emergencyContact.phone ? `Phone / SMS: ${emergencyContact.phone}` : 'Fallback alert contact'}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Dispatched Alerts Log */}
        <div className="space-y-2 pt-1">
          <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
            Recent Alert Dispatch History
          </div>

          {missedAlerts.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {missedAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3 rounded-xl bg-rose-50/50 border border-rose-100 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <div className="font-bold text-slate-800 truncate">
                      {alert.medicationName} ({alert.dosage})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Scheduled {alert.scheduledTime} • Dispatched to {alert.recipientEmail}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold shrink-0">
                    DISPATCHED
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 bg-slate-50 rounded-2xl text-xs text-slate-500 border border-dashed border-slate-200">
              No missed doses recorded yet. Your schedule is completely on track!
            </div>
          )}
        </div>
      </div>

      {/* Emergency Family Alert & WhatsApp / SMS Hub Modal */}
      <FamilyAlertModal
        isOpen={isFamilyAlertModalOpen}
        onClose={() => setIsFamilyAlertModalOpen(false)}
        emergencyContact={emergencyContact}
        onUpdateEmergencyContact={onUpdateEmergencyContact}
        userSession={userSession}
        userName={patientProfile.name || userSession?.displayName || ''}
      />
    </div>
  );
};
