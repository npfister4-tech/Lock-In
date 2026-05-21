export default function MealTemplatesModal({ templates, onAdd, onManage, onClose, onAddCustom }) {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>

      <div className="rounded-t-2xl overflow-hidden flex flex-col max-h-[80vh]"
        style={{ background: '#0d1117', borderTop: '1px solid #21262d' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 shrink-0"
          style={{ borderBottom: '1px solid #21262d' }}>
          <h2 className="text-base font-black text-white">Meal Templates</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={onManage}
              className="text-xs font-semibold transition-colors"
              style={{ color: '#00e5ff' }}>
              Manage →
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-white transition-colors"
              style={{ background: '#161b22' }}>
              ✕
            </button>
          </div>
        </div>

        {/* Template list */}
        <div className="overflow-y-auto flex-1">
          {templates.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-gray-500 text-sm">No templates yet.</p>
              <p className="text-gray-600 text-xs mt-1">Tap "Manage →" to create one.</p>
            </div>
          ) : (
            <div className="p-3 space-y-2">
              {templates.map(t => (
                <div key={t.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: '#161b22', border: '1px solid #21262d' }}>
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-bold text-white truncate">{t.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#8b949e' }}>
                      <span style={{ color: '#00e5ff' }}>{t.calories} kcal</span>
                      <span className="mx-1.5 text-gray-700">·</span>
                      <span style={{ color: '#a78bfa' }}>{t.protein}g protein</span>
                    </p>
                  </div>
                  <button
                    onClick={() => { onAdd(t); onClose(); }}
                    className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl font-black text-lg transition-all active:scale-90"
                    style={{ background: 'rgba(0,229,255,0.12)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }}>
                    +
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add custom — pinned at bottom */}
        <div className="px-4 py-4 shrink-0" style={{ borderTop: '1px solid #21262d' }}>
          <button
            onClick={() => { onAddCustom(); onClose(); }}
            className="w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95"
            style={{ background: '#161b22', border: '1px dashed #374151', color: '#8b949e' }}>
            + Add custom meal instead
          </button>
        </div>

      </div>
    </div>
  );
}
