import { useEffect, useState } from 'react';
import * as api from '../api';
import DroneCard from '../components/DroneCard.jsx';

export default function Drones() {
  const [drones, setDrones] = useState([]);
  const [subcategory, setSubcategory] = useState('');

  useEffect(() => {
    const params = {};
    if (subcategory) params.subcategory = subcategory;
    api.getDrones(params).then(setDrones);
  }, [subcategory]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Drones</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={subcategory} onChange={(e) => setSubcategory(e.target.value)} className="border border-neutral-300 rounded-md px-3 py-2">
          <option value="">All categories</option>
          <option value="rescue">Rescue</option>
          <option value="police">Police</option>
          <option value="medical">Medical</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {drones.map((d) => <DroneCard key={d.id} drone={d} />)}
      </div>
    </div>
  );
}