import { useState } from 'react';

function TemplateForm({ initial, onSave, onCancel }) {
  const [name, setName] = useState(initial?.name ?? '');
  const [calories, setCalories] = useState(initial?.calories ?? '');
  const [protein, setProtein] = useState(initial?.protein ?? '');

  function submit() {
    if (!name.trim()) return;
    onSave({ name: name.trim(), calories: Number(calories) || 0, protein: Number(protein) || 0 });
  }

  return (
    <div className="rounded-xl p-4 space-y-3"
      style={{ background: '#161b22', border: '1px solid rgba(0,229,255,0.2)' }}>
      <input
        autoFocus
        placeholder="Meal name (e.g. Chicken Rice Bowl)"
        value={name}
        onChange={e => setName(e.target.value)}
        className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
        style={{ background: '#080c10', border: '1px solid #21262d' }}
      />
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-1">Calories</label>
          <input
            type="number"
            placeholder="0"
            value={calories}
            onChange={e => setCalories(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
            style={{ background: '#080c10', border: '1px solid #21262d' }}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 block mb-1">Protein (g)</label>
          <input
            type="number"
            placeholder="0"
            value={protein}
            onChange={e => setProtein(e.target.value)}
            className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 outline-none"
            style={{ background: '#080c10', border: '1px solid #21262d' }}
          />
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCancel}
          className="flex-1 py-2 rounded-lg text-sm font-semibold text-gray-400 transition-all active:scale-95"
          style={{ background: '#21262d' }}>
          Cancel
        </button>
        <button
          onClick={submit}
          disabled={!name.trim()}
          className="flex-1 py-2 rounded-lg text-sm font-black transition-all active:scale-95"
          style={{
            background: name.trim() ? '#00e5ff' : '#21262d',
            color: name.trim() ? '#080c10' : '#374151',
          }}>
          Save
        </button>
      </div>
    </div>
  );
}

export default function ManageTemplates({ templates, onSave, onBack }) {
  const [editing, setEditing] = useState(null);   // id being edited, or 'new'
  const [confirmDelete, setConfirmDelete] = useState(null); // id to confirm delete

  function handleCreate(fields) {
    const next = [...templates, { id: Date.now().toString(), ...fields }];
    onSave(next);
    setEditing(null);
  }

  function handleEdit(id, fields) {
    const next = templates.map(t => t.id === id ? { ...t, ...fields } : t);
    onSave(next);
    setEditing(null);
  }

  function handleDelete(id) {
    onSave(templates.filter(t => t.id !== id));
    setConfirmDelete(null);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: '#080c10' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-4 shrink-0"
        style={{ borderBottom: '1px solid #21262d' }}>
        <button onClick={onBack} className="text-gray-400 hover:text-white transition-colors text-lg">←</button>
        <h1 className="text-lg font-black text-white">Manage Templates</h1>
        <button
          onClick={() => { setEditing('new'); setConfirmDelete(null); }}
          className="ml-auto px-3 py-1.5 rounded-lg text-xs font-black transition-all active:scale-95"
          style={{ background: 'rgba(0,229,255,0.12)', color: '#00e5ff', border: '1px solid rgba(0,229,255,0.2)' }}>
          + New
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">

        {/* New template form */}
        {editing === 'new' && (
          <TemplateForm
            onSave={handleCreate}
            onCancel={() => setEditing(null)}
          />
        )}

        {templates.length === 0 && editing !== 'new' && (
          <div className="py-12 text-center">
            <p className="text-gray-500 text-sm">No templates yet.</p>
            <p className="text-gray-600 text-xs mt-1">Tap "+ New" to create your first one.</p>
          </div>
        )}

        {templates.map(t => (
          <div key={t.id}>
            {editing === t.id ? (
              <TemplateForm
                initial={t}
                onSave={fields => handleEdit(t.id, fields)}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <div className="rounded-xl px-4 py-3"
                style={{ background: '#0d1117', border: `1px solid ${confirmDelete === t.id ? 'rgba(218,54,51,0.4)' : '#21262d'}` }}>
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0 mr-3">
                    <p className="text-sm font-bold text-white truncate">{t.name}</p>
                    <p className="text-xs mt-0.5">
                      <span style={{ color: '#00e5ff' }}>{t.calories} kcal</span>
                      <span className="mx-1.5 text-gray-700">·</span>
                      <span style={{ color: '#a78bfa' }}>{t.protein}g protein</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => { setEditing(t.id); setConfirmDelete(null); }}
                      className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all"
                      style={{ background: '#161b22', color: '#8b949e', border: '1px solid #21262d' }}>
                      Edit
                    </button>
                    <button
                      onClick={() => setConfirmDelete(confirmDelete === t.id ? null : t.id)}
                      className="text-xs px-2.5 py-1 rounded-lg font-semibold transition-all"
                      style={{ background: 'rgba(218,54,51,0.1)', color: '#da3633', border: '1px solid rgba(218,54,51,0.2)' }}>
                      {confirmDelete === t.id ? 'Cancel' : 'Delete'}
                    </button>
                  </div>
                </div>

                {confirmDelete === t.id && (
                  <div className="mt-3 flex items-center justify-between pt-3"
                    style={{ borderTop: '1px solid rgba(218,54,51,0.2)' }}>
                    <p className="text-xs text-gray-400">Delete "{t.name}"?</p>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-xs px-3 py-1.5 rounded-lg font-black transition-all active:scale-95"
                      style={{ background: '#da3633', color: '#fff' }}>
                      Yes, delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
