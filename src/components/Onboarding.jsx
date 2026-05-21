export default function Onboarding({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: 'linear-gradient(135deg, #080c10 0%, #0d1117 100%)' }}>

      <div className="mb-8">
        <div className="text-6xl mb-4">⚡</div>
        <h1 className="text-5xl font-black tracking-tight mb-2"
          style={{ color: '#00e5ff', letterSpacing: '-2px' }}>
          LOCK IN
        </h1>
        <p className="text-gray-400 text-lg">30-Day Transformation Challenge</p>
      </div>

      <div className="rounded-2xl p-6 mb-8 max-w-sm w-full"
        style={{ background: '#0d1117', border: '1px solid #21262d' }}>
        <p className="text-3xl font-bold text-white mb-1">Day 1 of 30.</p>
        <p className="text-2xl font-bold mb-6" style={{ color: '#00e5ff' }}>Lock in.</p>

        <div className="space-y-3 text-left text-sm">
          {[
            ['🎯', 'Goal', 'Visible abs + maintain muscle'],
            ['🔥', 'Calories', '2,100 kcal / day'],
            ['💪', 'Protein', '165g / day'],
            ['💧', 'Water', '1 gallon (128 oz) / day'],
            ['🧘', 'Stretch', 'Morning stretch daily'],
          ].map(([icon, label, value]) => (
            <div key={label} className="flex items-center gap-3">
              <span className="text-lg">{icon}</span>
              <div>
                <span className="text-gray-400">{label}: </span>
                <span className="text-white font-medium">{value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onStart}
        className="w-full max-w-sm py-4 rounded-xl text-lg font-black tracking-wide transition-all active:scale-95"
        style={{
          background: '#00e5ff',
          color: '#080c10',
          boxShadow: '0 0 30px rgba(0,229,255,0.4)',
        }}>
        START DAY 1 →
      </button>

      <p className="text-gray-600 text-xs mt-4">Your 30-day clock starts today</p>
    </div>
  );
}
