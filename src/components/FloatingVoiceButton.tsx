import React from 'react';
import { Mic, Volume2 } from 'lucide-react';
import { LanguageCode } from '../types';

interface Props {
  onClick: () => void;
  language: LanguageCode;
  onQuickSpeakNextDose?: () => void;
}

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

export const FloatingVoiceButton: React.FC<Props> = ({
  onClick,
  language,
  onQuickSpeakNextDose
}) => {
  const currentFlag = LANGUAGE_FLAGS[language] || '🇮🇳';
  const langName = LANGUAGE_NAMES[language] || 'Voice';

  return (
    <aside aria-label="Voice Medicine Assistant" className="fixed bottom-20 right-4 sm:right-6 z-40 flex flex-col items-end gap-2 pointer-events-none">
      {/* Small floating pill showing the current language flag and quick action */}
      {onQuickSpeakNextDose && (
        <button
          type="button"
          onClick={onQuickSpeakNextDose}
          title={`Speak next medicine details in ${langName}`}
          className="pointer-events-auto bg-white dark:bg-[#202237] border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-md hover:bg-slate-50 dark:hover:bg-[#2d2f4d] flex items-center gap-1.5 transition-all hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="text-sm select-none" role="img" aria-label={langName}>{currentFlag}</span>
          <Volume2 className="w-3.5 h-3.5 text-[#5B2FD6] dark:text-[#FFC400]" />
          <span className="text-slate-800 dark:text-white">Speak Medicine</span>
        </button>
      )}

      {/* Primary Floating Action Button (FAB) for Voice Activation */}
      <button
        id="fab-voice-assistant"
        type="button"
        onClick={onClick}
        title={`Speak to log medicine in ${langName}`}
        aria-label="Voice activated medicine command"
        className="pointer-events-auto group relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-tr from-[#5B2FD6] via-[#6d3ce3] to-[#8c5ff8] text-white flex items-center justify-center shadow-xl shadow-purple-700/40 hover:shadow-purple-600/60 hover:scale-108 active:scale-95 transition-all duration-200 cursor-pointer border-2 border-white dark:border-purple-300/40"
      >
        {/* Subtle glowing pulse ring */}
        <span className="absolute -inset-1 rounded-full bg-purple-500/20 dark:bg-[#FFC400]/20 animate-pulse group-hover:bg-purple-500/30" />

        {/* Microphone & Sound icon right at mic */}
        <div className="relative z-10 flex items-center justify-center gap-0.5">
          <Mic className="w-6 h-6 sm:w-7 sm:h-7 text-white group-hover:scale-110 transition-transform" />
          <Volume2 className="w-4 h-4 text-amber-300 animate-pulse" />
        </div>

        {/* Exactly one language flag badge attached to the top-right corner of the button */}
        <span 
          className="absolute -top-1 -right-1 z-20 w-6 h-6 rounded-full bg-white dark:bg-[#1E1B4B] border border-slate-200 dark:border-purple-700 flex items-center justify-center text-xs shadow-md select-none"
          role="img"
          aria-label={langName}
        >
          {currentFlag}
        </span>
      </button>
    </aside>
  );
};
