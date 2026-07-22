import { Link } from 'react-router-dom';

export default function DroneCard({ drone }) {
  return (
    <Link to={`/drones/${drone.id}`} className="block border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-400 transition">
      <img src={drone.primary_image_url} alt={drone.name} className="w-full h-40 object-cover bg-neutral-100" />
      <div className="p-4">
        <p className="font-mono text-xs text-neutral-500 uppercase mb-1">{drone.category}</p>
        <h3 className="font-medium">{drone.name}</h3>
        <p className="text-sm text-neutral-600 mt-1">${Number(drone.price).toLocaleString()}</p>
      </div>
    </Link>
  );
}