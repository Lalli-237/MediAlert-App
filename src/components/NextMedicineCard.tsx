import React, { useState } from 'react';
import { 
  Check, 
  Volume2, 
  Timer, 
  Clock, 
  AlertCircle, 
  Utensils, 
  Apple, 
  Sparkles,
  Camera,
  Plus,
  RotateCcw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NextDose, LanguageCode, Medication, AppSettings } from '../types';
import { translations, getLocalizedListenAgain } from '../utils/translations';
import { speakMedicationAlert, playFamilyVoice } from '../utils/speech';
import { MedicineShapeIcon } from './MedicineShapeIcon';

interface Props {
  nextDose: NextDose | null;
  tomorrowDose?: { medication: Medication; timeString: string } | null;
  hasMedications?: boolean;
  language: LanguageCode;
  patientName: string;
  familyVoice?: AppSettings['familyVoice'];
  onTakeDose: (medicationId: string, scheduledTime: string) => void;
  onSnooze5Min: (medicationId: string, scheduledTime: string) => void;
  onCancelSnooze?: (medicationId: string, scheduledTime: string) => void;
  onOpenAddModal: () => void;
}

export const NextMedicineCard: React.FC<Props> = ({
  nextDose,
  tomorrowDose,
  hasMedications = true,
  language,
  patientName,
  familyVoice,
  onTakeDose,
  onSnooze5Min,
  onCancelSnooze,
  onOpenAddModal
}) => {
  const t = translations[language] || translations.en;
  const [isTaking, setIsTaking] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [hasListened, setHasListened] = useState<boolean>(false);

  // Case 1: No medications added yet in the app
  if (!hasMedications) {
    return (
      <div 
        id="card-next-medicine-empty"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6035db] via-[#6a3ae2] to-[#794df0] text-white p-6 sm:p-7 shadow-xl shadow-purple-600/25 transition-all duration-300"
      >
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
        
        {/* Top Right "START HERE" Badge */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Add Your First Medicine
          </h2>
          <span className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider text-purple-100">
            START HERE
          </span>
        </div>

        {/* Illustration & instructions */}
        <div className="my-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-3 shadow-inner">
            <Plus className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
            No Prescriptions Scheduled Yet
          </h3>
          <p className="text-purple-200 text-sm leading-relaxed max-w-lg">
            Tap the button below to add your tablet name, daily reminder times, food conditions, and photos.
          </p>
        </div>

        {/* Action Button: Add Medicine */}
        <div className="relative z-10 mt-6">
          <button
            id="btn-next-medicine-add-first"
            onClick={onOpenAddModal}
            className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-white hover:bg-purple-50 active:scale-[0.98] text-[#5e35b1] font-extrabold text-base flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Your First Medicine</span>
          </button>
        </div>
      </div>
    );
  }

  // Case 2: Medications exist, but all doses for today are already completed
  if (!nextDose) {
    return (
      <div 
        id="card-next-medicine-done"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5B2FD6] via-[#6537df] to-[#7547ed] text-white p-6 sm:p-7 shadow-xl shadow-purple-600/25 transition-all duration-300"
      >
        {/* Decorative corner ambient glow */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
        
        {/* Top Right "DONE" Badge */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.allDone}
          </h2>
          <span className="px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-black uppercase tracking-wider text-purple-100">
            COMPLETED
          </span>
        </div>

        {/* Shape Illustration */}
        <div className="my-4 relative z-10">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center mb-3 shadow-inner p-2 border border-white/20">
            <MedicineShapeIcon type="tablet" className="w-8 h-8 text-emerald-300" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-1">
            {t.allTakenSubtitle}
          </h3>
          <p className="text-purple-200 text-sm mb-3">
            {t.greatJob}
          </p>
          {tomorrowDose && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 border border-white/20 text-xs font-semibold text-purple-100">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Next up tomorrow: <strong>{tomorrowDose.medication.name}</strong> at <strong>{tomorrowDose.timeString}</strong></span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="relative z-10 mt-6">
          <button
            id="btn-next-medicine-add-more"
            onClick={onOpenAddModal}
            className="w-full min-h-[52px] py-3.5 px-6 rounded-2xl bg-white hover:bg-purple-50 active:scale-[0.98] text-[#5e35b1] font-extrabold text-base flex items-center justify-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            <span>Add Another Medicine</span>
          </button>
        </div>
      </div>
    );
  }

  const { medication, timeString, minutesDiff, isOverdue, isDueNow, isSnoozed } = nextDose;

  const handleTakeDose = () => {
    setIsTaking(true);
    confetti({
      particleCount: 65,
      spread: 60,
      origin: { y: 0.65 },
      colors: ['#7c3aed', '#6035db', '#10b981', '#f59e0b']
    });

    setTimeout(() => {
      onTakeDose(medication.id, timeString);
      setIsTaking(false);
    }, 200);
  };

  const handleSpeak = () => {
    setIsSpeaking(true);
    setHasListened(true);
    speakMedicationAlert(medication, timeString, language, patientName);
    setTimeout(() => setIsSpeaking(false), 4200);
  };

  // Timing badge text
  let statusText = t.dueIn.replace('{m}', Math.max(1, minutesDiff).toString());
  if (isSnoozed) {
    statusText = t.snoozedFor5Min;
  } else if (isOverdue) {
    statusText = t.overdueBy.replace('{m}', Math.abs(minutesDiff).toString());
  } else if (isDueNow) {
    statusText = t.dueNow;
  } else if (minutesDiff > 120) {
    const hours = Math.floor(minutesDiff / 60);
    const mins = minutesDiff % 60;
    statusText = `${hours}h ${mins}m`;
  }

  const foodInfo = t.foodConditions[medication.foodCondition] || t.foodConditions.after_food;

  return (
    <div 
      id="card-next-medicine-priority"
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#5B2FD6] via-[#6638e4] to-[#7548ed] text-white p-6 sm:p-7 shadow-xl shadow-purple-600/30 transition-all duration-300"
    >
      {/* Decorative corner ambient glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/15 blur-2xl pointer-events-none" />

      {/* Header Row: Title & Action Button */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <span className="text-xs uppercase font-bold tracking-widest text-purple-200">
            {timeString} • {statusText}
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 text-white">
            {medication.name}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Read aloud in Indian language button with Listen Once More */}
          <button
            id="btn-voice-read-aloud"
            onClick={handleSpeak}
            title={hasListened ? "Listen Once More" : t.listenReminder}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 hover:bg-white/30 active:scale-95 text-white text-xs font-bold transition-all cursor-pointer border border-white/20 shadow-xs"
          >
            {hasListened ? (
              <>
                <RotateCcw className={`w-3.5 h-3.5 ${isSpeaking ? 'animate-spin text-amber-300' : ''}`} />
                <span className="whitespace-nowrap">Listen Once More</span>
              </>
            ) : (
              <>
                <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-amber-300' : ''}`} />
                <span className="whitespace-nowrap">Listen</span>
              </>
            )}
          </button>
        </div>
      </div>

        {/* Main Medicine Visual Area: Photo or Form-Specific Shape Icon (Tablet/Syrup/Injection/Drops/Inhaler) */}
      <div className="flex items-center gap-4 my-4 relative z-10">
        {medication.imageUrl ? (
          <div className="relative group">
            <img 
              src={medication.imageUrl} 
              alt={medication.name}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white/40 shadow-md bg-white/10"
            />
            <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/60 text-[10px] text-white font-medium flex items-center gap-0.5">
              <Camera className="w-2.5 h-2.5" />
              Photo
            </span>
          </div>
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shadow-inner border border-white/30 p-2.5">
            <MedicineShapeIcon
              type={medication.type}
              name={medication.name}
              className="w-10 h-10 sm:w-12 sm:h-12 text-white drop-shadow-sm"
            />
          </div>
        )}

        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-black text-white">
              {medication.dosage}
            </span>
            <span className="capitalize text-sm text-purple-200 font-medium">
              ({medication.type})
            </span>
          </div>

          {medication.prescribedFor && (
            <p className="text-xs text-purple-100 line-clamp-1">
              For: {medication.prescribedFor}
            </p>
          )}

          {/* Food Condition Tag (Feature #3) */}
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 text-xs font-bold text-white shadow-xs">
              <Utensils className="w-3.5 h-3.5" />
              <span>{foodInfo.title}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Doctor instruction note if available */}
      {medication.instructions && (
        <div className="mb-5 bg-white/10 border border-white/15 rounded-xl p-2.5 text-xs text-purple-100 flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-300" />
          <span>{medication.instructions}</span>
        </div>
      )}

      {/* Bottom Actions: Big White "Take Now ✓" Button & Snooze 5 Min */}
      <div className="space-y-2.5 relative z-10">
        {isSnoozed && (
          <div className="flex items-center justify-between bg-amber-500/20 border border-amber-300/40 px-3.5 py-2 rounded-xl text-xs text-amber-200">
            <span className="flex items-center gap-1.5 font-bold">
              <Timer className="w-4 h-4 text-amber-300 animate-pulse" />
              Snooze Active (Resumes in {Math.max(1, minutesDiff)}m)
            </span>
            {onCancelSnooze && (
              <button
                type="button"
                id="btn-cancel-snooze-card"
                onClick={() => onCancelSnooze(medication.id, timeString)}
                className="text-[11px] underline text-amber-100 hover:text-white font-bold cursor-pointer"
              >
                End Snooze
              </button>
            )}
          </div>
        )}

        <button
          id="btn-take-now-main"
          onClick={handleTakeDose}
          disabled={isTaking}
          className="w-full min-h-[54px] py-4 px-6 rounded-2xl bg-white hover:bg-purple-50 active:scale-[0.98] text-[#5e35b1] font-black text-lg sm:text-xl flex items-center justify-center gap-2.5 shadow-lg shadow-black/10 transition-all focus:outline-none focus:ring-4 focus:ring-white/40"
        >
          <span>{t.takeNow}</span>
        </button>

        <div className="flex items-center justify-between gap-2 pt-1">
          {/* 5-minute snooze */}
          <button
            id="btn-snooze-5m-card"
            onClick={() => onSnooze5Min(medication.id, timeString)}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-all border border-white/20"
          >
            <Timer className="w-4 h-4 text-amber-300" />
            <span>{isSnoozed ? '+5m Snooze' : t.snooze5Min}</span>
          </button>

          {/* Voice Over Read-Aloud / Listen Once More in native language */}
          <button
            id="btn-voice-read-aloud-text"
            onClick={handleSpeak}
            className="flex-1 py-2.5 px-3 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] text-xs sm:text-sm font-bold text-white flex items-center justify-center gap-1.5 transition-all border border-white/20 cursor-pointer"
          >
            <Volume2 className={`w-4 h-4 text-purple-200 ${isSpeaking ? 'animate-bounce text-amber-300' : 'animate-pulse'}`} />
            <span>{isSpeaking ? 'Speaking...' : getLocalizedListenAgain(language)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
