import { useMemo, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';
import { getDateForDay, evaluateDayStatus, toDateStr } from '../utils/dayLogic';
import { getLiftHistory, getPullupHistory } from '../utils/workoutLogic';

export default function Stats({ data, onBack, onReset }) {
  const { startDate, days, workouts = {} } = data;
  const todayStr = toDateStr(new Date());

  const allDays = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const dayNum = i + 1;
      const ds = getDateForDay(startDate, dayNum);
      const d = days[ds] || {};
      return { dayNum, ds, ...d };
    }).filter(d => d.ds <= todayStr && d.weight);
  }, [startDate, days, todayStr]);

  const weightData = allDays.map(d => ({
    day: `D${d.dayNum}`,
    weight: d.weight,
  }));

  const weeks = useMemo(() => {
    return [1, 2, 3, 4].map(w => {
      const start = (w - 1) * 7 + 1;
      const weekDays = Array.from({ length: 7 }, (_, i) => {
        const ds = getDateForDay(startDate, start + i);
        if (ds > todayStr) return null;
        return days[ds] || null;
      }).filter(Boolean);

      if (weekDays.length === 0) return { w, empty: true };
      const n = weekDays.length;
      return {
        w, empty: false,
        avgCals: Math.round(weekDays.reduce((s, d) => s + (d.calories || 0), 0) / n),
        avgProtein: Math.round(weekDays.reduce((s, d) => s + (d.protein || 0), 0) / n),
        avgWater: Math.round(weekDays.reduce((s, d) => s + (d.water || 0), 0) / n),
        stretchRate: Math.round((weekDays.filter(d => d.stretch).length / n) * 100),
      };
    });
  }, [startDate, days, todayStr]);

  const totals = useMemo(() => {
    let daysComplete = 0, totalProtein = 0, totalCals = 0, logged = 0, maxStreak = 0, curStreak = 0;
    for (let i = 1; i <= 30; i++) {
      const ds = getDateForDay(startDate, i);
      if (ds > todayStr) break;
      const d = days[ds];
      if (evaluateDayStatus(d, ds) === 'complete') { daysComplete++; curStreak++; maxStreak = Math.max(maxStreak, curStreak); } else { curStreak = 0; }
      if (d) { totalProtein += d.protein || 0; totalCals += d.calories || 0; logged++; }
    }
    return { daysComplete, maxStreak, avgProtein: logged ? Math.round(totalProtein / logged) : 0, avgCals: logged ? Math.round(totalCals / logged) : 0 };
  }, [startDate, days, todayStr]);

  // Lift histories
  const benchData = useMemo(() => getLiftHistory(workouts, 'Barbell Bench Press'), [workouts]);
  const squatData = useMemo(() => getLiftHistory(workouts, 'Barbell Back Squat'), [workouts]);
  const pullupData = useMemo(() => getPullupHistory(workouts), [workouts]);

  const CustomTooltip = ({ active, payload, label, unit = 'lbs' }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg px-3 py-2 text-sm" style={{ background: '#161b22', border: '1px solid #21262d', color: '#e6edf3' }}>
        <p className="font-bold text-xs text-gray-400">{label}</p>
        <p className="font-black" style={{ color: '#00e5ff' }}>{payload[0].value} {unit}</p>
        {payload[1] && <p className="font-black" style={{ color: '#a78bfa' }}>{payload[1].value} {unit}</p>}
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080c10' }}>
      <div className="sticky top-0 z-10 px-4 py-4 flex items-center gap-3"
        style={{ background: '#080c10', borderBottom: '1px solid #21262d' }}>
        <h1 className="text-lg font-black text-white">Stats & Progress</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Totals */}
        <div className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Overall</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Days Complete', value: totals.daysComplete, color: '#2ea043' },
              { label: 'Longest Streak', value: `${totals.maxStreak}d`, color: '#00e5ff' },
              { label: 'Avg Protein', value: `${totals.avgProtein}g`, color: '#a78bfa' },
              { label: 'Avg Calories', value: totals.avgCals, color: '#f97316' },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-3" style={{ background: '#161b22', border: '1px solid #21262d' }}>
                <div className="text-2xl font-black" style={{ color }}>{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Weight trend */}
        <LiftChart
          title="Bodyweight Trend"
          data={weightData}
          dataKey="weight"
          color="#00e5ff"
          unit="lbs"
          emptyMsg="Log weight on 2+ days to see your trend"
          yLabel="lbs"
        />

        {/* Bench chart */}
        <LiftChart
          title="Bench Press — Max Weight"
          data={benchData}
          dataKey="weight"
          color="#f97316"
          unit="lbs"
          emptyMsg="Log bench press in your workout to track progress"
          yLabel="lbs"
        />

        {/* Squat chart */}
        <LiftChart
          title="Back Squat — Max Weight"
          data={squatData}
          dataKey="weight"
          color="#a78bfa"
          unit="lbs"
          emptyMsg="Log squats in your workout to track progress"
          yLabel="lbs"
        />

        {/* Pullups chart */}
        <div className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Pullups — Total Reps</p>
          {pullupData.length >= 2 ? (
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={pullupData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="day" tick={{ fill: '#8b949e', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                <Tooltip content={<CustomTooltip unit="reps" />} />
                <Line type="monotone" dataKey="totalReps" stroke="#2ea043" strokeWidth={2}
                  dot={{ fill: '#2ea043', r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#2ea043', strokeWidth: 0 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[160px] flex items-center justify-center">
              <p className="text-gray-600 text-sm text-center">Log pullups in your workout to track progress</p>
            </div>
          )}
        </div>

        {/* Weekly summaries */}
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Weekly Breakdown</p>

          <div className="space-y-3">
            {weeks.map(({ w, empty, avgCals, avgProtein, avgWater, stretchRate }) => (
              <div key={w} className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
                <p className="text-sm font-bold text-white mb-3">Week {w}</p>
                {empty ? (
                  <p className="text-xs text-gray-600">No data yet</p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <StatItem label="Avg Calories" value={avgCals} unit="kcal" target={2100} color="#f97316" />
                    <StatItem label="Avg Protein" value={avgProtein} unit="g" target={165} color="#a78bfa" />
                    <StatItem label="Avg Water" value={avgWater} unit="oz" target={128} color="#38bdf8" />
                    <StatItem label="Stretch Rate" value={stretchRate} unit="%" target={100} color="#2ea043" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Reset */}
        <ResetButton onReset={onReset} />

      </div>
    </div>
  );
}

function ResetButton({ onReset }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Danger Zone</p>
      {!confirming ? (
        <button
          onClick={() => setConfirming(true)}
          className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
          style={{ background: 'rgba(218,54,51,0.1)', border: '1px solid rgba(218,54,51,0.25)', color: '#da3633' }}>
          Reset App
        </button>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-gray-400 text-center">
            This deletes <span className="text-white font-bold">all 30 days</span> of logs, workouts, and templates. Cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setConfirming(false)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95"
              style={{ background: '#161b22', border: '1px solid #21262d', color: '#8b949e' }}>
              Cancel
            </button>
            <button
              onClick={onReset}
              className="flex-1 py-2.5 rounded-xl text-sm font-black transition-all active:scale-95"
              style={{ background: '#da3633', color: '#fff' }}>
              Yes, reset everything
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LiftChart({ title, data, dataKey, color, unit, emptyMsg }) {
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="rounded-lg px-3 py-2 text-sm" style={{ background: '#161b22', border: '1px solid #21262d' }}>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="font-black" style={{ color }}>{payload[0].value} {unit}</p>
      </div>
    );
  };

  return (
    <div className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">{title}</p>
      {data.length >= 2 ? (
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
            <XAxis dataKey="day" tick={{ fill: '#8b949e', fontSize: 10 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#8b949e', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2}
              dot={{ fill: color, r: 3, strokeWidth: 0 }}
              activeDot={{ r: 5, fill: color, strokeWidth: 0 }} />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[160px] flex items-center justify-center">
          <p className="text-gray-600 text-sm text-center">{emptyMsg}</p>
        </div>
      )}
    </div>
  );
}

function StatItem({ label, value, unit, target, color }) {
  const pct = Math.min(100, Math.round((value / target) * 100));
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-gray-500">{label}</span>
        <span style={{ color }} className="font-bold">{value}{unit}</span>
      </div>
      <div className="w-full h-1.5 rounded-full" style={{ background: '#21262d' }}>
        <div className="h-1.5 rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
