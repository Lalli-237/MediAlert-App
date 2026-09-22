import React, { useState } from 'react';
import { 
  Flame, 
  CheckCircle2, 
  TrendingUp, 
  Calendar, 
  Clock, 
  History,
  Check,
  X,
  Timer,
  Plus,
  Package,
  AlertTriangle,
  Bell,
  BellOff,
  ShoppingBag,
  Pill
} from 'lucide-react';
import { DoseLog, DailyAdherence, LanguageCode, Medication } from '../types';
import { translations } from '../utils/translations';
import { FoodConditionBadge } from './FoodConditionBadge';
import { MedicineShapeIcon } from './MedicineShapeIcon';

interface Props {
  days: DailyAdherence[];
  weeklyRate: number;
  streakDays: number;
  totalTakenThisWeek: number;
  totalScheduledThisWeek: number;
  doseLogs: DoseLog[];
  medications?: Medication[];
  language: LanguageCode;
  hasMedications?: boolean;
  onOpenAddModal?: () => void;
  onUpdateMedication?: (med: Medication) => void;
}

export const WeeklyComplianceTracker: React.FC<Props> = ({
  days,
  weeklyRate,
  streakDays,
  totalTakenThisWeek,
  totalScheduledThisWeek,
  doseLogs,
  medications = [],
  language,
  hasMedications = true,
  onOpenAddModal,
  onUpdateMedication
}) => {
  const t = translations[language] || translations.en;
  const [filter, setFilter] = useState<'all' | 'taken' | 'snoozed'>('all');
  const [refillFeedback, setRefillFeedback] = useState<string | null>(null);

  // Active medications with stock calculations
  const activeMeds = medications.filter(m => m.isActive);

  // Identify low stock medications: daily reminder triggers when there are 5 or fewer left (stock <= 5)
  const lowStockMeds = activeMeds.filter(med => {
    const stock = typeof med.inventoryCount === 'number' ? med.inventoryCount : 0;
    return stock <= 5;
  });

  const handleRestock = (med: Medication, amount: number) => {
    if (!onUpdateMedication) return;
    const currentStock = typeof med.inventoryCount === 'number' ? med.inventoryCount : 0;
    const newStock = currentStock + amount;
    const updated: Medication = {
      ...med,
      inventoryCount: newStock
    };
    onUpdateMedication(updated);
    setRefillFeedback(`✓ Restocked ${amount} doses of ${med.name}! New stock: ${newStock}`);
    setTimeout(() => setRefillFeedback(null), 3500);
  };

  const handleToggleDailyReminder = (med: Medication) => {
    if (!onUpdateMedication) return;
    const currentSetting = med.remindDailyLowStock !== false;
    const updated: Medication = {
      ...med,
      remindDailyLowStock: !currentSetting
    };
    onUpdateMedication(updated);
    setRefillFeedback(
      !currentSetting 
        ? `🔔 Daily low stock reminder activated for ${med.name} (when 5 or fewer left)` 
        : `🔕 Daily reminder turned off for ${med.name}`
    );
    setTimeout(() => setRefillFeedback(null), 3000);
  };

  const handleAdjustCount = (med: Medication, delta: number) => {
    if (!onUpdateMedication) return;
    const currentStock = typeof med.inventoryCount === 'number' ? med.inventoryCount : 30;
    const newStock = Math.max(0, currentStock + delta);
    const updated: Medication = {
      ...med,
      inventoryCount: newStock
    };
    onUpdateMedication(updated);
  };

  // Only display dose logs for medicines added by the user; remove all default/sample logs
  const userMedIds = new Set(medications.map(m => m.id));
  const userAddedLogs = doseLogs.filter(log =>
    userMedIds.has(log.medicationId) && !/^log-\d+-\d+$/.test(log.id)
  );

  const filteredLogs = userAddedLogs
    .filter(log => {
      if (filter === 'all') return true;
      return log.status === filter;
    })
    .slice(0, 15); // Show latest 15 user logs

  // If no medications exist at all
  if (medications.length === 0) {
    return (
      <div id="section-weekly-compliance-empty" className="space-y-6">
        <div 
          id="card-tracker-empty"
          className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 text-center shadow-xs space-y-5"
        >
          <div className="w-16 h-16 rounded-2xl bg-purple-50 border border-purple-100 text-[#5e35b1] flex items-center justify-center mx-auto shadow-inner">
            <Package className="w-8 h-8" />
          </div>
          
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              No Medicines Added Yet
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Add your scheduled medicines to view stock availability, low-stock reminders, attendance streaks, and weekly adherence reports.
            </p>
          </div>

          {onOpenAddModal && (
            <div className="pt-2">
              <button
                id="btn-tracker-add-medicine"
                onClick={onOpenAddModal}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-[#5e35b1] hover:bg-[#512da8] text-white font-extrabold text-sm shadow-md shadow-purple-600/25 active:scale-95 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Medicine</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div id="section-weekly-compliance" className="space-y-6">
      {/* Toast Feedback for Stock Updates */}
      {refillFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg animate-in fade-in slide-in-from-top-2">
          <Check className="w-4 h-4 stroke-[3]" />
          <span>{refillFeedback}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. MEDICINE STOCK & REFILL TRACKER (REQUESTED IN USER PROMPT)            */}
      {/* ========================================================================= */}
      <div 
        id="card-medicine-stock-tracker"
        className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shadow-xs">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Medicine Stock & Inventory
              </h3>
              <p className="text-xs text-slate-500">
                Track available medicine. Daily reminder triggers when there are 5 or fewer left.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {lowStockMeds.length > 0 ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-700 font-extrabold text-xs">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                {lowStockMeds.length} Need Refill (≤5 left)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-extrabold text-xs">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                All Medicines Well Stocked (&gt;5 left)
              </span>
            )}
          </div>
        </div>

        {/* Low stock alert banner */}
        {lowStockMeds.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-amber-950 space-y-0.5">
              <p className="font-bold">
                Daily Reminder: {lowStockMeds.length} medicine{lowStockMeds.length > 1 ? 's have' : ' has'} 5 or fewer left!
              </p>
              <p className="text-amber-800 text-xs">
                Medicines with 5 or fewer doses left trigger daily alerts. Tap &ldquo;I Bought It (+30)&rdquo; once restocked.
              </p>
            </div>
          </div>
        )}

        {/* List of active medicines with stock and actions */}
        <div className="divide-y divide-slate-100">
          {activeMeds.map((med) => {
            const dailyDoses = Math.max(1, med.scheduledTimes.length);
            const stock = typeof med.inventoryCount === 'number' ? med.inventoryCount : 0;
            const daysRemaining = Math.floor(stock / dailyDoses);
            const isOutOfStock = stock <= 0;
            const isLowStock = stock <= 5;
            const isDailyReminderOn = med.remindDailyLowStock !== false;

            return (
              <div 
                key={med.id}
                className={`py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  isLowStock ? 'bg-amber-50/30 -mx-3 px-3 rounded-2xl' : ''
                }`}
              >
                {/* Left: Med Details & Stock Status */}
                <div className="flex items-start gap-3.5 min-w-0">
                  {med.imageUrl ? (
                    <img 
                      src={med.imageUrl} 
                      alt={med.name}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0" 
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-[#F6F6FE] dark:bg-[#1E1B4B] text-[#5B2FD6] dark:text-purple-300 flex items-center justify-center shrink-0 p-2 border border-purple-100 dark:border-purple-800">
                      <MedicineShapeIcon type={med.type} name={med.name} className="w-7 h-7 text-[#5B2FD6] dark:text-purple-300" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        {med.name}
                      </h4>
                      <span className="text-xs font-semibold text-slate-500">
                        {med.dosage}
                      </span>
                      {isOutOfStock ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black uppercase tracking-wider">
                          Out of Stock! (0 left)
                        </span>
                      ) : isLowStock ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-extrabold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Low Stock: Only {stock} left!
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                          {stock} left (~{daysRemaining}d supply)
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1 flex-wrap">
                      <span className="font-bold text-slate-700">
                        {stock} tablet{stock === 1 ? '' : 's'} available
                      </span>
                      <span>•</span>
                      <span>
                        {dailyDoses} dose{dailyDoses > 1 ? 's' : ''}/day
                      </span>
                      <span>•</span>
                      <span>
                        Times: {med.scheduledTimes.join(', ')}
                      </span>
                    </div>

                    {/* Visual stock health bar */}
                    <div className="w-48 sm:w-60 h-2 bg-slate-100 rounded-full overflow-hidden mt-2 border border-slate-200/60">
                      <div 
                        className={`h-full rounded-full transition-all duration-300 ${
                          isOutOfStock
                            ? 'w-0'
                            : isLowStock
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(5, (daysRemaining / 30) * 100))}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Right: Actions (Bought button, Daily Reminder toggle, and Quick Adjuster) */}
                <div className="flex flex-wrap items-center gap-2 self-start md:self-auto shrink-0">
                  {/* Fine-tune Adjuster [-] [+] */}
                  <div className="flex items-center bg-slate-100 rounded-xl p-0.5 border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleAdjustCount(med, -1)}
                      title="Reduce count by 1"
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-black text-slate-800 min-w-[28px] text-center">
                      {stock}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleAdjustCount(med, 1)}
                      title="Increase count by 1"
                      className="w-7 h-7 flex items-center justify-center text-slate-600 hover:text-slate-900 font-bold hover:bg-white rounded-lg transition-colors cursor-pointer"
                    >
                      +
                    </button>
                  </div>

                  {/* BOUGHT BUTTON (Restocks +30 doses) */}
                  <button
                    type="button"
                    id={`btn-bought-${med.id}`}
                    onClick={() => handleRestock(med, 30)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5e35b1] hover:bg-[#512da8] text-white text-xs font-extrabold shadow-xs hover:shadow-md active:scale-95 transition-all cursor-pointer"
                    title="Click if you bought this medicine to add a 30-dose refill"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>I Bought It (+30)</span>
                  </button>

                  {/* REMEMBER DAILY ONCE TOGGLE */}
                  <button
                    type="button"
                    id={`btn-remind-daily-${med.id}`}
                    onClick={() => handleToggleDailyReminder(med)}
                    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      isDailyReminderOn
                        ? 'bg-purple-50 border-purple-200 text-[#5e35b1] hover:bg-purple-100'
                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                    }`}
                    title={isDailyReminderOn ? 'Click to turn off daily low-stock reminder' : 'Click to enable daily low-stock reminder'}
                  >
                    {isDailyReminderOn ? (
                      <>
                        <Bell className="w-3.5 h-3.5 text-[#5e35b1] fill-purple-200" />
                        <span>Daily Reminder: ON</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="w-3.5 h-3.5 text-slate-400" />
                        <span>Daily Reminder: OFF</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Metric 1: Streak */}
        <div 
          id="card-compliance-streak"
          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-7 h-7 fill-amber-500 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {streakDays} <span className="text-sm font-semibold text-slate-500">days</span>
            </div>
            <p className="text-xs font-medium text-slate-500">
              {t.streakDays.replace('{d}', streakDays.toString())}
            </p>
          </div>
        </div>

        {/* Metric 2: Adherence Rate */}
        <div 
          id="card-compliance-rate"
          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-4"
        >
          <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${
            weeklyRate >= 90
              ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
              : weeklyRate >= 75
                ? 'bg-teal-50 border-teal-200 text-teal-600'
                : 'bg-amber-50 border-amber-200 text-amber-600'
          }`}>
            <TrendingUp className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {weeklyRate}%
            </div>
            <p className="text-xs font-medium text-slate-500">
              {t.complianceRate}
            </p>
          </div>
        </div>

        {/* Metric 3: Total Doses Taken */}
        <div 
          id="card-doses-taken-count"
          className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex items-center gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalTakenThisWeek}
              <span className="text-sm font-normal text-slate-400">/{totalScheduledThisWeek}</span>
            </div>
            <p className="text-xs font-medium text-slate-500">
              {t.dosesTaken}
            </p>
          </div>
        </div>
      </div>

      {/* 7-Day Adherence Visualization Bar Chart */}
      <div 
        id="card-7day-adherence-chart"
        className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {t.weeklyAdherence}
            </h3>
          </div>
          <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-200">
            7-Day Window
          </span>
        </div>

        {/* Horizontal & Vertical 7-Day Matrix */}
        <div className="grid grid-cols-7 gap-2 sm:gap-3 pt-2">
          {days.map((day, idx) => {
            const isToday = idx === days.length - 1;
            const isTracked = day.isTracked !== false;
            const rate = day.complianceRate;

            return (
              <div 
                key={day.dateStr}
                className={`flex flex-col items-center p-2 sm:p-3 rounded-xl border transition-all ${
                  isToday 
                    ? 'bg-teal-50/70 border-teal-300 ring-2 ring-teal-200 shadow-xs' 
                    : isTracked
                      ? 'bg-slate-50/70 border-slate-200'
                      : 'bg-slate-50/30 border-dashed border-slate-200 opacity-60'
                }`}
              >
                <span className={`text-xs font-bold ${isToday ? 'text-teal-900 font-extrabold' : 'text-slate-600'}`}>
                  {day.dayLabel}
                </span>

                {/* Progress Vertical Pill */}
                <div className="w-3.5 sm:w-4 h-20 bg-slate-200 rounded-full my-2 relative overflow-hidden flex flex-col justify-end">
                  {isTracked ? (
                    <div 
                      className={`w-full rounded-full transition-all duration-500 ${
                        rate >= 100 
                          ? 'bg-emerald-500' 
                          : rate >= 70 
                            ? 'bg-teal-500' 
                            : rate > 0 
                              ? 'bg-amber-400' 
                              : 'bg-transparent'
                      }`}
                      style={{ height: `${Math.max(rate > 0 ? 12 : 0, rate)}%` }}
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                      <span className="text-[10px] text-slate-400">·</span>
                    </div>
                  )}
                </div>

                <span className="text-[11px] font-bold text-slate-800">
                  {isTracked ? `${rate}%` : '—'}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {isTracked ? `${day.totalTaken}/${day.totalScheduled}` : 'Pre-app'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Clear Explanation for Seniors */}
        <div className="mt-4 p-3 rounded-xl bg-purple-50/60 border border-purple-100 flex items-start gap-2.5 text-xs text-purple-900">
          <Calendar className="w-4 h-4 text-[#5e35b1] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Honest & Accurate Tracking:</strong> Your medicine adherence is measured from the day you started using MediAlert. Days before installing the app are not counted as missed.
          </p>
        </div>
      </div>

      {/* Recent Dose Activity Timeline */}
      <div 
        id="card-dose-history-log"
        className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              {t.doseHistory}
            </h3>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('taken')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                filter === 'taken' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Taken
            </button>
            <button
              onClick={() => setFilter('snoozed')}
              className={`px-3 py-1 rounded-md font-medium transition-all ${
                filter === 'snoozed' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Snoozed
            </button>
          </div>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 space-y-1.5">
            <p className="font-bold text-slate-700 text-sm">No Recent Dose Activity</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Default dose activity has been removed. Only doses for medicines you add will be recorded here when taken or snoozed.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredLogs.map((log) => {
              const logTime = new Date(log.loggedTime || log.scheduledTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              });
              const logDate = new Date(log.loggedTime || log.scheduledTime).toLocaleDateString([], {
                month: 'short',
                day: 'numeric'
              });

              return (
                <div 
                  key={log.id} 
                  className="py-3 flex items-center justify-between gap-3 text-xs sm:text-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      log.status === 'taken'
                        ? 'bg-emerald-100 text-emerald-700'
                        : log.status === 'snoozed'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                    }`}>
                      {log.status === 'taken' ? (
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      ) : log.status === 'snoozed' ? (
                        <Timer className="w-4 h-4" />
                      ) : (
                        <X className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">
                        {log.medicationName}
                      </div>
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>{log.dosage}</span>
                        <span>•</span>
                        <span className="capitalize">{log.status}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-semibold text-slate-700">{logTime}</div>
                    <div className="text-[11px] text-slate-600">{logDate}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
