import { TARGETS } from '../data/motivations';

export function toDateStr(date) {
  return date.toISOString().split('T')[0];
}

export function getDayNumber(startDate, dateStr) {
  const start = new Date(startDate + 'T00:00:00');
  const target = new Date(dateStr + 'T00:00:00');
  return Math.floor((target - start) / 86400000) + 1;
}

export function getDateForDay(startDate, dayNum) {
  const d = new Date(startDate + 'T00:00:00');
  d.setDate(d.getDate() + dayNum - 1);
  return toDateStr(d);
}

export function evaluateDayStatus(dayData, dateStr) {
  const todayStr = toDateStr(new Date());
  const dayNum = new Date(dateStr + 'T00:00:00');
  const today = new Date(todayStr + 'T00:00:00');

  if (dayNum > today) return 'locked';

  if (!dayData) return 'incomplete';

  const { calories = 0, protein = 0, water = 0, stretch = false } = dayData;

  const criteria = [
    calories >= 2000 && calories <= 2200,
    protein >= 150,
    water >= 100,
    stretch === true,
  ];

  const met = criteria.filter(Boolean).length;

  if (met === 4) return 'complete';
  if (met >= 2) return 'partial';
  return 'incomplete';
}

export function computeStreak(startDate, days) {
  const todayStr = toDateStr(new Date());
  let streak = 0;
  let cursor = new Date(todayStr + 'T00:00:00');

  while (true) {
    const ds = toDateStr(cursor);
    const dayNum = getDayNumber(startDate, ds);
    if (dayNum < 1 || dayNum > 30) break;

    const status = evaluateDayStatus(days[ds], ds);
    if (status !== 'complete') break;

    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function computeStats(startDate, days) {
  const todayStr = toDateStr(new Date());
  let daysComplete = 0;
  let daysLogged = 0;

  for (let i = 1; i <= 30; i++) {
    const ds = getDateForDay(startDate, i);
    if (ds > todayStr) break;
    const status = evaluateDayStatus(days[ds], ds);
    if (status === 'complete') daysComplete++;
    if (days[ds]) daysLogged++;
  }

  const today = new Date(todayStr + 'T00:00:00');
  const start = new Date(startDate + 'T00:00:00');
  const daysPassed = Math.min(30, Math.floor((today - start) / 86400000) + 1);
  const daysRemaining = Math.max(0, 30 - daysPassed);
  const completionPct = daysPassed > 0 ? Math.round((daysComplete / daysPassed) * 100) : 0;

  return { daysComplete, daysRemaining, completionPct, daysPassed, daysLogged };
}

export function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}
