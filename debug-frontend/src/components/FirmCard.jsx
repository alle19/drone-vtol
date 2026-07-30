import { Link } from 'react-router-dom';

export default function FirmCard({ firm }) {
  return (
    <Link to={`/firms/${firm.id}`} className="block rounded-2xl border border-neutral-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-neutral-400">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <img src={firm.logo_url || '/logo-black.svg'} alt={firm.name} className="h-10 w-10 rounded-full object-contain bg-neutral-50 p-1" />
          <div>
            <h3 className="font-medium text-neutral-900">{firm.name}</h3>
            <p className="text-sm text-neutral-600">{firm.location || 'Location pending'}</p>
          </div>
        </div>
        {firm.verified && <span className="text-xs font-mono text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Verified</span>}
      </div>
      <p className="text-sm text-neutral-600 line-clamp-2">{firm.description || 'New VTOL partner in the network.'}</p>
      {firm.website_url && <p className="mt-3 text-sm text-beacon">{firm.website_url}</p>}
    </Link>
  );
}