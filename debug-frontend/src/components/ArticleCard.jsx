import { Link } from 'react-router-dom';

export default function ArticleCard({ article }) {
  return (
    <Link to={`/articles/${article.slug}`} className="block border border-neutral-200 rounded-lg p-4 hover:border-neutral-400 transition">
      <p className="font-mono text-xs text-neutral-500 uppercase mb-1">{article.category}</p>
      <h3 className="font-medium">{article.title}</h3>
      <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{article.body}</p>
    </Link>
  );
}