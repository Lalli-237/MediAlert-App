import React, { useState } from 'react';
import { 
  Calendar as CalendarIcon, 
  Download, 
  Check, 
  ExternalLink, 
  X, 
  Bell, 
  Smartphone, 
  ShieldCheck, 
  Info,
  Clock,
  Sparkles
} from 'lucide-react';
import { Medication } from '../types';
import { generateIcsCalendar, downloadIcsFile, generateGoogleCalendarEventUrl } from '../utils/calendarExport';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  medications: Medication[];
  patientName?: string;
  language?: string;
}

export const ExportCalendarModal: React.FC<Props> = ({
  isOpen,
  onClose,
  medications,
  patientName = 'User',
  language = 'en'
}) => {
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);
  const [selectedMedForGCal, setSelectedMedForGCal] = useState<string>('');

  if (!isOpen) return null;

  const activeMeds = medications.filter(m => m.isActive);
  const totalDailyDoses = activeMeds.reduce((acc, m) => acc + (m.scheduledTimes?.length || 0), 0);

  const handleDownload = () => {
    const icsData = generateIcsCalendar(medications, patientName, language);
    const filename = `medialert-schedule-${new Date().toISOString().split('T')[0]}.ics`;
    downloadIcsFile(icsData, filename);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 5000);
  };

  return (
    <div 
      id="modal-export-calendar"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-labelledby="calendar-export-title"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#5e35b1] via-[#7e57c2] to-indigo-600 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shadow-inner">
              <CalendarIcon className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-purple-200">
                System Alarms &amp; Sync
              </span>
              <h2 id="calendar-export-title" className="text-xl sm:text-2xl font-black text-white">
                Export to Calendar
              </h2>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-purple-100 mt-2 font-medium">
            Generates a standard <strong className="text-white">.ICS calendar file</strong> with daily recurring alarms for Google Calendar, Apple Calendar, and Outlook.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Summary Box */}
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50/60 p-4 rounded-2xl border border-purple-100 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold uppercase text-purple-800 tracking-wider">
                Schedule Ready for Export
              </div>
              <div className="text-base font-black text-slate-900 mt-0.5">
                {activeMeds.length} Active Medicines ({totalDailyDoses} Daily Doses)
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1 mt-0.5">
                <Clock className="w-3.5 h-3.5 text-[#5e35b1]" />
                <span>Repeats every single day with sound &amp; popup alarms</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#5e35b1] text-white flex items-center justify-center font-black text-lg shadow-sm">
              {totalDailyDoses}
            </div>
          </div>

          {/* Primary Action Button: Download .ICS */}
          <div>
            <button
              id="btn-download-ics-file"
              onClick={handleDownload}
              className={`w-full min-h-[54px] py-3.5 px-6 rounded-2xl font-extrabold text-base flex items-center justify-center gap-2.5 shadow-lg active:scale-[0.98] transition-all cursor-pointer ${
                isDownloaded
                  ? 'bg-emerald-600 text-white shadow-emerald-600/30'
                  : 'bg-[#5e35b1] hover:bg-[#512da8] text-white shadow-purple-600/30'
              }`}
            >
              {isDownloaded ? (
                <>
                  <Check className="w-5 h-5 stroke-[3]" />
                  <span>Calendar File Downloaded!</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 stroke-[2.5]" />
                  <span>Download Calendar Schedule (.ICS)</span>
                </>
              )}
            </button>
            <p className="text-[11px] text-center text-slate-500 font-medium mt-1.5">
              Standard iCalendar (.ics) format compatible with all smartphones and laptops.
            </p>
          </div>

          {/* Guaranteed Closed-App Protection Notice */}
          <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <strong className="block font-black text-amber-950">
                Guaranteed Alarms When App is Closed
              </strong>
              <p>
                When imported into Apple Calendar or Google Calendar, your device’s operating system manages the alarms natively. They will ring, vibrate, and alert you <strong>even if the MediAlert app is closed, phone is locked, or you are playing games/using other apps.</strong>
              </p>
            </div>
          </div>

          {/* Step-by-Step Instructions */}
          <div className="space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
              Quick Setup Guide
            </h3>

            {/* Apple Calendar (iOS / Mac) */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                  <Smartphone className="w-4 h-4 text-slate-700" />
                  <span>Apple Calendar (iPhone, iPad, Mac)</span>
                </div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  1 Tap
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                1. Tap <strong>Download Calendar Schedule (.ICS)</strong> above.<br />
                2. Tap the downloaded file in your browser downloads or Files.<br />
                3. Tap <strong>&ldquo;Add All&rdquo;</strong> in the top right to import all daily alarms directly.
              </p>
            </div>

            {/* Google Calendar (Android & Web) */}
            <div className="p-3.5 rounded-2xl border border-slate-200 bg-white space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-black text-sm text-slate-900">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span>Google Calendar (Android &amp; Desktop)</span>
                </div>
                <a
                  href="https://calendar.google.com/calendar/u/0/r/settings/export"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                  <span>Open Import</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                1. Download the <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">.ics</code> file above.<br />
                2. Open <strong>Google Calendar Settings &gt; Import &amp; Export</strong>.<br />
                3. Select the file and click <strong>Import</strong>. Your phone will sync and trigger alarms automatically.
              </p>
            </div>

            {/* Direct Google Calendar Web Link for Individual Dose */}
            {activeMeds.length > 0 && (
              <div className="p-3.5 rounded-2xl border border-purple-100 bg-purple-50/50 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-[#5e35b1]">
                  <Sparkles className="w-4 h-4" />
                  <span>Direct One-Click Google Calendar Web Link</span>
                </div>
                <p className="text-xs text-slate-600">
                  Prefer adding directly in Google Calendar without uploading a file? Select a medicine:
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={selectedMedForGCal}
                    onChange={(e) => setSelectedMedForGCal(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl border border-purple-200 bg-white text-xs font-semibold text-slate-800"
                  >
                    <option value="">Select a medicine...</option>
                    {activeMeds.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.dosage}) - {m.scheduledTimes.join(', ')}
                      </option>
                    ))}
                  </select>
                  {selectedMedForGCal && (() => {
                    const chosen = activeMeds.find(m => m.id === selectedMedForGCal);
                    if (!chosen) return null;
                    const url = generateGoogleCalendarEventUrl(chosen, chosen.scheduledTimes[0] || '08:00', patientName);
                    return (
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm whitespace-nowrap"
                      >
                        <span>Add {chosen.name}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">
            {activeMeds.length} medicines exported
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
