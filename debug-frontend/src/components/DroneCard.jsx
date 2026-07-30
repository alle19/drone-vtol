import { Link } from 'react-router-dom';

export default function DroneCard({ drone }) {
  return (
    <Link to={`/drones/${drone.id}`} className="block overflow-hidden rounded-2xl border border-neutral-200 bg-white transition hover:-translate-y-0.5 hover:border-neutral-400 motion-reduce:transition-none">
      <img src={drone.primary_image_url || '/logo-red.svg'} alt={drone.name} className="h-44 w-full object-cover bg-neutral-100" />
      <div className="p-4">
        <p className="mb-1 font-mono text-xs uppercase tracking-wide text-neutral-500">{drone.subcategory || 'VTOL'}</p>
        <h3 className="font-medium text-neutral-900">{drone.name}</h3>
        <p className="mt-2 text-sm text-neutral-600">Request pricing</p>
      </div>
    </Link>
  );
}