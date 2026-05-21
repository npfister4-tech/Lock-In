import { useState, useMemo } from 'react';
import { WORKOUTS, WORKOUT_LABEL, CARDIO_DAYS, CARDIO_FINISHER, REST_TIPS } from '../data/workouts';
import { getWorkoutTypeForDate, emptyWorkoutLog, getOverloadSuggestion, isWorkoutComplete } from '../utils/workoutLogic';
import { toDateStr, getDayNumber, getDateForDay, formatDate } from '../utils/dayLogic';
import ExerciseCard from './ExerciseCard';

export default function Workout({ data, onSaveWorkout }) {
  const { startDate, workouts = {} } = data;
  const todayStr = toDateStr(new Date());
  const [viewDate, setViewDate] = useState(todayStr);
  const [showHistory, setShowHistory] = useState(false);

  const workoutType = getWorkoutTypeForDate(viewDate);
  const isToday = viewDate === todayStr;
  const isReadOnly = viewDate < todayStr;
  const dayNum = getDayNumber(startDate, viewDate);
  const dayOfWeek = new Date(viewDate + 'T00:00:00').getDay();
  const hasCardio = CARDIO_DAYS.has(dayOfWeek);

  const log = workouts[viewDate] || emptyWorkoutLog(workoutType);
  const workoutGroups = WORKOUTS[workoutType] || [];
  const restTipIndex = Math.abs(viewDate.split('-').join('').slice(-2)) % REST_TIPS.length;

  function updateExercise(exName, exLog) {
    const next = {
      ...log,
      exercises: { ...log.exercises, [exName]: exLog },
    };
    onSaveWorkout(viewDate, next);
  }

  function toggleComplete() {
    onSaveWorkout(viewDate, { ...log, complete: !log.complete });
  }

  const complete = isWorkoutComplete(log, workoutType) || log.complete;

  // Build history list — past days that have a workout (not rest)
  const historyDays = useMemo(() => {
    const days = [];
    for (let i = 1; i <= 30; i++) {
      const ds = getDateForDay(startDate, i);
      if (ds > todayStr) break;
      const type = getWorkoutTypeForDate(ds);
      if (type === 'rest') continue;
      const wlog = workouts[ds];
      days.push({ ds, dayNum: i, type, logged: !!wlog, complete: wlog?.complete || isWorkoutComplete(wlog, type) });
    }
    return days.reverse();
  }, [startDate, workouts, todayStr]);

  if (showHistory) {
    return (
      <div className="min-h-screen pb-24" style={{ background: '#080c10' }}>
        <div className="sticky top-0 z-10 px-4 py-4 flex items-center gap-3"
          style={{ background: '#080c10', borderBottom: '1px solid #21262d' }}>
          <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white text-lg">←</button>
          <h1 className="text-lg font-black text-white">Workout History</h1>
        </div>
        <div className="px-4 mt-4 space-y-2">
          {historyDays.length === 0 && (
            <p className="text-center text-gray-600 text-sm py-8">No workouts logged yet.</p>
          )}
          {historyDays.map(({ ds, dayNum, type, logged, complete }) => (
            <button
              key={ds}
              onClick={() => { setViewDate(ds); setShowHistory(false); }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all active:scale-[0.98]"
              style={{ background: '#0d1117', border: '1px solid #21262d' }}>
              <div className="text-left">
                <p className="text-sm font-bold text-white">Day {dayNum} — {WORKOUT_LABEL[type]}</p>
                <p className="text-xs text-gray-500">{formatDate(ds)}</p>
              </div>
              <span className="px-2 py-1 rounded-md text-xs font-bold"
                style={{
                  background: complete ? 'rgba(46,160,67,0.2)' : logged ? 'rgba(210,153,34,0.15)' : 'rgba(218,54,51,0.1)',
                  color: complete ? '#2ea043' : logged ? '#d29922' : '#da3633',
                }}>
                {complete ? 'Complete' : logged ? 'Partial' : 'Not logged'}
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24" style={{ background: '#080c10' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-4"
        style={{ background: '#080c10', borderBottom: '1px solid #21262d' }}>
        <div className="flex items-center justify-between">
          <div>
            {!isToday && (
              <button onClick={() => setViewDate(todayStr)} className="text-xs text-gray-500 hover:text-white mb-1 flex items-center gap-1">
                ← Back to today
              </button>
            )}
            <h1 className="text-lg font-black text-white leading-none">{WORKOUT_LABEL[workoutType]}</h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Day {Math.max(1, dayNum)} · {formatDate(viewDate)}
              {isReadOnly && <span className="ml-2 text-gray-600">(read-only)</span>}
            </p>
          </div>
          <button
            onClick={() => setShowHistory(true)}
            className="text-xs px-3 py-1.5 rounded-lg font-medium"
            style={{ background: '#161b22', border: '1px solid #21262d', color: '#8b949e' }}>
            History
          </button>
        </div>
      </div>

      {/* Rest day */}
      {workoutType === 'rest' && (
        <div className="px-4 mt-6">
          <div className="rounded-2xl p-6 text-center"
            style={{ background: '#0d1117', border: '1px solid #21262d' }}>
            <div className="text-4xl mb-3">😴</div>
            <h2 className="text-xl font-black text-white mb-2">Rest Day</h2>
            <p className="text-sm text-gray-400 leading-relaxed">{REST_TIPS[restTipIndex]}</p>
          </div>
        </div>
      )}

      {/* Workout */}
      {workoutType !== 'rest' && (
        <div className="px-4 mt-4">
          {/* Complete banner */}
          {complete && (
            <div className="mb-4 px-4 py-3 rounded-xl flex items-center gap-2"
              style={{ background: 'rgba(46,160,67,0.15)', border: '1px solid rgba(46,160,67,0.3)' }}>
              <span>💪</span>
              <span className="text-sm font-bold" style={{ color: '#2ea043' }}>Workout complete! Great session.</span>
            </div>
          )}

          {/* Muscle groups */}
          {workoutGroups.map((group) => (
            <div key={group.muscle} className="mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1" style={{ background: '#21262d' }} />
                <span className="text-xs font-black uppercase tracking-widest px-2"
                  style={{ color: '#00e5ff' }}>
                  {group.muscle}
                </span>
                <div className="h-px flex-1" style={{ background: '#21262d' }} />
              </div>

              {group.exercises.map((ex) => {
                const overload = getOverloadSuggestion(data.workouts, workoutType, ex.name, viewDate);
                return (
                  <ExerciseCard
                    key={ex.name}
                    exercise={ex}
                    logEntry={log.exercises?.[ex.name]}
                    overload={overload}
                    readOnly={isReadOnly}
                    onUpdate={(updated) => updateExercise(ex.name, updated)}
                  />
                );
              })}
            </div>
          ))}

          {/* Cardio finisher */}
          {hasCardio && (
            <div className="mb-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-px flex-1" style={{ background: '#21262d' }} />
                <span className="text-xs font-black uppercase tracking-widest px-2"
                  style={{ color: '#f97316' }}>
                  Cardio Finisher
                </span>
                <div className="h-px flex-1" style={{ background: '#21262d' }} />
              </div>
              <div className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid rgba(249,115,22,0.2)' }}>
                <p className="text-sm font-bold text-white">{CARDIO_FINISHER.primary.label}</p>
                <p className="text-xs text-gray-400 mt-1">{CARDIO_FINISHER.primary.detail}</p>
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid #21262d' }}>
                  <p className="text-xs text-gray-600 mb-1">No jump rope? Use:</p>
                  <p className="text-xs font-medium text-gray-400">{CARDIO_FINISHER.alt.label}</p>
                  <p className="text-xs text-gray-600">{CARDIO_FINISHER.alt.detail}</p>
                </div>
              </div>
            </div>
          )}

          {/* Mark complete */}
          {!isReadOnly && (
            <button
              onClick={toggleComplete}
              className="w-full py-4 rounded-xl text-base font-black tracking-wide transition-all active:scale-95 mb-2"
              style={{
                background: complete ? 'rgba(46,160,67,0.15)' : '#00e5ff',
                border: complete ? '1px solid rgba(46,160,67,0.4)' : 'none',
                color: complete ? '#2ea043' : '#080c10',
                boxShadow: complete ? 'none' : '0 0 20px rgba(0,229,255,0.3)',
              }}>
              {complete ? '✓ WORKOUT LOGGED' : 'MARK WORKOUT COMPLETE'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
