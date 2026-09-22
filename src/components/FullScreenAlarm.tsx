import React, { useEffect, useState } from 'react';
import { 
  BellRing, 
  CheckCircle2, 
  Timer, 
  Volume2, 
  VolumeX, 
  PhoneCall, 
  Utensils, 
  X,
  Camera
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Medication, LanguageCode } from '../types';
import { translations, getLocalizedCurrentTimeLabel, getLocalizedTabletPictureLabel, getLocalizedListenAgain } from '../utils/translations';
import { audioAlarm } from '../utils/audioAlarm';
import { FoodConditionBadge } from './FoodConditionBadge';
import { speakMedicationAlert, stopSpeaking, playFamilyVoice } from '../utils/speech';
import { MedicineShapeIcon } from './MedicineShapeIcon';

interface Props {
  isOpen: boolean;
  medication: Medication | null;
  scheduledTime: string;
  language: LanguageCode;
  patientName?: string;
  soundEnabled: boolean;
  familyVoice?: {
    enabled: boolean;
    audioDataUrl?: string;
    familyMemberName?: string;
    relationship?: string;
    customNote?: string;
  };
  onTakeDose: (medicationId: string, scheduledTime: string) => void;
  onSnooze5Min: (medicationId: string, scheduledTime: string) => void;
  onDismiss: () => void;
  onOpenEmergency: () => void;
}

export const FullScreenAlarm: React.FC<Props> = ({
  isOpen,
  medication,
  scheduledTime,
  language,
  patientName = 'Lakshmi',
  soundEnabled,
  familyVoice,
  onTakeDose,
  onSnooze5Min,
  onDismiss,
  onOpenEmergency
}) => {
  const t = translations[language] || translations.en;
  const [isMuted, setIsMuted] = useState<boolean>(!soundEnabled);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isPlayingFamilyVoice, setIsPlayingFamilyVoice] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  );

  // Determine if family voice is targeted for this specific medication
  const shouldPlayFamilyVoice = Boolean(
    familyVoice?.enabled &&
    familyVoice.audioDataUrl &&
    (
      familyVoice.targetScope === 'all' ||
      medication?.hasFamilyVoice ||
      (familyVoice.selectedMedicationIds && (
        familyVoice.selectedMedicationIds.includes(medication?.id || '') ||
        familyVoice.selectedMedicationIds.includes(medication?.name.trim().toLowerCase() || '')
      ))
    )
  );

  useEffect(() => {
    if (!isOpen) {
      audioAlarm.stopAlarm();
      stopSpeaking();
      setIsPlayingFamilyVoice(false);
      return;
    }

    // Start alarm audio if sound is enabled and not locally muted
    if (soundEnabled && !isMuted) {
      audioAlarm.startAlarm(0.85);
    }

    // If a custom family member voice is recorded and enabled for this medicine, play it with loving priority!
    if (shouldPlayFamilyVoice && familyVoice?.audioDataUrl) {
      setIsPlayingFamilyVoice(true);
      playFamilyVoice(familyVoice.audioDataUrl, () => {
        setIsPlayingFamilyVoice(false);
        // After family voice finishes, optionally read clinical dosage details in chosen language
        if (medication) {
          speakMedicationAlert(medication, scheduledTime, language, patientName);
        }
      });
    } else if (medication) {
      // Automatically speak reminder once on alarm open in selected Indian language
      speakMedicationAlert(medication, scheduledTime, language, patientName);
    }

    const clockTimer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1000);

    return () => {
      audioAlarm.stopAlarm();
      stopSpeaking();
      clearInterval(clockTimer);
    };
  }, [isOpen, soundEnabled, isMuted, medication, scheduledTime, language, patientName, familyVoice, shouldPlayFamilyVoice]);

  if (!isOpen || !medication) return null;

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      audioAlarm.startAlarm(0.85);
    } else {
      setIsMuted(true);
      audioAlarm.stopAlarm();
      stopSpeaking();
    }
  };

  const handleTakeDose = () => {
    audioAlarm.stopAlarm();
    stopSpeaking();
    audioAlarm.playDoseTakenSound();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    onTakeDose(medication.id, scheduledTime);
  };

  const handleSnooze = () => {
    // Immediately stop audio buzzer and voice speech when snoozed
    audioAlarm.stopAlarm();
    stopSpeaking();
    onSnooze5Min(medication.id, scheduledTime);
  };

  const handleListenOnceMore = () => {
    setIsSpeaking(true);
    // Temporarily pause harsh buzzer so voice announcement can be heard clearly
    audioAlarm.stopAlarm();

    if (shouldPlayFamilyVoice && familyVoice?.audioDataUrl) {
      setIsPlayingFamilyVoice(true);
      playFamilyVoice(familyVoice.audioDataUrl, () => {
        setIsPlayingFamilyVoice(false);
        setIsSpeaking(false);
      });
    } else {
      speakMedicationAlert(medication, scheduledTime, language, patientName);
      setTimeout(() => {
        setIsSpeaking(false);
        if (soundEnabled && !isMuted) {
          audioAlarm.startAlarm(0.75);
        }
      }, 4500);
    }
  };

  return (
    <div 
      id="fullscreen-medication-alarm-overlay"
      className="fixed inset-0 z-50 bg-white dark:bg-[#1C123D] text-slate-900 dark:text-white flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="alarm-dialog-title"
    >
      {/* Background Pulsing Ambient Rings */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center">
        <div className="w-[600px] h-[600px] rounded-full bg-purple-100/60 dark:bg-[#5B2FD6]/25 blur-3xl animate-pulse" />
        <div className="w-[450px] h-[450px] rounded-full bg-amber-100/50 dark:bg-[#FFC400]/15 blur-2xl animate-ping opacity-25" />
      </div>

      {/* Top Bar: Emergency Contact & Sound Controls */}
      <div className="relative z-10 max-w-lg w-full mx-auto flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          <span className="text-xs sm:text-sm font-black tracking-widest text-rose-600 dark:text-rose-300 uppercase">
            {t.alarmActive}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Re-read Aloud in Indian language button */}
          <button
            id="btn-alarm-re-speak"
            onClick={() => speakMedicationAlert(medication, scheduledTime, language, patientName)}
            title="Read aloud in selected language"
            className="p-2 rounded-full bg-purple-100 border border-purple-200 text-[#5B2FD6] hover:bg-purple-200 dark:bg-purple-900/60 dark:border-purple-700 dark:text-purple-200 transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4" />
          </button>

          {/* Mute/Unmute Alarm Tone */}
          <button
            id="btn-alarm-toggle-mute"
            onClick={toggleMute}
            className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isMuted 
                ? 'bg-rose-100 border-rose-300 text-rose-700 dark:bg-rose-900/60 dark:border-rose-700 dark:text-rose-200' 
                : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {isMuted ? (
              <>
                <VolumeX className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                <span>Muted</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-bounce" />
                <span>Sounding</span>
              </>
            )}
          </button>

          {/* Dismiss button */}
          <button
            id="btn-alarm-dismiss"
            onClick={() => {
              audioAlarm.stopAlarm();
              onDismiss();
            }}
            className="p-2 rounded-full text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Dismiss Alarm"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center: Tablet Image at Middle, then details directly below it */}
      <div className="relative z-10 max-w-lg w-full mx-auto my-auto text-center py-2 flex flex-col items-center">
        {/* Tablet Image at Middle */}
        <div className="relative mb-4">
          {medication.imageUrl ? (
            <div className="relative">
              <img 
                src={medication.imageUrl} 
                alt={medication.name}
                className="w-44 h-44 sm:w-52 sm:h-52 rounded-3xl object-contain bg-slate-50 dark:bg-slate-900/90 p-2 border-4 border-[#5B2FD6] dark:border-purple-400 shadow-xl shadow-purple-600/20 dark:shadow-purple-600/50 mx-auto ring-4 ring-purple-100 dark:ring-white/20"
              />
              <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-[#5e35b1] text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-purple-300 flex items-center gap-1.5 whitespace-nowrap">
                <Camera className="w-3.5 h-3.5" />
                {getLocalizedTabletPictureLabel(language)}
              </span>
            </div>
          ) : (
            <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl bg-purple-50 dark:bg-[#21154e] border-4 border-[#5B2FD6] dark:border-[#FFC400] shadow-xl shadow-purple-600/15 dark:shadow-black/40 flex flex-col items-center justify-center p-4 ring-4 ring-purple-100 dark:ring-white/10">
              <MedicineShapeIcon
                type={medication.type}
                name={medication.name}
                className="w-20 h-20 text-[#5B2FD6] dark:text-[#FFC400] drop-shadow-sm"
              />
              <span className="text-xs font-black text-[#5B2FD6] dark:text-[#FFC400] uppercase tracking-wider mt-2">
                {medication.type}
              </span>
            </div>
          )}
        </div>

        {/* Live Current Time of Appearance */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900/95 border border-slate-200 dark:border-purple-400/40 text-xs sm:text-sm font-mono text-slate-800 dark:text-purple-100 shadow-xs mb-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
          </span>
          <span className="text-slate-600 dark:text-slate-300 font-bold">{getLocalizedCurrentTimeLabel(language)}:</span>
          <span className="font-extrabold text-slate-900 dark:text-white tracking-wider">{currentTime}</span>
          <span className="text-slate-400 dark:text-slate-500">|</span>
          <span className="text-[#5B2FD6] dark:text-purple-300 font-bold">{scheduledTime}</span>
        </div>

        {/* Medicine Name */}
        <h1 
          id="alarm-dialog-title"
          className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-1.5"
        >
          {medication.name}
        </h1>

        {/* Dosage Tag */}
        <div className="inline-block px-4 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-500/50 text-[#5B2FD6] dark:text-purple-200 font-bold text-lg sm:text-xl mb-3 shadow-2xs">
          {medication.dosage} ({medication.type})
        </div>

        {/* Family Voice Indicator Banner if active for this medication */}
        {shouldPlayFamilyVoice && familyVoice && (
          <div className="w-full max-w-md mx-auto mb-2.5 bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-500/60 rounded-2xl p-2.5 flex items-center justify-between text-xs text-rose-800 dark:text-rose-200 shadow-xs">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              ❤️ Voice Alert: {familyVoice.familyMemberName || 'Family Member'}
            </span>
            <span className="text-[11px] text-rose-700 dark:text-rose-300 italic truncate max-w-[200px]">
              &ldquo;{familyVoice.customNote || 'Take your medicine!'}&rdquo;
            </span>
          </div>
        )}

        {/* Food Condition Guidance Warning Banner */}
        <div className="w-full max-w-md mx-auto mb-3 bg-slate-50 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3.5 text-left shadow-xs">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              {t.foodConditionLabel}
            </span>
            <FoodConditionBadge 
              condition={medication.foodCondition} 
              language={language}
              size="sm"
            />
          </div>
          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
            {t.foodConditions[medication.foodCondition]?.hint}
          </p>
        </div>

        {/* Doctor Instructions if present */}
        {medication.instructions && (
          <p className="text-xs text-slate-600 dark:text-purple-200 max-w-sm mx-auto italic">
            &ldquo;{medication.instructions}&rdquo;
          </p>
        )}
      </div>

      {/* Bottom Action Area: Massive, senior-friendly touch targets */}
      <div className="relative z-10 max-w-lg w-full mx-auto space-y-3 pb-4">
        {/* Primary Action: Take Dose Now */}
        <button
          id="btn-alarm-take-dose"
          onClick={handleTakeDose}
          className="w-full min-h-[58px] sm:min-h-[64px] px-8 py-4 rounded-2xl bg-[#5B2FD6] hover:bg-[#4d25bf] dark:bg-white dark:hover:bg-slate-100 active:scale-[0.98] text-white dark:text-[#30206F] font-black text-lg sm:text-xl flex items-center justify-center gap-3 shadow-xl shadow-purple-600/25 transition-all cursor-pointer"
        >
          <CheckCircle2 className="w-6 h-6 text-white dark:text-[#5B2FD6] stroke-[2.8]" />
          <span>{t.takeNow}</span>
        </button>

        {/* Listen Once More Option */}
        <button
          id="btn-alarm-listen-once-more"
          type="button"
          onClick={handleListenOnceMore}
          className="w-full min-h-[52px] px-6 py-3.5 rounded-2xl bg-purple-50 hover:bg-purple-100 border border-purple-200 text-[#5B2FD6] dark:bg-[#21154e] dark:hover:bg-[#281a5d] dark:border-purple-400/40 dark:text-white active:scale-[0.98] font-bold text-base flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
        >
          <Volume2 className={`w-5 h-5 text-[#5B2FD6] dark:text-indigo-200 ${isSpeaking ? 'animate-bounce text-amber-500 dark:text-[#FFC400]' : 'animate-pulse'}`} />
          <span>{isSpeaking ? 'Playing Voice Reminder...' : getLocalizedListenAgain(language)}</span>
        </button>

        {/* Secondary Action: 5-Minute Snooze with Accent Yellow */}
        <button
          id="btn-alarm-snooze-5m"
          onClick={handleSnooze}
          className="w-full min-h-[50px] px-6 py-3 rounded-2xl bg-amber-50 hover:bg-amber-100 border-2 border-amber-400 text-amber-900 dark:bg-[#21154e] dark:hover:bg-[#281a5d] dark:border-[#FFC400] dark:text-[#FFC400] active:scale-[0.98] font-black text-base flex items-center justify-center gap-2.5 transition-all cursor-pointer"
        >
          <Timer className="w-5 h-5 text-amber-600 dark:text-[#FFC400]" />
          <span>{t.snooze5Min}</span>
        </button>

        {/* Emergency Caregiver Direct Contact */}
        <button
          id="btn-alarm-sos-caregiver"
          onClick={() => {
            audioAlarm.stopAlarm();
            onOpenEmergency();
          }}
          className="w-full py-2.5 px-4 text-xs sm:text-sm text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <PhoneCall className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          <span>{t.emergencyContact} / Need Help</span>
        </button>
      </div>
    </div>
  );
};
