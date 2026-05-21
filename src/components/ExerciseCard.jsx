import { useState, useRef } from 'react';
import { COMPOUND_LIFTS } from '../data/workouts';

export default function ExerciseCard({ exercise, logEntry, onUpdate, overload, readOnly }) {
  const [showTip, setShowTip] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const nameInputRef = useRef(null);

  const { name, sets: numSets, reps, tip, isCircuit } = exercise;
  const isCompound = COMPOUND_LIFTS.has(name);
  const isPullup = name === 'Pullups';

  // Displayed name — persisted rename takes priority over the default
  const displayName = logEntry?.customName || name;

  // Card-level weight (single field for all sets).
  // Migrate legacy entries that stored weight per-set: pull from set[0] if needed.
  const cardWeight = logEntry?.weight ?? logEntry?.sets?.[0]?.weight ?? '';

  // Sets only carry reps now. Migrate legacy {weight, reps} entries by stripping weight.
  const rawSets = logEntry?.sets || Array.from({ length: numSets }, () => ({ reps: '' }));
  const sets = rawSets.map(s => ({ reps: s.reps ?? '' }));

  const notes = logEntry?.notes || '';

  // Helpers that always send the full updated entry to onUpdate
  function patch(updates) {
    if (readOnly) return;
    onUpdate({
      weight: cardWeight,
      sets,
      notes,
      customName: logEntry?.customName || '',
      ...updates,
    });
  }

  function updateWeight(val) {
    patch({ weight: val });
  }

  function updateReps(idx, val) {
    const next = sets.map((s, i) => i === idx ? { reps: val } : s);
    patch({ sets: next });
  }

  function updateNotes(val) {
    patch({ notes: val });
  }

  function commitName(val) {
    const trimmed = val.trim();
    patch({ customName: trimmed || name });
    setEditingName(false);
  }

  // A set is done when it has reps. Weight is shared so we check it once for allDone.
  const weightFilled = isPullup || cardWeight !== '';
  const filledSets = sets.filter(s => s.reps !== '').length;
  const allDone = !isCircuit && weightFilled && filledSets === numSets;

  return (
    <div className="rounded-xl overflow-hidden mb-3"
      style={{ background: '#0d1117', border: `1px solid ${allDone ? 'rgba(46,160,67,0.4)' : '#21262d'}` }}>

      {/* Header */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">

            {/* Editable exercise name */}
            <div className="flex items-center gap-2 flex-wrap">
              {editingName ? (
                <input
                  ref={nameInputRef}
                  autoFocus
                  defaultValue={displayName}
                  onBlur={e => commitName(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitName(e.target.value);
                    if (e.key === 'Escape') setEditingName(false);
                  }}
                  className="text-sm font-bold text-white rounded-md px-2 py-0.5 outline-none min-w-0 flex-1"
                  style={{ background: '#161b22', border: '1px solid rgba(0,229,255,0.4)' }}
                />
              ) : (
                <button
                  onClick={() => !readOnly && setEditingName(true)}
                  className="text-sm font-bold text-white text-left leading-snug"
                  style={{ cursor: readOnly ? 'default' : 'text' }}
                  title={readOnly ? undefined : 'Tap to rename'}>
                  {displayName}
                  {!readOnly && (
                    <span className="ml-1.5 text-gray-600" style={{ fontSize: '10px' }}>✎</span>
                  )}
                </button>
              )}
              {isCompound && (
                <span className="text-xs px-1.5 py-0.5 rounded font-bold shrink-0"
                  style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff', fontSize: '10px' }}>
                  COMPOUND
                </span>
              )}
              {allDone && (
                <span className="text-xs px-1.5 py-0.5 rounded font-bold shrink-0"
                  style={{ background: 'rgba(46,160,67,0.2)', color: '#2ea043', fontSize: '10px' }}>
                  ✓ DONE
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs font-bold" style={{ color: '#00e5ff' }}>
                {numSets} × {reps}
              </span>
              {!isCircuit && (
                <span className="text-xs text-gray-600">{filledSets}/{numSets} sets</span>
              )}
            </div>
          </div>

          {tip && (
            <button onClick={() => setShowTip(p => !p)}
              className="text-gray-600 hover:text-gray-400 transition-colors text-xs shrink-0 mt-0.5">
              {showTip ? '✕' : '💡'}
            </button>
          )}
        </div>

        {/* Overload badge */}
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

      {/* Body */}
      <div className="px-3 pb-3">
        {!isCircuit ? (
          <>
            {/* Single shared weight field */}
            <div className="mb-3 flex items-center gap-3 px-1">
              <label className="text-xs text-gray-500 shrink-0">
                {isPullup ? 'Belt weight (lbs) — all sets' : 'Weight (lbs) — all sets'}
              </label>
              <input
                type="number"
                placeholder={isPullup ? '0 = bodyweight' : '0'}
                value={cardWeight}
                readOnly={readOnly}
                onChange={e => updateWeight(e.target.value)}
                className="w-24 rounded-lg px-2 py-1.5 text-sm text-center text-white placeholder-gray-700 outline-none"
                style={{
                  background: '#161b22',
                  border: `1px solid ${cardWeight ? 'rgba(0,229,255,0.3)' : '#21262d'}`,
                }}
              />
            </div>

            {/* Set rows — reps only */}
            <div className="grid mb-1" style={{ gridTemplateColumns: '28px 1fr' }}>
              <span className="text-xs text-gray-600 text-center">Set</span>
              <span className="text-xs text-gray-600 text-center">Reps</span>
            </div>

            {sets.map((s, i) => {
              const done = (isPullup || cardWeight !== '') && s.reps !== '';
              return (
                <div key={i} className="grid gap-1.5 mb-1.5" style={{ gridTemplateColumns: '28px 1fr' }}>
                  <div className="flex items-center justify-center">
                    <span className="text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                      style={{
                        background: done ? 'rgba(46,160,67,0.2)' : '#161b22',
                        color: done ? '#2ea043' : '#8b949e',
                      }}>
                      {i + 1}
                    </span>
                  </div>
                  <input
                    type="number"
                    placeholder="0"
                    value={s.reps}
                    readOnly={readOnly}
                    onChange={e => updateReps(i, e.target.value)}
                    className="rounded-lg px-2 py-1.5 text-sm text-center text-white placeholder-gray-700 outline-none w-full"
                    style={{ background: '#161b22', border: `1px solid ${s.reps ? 'rgba(0,229,255,0.2)' : '#21262d'}` }}
                  />
                </div>
              );
            })}
          </>
        ) : (
          <div className="space-y-1.5">
            <p className="text-xs text-gray-500 mb-2">15 knee raises + 20 bicycle crunches + 30s plank</p>
            {sets.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs font-bold w-14 text-gray-500">Round {i + 1}</span>
                <button
                  onClick={() => !readOnly && updateReps(i, s.reps ? '' : 'done')}
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
