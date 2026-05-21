import { useState, useEffect, useCallback } from 'react';
import { loadData, initData, updateDay, updateWorkout, updateTemplates, DEFAULT_TEMPLATES } from './utils/storage';
import { toDateStr } from './utils/dayLogic';
import Onboarding from './components/Onboarding';
import Dashboard from './components/Dashboard';
import DailyLog from './components/DailyLog';
import Workout from './components/Workout';
import Stats from './components/Stats';
import './index.css';

const TABS = [
  { id: 'dashboard', label: 'Home', icon: '🏠' },
  { id: 'workout',   label: 'Workout', icon: '💪' },
  { id: 'stats',     label: 'Stats', icon: '📈' },
];

export default function App() {
  const [data, setData] = useState(null);
  const [screen, setScreen] = useState('loading');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const saved = loadData();
    if (saved?.startDate) {
      if (!saved.workouts) saved.workouts = {};
      if (!saved.templates) saved.templates = DEFAULT_TEMPLATES;
      setData(saved);
      setScreen('app');
    } else {
      setScreen('onboarding');
    }
  }, []);

  const handleStart = useCallback(() => {
    const today = toDateStr(new Date());
    const fresh = initData(today);
    fresh.workouts = {};
    setData(fresh);
    setScreen('app');
  }, []);

  const handleSelectDay = useCallback((dateStr) => {
    setSelectedDate(dateStr);
    setScreen('daily-log');
  }, []);

  const handleSaveDay = useCallback((dateStr, dayData) => {
    setData(prev => updateDay(prev, dateStr, dayData));
    setScreen('app');
  }, []);

  const handleSaveWorkout = useCallback((dateStr, workoutLog) => {
    setData(prev => updateWorkout(prev, dateStr, workoutLog));
  }, []);

  const handleSaveTemplates = useCallback((templates) => {
    setData(prev => updateTemplates(prev, templates));
  }, []);

  const handleReset = useCallback(() => {
    localStorage.clear();
    setData(null);
    setActiveTab('dashboard');
    setScreen('onboarding');
  }, []);

  if (screen === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080c10' }}>
        <div className="text-2xl font-black" style={{ color: '#00e5ff' }}>LOCK IN</div>
      </div>
    );
  }

  if (screen === 'onboarding') {
    return <Onboarding onStart={handleStart} />;
  }

  if (!data) return null;

  if (screen === 'daily-log' && selectedDate) {
    return (
      <DailyLog
        data={data}
        dateStr={selectedDate}
        onBack={() => setScreen('app')}
        onSave={handleSaveDay}
        onSaveTemplates={handleSaveTemplates}
      />
    );
  }

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#080c10' }}>
      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <Dashboard
            data={data}
            onSelectDay={handleSelectDay}
          />
        )}
        {activeTab === 'workout' && (
          <Workout
            data={data}
            onSaveWorkout={handleSaveWorkout}
          />
        )}
        {activeTab === 'stats' && (
          <Stats data={data} onReset={handleReset} />
        )}
      </div>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-safe"
        style={{ background: '#0d1117', borderTop: '1px solid #21262d' }}>
        <div className="flex items-center justify-around py-2 max-w-lg mx-auto">
          {TABS.map(({ id, label, icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className="flex flex-col items-center gap-0.5 px-6 py-2 rounded-xl transition-all"
                style={{ color: active ? '#00e5ff' : '#8b949e' }}>
                <span className="text-xl">{icon}</span>
                <span className="text-xs font-semibold">{label}</span>
                {active && (
                  <div className="w-1 h-1 rounded-full" style={{ background: '#00e5ff' }} />
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
