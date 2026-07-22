import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import * as api from '../api';
import { useAuth } from '../context/AuthContext.jsx';

export default function DroneDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [drone, setDrone] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [reviewBody, setReviewBody] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [favorited, setFavorited] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});

  function load() {
    api.getDrone(id).then(setDrone);
    api.getDroneReviews(id).then(setReviews);
  }

  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (drone) setForm(drone); }, [drone]);

  if (!drone) return null;

  const isOwner = user?.role === 'firm_owner' && user.firm_id === drone.firm_id;
  const isAdmin = user?.role === 'admin';
  const canReview = user && !(user.role === 'firm_owner' && user.firm_id === drone.firm_id);

  async function handleReview(e) {
    e.preventDefault();
    setReviewError('');
    try {
      await api.createDroneReview(id, { rating: Number(rating), body: reviewBody });
      setReviewBody('');
      api.getDroneReviews(id).then(setReviews);
      api.getDrone(id).then(setDrone);
    } catch (err) {
      setReviewError(err.message);
    }
  }

  async function handleFavorite() {
    const res = await api.toggleFavorite({ item_type: 'drone', item_id: drone.id });
    setFavorited(res.favorited);
  }

  async function handleInquiry(e) {
    e.preventDefault();
    setInquiryStatus('');
    try {
      await api.createInquiry({ firm_id: drone.firm_id, drone_id: drone.id, message: inquiryMessage });
      setInquiryMessage('');
      setInquiryStatus('Sent');
    } catch (err) {
      setInquiryStatus(err.message);
    }
  }

  async function handleEdit(e) {
    e.preventDefault();
    const updated = await api.updateDrone(id, form);
    setDrone(updated);
    setEditing(false);
  }

  const specFields = [
    ['Price', drone.price ? `$${Number(drone.price).toLocaleString()}` : null],
    ['Wingspan', drone.wingspan_mm ? `${drone.wingspan_mm} mm` : null],
    ['Weight', drone.weight_kg ? `${drone.weight_kg} kg` : null],
    ['Flight time', drone.flight_time_min ? `${drone.flight_time_min} min` : null],
    ['Range', drone.range_km ? `${drone.range_km} km` : null],
    ['Max speed', drone.max_speed_kmh ? `${drone.max_speed_kmh} km/h` : null],
    ['Payload', drone.payload_kg ? `${drone.payload_kg} kg` : null],
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        <img src={drone.primary_image_url} alt={drone.name} className="w-full h-72 object-cover rounded-lg bg-neutral-100" />
        <div>
          <p className="font-mono text-xs text-neutral-500 uppercase mb-1">{drone.category}</p>
          <h1 className="text-3xl font-semibold">{drone.name}</h1>
          <p className="text-neutral-600 mt-2">{drone.description}</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Specifications</h2>
          <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-sm">
            {specFields.filter(([, v]) => v).map(([k, v]) => (
              <div key={k}>
                <dt className="text-neutral-500">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          {drone.extra_specs && Object.keys(drone.extra_specs).length > 0 && (
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 font-mono text-sm mt-4">
              {Object.entries(drone.extra_specs).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-neutral-500">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-3">Reviews ({drone.review_count || 0}{drone.average_rating ? `, avg ${Number(drone.average_rating).toFixed(1)}` : ''})</h2>
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{r.reviewer_name}</span>
                  <span className="font-mono text-sm">{r.rating}/5</span>
                </div>
                <p className="text-sm text-neutral-600 mt-1">{r.body}</p>
              </div>
            ))}
          </div>
          {canReview && (
            <form onSubmit={handleReview} className="mt-4 space-y-2 border border-neutral-200 rounded-lg p-4">
              <select value={rating} onChange={(e) => setRating(e.target.value)} className="border border-neutral-300 rounded-md px-3 py-2 text-sm">
                {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} / 5</option>)}
              </select>
              <textarea value={reviewBody} onChange={(e) => setReviewBody(e.target.value)} placeholder="Write a review" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" rows={3} />
              {reviewError && <p className="text-sm text-red-600">{reviewError}</p>}
              <button type="submit" className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">Submit review</button>
            </form>
          )}
        </div>

        {(isOwner || isAdmin) && (
          <div>
            <button onClick={() => setEditing(!editing)} className="text-sm text-beacon font-medium">{editing ? 'Cancel edit' : 'Edit drone'}</button>
            {editing && (
              <form onSubmit={handleEdit} className="mt-4 space-y-2 border border-neutral-200 rounded-lg p-4">
                <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
                <input value={form.price || ''} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Price" type="number" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
                <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" rows={3} />
                <button type="submit" className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">Save</button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="border border-neutral-200 rounded-lg p-4">
          <p className="text-2xl font-semibold">${drone.price ? Number(drone.price).toLocaleString() : '—'}</p>
          <Link to={`/firms/${drone.firm_id}`} className="text-sm text-beacon mt-1 block">View firm</Link>
          {user && (
            <button onClick={handleFavorite} className="w-full mt-4 border border-neutral-300 rounded-md py-2 text-sm font-medium">
              {favorited ? 'Remove favorite' : 'Add to favorites'}
            </button>
          )}
        </div>

        {user && (
          <form onSubmit={handleInquiry} className="border border-neutral-200 rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Contact this firm</h3>
            <textarea value={inquiryMessage} onChange={(e) => setInquiryMessage(e.target.value)} placeholder="Ask a question" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" rows={3} required />
            <button type="submit" className="w-full bg-neutral-900 text-white rounded-md py-2 text-sm font-medium">Send inquiry</button>
            {inquiryStatus && <p className="text-sm text-neutral-600">{inquiryStatus}</p>}
          </form>
        )}
      </div>
    </div>
  );
}