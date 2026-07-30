import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { SkeletonBlock } from '../components/Skeleton.jsx';

export default function ArticleDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  function load() {
    api.getArticle(slug).then(setArticle);
  }

  useEffect(() => { load(); }, [slug]);
  useEffect(() => { if (article) setForm(article); }, [article]);

  if (!article) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <SkeletonBlock className="h-3 w-32" />
        <SkeletonBlock className="h-9 w-3/4" />
        <SkeletonBlock className="h-64 w-full" />
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-full" />
          <SkeletonBlock className="h-4 w-2/3" />
        </div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin';
  const isAuthor = user?.role === 'editor' && user.id === article.author_id;

  async function handleEdit(e) {
    e.preventDefault();
    const updated = await api.updateArticle(article.id, form);
    setArticle(updated);
    setForm(updated);
    setEditing(false);
  }

  async function handlePublishToggle() {
    const updated = await api.updateArticle(article.id, { status: article.status === 'published' ? 'draft' : 'published' });
    setArticle(updated);
  }

  return (
    <div className="max-w-2xl mx-auto">
      <p className="font-mono text-xs text-neutral-500 uppercase mb-2">{article.category} · {article.status}</p>
      <h1 className="text-3xl font-semibold mb-4">{article.title}</h1>
      {article.featured_image_url && <img src={article.featured_image_url} alt={article.title} className="w-full h-64 object-cover rounded-lg mb-6 bg-neutral-100" />}
      <p className="text-neutral-700 whitespace-pre-wrap">{article.body}</p>

      {(isAdmin || isAuthor) && (
        <div className="mt-8 space-y-3">
          <div className="flex gap-3">
            <button onClick={() => setEditing(!editing)} className="text-sm text-beacon font-medium">{editing ? 'Cancel edit' : 'Edit article'}</button>
            <button onClick={handlePublishToggle} className="text-sm text-beacon font-medium">{article.status === 'published' ? 'Unpublish' : 'Publish'}</button>
          </div>
          {editing && (
            <form onSubmit={handleEdit} className="space-y-2 border border-neutral-200 rounded-lg p-4">
              <input value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Title" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
              <textarea value={form.body || ''} onChange={(e) => setForm({ ...form, body: e.target.value })} placeholder="Body" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" rows={6} />
              <button type="submit" className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">Save</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}