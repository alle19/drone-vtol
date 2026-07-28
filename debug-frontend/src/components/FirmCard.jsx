import { Link } from 'react-router-dom';

export default function FirmCard({ firm }) {
  return (
    <Link to={`/firms/${firm.id}`} className="block border border-neutral-200 rounded-lg p-4 hover:border-neutral-400 transition">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-medium">{firm.name}</h3>
        {firm.verified && <span className="text-xs font-mono text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Verified</span>}
      </div>
      <p className="text-sm text-neutral-600">{firm.location}</p>
      <p className="text-sm text-neutral-600 mt-1 line-clamp-2">{firm.description}</p>
    </Link>
  );
}