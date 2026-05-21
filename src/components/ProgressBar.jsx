export default function ProgressBar({ value, max, color = '#00e5ff', label, unit, showPct = false }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  const over = value > max;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-baseline mb-1">
          <span className="text-xs text-gray-400 uppercase tracking-wider">{label}</span>
          <span className="text-xs font-medium" style={{ color: over ? '#da3633' : '#8b949e' }}>
            {value}{unit} / {max}{unit} {showPct && `(${pct}%)`}
          </span>
        </div>
      )}
      <div className="w-full rounded-full h-2" style={{ background: '#21262d' }}>
        <div
          className="h-2 rounded-full progress-bar-fill"
          style={{
            width: `${pct}%`,
            background: over ? '#da3633' : color,
            boxShadow: pct > 0 ? `0 0 8px ${over ? '#da363360' : color + '60'}` : 'none',
          }}
        />
      </div>
    </div>
  );
}
