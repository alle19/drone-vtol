import { useEffect, useState } from 'react';
import * as api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import FirmCard from '../components/FirmCard.jsx';

export default function Firms() {
  const [firms, setFirms] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', slug: '', description: '', location: '' });
  const [error, setError] = useState('');
  const { user, refreshUser } = useAuth();

  function load() {
    api.getFirms().then(setFirms);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createFirm(form);
      setCreating(false);
      setForm({ name: '', slug: '', description: '', location: '' });
      load();
      refreshUser();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Firms</h1>
        {user?.role === 'user' && (
          <button onClick={() => setCreating(!creating)} className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">
            {creating ? 'Cancel' : 'List your business'}
          </button>
        )}
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="border border-neutral-200 rounded-lg p-4 space-y-2 mb-6">
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Firm name" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" required />
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" required />
          <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" rows={3} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">Create</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {firms.map((f) => <FirmCard key={f.id} firm={f} />)}
      </div>
    </div>
  );
}