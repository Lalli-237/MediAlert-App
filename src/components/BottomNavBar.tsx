import React from 'react';
import { Home, BarChart2, Plus, Bell, User } from 'lucide-react';
import { AppTab, LanguageCode } from '../types';
import { translations } from '../utils/translations';

interface Props {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenAddModal: () => void;
  language: LanguageCode;
}

export const BottomNavBar: React.FC<Props> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  language
}) => {
  const t = translations[language] || translations.en;

  return (
    <nav 
      aria-label="Main Navigation"
      className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="max-w-lg mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between relative">
        {/* Tab 1: Home */}
        <button
          id="nav-tab-home"
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[46px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'home'
              ? 'text-[#5e35b1] font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Home className={`w-5 h-5 mb-0.5 ${currentTab === 'home' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] sm:text-xs tracking-tight whitespace-nowrap">{t.navHome}</span>
        </button>

        {/* Tab 2: Tracker */}
        <button
          id="nav-tab-tracker"
          onClick={() => onSelectTab('tracker')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[46px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'tracker'
              ? 'text-[#5e35b1] font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <BarChart2 className={`w-5 h-5 mb-0.5 ${currentTab === 'tracker' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] sm:text-xs tracking-tight whitespace-nowrap">{t.navTracker}</span>
        </button>

        {/* Center Floating Plus Button: Add Medicine */}
        <div className="flex-1 flex items-center justify-center relative -top-3.5 sm:-top-4">
          <button
            id="nav-btn-add-medicine"
            onClick={onOpenAddModal}
            aria-label={t.addMedicineBtn}
            className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-[#5e35b1] hover:bg-[#512da8] text-white flex items-center justify-center shadow-lg shadow-purple-600/35 hover:scale-105 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-300 cursor-pointer"
          >
            <Plus className="w-7 h-7 stroke-[2.8]" />
          </button>
        </div>

        {/* Tab 4: Manage / Reminder */}
        <button
          id="nav-tab-manage"
          onClick={() => onSelectTab('manage')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[46px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'manage'
              ? 'text-[#5e35b1] font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <Bell className={`w-5 h-5 mb-0.5 ${currentTab === 'manage' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] sm:text-xs tracking-tight whitespace-nowrap">{t.navManage}</span>
        </button>

        {/* Tab 5: Profile */}
        <button
          id="nav-tab-profile"
          onClick={() => onSelectTab('profile')}
          className={`flex flex-col items-center justify-center flex-1 min-h-[46px] py-1 px-1 rounded-xl transition-all cursor-pointer ${
            currentTab === 'profile'
              ? 'text-[#5e35b1] font-bold'
              : 'text-slate-500 hover:text-slate-800 font-medium'
          }`}
        >
          <User className={`w-5 h-5 mb-0.5 ${currentTab === 'profile' ? 'stroke-[2.5]' : 'stroke-[1.8]'}`} />
          <span className="text-[10px] sm:text-xs tracking-tight whitespace-nowrap">{t.navProfile}</span>
        </button>
      </div>
    </nav>
  );
};
