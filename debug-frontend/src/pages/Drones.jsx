import { useEffect, useState } from 'react';
import * as api from '../api';
import DroneCard from '../components/DroneCard.jsx';

export default function Drones() {
  const [drones, setDrones] = useState([]);
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  useEffect(() => {
    const params = {};
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (minPrice) params.min_price = minPrice;
    if (maxPrice) params.max_price = maxPrice;
    api.getDrones(params).then(setDrones);
  }, [category, sort, minPrice, maxPrice]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Drones</h1>
      <div className="flex flex-wrap gap-3 mb-6">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="border border-neutral-300 rounded-md px-3 py-2 text-sm">
          <option value="">All categories</option>
          <option value="agriculture">Agriculture</option>
          <option value="delivery">Delivery</option>
          <option value="inspection">Inspection</option>
          <option value="emergency">Emergency</option>
          <option value="mapping">Mapping</option>
          <option value="surveillance">Surveillance</option>
        </select>
        <input type="number" placeholder="Min price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className="border border-neutral-300 rounded-md px-3 py-2 text-sm w-32" />
        <input type="number" placeholder="Max price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className="border border-neutral-300 rounded-md px-3 py-2 text-sm w-32" />
        <select value={sort} onChange={(e) => setSort(e.target.value)} className="border border-neutral-300 rounded-md px-3 py-2 text-sm">
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {drones.map((d) => <DroneCard key={d.id} drone={d} />)}
      </div>
    </div>
  );
}