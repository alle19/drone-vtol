import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import DroneCard from '../components/DroneCard.jsx';
import ArticleCard from '../components/ArticleCard.jsx';
import BrandLogo from '../components/BrandLogo.jsx';
import { getReferralSource } from '../referral';

export default function Home() {
  const [drones, setDrones] = useState([]);
  const [articles, setArticles] = useState([]);
  const [landing, setLanding] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState('');

  useEffect(() => {
    let active = true;

    async function load() {
      const [dronesResult, articlesResult, landingResult] = await Promise.allSettled([
        api.getDrones(),
        api.getArticles(),
        api.getLanding(),
      ]);

      if (!active) return;

      if (dronesResult.status === 'fulfilled' && Array.isArray(dronesResult.value)) {
        setDrones(dronesResult.value.slice(0, 3));
      } else {
        setDrones([]);
      }

      if (articlesResult.status === 'fulfilled' && Array.isArray(articlesResult.value)) {
        setArticles(articlesResult.value.slice(0, 2));
      } else {
        setArticles([]);
      }

      if (landingResult.status === 'fulfilled' && landingResult.value) {
        setLanding(landingResult.value);
      }

      if (dronesResult.status === 'rejected' || articlesResult.status === 'rejected' || landingResult.status === 'rejected') {
        setLoadError('Some content could not be loaded right now. The homepage is still available.');
      }
    }

    load().catch(() => setLoadError('Some content could not be loaded right now.'));

    return () => {
      active = false;
    };
  }, []);

  async function handleNewsletterSubmit(e) {
    e.preventDefault();
    setNewsletterStatus('');
    try {
      await api.subscribeNewsletter({ email: newsletterEmail, referral_source: getReferralSource() });
      setNewsletterEmail('');
      setNewsletterStatus('Subscribed — thanks for following along.');
    } catch (err) {
      setNewsletterStatus(err.message);
    }
  }

  const heroTitle = landing?.hero?.title || 'Fixed-wing VTOL, without the runway';
  const heroSubtitle = landing?.hero?.subtitle || 'Browse the drone catalog, read the research, and request pricing directly for the platform your team needs.';
  const benefits = landing?.benefits || [];

  return (
    <div className="space-y-16">
      {loadError && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </div>
      )}

      <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2">
            <BrandLogo className="h-8" />
            <p className="font-mono text-sm text-beacon">{landing?.hashtag || '#PunctulDeZbor'}</p>
          </div>
          <h1 className="text-4xl font-semibold tracking-tight mb-4">{heroTitle}</h1>
          <p className="text-neutral-600 max-w-2xl mx-auto mb-8">{heroSubtitle}</p>
          <div className="flex items-center justify-center gap-4">
            <Link to="/drones" className="px-5 py-2.5 rounded-md bg-neutral-900 text-white text-sm font-medium">Browse drones</Link>
            <Link to="/articles" className="px-5 py-2.5 rounded-md border border-neutral-300 text-sm font-medium">Read the research</Link>
          </div>
        </div>

        {benefits.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {benefits.map((item) => (
              <div key={item.title} className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-left">
                <h3 className="font-semibold text-neutral-900">{item.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{item.description}</p>
              </div>
            ))}
          </div>
        )}
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

      <section className="rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm text-center">
        <h2 className="text-lg font-semibold">Stay in the loop</h2>
        <p className="mt-2 text-sm text-neutral-600 max-w-md mx-auto">Get updates on new drones, field results, and demo events. No spam.</p>
        <form onSubmit={handleNewsletterSubmit} className="mt-4 flex flex-col sm:flex-row gap-2 max-w-sm mx-auto">
          <input
            type="email"
            required
            placeholder="you@example.com"
            value={newsletterEmail}
            onChange={(e) => setNewsletterEmail(e.target.value)}
            className="flex-1 border border-neutral-300 rounded-md px-3 py-2 text-sm"
          />
          <button type="submit" className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">Subscribe</button>
        </form>
        {newsletterStatus && <p className="mt-3 text-sm text-neutral-600">{newsletterStatus}</p>}
      </section>
    </div>
  );
}