const KEY = 'lockin_v1';

export const DEFAULT_TEMPLATES = [
  { id: 'preset-1', name: 'Ground Beef Burrito', calories: 505, protein: 27 },
];

export function loadData() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveData(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function initData(startDate) {
  const data = { startDate, days: {}, workouts: {}, templates: DEFAULT_TEMPLATES };
  saveData(data);
  return data;
}

export function updateDay(data, dateStr, updates) {
  const next = {
    ...data,
    days: {
      ...data.days,
      [dateStr]: { ...(data.days[dateStr] || {}), ...updates },
    },
  };
  saveData(next);
  return next;
}

export function updateWorkout(data, dateStr, workoutLog) {
  const next = {
    ...data,
    workouts: {
      ...(data.workouts || {}),
      [dateStr]: workoutLog,
    },
  };
  saveData(next);
  return next;
}

export function updateTemplates(data, templates) {
  const next = { ...data, templates };
  saveData(next);
  return next;
}
