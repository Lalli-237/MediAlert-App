import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Calendar as CalendarIcon, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles,
  Smartphone
} from 'lucide-react';
import { 
  getNotificationStatus, 
  requestNotificationPermission, 
  triggerTestBackgroundNotification,
  NotificationStatus 
} from '../utils/serviceWorkerManager';

interface Props {
  onOpenCalendarExport: () => void;
  className?: string;
}

export const BackgroundNotificationCard: React.FC<Props> = ({
  onOpenCalendarExport,
  className = ''
}) => {
  const [notifStatus, setNotifStatus] = useState<NotificationStatus>(() => getNotificationStatus());
  const [testSent, setTestSent] = useState<boolean>(false);
  const [isRequesting, setIsRequesting] = useState<boolean>(false);

  useEffect(() => {
    const update = () => setNotifStatus(getNotificationStatus());
    update();
    window.addEventListener('focus', update);
    return () => window.removeEventListener('focus', update);
  }, []);

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    try {
      const perm = await requestNotificationPermission();
      setNotifStatus(getNotificationStatus());
      if (perm === 'granted') {
        // Send a celebratory test notification
        await triggerTestBackgroundNotification('Your Medicines');
        setTestSent(true);
        setTimeout(() => setTestSent(false), 4000);
      }
    } finally {
      setIsRequesting(false);
    }
  };

  const handleTestNotification = async () => {
    setTestSent(true);
    await triggerTestBackgroundNotification('Heart & Blood Pressure Medicine');
    setTimeout(() => setTestSent(false), 4000);
  };

  const isGranted = notifStatus.permission === 'granted';

  return (
    <div 
      id="card-background-notification-hub"
      className={`bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 ${className}`}
    >
      {/* Title & Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-purple-100 text-[#5e35b1] flex items-center justify-center font-bold shadow-2xs">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
              Closed-App &amp; Background Reminders
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Alerts even when the app is closed or you are using another app
            </p>
          </div>
        </div>

        {isGranted ? (
          <span className="px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-black flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Background Active
          </span>
        ) : (
          <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-xs font-black flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Permission Needed
          </span>
        )}
      </div>

      {/* Description */}
      <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700 leading-relaxed space-y-1.5">
        <div className="flex items-center gap-1.5 text-[#5e35b1] font-bold">
          <ShieldCheck className="w-4 h-4 text-[#5e35b1]" />
          <span>Dual Protection System</span>
        </div>
        <p>
          1. <strong>Service Worker Notifications:</strong> Background process fires push alerts on your system tray/lock screen.<br />
          2. <strong>Calendar Schedule (.ICS):</strong> Native alarms in Google or Apple Calendar ensure your device rings even if offline or locked.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Enable / Test Button */}
        {!isGranted ? (
          <button
            id="btn-enable-background-notifications"
            onClick={handleEnableNotifications}
            disabled={isRequesting}
            className="min-h-[48px] py-3 px-4 rounded-2xl bg-[#5e35b1] hover:bg-[#512da8] active:scale-95 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-purple-600/20 transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            <span>{isRequesting ? 'Requesting...' : 'Enable Closed-App Alerts'}</span>
          </button>
        ) : (
          <button
            id="btn-test-background-notification"
            onClick={handleTestNotification}
            className="min-h-[48px] py-3 px-4 rounded-2xl bg-purple-50 hover:bg-purple-100 active:bg-purple-200 border border-purple-200 text-[#5e35b1] font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            {testSent ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Test Notification Sent!</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Send Test Background Alert</span>
              </>
            )}
          </button>
        )}

        {/* Export to Calendar Button */}
        <button
          id="btn-export-calendar-prominent"
          onClick={onOpenCalendarExport}
          className="min-h-[48px] py-3 px-4 rounded-2xl bg-white dark:bg-[#202237] hover:bg-slate-50 dark:hover:bg-[#282a44] active:scale-95 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <CalendarIcon className="w-4 h-4 text-[#5B2FD6] dark:text-purple-300" />
          <span>Export to Calendar (.ICS)</span>
        </button>
      </div>
    </div>
  );
};
