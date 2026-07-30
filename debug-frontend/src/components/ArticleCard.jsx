import { Link } from 'react-router-dom';

export default function ArticleCard({ article }) {
  const preview = article.body?.replace(/\s+/g, ' ').trim().slice(0, 160) || 'Read the latest VTOL insight.';

  return (
    <Link to={`/articles/${article.slug}`} className="block overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:border-neutral-400 motion-reduce:transition-none">
      <img src={article.featured_image_url || '/logo-red.svg'} alt={article.title} className="h-40 w-full object-cover bg-neutral-100" />
      <div className="p-4">
        <p className="mb-1 font-mono text-xs uppercase tracking-wide text-neutral-500">{article.category || 'Insight'}</p>
        <h3 className="font-medium text-neutral-900">{article.title}</h3>
        <p className="mt-2 text-sm text-neutral-600">{preview}{preview.length >= 160 ? '…' : ''}</p>
      </div>
    </Link>
  );
}