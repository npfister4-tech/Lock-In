import { SCHEDULE, WORKOUTS, COMPOUND_LIFTS } from '../data/workouts';
import { toDateStr } from './dayLogic';

export function getWorkoutTypeForDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return SCHEDULE[d.getDay()];
}

export function getWorkoutTypeForToday() {
  return getWorkoutTypeForDate(toDateStr(new Date()));
}

// Build the default empty set structure for an exercise
export function emptySetRows(numSets) {
  return Array.from({ length: numSets }, () => ({ weight: '', reps: '' }));
}

// Build an empty workout log entry for a given type
export function emptyWorkoutLog(type) {
  if (type === 'rest') return { type, complete: false, exercises: {} };
  const groups = WORKOUTS[type] || [];
  const exercises = {};
  for (const group of groups) {
    for (const ex of group.exercises) {
      exercises[ex.name] = { sets: emptySetRows(ex.sets), notes: '' };
    }
  }
  return { type, complete: false, exercises };
}

// A set is "filled" if both weight and reps are non-empty (or it's an Ab Circuit)
function setFilled(s, exName) {
  if (exName === 'Ab Circuit') return s.reps !== '';
  return s.weight !== '' && s.reps !== '';
}

// An exercise is fully completed if all its sets are filled
function exerciseDone(logEntry, exName) {
  if (!logEntry) return false;
  return logEntry.sets.every(s => setFilled(s, exName));
}

// Returns true if the entire workout was completed (all exercises logged)
export function isWorkoutComplete(workoutLog, type) {
  if (!workoutLog || type === 'rest') return false;
  const groups = WORKOUTS[type] || [];
  for (const group of groups) {
    for (const ex of group.exercises) {
      if (!exerciseDone(workoutLog.exercises?.[ex.name], ex.name)) return false;
    }
  }
  return true;
}

// Find the last workout log of the same type before today
export function getPreviousWorkoutLog(workouts, type, beforeDate) {
  const before = new Date(beforeDate + 'T00:00:00');
  // Walk back up to 30 days
  for (let i = 1; i <= 30; i++) {
    const d = new Date(before);
    d.setDate(d.getDate() - i);
    const ds = toDateStr(d);
    const log = workouts?.[ds];
    if (log && log.type === type) return { dateStr: ds, log };
  }
  return null;
}

// Get progressive overload suggestion for an exercise
// Returns { show: bool, label: string }
export function getOverloadSuggestion(workouts, type, exName, todayStr) {
  const prev = getPreviousWorkoutLog(workouts, type, todayStr);
  if (!prev) return { show: false };

  const prevLog = prev.log;
  if (!prevLog.complete) return { show: false };

  const prevEx = prevLog.exercises?.[exName];
  if (!prevEx) return { show: false };
  if (!exerciseDone(prevEx, exName)) return { show: false };

  const isCompound = COMPOUND_LIFTS.has(exName);

  if (exName === 'Pullups') {
    // For pullups: suggest +5 lbs belt weight, or just flag it
    return { show: true, label: '+5 lbs belt or +1 rep per set' };
  }

  if (isCompound) {
    const lastWeight = Math.max(...prevEx.sets.map(s => Number(s.weight) || 0));
    if (lastWeight > 0) {
      return { show: true, label: `Try ${lastWeight + 5} lbs (+5 lbs)` };
    }
    return { show: true, label: '+5 lbs from last session' };
  }

  // Accessory — suggest +2.5 lbs or +1 rep
  const lastWeight = Math.max(...prevEx.sets.map(s => Number(s.weight) || 0));
  if (lastWeight > 0) {
    return { show: true, label: `Try ${lastWeight + 2.5} lbs or +1 rep` };
  }
  return { show: true, label: '+2.5 lbs or add a rep' };
}

// Get max weight logged for a compound across all workout history
export function getLiftHistory(workouts, exName) {
  if (!workouts) return [];
  const points = [];
  const sorted = Object.entries(workouts).sort(([a], [b]) => a.localeCompare(b));
  for (const [dateStr, log] of sorted) {
    const ex = log.exercises?.[exName];
    if (!ex) continue;
    const weights = ex.sets.map(s => Number(s.weight) || 0).filter(w => w > 0);
    if (weights.length === 0) continue;
    const maxW = Math.max(...weights);
    const d = new Date(dateStr + 'T00:00:00');
    points.push({ date: dateStr, day: `${d.getMonth() + 1}/${d.getDate()}`, weight: maxW });
  }
  return points;
}

// Get pullup volume history (total reps across all sets, or max added weight)
export function getPullupHistory(workouts) {
  if (!workouts) return [];
  const points = [];
  const sorted = Object.entries(workouts).sort(([a], [b]) => a.localeCompare(b));
  for (const [dateStr, log] of sorted) {
    const ex = log.exercises?.['Pullups'];
    if (!ex) continue;
    const totalReps = ex.sets.reduce((s, set) => s + (Number(set.reps) || 0), 0);
    if (totalReps === 0) continue;
    const addedWeight = Math.max(...ex.sets.map(s => Number(s.weight) || 0));
    const d = new Date(dateStr + 'T00:00:00');
    points.push({
      date: dateStr,
      day: `${d.getMonth() + 1}/${d.getDate()}`,
      totalReps,
      addedWeight,
    });
  }
  return points;
}
