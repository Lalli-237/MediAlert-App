import React, { useState, useEffect, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Check, 
  Volume2, 
  AlertCircle, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { Medication, LanguageCode, NextDose } from '../types';
import { speakMedicationDetails, speakFeedback, stopSpeaking } from '../utils/speech';
import { MedicineShapeIcon } from './MedicineShapeIcon';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  medications: Medication[];
  nextDose: NextDose | null;
  language: LanguageCode;
  onTakeDose: (medicationId: string, timeSlot: string) => void;
  onSnoozeDose: (medicationId: string, timeSlot: string) => void;
  onOpenAddMedicine: () => void;
  onNavigateToTab: (tab: 'home' | 'tracker' | 'manage' | 'profile') => void;
}

const LANGUAGE_SPEECH_RECOG_CODES: Record<LanguageCode, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  te: 'te-IN',
  kn: 'kn-IN',
  bn: 'bn-IN',
  mr: 'mr-IN',
  ml: 'ml-IN',
  gu: 'gu-IN',
  es: 'es-ES',
  fr: 'fr-FR',
  de: 'de-DE',
  ja: 'ja-JP'
};

const LANGUAGE_FLAGS: Record<LanguageCode, string> = {
  en: '🌐',
  hi: '🇮🇳',
  ta: '🇮🇳',
  te: '🇮🇳',
  kn: '🇮🇳',
  bn: '🇮🇳',
  mr: '🇮🇳',
  ml: '🇮🇳',
  gu: '🇮🇳',
  es: '🇪🇸',
  fr: '🇫🇷',
  de: '🇩🇪',
  ja: '🇯🇵'
};

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: 'English',
  hi: 'हिन्दी',
  ta: 'தமிழ்',
  te: 'తెలుగు',
  kn: 'ಕನ್ನಡ',
  bn: 'বাংলা',
  mr: 'मराठी',
  ml: 'മലയാളം',
  gu: 'ગુજરાતી',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語'
};

export const VoiceCommandModal: React.FC<Props> = ({
  isOpen,
  onClose,
  medications,
  nextDose,
  language,
  onTakeDose,
  onSnoozeDose,
  onOpenAddMedicine,
  onNavigateToTab
}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [feedback, setFeedback] = useState('');
  const [matchedMed, setMatchedMed] = useState<Medication | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  // Initialize and start listening when opened
  useEffect(() => {
    if (isOpen) {
      setTranscript('');
      setFeedback('');
      setMatchedMed(null);
      startListening();
    } else {
      stopListening();
      stopSpeaking();
    }
    return () => {
      stopListening();
    };
  }, [isOpen, language]);

  const startListening = () => {
    stopSpeaking();
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      setFeedback('Speech recognition is not supported on this browser. Try Google Chrome or Android browser.');
      return;
    }

    try {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = LANGUAGE_SPEECH_RECOG_CODES[language] || 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback('Listening... Please speak your command (e.g. "I took my medicine", "What is my next medicine?")');
      };

      recognition.onresult = (event: any) => {
        const current = event.resultIndex;
        const text = event.results[current][0].transcript;
        setTranscript(text);

        if (event.results[current].isFinal) {
          processVoiceCommand(text);
        }
      };

      recognition.onerror = (event: any) => {
        setIsListening(false);
        if (event.error === 'no-speech') {
          setFeedback('No voice detected. Tap the microphone and try again.');
        } else if (event.error === 'not-allowed') {
          setFeedback('Microphone access was denied. Please allow microphone permission in your browser.');
        } else {
          setFeedback(`Listening ended (${event.error}). Tap the mic button to retry.`);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn('Speech recognition start failed:', err);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  // Natural language processing for senior voice commands across Indian & Global languages
  const processVoiceCommand = (rawText: string) => {
    const text = rawText.toLowerCase().trim();
    if (!text) return;

    // 1. Check if user wants to log medicine as TAKEN (e.g. "taken", "took", "le li", "pottutan", "vesukunnanu", "khayechi")
    const isTakenCommand = 
      text.includes('take') || text.includes('took') || text.includes('done') || text.includes('taken') ||
      text.includes('log') || text.includes('yes') || text.includes('le li') || text.includes('kha li') ||
      text.includes('pottutan') || text.includes('saaptuten') || text.includes('vesukunna') ||
      text.includes('thagonde') || text.includes('khayechi') || text.includes('ghetli') ||
      text.includes('kashichu') || text.includes('kidathanu') || text.includes('tomada') || text.includes('pris');

    // 2. Check if user wants to hear DETAILS of medicine (e.g., "details", "what", "which", "speak", "batao", "sollu", "cheppu", "helu")
    const isDetailsCommand = 
      text.includes('detail') || text.includes('what') || text.includes('which') || text.includes('speak') || 
      text.includes('tell') || text.includes('batao') || text.includes('kya') || text.includes('enna') || 
      text.includes('sollu') || text.includes('cheppu') || text.includes('yemi') || text.includes('helu') || 
      text.includes('bol') || text.includes('parayu') || text.includes('dime');

    // 3. Check if user wants to SNOOZE (e.g. "snooze", "later", "5 minutes", "baad me", "aprom")
    const isSnoozeCommand = 
      text.includes('snooze') || text.includes('later') || text.includes('delay') || text.includes('wait') ||
      text.includes('baad me') || text.includes('aprom') || text.includes('taruvatha');

    // 4. Check if user mentioned a specific medicine by name
    let foundMed: Medication | null = null;
    for (const med of medications) {
      if (text.includes(med.name.toLowerCase())) {
        foundMed = med;
        break;
      }
    }

    const targetMed = foundMed || nextDose?.medication || medications[0] || null;
    const targetSlot = nextDose?.timeString || targetMed?.scheduledTimes[0] || '08:00';

    if (isTakenCommand) {
      if (targetMed) {
        onTakeDose(targetMed.id, targetSlot);
        setMatchedMed(targetMed);
        const confirmMsg = `Logged ${targetMed.name} as taken successfully!`;
        setFeedback(confirmMsg);
        speakFeedback(confirmMsg, language);
      } else {
        setFeedback('No active medicine scheduled right now.');
      }
      return;
    }

    if (isDetailsCommand) {
      if (targetMed) {
        setMatchedMed(targetMed);
        setFeedback(`Reading out details for ${targetMed.name} in ${LANGUAGE_NAMES[language]}...`);
        speakMedicationDetails(targetMed, language);
      } else {
        setFeedback('No medicines in your list yet.');
      }
      return;
    }

    if (isSnoozeCommand) {
      if (targetMed) {
        onSnoozeDose(targetMed.id, targetSlot);
        const snoozeMsg = `Snoozed ${targetMed.name} for 5 minutes.`;
        setFeedback(snoozeMsg);
        speakFeedback(snoozeMsg, language);
      }
      return;
    }

    if (text.includes('add') || text.includes('new') || text.includes('jodo')) {
      onClose();
      onOpenAddMedicine();
      return;
    }

    if (text.includes('tracker') || text.includes('history') || text.includes('progress')) {
      onClose();
      onNavigateToTab('tracker');
      return;
    }

    // Default fallback: if any medicine was mentioned, read its details
    if (targetMed) {
      setMatchedMed(targetMed);
      setFeedback(`Found ${targetMed.name}. Tap below to log as taken or listen to details.`);
      speakMedicationDetails(targetMed, language);
    } else {
      setFeedback(`Recognized: "${rawText}". Try saying "I took my medicine" or "Details of medicine".`);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      id="modal-voice-commands"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-white dark:bg-[#161726] rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4">
        {/* Header with single language flag and close button */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-[#202237] text-[#5B2FD6] dark:text-[#FFC400] flex items-center justify-center font-bold">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                  Voice Medicine Assistant
                </h3>
                {/* Exactly single flag beside language */}
                <span className="text-base select-none" role="img" aria-label={LANGUAGE_NAMES[language]}>
                  {LANGUAGE_FLAGS[language] || '🇮🇳'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speak in {LANGUAGE_NAMES[language]} without typing
              </p>
            </div>
          </div>

          <button
            id="btn-close-voice-modal"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Big Microphone Tap Area with Senior-Friendly Ripple Animation */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div className="relative flex items-center justify-center">
            {isListening && (
              <>
                <div className="absolute w-28 h-28 rounded-full bg-[#5B2FD6]/20 dark:bg-[#FFC400]/20 animate-ping pointer-events-none" />
                <div className="absolute w-24 h-24 rounded-full bg-[#5B2FD6]/30 dark:bg-[#FFC400]/30 animate-pulse pointer-events-none" />
              </>
            )}

            <button
              id="btn-voice-mic-trigger"
              type="button"
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all active:scale-95 cursor-pointer ${
                isListening
                  ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white ring-4 ring-rose-300 shadow-rose-600/30'
                  : 'bg-gradient-to-br from-[#5B2FD6] to-[#794df0] text-white ring-4 ring-purple-200 dark:ring-purple-900 shadow-purple-600/30 hover:scale-105'
              }`}
            >
              {isListening ? (
                <Mic className="w-9 h-9 animate-bounce" />
              ) : (
                <Mic className="w-9 h-9" />
              )}
            </button>
          </div>

          <span className="text-xs font-black tracking-wider uppercase text-purple-700 dark:text-[#FFC400]">
            {isListening ? 'Listening... Speak Now' : 'Tap Mic to Speak'}
          </span>
        </div>

        {/* Live Transcript / Speech Display Box */}
        <div className="min-h-[70px] bg-slate-50 dark:bg-[#202237] rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 flex flex-col justify-center text-center">
          {transcript ? (
            <p className="text-base font-black text-[#5B2FD6] dark:text-[#FFC400] italic">
              "{transcript}"
            </p>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-400">
              {isListening ? 'Speak your medicine command clearly into your microphone...' : 'Press the mic button and speak'}
            </p>
          )}

          {feedback && (
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 mt-1.5 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{feedback}</span>
            </p>
          )}
        </div>

        {/* Active / Detected Medicine Visual Card */}
        {matchedMed && (
          <div className="p-3.5 bg-purple-50 dark:bg-[#1E1B4B] border border-purple-200 dark:border-purple-800 rounded-2xl flex items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white dark:bg-[#202237] flex items-center justify-center p-2 border border-purple-100 dark:border-purple-800 shrink-0 shadow-2xs">
                <MedicineShapeIcon type={matchedMed.type} name={matchedMed.name} className="w-7 h-7 text-[#5B2FD6] dark:text-[#FFC400]" />
              </div>
              <div className="min-w-0">
                <h4 className="font-black text-slate-900 dark:text-white text-sm truncate">
                  {matchedMed.name}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {matchedMed.dosage} • {matchedMed.type}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => speakMedicationDetails(matchedMed, language)}
                title="Speak details in selected language"
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#202237] border border-purple-200 dark:border-purple-700 text-[#5B2FD6] dark:text-[#FFC400] text-xs font-bold flex items-center gap-1 hover:bg-purple-100 transition-colors"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onTakeDose(matchedMed.id, nextDose?.timeString || matchedMed.scheduledTimes[0] || '08:00');
                  const msg = `Logged ${matchedMed.name} as taken.`;
                  setFeedback(msg);
                  speakFeedback(msg, language);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1 shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Taken</span>
              </button>
            </div>
          </div>
        )}

        {/* Quick Voice Command Guide for Senior Users */}
        <div className="bg-slate-50 dark:bg-[#202237] p-3 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
            <HelpCircle className="w-4 h-4 text-purple-600 dark:text-[#FFC400]" />
            <span>Senior Voice Commands (Tap to execute or speak aloud):</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => processVoiceCommand('I took my medicine')}
              className="p-2 text-left bg-white dark:bg-[#161726] rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-800 dark:text-slate-200 font-semibold"
            >
              💊 "I took my medicine"
            </button>
            <button
              type="button"
              onClick={() => processVoiceCommand('What is my medicine details')}
              className="p-2 text-left bg-white dark:bg-[#161726] rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-800 dark:text-slate-200 font-semibold"
            >
              🔊 "Speak details of medicine"
            </button>
            <button
              type="button"
              onClick={() => processVoiceCommand('Snooze for 5 minutes')}
              className="p-2 text-left bg-white dark:bg-[#161726] rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-800 dark:text-slate-200 font-semibold"
            >
              ⏰ "Snooze for 5 minutes"
            </button>
            <button
              type="button"
              onClick={() => {
                if (nextDose?.medication) {
                  speakMedicationDetails(nextDose.medication, language);
                }
              }}
              className="p-2 text-left bg-white dark:bg-[#161726] rounded-xl border border-slate-200 dark:border-slate-700 hover:border-purple-300 text-slate-800 dark:text-slate-200 font-semibold"
            >
              🗣️ Read next dose aloud
            </button>
          </div>
        </div>

        {/* Speak Out Medicine Details in Specified Language Button */}
        {nextDose?.medication && (
          <button
            id="btn-voice-read-specified-lang"
            type="button"
            onClick={() => speakMedicationDetails(nextDose.medication, language)}
            className="w-full min-h-[46px] px-4 py-2.5 rounded-2xl bg-[#5B2FD6] hover:bg-[#4e25bf] active:scale-95 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-600/25 transition-all cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-[#FFC400]" />
            <span>Speak Details in {LANGUAGE_NAMES[language]} ({LANGUAGE_FLAGS[language]})</span>
          </button>
        )}
      </div>
    </div>
  );
};
