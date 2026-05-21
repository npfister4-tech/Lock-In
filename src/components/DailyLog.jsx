import { useState, useMemo } from 'react';
import { getDayNumber, formatDate, evaluateDayStatus, toDateStr } from '../utils/dayLogic';
import { MOTIVATIONS, TARGETS } from '../data/motivations';
import ProgressBar from './ProgressBar';
import MealTemplatesModal from './MealTemplatesModal';
import ManageTemplates from './ManageTemplates';

export default function DailyLog({ data, dateStr, onBack, onSave, onSaveTemplates }) {
  const dayNum = getDayNumber(data.startDate, dateStr);
  const existing = data.days[dateStr] || {};
  const todayStr = toDateStr(new Date());

  const [calories, setCalories] = useState(existing.calories ?? '');
  const [protein, setProtein] = useState(existing.protein ?? '');
  const [water, setWater] = useState(existing.water ?? 0);
  const [stretch, setStretch] = useState(existing.stretch ?? false);
  const [meals, setMeals] = useState(existing.meals ?? []);
  const [weight, setWeight] = useState(existing.weight ?? '');
  const [notes, setNotes] = useState(existing.notes ?? '');
  const [newMeal, setNewMeal] = useState({ name: '', calories: '', protein: '' });
  const [showMealForm, setShowMealForm] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showManageTemplates, setShowManageTemplates] = useState(false);

  const templates = data.templates || [];
  const quote = MOTIVATIONS[Math.min(dayNum - 1, 29)];

  const totalMealCals = useMemo(() => meals.reduce((s, m) => s + (Number(m.calories) || 0), 0), [meals]);
  const totalMealProtein = useMemo(() => meals.reduce((s, m) => s + (Number(m.protein) || 0), 0), [meals]);

  const effectiveCalories = meals.length > 0 ? totalMealCals : Number(calories) || 0;
  const effectiveProtein = meals.length > 0 ? totalMealProtein : Number(protein) || 0;

  function addMeal() {
    if (!newMeal.name) return;
    setMeals(prev => [...prev, {
      ...newMeal,
      calories: Number(newMeal.calories) || 0,
      protein: Number(newMeal.protein) || 0,
    }]);
    setNewMeal({ name: '', calories: '', protein: '' });
    setShowMealForm(false);
  }

  function addFromTemplate(template) {
    setMeals(prev => [...prev, {
      name: template.name,
      calories: template.calories,
      protein: template.protein,
    }]);
  }

  function removeMeal(i) {
    setMeals(prev => prev.filter((_, idx) => idx !== i));
  }

  function addWater(oz) {
    setWater(prev => prev + oz);
  }

  function handleSave() {
    onSave(dateStr, {
      calories: effectiveCalories,
      protein: effectiveProtein,
      water,
      stretch,
      meals,
      weight: Number(weight) || null,
      notes,
    });
  }

  const status = evaluateDayStatus(
    { calories: effectiveCalories, protein: effectiveProtein, water, stretch },
    dateStr
  );

  const criteria = [
    { label: 'Calories', met: effectiveCalories >= 2000 && effectiveCalories <= 2200 },
    { label: 'Protein ≥150g', met: effectiveProtein >= 150 },
    { label: 'Water ≥100oz', met: water >= 100 },
    { label: 'Stretched', met: stretch },
  ];

  return (
    <div className="min-h-screen pb-10" style={{ background: '#080c10' }}>

      {/* Overlays */}
      {showTemplatesModal && (
        <MealTemplatesModal
          templates={templates}
          onAdd={addFromTemplate}
          onClose={() => setShowTemplatesModal(false)}
          onManage={() => { setShowTemplatesModal(false); setShowManageTemplates(true); }}
          onAddCustom={() => setShowMealForm(true)}
        />
      )}
      {showManageTemplates && (
        <ManageTemplates
          templates={templates}
          onSave={onSaveTemplates}
          onBack={() => setShowManageTemplates(false)}
        />
      )}

      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-4 flex items-center gap-3"
        style={{ background: '#080c10', borderBottom: '1px solid #21262d' }}>
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors text-lg">←</button>
        <div>
          <h1 className="text-lg font-black text-white leading-none">Day {dayNum}</h1>
          <p className="text-xs text-gray-500">{formatDate(dateStr)}</p>
        </div>
        <div className="ml-auto">
          <span className="px-2 py-1 rounded-md text-xs font-bold uppercase"
            style={{
              background: status === 'complete' ? 'rgba(46,160,67,0.2)' : status === 'partial' ? 'rgba(210,153,34,0.2)' : 'rgba(218,54,51,0.2)',
              color: status === 'complete' ? '#2ea043' : status === 'partial' ? '#d29922' : '#da3633',
            }}>
            {status}
          </span>
        </div>
      </div>

      {/* Quote */}
      <div className="px-4 py-4 mx-4 mt-4 rounded-xl"
        style={{ background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.15)' }}>
        <p className="text-sm text-center font-medium" style={{ color: '#00e5ff' }}>
          "{quote}"
        </p>
      </div>

      <div className="px-4 mt-4 space-y-4">

        {/* Goals status */}
        <div className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Today's Goals</p>
          <div className="grid grid-cols-2 gap-2">
            {criteria.map(({ label, met }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <span style={{ color: met ? '#2ea043' : '#374151' }}>{met ? '✓' : '○'}</span>
                <span style={{ color: met ? '#2ea043' : '#8b949e' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Calories */}
        <div className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white">🔥 Calories</p>
            <span className="text-lg font-black" style={{ color: '#00e5ff' }}>
              {effectiveCalories} <span className="text-sm text-gray-500">/ 2,100</span>
            </span>
          </div>
          <ProgressBar value={effectiveCalories} max={TARGETS.calories}
            color={effectiveCalories > 2200 ? '#da3633' : '#00e5ff'} />
          {meals.length === 0 && (
            <input type="number" placeholder="Enter total calories" value={calories}
              onChange={e => setCalories(e.target.value)}
              className="mt-3 w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
              style={{ background: '#161b22', border: '1px solid #21262d' }} />
          )}
          {meals.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">Calculated from meal log below</p>
          )}
        </div>

        {/* Protein */}
        <div className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white">💪 Protein</p>
            <span className="text-lg font-black" style={{ color: '#a78bfa' }}>
              {effectiveProtein}g <span className="text-sm text-gray-500">/ 165g</span>
            </span>
          </div>
          <ProgressBar value={effectiveProtein} max={TARGETS.protein} color="#a78bfa" />
          {meals.length === 0 && (
            <input type="number" placeholder="Enter total protein (g)" value={protein}
              onChange={e => setProtein(e.target.value)}
              className="mt-3 w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
              style={{ background: '#161b22', border: '1px solid #21262d' }} />
          )}
        </div>

        {/* Water */}
        <div className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white">💧 Water</p>
            <span className="text-lg font-black" style={{ color: '#38bdf8' }}>
              {water}oz <span className="text-sm text-gray-500">/ 128oz</span>
            </span>
          </div>
          <ProgressBar value={water} max={TARGETS.water} color="#38bdf8" />
          <div className="flex gap-2 mt-3">
            {[8, 16, 32, 64].map(oz => (
              <button key={oz} onClick={() => addWater(oz)}
                className="flex-1 py-2 rounded-lg text-xs font-bold transition-all active:scale-95"
                style={{ background: '#161b22', border: '1px solid #21262d', color: '#38bdf8' }}>
                +{oz}oz
              </button>
            ))}
          </div>
          {water > 0 && (
            <button onClick={() => setWater(0)}
              className="mt-2 text-xs text-gray-600 hover:text-gray-400 transition-colors">
              Reset
            </button>
          )}
        </div>

        {/* Stretch */}
        <div className="rounded-xl p-4 flex items-center justify-between"
          style={{ background: '#0d1117', border: '1px solid #21262d' }}>
          <div>
            <p className="text-sm font-bold text-white">🧘 Morning Stretch</p>
            <p className="text-xs text-gray-500">Did you stretch today?</p>
          </div>
          <button onClick={() => setStretch(prev => !prev)}
            className="px-5 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{
              background: stretch ? 'rgba(46,160,67,0.2)' : '#161b22',
              border: `1px solid ${stretch ? '#2ea043' : '#21262d'}`,
              color: stretch ? '#2ea043' : '#8b949e',
            }}>
            {stretch ? '✓ Done' : 'Not yet'}
          </button>
        </div>

        {/* Meal log */}
        <div className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #21262d' }}>

          {/* Meal log header with Templates + Add buttons */}
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-white">🍽 Meal Log</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowTemplatesModal(true); setShowMealForm(false); }}
                className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95"
                style={{ background: 'rgba(167,139,250,0.1)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.2)' }}>
                <span>⚡</span> Templates
              </button>
              <button
                onClick={() => { setShowMealForm(prev => !prev); setShowTemplatesModal(false); }}
                className="text-xs font-bold px-2.5 py-1 rounded-lg transition-all active:scale-95"
                style={{ background: 'rgba(0,229,255,0.1)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }}>
                + Add
              </button>
            </div>
          </div>

          {/* Custom meal form */}
          {showMealForm && (
            <div className="rounded-xl p-3 mb-3 space-y-2" style={{ background: '#161b22', border: '1px solid #21262d' }}>
              <input placeholder="Meal name" value={newMeal.name}
                onChange={e => setNewMeal(p => ({ ...p, name: e.target.value }))}
                className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
                style={{ background: '#080c10', border: '1px solid #21262d' }} />
              <div className="flex gap-2">
                <input type="number" placeholder="Calories" value={newMeal.calories}
                  onChange={e => setNewMeal(p => ({ ...p, calories: e.target.value }))}
                  className="flex-1 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
                  style={{ background: '#080c10', border: '1px solid #21262d' }} />
                <input type="number" placeholder="Protein (g)" value={newMeal.protein}
                  onChange={e => setNewMeal(p => ({ ...p, protein: e.target.value }))}
                  className="flex-1 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
                  style={{ background: '#080c10', border: '1px solid #21262d' }} />
              </div>
              <button onClick={addMeal}
                className="w-full py-2 rounded-lg text-sm font-black transition-all active:scale-95"
                style={{ background: '#00e5ff', color: '#080c10' }}>
                Add Meal
              </button>
            </div>
          )}

          {/* Meal list */}
          {meals.length > 0 ? (
            <div className="space-y-2">
              {meals.map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg"
                  style={{ background: '#161b22' }}>
                  <span className="text-sm text-white font-medium truncate mr-2">{m.name}</span>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-400">{m.calories} kcal</span>
                    <span className="text-xs" style={{ color: '#a78bfa' }}>{m.protein}g P</span>
                    <button onClick={() => removeMeal(i)}
                      className="text-gray-600 hover:text-red-400 text-xs transition-colors">✕</button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 text-xs font-bold"
                style={{ borderTop: '1px solid #21262d' }}>
                <span className="text-gray-400">Total</span>
                <div className="flex gap-3">
                  <span style={{ color: '#00e5ff' }}>{totalMealCals} kcal</span>
                  <span style={{ color: '#a78bfa' }}>{totalMealProtein}g P</span>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-gray-600 text-center py-2">No meals logged yet</p>
          )}
        </div>

        {/* Weight */}
        <div className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
          <p className="text-sm font-bold text-white mb-2">⚖️ Weight</p>
          <div className="flex items-center gap-2">
            <input type="number" placeholder="lbs" value={weight}
              onChange={e => setWeight(e.target.value)}
              className="flex-1 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
              style={{ background: '#161b22', border: '1px solid #21262d' }} />
            <span className="text-gray-500 text-sm">lbs</span>
          </div>
        </div>

        {/* Notes */}
        <div className="rounded-xl p-4" style={{ background: '#0d1117', border: '1px solid #21262d' }}>
          <p className="text-sm font-bold text-white mb-2">📝 Notes</p>
          <textarea placeholder="Energy level, how work went, anything..." value={notes}
            onChange={e => setNotes(e.target.value)} rows={3}
            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none resize-none"
            style={{ background: '#161b22', border: '1px solid #21262d' }} />
        </div>

        {/* Save */}
        <button onClick={handleSave}
          className="w-full py-4 rounded-xl text-base font-black tracking-wide transition-all active:scale-95"
          style={{
            background: status === 'complete' ? '#2ea043' : '#00e5ff',
            color: '#080c10',
            boxShadow: `0 0 20px ${status === 'complete' ? 'rgba(46,160,67,0.4)' : 'rgba(0,229,255,0.3)'}`,
          }}>
          {status === 'complete' ? '✓ DAY COMPLETE — SAVE' : 'SAVE LOG'}
        </button>

      </div>
    </div>
  );
}
