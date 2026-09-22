import { Medication, DoseLog, NextDose, DailyAdherence } from '../types';

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates the next highest priority medication dose
 * Prioritizes:
 * 1. Snoozed doses whose snooze timer has elapsed
 * 2. Overdue doses (past scheduled time, not yet taken)
 * 3. Doses due right now (within 5 minutes)
 * 4. Earliest upcoming dose today
 * 5. Tomorrow's earliest dose if today's are complete
 */
export function calculateNextDose(
  medications: Medication[],
  doseLogs: DoseLog[],
  snoozedDoses: Record<string, number> // key: `${medId}_${timeStr}_${dateStr}`, value: timestamp
): NextDose | null {
  const activeMeds = medications.filter(m => m.isActive);
  if (activeMeds.length === 0) return null;

  const now = new Date();
  const todayStr = getTodayDateString();

  interface CandidateSlot {
    medication: Medication;
    scheduledDateTime: Date;
    timeString: string;
    isSnoozed: boolean;
    snoozedUntil?: Date;
    minutesDiff: number;
    isOverdue: boolean;
    isDueNow: boolean;
    slotKey: string;
  }

  const candidates: CandidateSlot[] = [];

  // Check today's slots
  for (const med of activeMeds) {
    for (const timeStr of med.scheduledTimes) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const slotDate = new Date();
      slotDate.setHours(hours, minutes, 0, 0);

      const slotKey = `${med.id}_${timeStr}_${todayStr}`;
      
      // Check if already taken or skipped
      const isLogged = doseLogs.some(log => {
        const logDateStr = log.scheduledTime.split('T')[0];
        const logTimeStr = log.scheduledTime.split('T')[1]?.substring(0, 5);
        return (
          log.medicationId === med.id &&
          logDateStr === todayStr &&
          logTimeStr === timeStr &&
          (log.status === 'taken' || log.status === 'skipped')
        );
      });

      if (isLogged) continue;

      // Check snooze state
      const snoozeExpiry = snoozedDoses[slotKey];
      let isSnoozed = false;
      let effectiveTime = slotDate;
      let snoozedUntilDate: Date | undefined;

      if (snoozeExpiry && snoozeExpiry > now.getTime()) {
        isSnoozed = true;
        snoozedUntilDate = new Date(snoozeExpiry);
        effectiveTime = snoozedUntilDate;
      }

      const diffMs = effectiveTime.getTime() - now.getTime();
      const minutesDiff = Math.round(diffMs / 60000);

      // Check if current device time is equal to the scheduled reminder time (exact hour and minute)
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const isTimeEqual = currentH === hours && currentM === minutes;

      // If snoozed into the future, it is neither overdue nor due now until the snooze expires
      let isOverdue = false;
      let isDueNow = false;

      if (isSnoozed) {
        isOverdue = false;
        isDueNow = false;
      } else if (snoozeExpiry && snoozeExpiry <= now.getTime() && (now.getTime() - snoozeExpiry) <= 60000) {
        // Snooze time has been reached right now
        isDueNow = true;
        isOverdue = false;
      } else {
        // When current time in user device is equal to reminder time, then and only then reminder is triggered
        isDueNow = isTimeEqual;
        isOverdue = diffMs < -60000;
      }

      candidates.push({
        medication: med,
        scheduledDateTime: effectiveTime,
        timeString: timeStr,
        isSnoozed,
        snoozedUntil: snoozedUntilDate,
        minutesDiff,
        isOverdue,
        isDueNow,
        slotKey
      });
    }
  }

  if (candidates.length > 0) {
    // Sort logic:
    // 1. Due Now and Overdue unsnoozed doses first
    // 2. Upcoming doses today (earliest first)
    // 3. Snoozed doses waiting for their timer
    candidates.sort((a, b) => {
      // Prioritize non-snoozed overdue/due doses
      if (!a.isSnoozed && a.isOverdue && b.isSnoozed) return -1;
      if (a.isSnoozed && !b.isSnoozed && b.isOverdue) return 1;

      // If one is overdue and other is future
      if (a.minutesDiff < 0 && b.minutesDiff >= 0) return -1;
      if (b.minutesDiff < 0 && a.minutesDiff >= 0) return 1;

      // Both overdue: most overdue first
      if (a.minutesDiff < 0 && b.minutesDiff < 0) {
        return a.minutesDiff - b.minutesDiff;
      }

      // Both in future: closest to now first
      return a.minutesDiff - b.minutesDiff;
    });

    const top = candidates[0];
    return {
      medication: top.medication,
      scheduledDateTime: top.scheduledDateTime,
      timeString: top.timeString,
      minutesDiff: top.minutesDiff,
      isOverdue: top.isOverdue,
      isDueNow: top.isDueNow,
      isSnoozed: top.isSnoozed,
      snoozedUntil: top.snoozedUntil
    };
  }

  // All today's scheduled doses have been taken!
  // Return null so the app displays "All Medicines Taken Today"
  return null;
}

/**
 * Returns tomorrow's earliest dose for preview when all today's doses are completed
 */
export function getTomorrowEarliestDose(medications: Medication[]): { medication: Medication; timeString: string } | null {
  const activeMeds = medications.filter(m => m.isActive);
  if (activeMeds.length === 0) return null;

  const slots: { medication: Medication; timeString: string; minutes: number }[] = [];
  for (const med of activeMeds) {
    for (const timeStr of med.scheduledTimes) {
      const [h, m] = timeStr.split(':').map(Number);
      slots.push({
        medication: med,
        timeString: timeStr,
        minutes: h * 60 + m
      });
    }
  }

  if (slots.length === 0) return null;
  slots.sort((a, b) => a.minutes - b.minutes);
  return {
    medication: slots[0].medication,
    timeString: slots[0].timeString
  };
}

/**
 * Calculates 7-day adherence stats and current consecutive streak
 */
export function calculateWeeklyCompliance(
  medications: Medication[],
  doseLogs: DoseLog[]
): {
  days: DailyAdherence[];
  weeklyRate: number;
  streakDays: number;
  totalTakenThisWeek: number;
  totalScheduledThisWeek: number;
} {
  const activeMeds = medications.filter(m => m.isActive);
  const scheduledPerDay = activeMeds.reduce((acc, m) => acc + m.scheduledTimes.length, 0);

  const days: DailyAdherence[] = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Determine earliest date user started tracking
  const todayStr = getTodayDateString();
  let trackingStartDate = todayStr;
  if (doseLogs.length > 0) {
    const dates = doseLogs
      .map(l => l.scheduledTime.split('T')[0])
      .sort();
    if (dates[0] && dates[0] < trackingStartDate) {
      trackingStartDate = dates[0];
    }
  }

  let totalTakenThisWeek = 0;
  let totalScheduledThisWeek = 0;

  // Past 7 days (index 6 is today, index 0 is 6 days ago)
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const dayLabel = dayNames[d.getDay()];

    const isTracked = dateStr >= trackingStartDate;

    const takenCount = doseLogs.filter(log => {
      const logDate = log.scheduledTime.split('T')[0];
      return logDate === dateStr && log.status === 'taken';
    }).length;

    let scheduledCount = 0;
    let complianceRate = 0;

    if (isTracked) {
      scheduledCount = Math.max(scheduledPerDay, takenCount);
      complianceRate = scheduledCount > 0
        ? Math.min(100, Math.round((takenCount / scheduledCount) * 100))
        : 100;

      // If it's today and early / before doses, don't show 0% failed
      if (dateStr === todayStr && takenCount === 0) {
        complianceRate = 100; // Ready for today
      }

      totalTakenThisWeek += takenCount;
      totalScheduledThisWeek += scheduledCount;
    }

    days.push({
      dateStr,
      dayLabel,
      totalScheduled: scheduledCount,
      totalTaken: takenCount,
      complianceRate,
      isTracked
    });
  }

  const trackedDays = days.filter(d => d.isTracked);
  const weeklyRate = totalScheduledThisWeek > 0
    ? Math.round((totalTakenThisWeek / totalScheduledThisWeek) * 100)
    : 100;

  // Calculate streak across tracked days
  let streak = 0;
  for (let i = days.length - 1; i >= 0; i--) {
    const day = days[i];
    if (!day.isTracked) break;

    if (day.complianceRate >= 80) {
      streak++;
    } else if (i === days.length - 1 && day.totalTaken === 0) {
      // If it's today, keep streak active
      streak++;
    } else {
      break;
    }
  }

  return {
    days,
    weeklyRate: trackedDays.length > 0 ? weeklyRate : 100,
    streakDays: Math.max(1, streak),
    totalTakenThisWeek,
    totalScheduledThisWeek
  };
}

export interface MissedDoseItem {
  medication: Medication;
  timeString: string;
  scheduledDateTime: Date;
  minutesOverdue: number;
  slotKey: string;
}

/**
 * Identifies doses scheduled for today that are past their grace window (e.g. > 15 mins)
 * and have not been taken or currently snoozed.
 */
export function findMissedDosesToday(
  medications: Medication[],
  doseLogs: DoseLog[],
  snoozedDoses: Record<string, number>,
  gracePeriodMinutes: number = 15
): MissedDoseItem[] {
  const activeMeds = medications.filter(m => m.isActive);
  const now = new Date();
  const todayStr = getTodayDateString();
  const missedList: MissedDoseItem[] = [];

  for (const med of activeMeds) {
    for (const timeStr of med.scheduledTimes) {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const slotDate = new Date();
      slotDate.setHours(hours, minutes, 0, 0);

      const slotKey = `${med.id}_${timeStr}_${todayStr}`;

      // Check if logged as taken or skipped
      const isLogged = doseLogs.some(log => {
        const logDateStr = log.scheduledTime.split('T')[0];
        const logTimeStr = log.scheduledTime.split('T')[1]?.substring(0, 5);
        return (
          log.medicationId === med.id &&
          logDateStr === todayStr &&
          logTimeStr === timeStr &&
          (log.status === 'taken' || log.status === 'skipped')
        );
      });

      if (isLogged) continue;

      // Check if currently snoozed into the future
      const snoozeExpiry = snoozedDoses[slotKey];
      if (snoozeExpiry && snoozeExpiry > now.getTime()) {
        continue;
      }

      // Calculate minutes elapsed since scheduled time
      const elapsedMinutes = Math.floor((now.getTime() - slotDate.getTime()) / 60000);

      if (elapsedMinutes > gracePeriodMinutes) {
        missedList.push({
          medication: med,
          timeString: timeStr,
          scheduledDateTime: slotDate,
          minutesOverdue: elapsedMinutes,
          slotKey
        });
      }
    }
  }

  return missedList;
}
