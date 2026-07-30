import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import { SkeletonCard } from '../components/Skeleton.jsx';

function hrefFor(f) {
  if (f.item_type === 'article') return `/articles/${f.item?.slug}`;
  return `/${f.item_type}s/${f.item_id}`;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getFavorites().then(setFavorites).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Favorites</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading && Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} imageHeight="h-40" />)}
        {!loading && favorites.map((f) => (
          <Link key={f.id} to={hrefFor(f)} className="block overflow-hidden rounded-2xl border border-neutral-200 bg-white hover:border-neutral-400 transition">
            <img src={f.item?.image_url || '/logo-red.svg'} alt={f.item?.title || 'Favorite'} className="h-40 w-full object-cover bg-neutral-100" />
            <div className="p-4">
              <p className="mb-1 font-mono text-xs uppercase tracking-wide text-neutral-500">{f.item_type}</p>
              <h3 className="font-medium text-neutral-900">{f.item?.title || 'Saved item'}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}