import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import DroneCard from '../components/DroneCard.jsx';
import ArticleCard from '../components/ArticleCard.jsx';

export default function Home() {
  const [drones, setDrones] = useState([]);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    api.getDrones().then((d) => setDrones(d.slice(0, 3)));
    api.getArticles().then((a) => setArticles(a.slice(0, 2)));
  }, []);

  return (
    <div className="space-y-16">
      <section className="text-center py-12">
        <p className="font-mono text-sm text-beacon mb-3">#PunctulDeZbor</p>
        <h1 className="text-4xl font-semibold tracking-tight mb-4">Fixed-wing VTOL, without the runway</h1>
        <p className="text-neutral-600 max-w-xl mx-auto mb-8">
          Browse drones from verified manufacturers, read the research, and connect directly with the firms behind them.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link to="/drones" className="px-5 py-2.5 rounded-md bg-neutral-900 text-white text-sm font-medium">Browse drones</Link>
          <Link to="/articles" className="px-5 py-2.5 rounded-md border border-neutral-300 text-sm font-medium">Read the research</Link>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Featured drones</h2>
          <Link to="/drones" className="text-sm text-neutral-600">View all</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {drones.map((d) => <DroneCard key={d.id} drone={d} />)}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Latest articles</h2>
          <Link to="/articles" className="text-sm text-neutral-600">View all</Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {articles.map((a) => <ArticleCard key={a.id} article={a} />)}
        </div>
      </section>
    </div>
  );
}