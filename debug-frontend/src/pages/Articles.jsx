import { useEffect, useState } from 'react';
import * as api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import ArticleCard from '../components/ArticleCard.jsx';

export default function Articles() {
  const { user } = useAuth();
  const [articles, setArticles] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: '', slug: '', body: '', category: '' });
  const [error, setError] = useState('');

  const isStaff = user?.role === 'editor' || user?.role === 'admin';

  function load() {
    if (showAll && isStaff) {
      api.getAllArticles().then(setArticles);
    } else {
      api.getArticles().then(setArticles);
    }
  }

  useEffect(() => { load(); }, [showAll]);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    try {
      await api.createArticle(form);
      setCreating(false);
      setForm({ title: '', slug: '', body: '', category: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Articles</h1>
        <div className="flex items-center gap-3">
          {isStaff && (
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
              Show all (incl. drafts)
            </label>
          )}
          {isStaff && (
            <button onClick={() => setCreating(!creating)} className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">
              {creating ? 'Cancel' : 'New article'}
            </button>
          )}
        </div>
      </div>

      {creating && (
        <form onSubmit={handleCreate} className="border border-neutral-200 rounded-lg p-4 space-y-2 mb-6">
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" required />
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="Slug" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" required />
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="Category" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
          <textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Body" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" rows={5} required />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">Create draft</button>
        </form>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
      </div>
    </div>
  );
}