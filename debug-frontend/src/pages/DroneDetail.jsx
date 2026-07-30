import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { logView } from '../activity';

export default function DroneDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [drone, setDrone] = useState(null);
  const [testimonials, setTestimonials] = useState([]);
  const [favorited, setFavorited] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquiryStatus, setInquiryStatus] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [creatingTestimonial, setCreatingTestimonial] = useState(false);
  const [testimonialForm, setTestimonialForm] = useState({ agency_name: '', contact_title: '', quote: '', outcome: '', featured: false });
  const [testimonialError, setTestimonialError] = useState('');
  const loggedViewRef = useRef(false);

  function load() {
    api.getDrone(id).then(setDrone);
    api.getTestimonials(id).then(setTestimonials);
  }

  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (drone) setForm(drone); }, [drone]);

  useEffect(() => {
    if (drone && !loggedViewRef.current) {
      loggedViewRef.current = true;
      logView('drone', drone.id);
    }
  }, [drone]);

  if (!drone) return null;

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'admin' || user?.role === 'editor';

  async function handleFavorite() {
    const res = await api.toggleFavorite({ item_type: 'drone', item_id: drone.id });
    setFavorited(res.favorited);
  }

  async function handleInquiry(e) {
    e.preventDefault();
    setInquiryStatus('');
    try {
      await api.createInquiry({ drone_id: drone.id, message: inquiryMessage });
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

  async function handleCreateTestimonial(e) {
    e.preventDefault();
    setTestimonialError('');
    try {
      await api.createTestimonial(id, testimonialForm);
      setTestimonialForm({ agency_name: '', contact_title: '', quote: '', outcome: '', featured: false });
      setCreatingTestimonial(false);
      api.getTestimonials(id).then(setTestimonials);
    } catch (err) {
      setTestimonialError(err.message);
    }
  }

  const specFields = [
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
          <p className="font-mono text-xs text-neutral-500 uppercase mb-1">{drone.subcategory}</p>
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
          <h2 className="text-lg font-semibold mb-3">What agencies say</h2>
          <div className="space-y-3">
            {testimonials.map((t) => (
              <div key={t.id} className="border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{t.agency_name}</span>
                  {t.featured && <span className="text-xs font-mono uppercase text-beacon">Featured</span>}
                </div>
                {t.contact_title && <p className="text-xs text-neutral-500 mt-0.5">{t.contact_title}</p>}
                <p className="text-sm text-neutral-600 mt-2">"{t.quote}"</p>
                {t.outcome && <p className="text-sm text-neutral-500 mt-2 font-mono text-xs">{t.outcome}</p>}
              </div>
            ))}
            {testimonials.length === 0 && <p className="text-sm text-neutral-500">No testimonials yet.</p>}
          </div>

          {isStaff && (
            <div className="mt-4">
              <button onClick={() => setCreatingTestimonial(!creatingTestimonial)} className="flex items-center min-h-11 text-sm text-beacon font-medium">
                {creatingTestimonial ? 'Cancel' : 'Add testimonial'}
              </button>
              {creatingTestimonial && (
                <form onSubmit={handleCreateTestimonial} className="mt-4 space-y-2 border border-neutral-200 rounded-lg p-4">
                  <input value={testimonialForm.agency_name} onChange={(e) => setTestimonialForm({ ...testimonialForm, agency_name: e.target.value })} placeholder="Agency name" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" required />
                  <input value={testimonialForm.contact_title} onChange={(e) => setTestimonialForm({ ...testimonialForm, contact_title: e.target.value })} placeholder="Contact title" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
                  <textarea value={testimonialForm.quote} onChange={(e) => setTestimonialForm({ ...testimonialForm, quote: e.target.value })} placeholder="Quote" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" rows={3} required />
                  <textarea value={testimonialForm.outcome} onChange={(e) => setTestimonialForm({ ...testimonialForm, outcome: e.target.value })} placeholder="Outcome" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" rows={2} />
                  <label className="text-sm flex items-center gap-2">
                    <input type="checkbox" checked={testimonialForm.featured} onChange={(e) => setTestimonialForm({ ...testimonialForm, featured: e.target.checked })} />
                    Featured
                  </label>
                  {testimonialError && <p className="text-sm text-red-600">{testimonialError}</p>}
                  <button type="submit" className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">Save testimonial</button>
                </form>
              )}
            </div>
          )}
        </div>

        {isAdmin && (
          <div>
            <button onClick={() => setEditing(!editing)} className="flex items-center min-h-11 text-sm text-beacon font-medium">{editing ? 'Cancel edit' : 'Edit drone'}</button>
            {editing && (
              <form onSubmit={handleEdit} className="mt-4 space-y-2 border border-neutral-200 rounded-lg p-4">
                <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
                <select value={form.subcategory || ''} onChange={(e) => setForm({ ...form, subcategory: e.target.value })} className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm">
                  <option value="">No subcategory</option>
                  <option value="rescue">Rescue</option>
                  <option value="police">Police</option>
                  <option value="medical">Medical</option>
                </select>
                <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" rows={3} />
                <button type="submit" className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">Save</button>
              </form>
            )}
          </div>
        )}
      </div>

      <div className="space-y-6">
        <div className="border border-neutral-200 rounded-lg p-4">
          <p className="text-lg font-semibold">Quote-only — no public pricing</p>
          <p className="text-sm text-neutral-600 mt-1">Request a demo or pricing below.</p>
          {user && (
            <button onClick={handleFavorite} className="w-full mt-4 min-h-11 flex items-center justify-center border border-neutral-300 rounded-md text-sm font-medium">
              {favorited ? 'Remove favorite' : 'Add to favorites'}
            </button>
          )}
        </div>

        {user && (
          <form onSubmit={handleInquiry} className="border border-neutral-200 rounded-lg p-4 space-y-2">
            <h3 className="font-medium">Request pricing / a demo</h3>
            <textarea value={inquiryMessage} onChange={(e) => setInquiryMessage(e.target.value)} placeholder="Tell us about your use case" className="w-full border border-neutral-300 rounded-md px-3 py-2" rows={3} required />
            <button type="submit" className="w-full min-h-11 flex items-center justify-center bg-neutral-900 text-white rounded-md text-sm font-medium">Send request</button>
            {inquiryStatus && <p className="text-sm text-neutral-600">{inquiryStatus}</p>}
          </form>
        )}
      </div>
    </div>
  );
}
