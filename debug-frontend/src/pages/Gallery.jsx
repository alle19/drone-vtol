import { useEffect, useState } from 'react';
import * as api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import GalleryCard from '../components/GalleryCard.jsx';

export default function Gallery() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', media_url: '', media_type: 'image', category: '' });
  const [error, setError] = useState('');

  const canCreate = user?.role === 'admin' || user?.role === 'editor';

  function load() {
    api.getGallery().then(setItems);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createGalleryItem(form);
      setCreating(false);
      setForm({ title: '', media_url: '', media_type: 'image', category: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Gallery</h1>
        {canCreate && (
          <button onClick={() => setCreating(!creating)} className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">
            {creating ? 'Cancel' : 'Add item'}
          </button>
        )}
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="border border-neutral-200 rounded-lg p-4 space-y-2 mb-6">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" required />
          <input value={form.media_url} onChange={(e) => setForm({ ...form, media_url: e.target.value })} placeholder="Media URL" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" required />
          <select value={form.media_type} onChange={(e) => setForm({ ...form, media_type: e.target.value })} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm">
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">Create</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((i) => <GalleryCard key={i.id} item={i} />)}
      </div>
    </div>
  );
}