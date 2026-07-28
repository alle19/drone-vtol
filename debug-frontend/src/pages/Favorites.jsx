import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';

function hrefFor(f) {
  if (f.item_type === 'article') return `/articles/${f.item?.slug}`;
  return `/${f.item_type}s/${f.item_id}`;
}

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    api.getFavorites().then(setFavorites);
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Favorites</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {favorites.map((f) => (
          <Link key={f.id} to={hrefFor(f)} className="block border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-400 transition">
            {f.item?.image_url && <img src={f.item.image_url} alt={f.item.title} className="w-full h-40 object-cover bg-neutral-100" />}
            <div className="p-4">
              <p className="font-mono text-xs text-neutral-500 uppercase mb-1">{f.item_type}</p>
              <h3 className="font-medium">{f.item?.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}