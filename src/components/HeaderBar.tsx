import React from 'react';
import { Bell, User, Moon, Sun } from 'lucide-react';
import { LanguageCode, AppSettings, UserSession } from '../types';
import { AppLogo } from './AppLogo';

interface Props {
  settings: AppSettings;
  userSession?: UserSession | null;
  onUpdateSettings: (newSettings: Partial<AppSettings>) => void;
  onOpenProfile: () => void;
  onTriggerAlarmTest: () => void;
  onOpenAuth?: () => void;
  onOpenCalendarExport?: () => void;
  onConnectToCalendar?: () => void;
}

export const HeaderBar: React.FC<Props> = ({
  settings,
  userSession,
  onUpdateSettings,
  onOpenProfile,
  onTriggerAlarmTest,
  onOpenAuth
}) => {
  const languageOptions: { code: LanguageCode; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🌐' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
    { code: 'kn', label: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'bn', label: 'বাংলা', flag: '🇮🇳' },
    { code: 'mr', label: 'मराठी', flag: '🇮🇳' },
    { code: 'ml', label: 'മലയാളം', flag: '🇮🇳' },
    { code: 'gu', label: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
  ];

  // Find the single flag for the currently active language
  const currentLanguageOption = languageOptions.find(o => o.code === settings.language) || languageOptions[0];

  return (
    <header className="bg-white dark:bg-[#161726] backdrop-blur-sm sticky top-0 z-20 px-3 py-2.5 sm:px-6 border-b border-slate-100 dark:border-slate-800 shadow-2xs transition-colors">
      <div className="max-w-lg mx-auto flex items-center justify-between gap-2">
        {/* Brand: App Logo (Purple Heart with angled Capsule) + MediAlert */}
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <AppLogo className="w-10 h-10 sm:w-11 sm:h-11 shrink-0" />

          <div className="min-w-0">
            <h1 className="font-extrabold text-lg sm:text-2xl text-[#5B2FD6] dark:text-purple-300 tracking-tight leading-tight truncate">
              MediAlert
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden min-[400px]:block">
              Smart Medicine Reminder
            </p>
          </div>
        </div>

        {/* Right Action Icons: Language Pill + Bell + Moon/Darkmode + Profile Avatar */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Single Flag beside the Language selector */}
          <div className="relative flex items-center bg-white dark:bg-[#202237] hover:bg-slate-50 dark:hover:bg-[#2a2c47] rounded-full px-2.5 py-1.5 transition-colors border border-slate-200 dark:border-slate-700 shadow-2xs">
            <span className="text-sm mr-1 select-none leading-none" role="img" aria-label={currentLanguageOption.label}>
              {currentLanguageOption.flag}
            </span>
            <select
              id="header-select-language"
              aria-label="Select Language"
              value={settings.language}
              onChange={(e) => onUpdateSettings({ language: e.target.value as LanguageCode })}
              className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer focus:outline-none max-w-[72px] sm:max-w-none truncate pr-0.5"
            >
              {languageOptions.map((opt) => (
                <option key={opt.code} value={opt.code} className="bg-white dark:bg-[#1E1B4B] text-slate-900 dark:text-slate-100">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Bell Icon Button (Notification / Test Alarm) */}
          <button
            id="btn-header-alarm-bell"
            onClick={onTriggerAlarmTest}
            title="Test Alarm Notification"
            className="w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#202237] hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-300 flex items-center justify-center text-amber-500 shadow-2xs transition-colors cursor-pointer"
          >
            <Bell className="w-5 h-5 fill-amber-400 text-amber-500" />
          </button>

          {/* Moon Icon Button beside Bell for toggling Dark Mode */}
          <button
            id="btn-header-theme-moon"
            onClick={() => onUpdateSettings({ darkMode: !settings.darkMode })}
            title={settings.darkMode ? "Switch to Light Mode" : "Switch to Dark Mode (Moon)"}
            className={`w-10 h-10 rounded-full border flex items-center justify-center shadow-2xs transition-all cursor-pointer ${
              settings.darkMode
                ? 'bg-[#282a44] border-purple-400/50 text-[#FFC400] hover:bg-[#323555]'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-purple-50 hover:text-[#5B2FD6] hover:border-purple-300'
            }`}
          >
            {settings.darkMode ? (
              <Sun className="w-5 h-5 text-amber-300 fill-amber-300/30" />
            ) : (
              <Moon className="w-5 h-5 text-[#5B2FD6] fill-[#5B2FD6]/20" />
            )}
          </button>

          {/* Profile & Account Button with login indicator */}
          <button
            id="btn-header-profile"
            onClick={onOpenProfile}
            title={userSession?.email ? `Signed in as ${userSession.email}` : "Profile & Settings"}
            className="relative w-10 h-10 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#202237] hover:bg-purple-50 dark:hover:bg-purple-950/30 hover:border-purple-300 flex items-center justify-center text-slate-700 dark:text-slate-200 shadow-2xs transition-colors"
          >
            {userSession?.isLoggedIn ? (
              <>
                <div className="w-8 h-8 rounded-full bg-[#5B2FD6] text-white flex items-center justify-center text-xs font-black">
                  {(userSession.displayName || 'L')[0].toUpperCase()}
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </>
            ) : (
              <User className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
