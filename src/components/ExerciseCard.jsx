import { useState } from 'react';
import { COMPOUND_LIFTS } from '../data/workouts';

export default function ExerciseCard({ exercise, logEntry, onUpdate, overload, readOnly }) {
  const [showTip, setShowTip] = useState(false);
  const { name, sets: numSets, reps, tip, isCircuit } = exercise;
  const isCompound = COMPOUND_LIFTS.has(name);
  const isPullup = name === 'Pullups';

  const sets = logEntry?.sets || Array.from({ length: numSets }, () => ({ weight: '', reps: '' }));
  const notes = logEntry?.notes || '';

  function updateSet(idx, field, val) {
    if (readOnly) return;
    const next = sets.map((s, i) => i === idx ? { ...s, [field]: val } : s);
    onUpdate({ sets: next, notes });
  }

  function updateNotes(val) {
    if (readOnly) return;
    onUpdate({ sets, notes: val });
  }

  const filledSets = sets.filter(s => {
    if (isCircuit) return s.reps !== '';
    return s.weight !== '' && s.reps !== '';
  }).length;
  const allDone = filledSets === numSets;

  return (
    <div className="rounded-xl overflow-hidden mb-3"
      style={{ background: '#0d1117', border: `1px solid ${allDone ? 'rgba(46,160,67,0.4)' : '#21262d'}` }}>

      {/* Exercise header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-white">{name}</span>
              {isCompound && (
                <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                  style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff', fontSize: '10px' }}>
                  COMPOUND
                </span>
              )}
              {allDone && (
                <span className="text-xs px-1.5 py-0.5 rounded font-bold"
                  style={{ background: 'rgba(46,160,67,0.2)', color: '#2ea043', fontSize: '10px' }}>
                  ✓ DONE
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold" style={{ color: '#00e5ff' }}>
                {numSets} × {reps}
              </span>
              <span className="text-xs text-gray-600">{filledSets}/{numSets} sets</span>
            </div>
          </div>
          {tip && (
            <button onClick={() => setShowTip(p => !p)}
              className="text-gray-600 hover:text-gray-400 transition-colors text-xs shrink-0 mt-0.5">
              {showTip ? '✕' : '💡'}
            </button>
          )}
        </div>

        {/* Progressive overload badge */}
        {overload?.show && (
          <div className="mt-2 px-2 py-1.5 rounded-lg flex items-center gap-1.5"
            style={{ background: 'rgba(210,153,34,0.1)', border: '1px solid rgba(210,153,34,0.2)' }}>
            <span className="text-xs">📈</span>
            <span className="text-xs font-medium" style={{ color: '#d29922' }}>
              Overload: {overload.label}
            </span>
          </div>
        )}

        {/* Tip */}
        {showTip && tip && (
          <div className="mt-2 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(0,229,255,0.04)', border: '1px solid rgba(0,229,255,0.1)' }}>
            <p className="text-xs" style={{ color: '#8b949e' }}>{tip}</p>
          </div>
        )}
      </div>

      {/* Set rows */}
      <div className="px-3 pb-3">
        {!isCircuit ? (
          <>
            {/* Column headers */}
            <div className="grid mb-1" style={{ gridTemplateColumns: '28px 1fr 1fr' }}>
              <span className="text-xs text-gray-600 text-center">Set</span>
              <span className="text-xs text-gray-600 text-center">
                {isPullup ? 'Belt +lbs' : 'Weight (lbs)'}
              </span>
              <span className="text-xs text-gray-600 text-center">Reps</span>
            </div>

            {sets.map((s, i) => (
              <div key={i} className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: '28px 1fr 1fr' }}>
                <div className="flex items-center justify-center">
                  <span className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                    style={{
                      background: (isPullup ? s.reps !== '' : s.weight !== '' && s.reps !== '')
                        ? 'rgba(46,160,67,0.2)' : '#161b22',
                      color: (isPullup ? s.reps !== '' : s.weight !== '' && s.reps !== '')
                        ? '#2ea043' : '#8b949e',
                    }}>
                    {i + 1}
                  </span>
                </div>
                <input
                  type="number"
                  placeholder={isPullup ? 'BW / +lbs' : '0'}
                  value={s.weight}
                  readOnly={readOnly}
                  onChange={e => updateSet(i, 'weight', e.target.value)}
                  className="rounded-lg px-2 py-1.5 text-sm text-center text-white placeholder-gray-700 outline-none w-full"
                  style={{ background: '#161b22', border: `1px solid ${s.weight ? 'rgba(0,229,255,0.2)' : '#21262d'}` }}
                />
                <input
                  type="number"
                  placeholder="0"
                  value={s.reps}
                  readOnly={readOnly}
                  onChange={e => updateSet(i, 'reps', e.target.value)}
                  className="rounded-lg px-2 py-1.5 text-sm text-center text-white placeholder-gray-700 outline-none w-full"
                  style={{ background: '#161b22', border: `1px solid ${s.reps ? 'rgba(0,229,255,0.2)' : '#21262d'}` }}
                />
              </div>
            ))}
          </>
        ) : (
          /* Ab circuit — just track rounds completed */
          <div className="space-y-1.5">
            <p className="text-xs text-gray-500 mb-2">15 knee raises + 20 bicycle crunches + 30s plank</p>
            {sets.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-bold w-14 text-gray-500">Round {i + 1}</span>
                <button
                  onClick={() => !readOnly && updateSet(i, 'reps', s.reps ? '' : 'done')}
                  className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all active:scale-95"
                  style={{
                    background: s.reps ? 'rgba(46,160,67,0.2)' : '#161b22',
                    border: `1px solid ${s.reps ? 'rgba(46,160,67,0.4)' : '#21262d'}`,
                    color: s.reps ? '#2ea043' : '#8b949e',
                  }}>
                  {s.reps ? '✓ Completed' : 'Mark Done'}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        <input
          type="text"
          placeholder="Notes (optional)"
          value={notes}
          readOnly={readOnly}
          onChange={e => updateNotes(e.target.value)}
          className="mt-2 w-full rounded-lg px-3 py-1.5 text-xs text-white placeholder-gray-700 outline-none"
          style={{ background: '#161b22', border: '1px solid #21262d' }}
        />
      </div>
    </div>
  );
}
