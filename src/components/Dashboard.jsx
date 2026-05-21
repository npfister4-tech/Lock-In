import { useMemo } from 'react';
import {
  toDateStr, getDayNumber, getDateForDay,
  evaluateDayStatus, computeStreak, computeStats
} from '../utils/dayLogic';

const STATUS_COLORS = {
  locked: '#21262d',
  incomplete: '#da3633',
  partial: '#d29922',
  complete: '#2ea043',
};

const STATUS_BG = {
  locked: '#0d1117',
  incomplete: 'rgba(218,54,51,0.15)',
  partial: 'rgba(210,153,34,0.15)',
  complete: 'rgba(46,160,67,0.15)',
};

export default function Dashboard({ data, onSelectDay }) {
  const { startDate, days } = data;
  const todayStr = toDateStr(new Date());
  const todayDayNum = getDayNumber(startDate, todayStr);

  const streak = useMemo(() => computeStreak(startDate, days), [startDate, days]);
  const stats = useMemo(() => computeStats(startDate, days), [startDate, days]);

  const hour = new Date().getHours();
  const showReminder = hour >= 21 && evaluateDayStatus(days[todayStr], todayStr) !== 'complete';

  const tiles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const dayNum = i + 1;
      const ds = getDateForDay(startDate, dayNum);
      const status = evaluateDayStatus(days[ds], ds);
      const isToday = ds === todayStr;
      return { dayNum, ds, status, isToday };
    });
  }, [startDate, days, todayStr]);

  const statCards = [
    { label: 'Streak', value: streak, unit: streak === 1 ? 'day' : 'days', icon: '🔥' },
    { label: 'Complete', value: stats.daysComplete, unit: 'days', icon: '✅' },
    { label: 'Remaining', value: stats.daysRemaining, unit: 'days', icon: '⏳' },
    { label: 'On Track', value: stats.completionPct, unit: '%', icon: '📈' },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080c10' }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight" style={{ color: '#00e5ff' }}>
            LOCK IN
          </h1>
          <p className="text-gray-400 text-sm">
            Day {Math.max(1, Math.min(30, todayDayNum))} of 30
          </p>
        </div>
      </div>

      {/* Late reminder */}
      {showReminder && (
        <div className="mx-4 mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2"
          style={{ background: 'rgba(210,153,34,0.15)', border: '1px solid rgba(210,153,34,0.3)', color: '#d29922' }}>
          <span>⚠️</span>
          <span>It's past 9pm — don't forget to log today's stats!</span>
        </div>
      )}

      {/* Stat cards */}
      <div className="px-4 grid grid-cols-4 gap-2 mb-6">
        {statCards.map(({ label, value, unit, icon }) => (
          <div key={label} className="rounded-xl p-3 text-center"
            style={{ background: '#0d1117', border: '1px solid #21262d' }}>
            <div className="text-lg mb-1">{icon}</div>
            <div className="text-xl font-black text-white">{value}</div>
            <div className="text-xs text-gray-500">{unit}</div>
            <div className="text-xs text-gray-600 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* 30-day grid */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            30-Day Grid
          </h2>
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#2ea043' }} />Done</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#d29922' }} />Partial</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ background: '#da3633' }} />Miss</span>
          </div>
        </div>

        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
          {tiles.map(({ dayNum, ds, status, isToday }) => {
            const isLocked = status === 'locked';
            return (
              <button
                key={dayNum}
                onClick={() => !isLocked && onSelectDay(ds)}
                disabled={isLocked}
                className="relative rounded-xl flex flex-col items-center justify-center transition-all active:scale-95"
                style={{
                  aspectRatio: '1',
                  background: STATUS_BG[status],
                  border: isToday
                    ? '2px solid #00e5ff'
                    : `1px solid ${STATUS_COLORS[status]}40`,
                  cursor: isLocked ? 'default' : 'pointer',
                  boxShadow: isToday ? '0 0 12px rgba(0,229,255,0.3)' : 'none',
                }}>
                <span className="text-xs font-bold" style={{
                  color: isLocked ? '#374151' : isToday ? '#00e5ff' : STATUS_COLORS[status]
                }}>
                  {dayNum}
                </span>
                {status === 'complete' && (
                  <span className="text-xs">✓</span>
                )}
                {status === 'partial' && (
                  <span className="text-xs">~</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Week labels */}
        <div className="grid mt-2 text-xs text-gray-600"
          style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
          {['W1', '', '', '', '', '', 'W2', '', '', '', '', '', 'W3', '', '', '', '', '', 'W4', '', '', '', '', '', 'W5', '', '', '', '', ''].slice(0, 30).map((label, i) => (
            <div key={i} className="text-center">{label}</div>
          ))}
        </div>
      </div>

      {/* Targets quick ref */}
      <div className="px-4 mt-6">
        <div className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Daily Targets</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['🔥', '2,100 kcal', 'Calories'],
              ['💪', '165g', 'Protein'],
              ['💧', '128 oz', 'Water (1 gal)'],
              ['🧘', 'Daily', 'Morning stretch'],
            ].map(([icon, val, label]) => (
              <div key={label} className="flex items-center gap-2">
                <span>{icon}</span>
                <div>
                  <div className="text-white text-sm font-bold">{val}</div>
                  <div className="text-gray-500 text-xs">{label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tap hint */}
      <p className="text-center text-gray-600 text-xs mt-4">
        Tap any day to log your stats
      </p>
    </div>
  );
}
