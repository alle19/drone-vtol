import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import DroneCard from '../components/DroneCard.jsx';

export default function FirmDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [firm, setFirm] = useState(null);
  const [drones, setDrones] = useState([]);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [creatingDrone, setCreatingDrone] = useState(false);
  const [droneForm, setDroneForm] = useState({ name: '', slug: '', category: '', price: '' });

  function load() {
    api.getFirm(id).then(setFirm);
    api.getDrones({ firm_id: id }).then(setDrones);
  }

  useEffect(() => { load(); }, [id]);
  useEffect(() => { if (firm) setForm(firm); }, [firm]);

  if (!firm) return null;

  const isOwner = user?.role === 'firm_owner' && user.firm_id === firm.id;
  const isAdmin = user?.role === 'admin';

  async function handleEdit(e) {
    e.preventDefault();
    const updated = await api.updateFirm(id, form);
    setFirm(updated);
    setEditing(false);
  }

  async function handleVerify(verified) {
    const updated = await api.updateFirm(id, { verified });
    setFirm(updated);
  }

  async function handleCreateDrone(e) {
    e.preventDefault();
    await api.createDrone(droneForm);
    setCreatingDrone(false);
    setDroneForm({ name: '', slug: '', category: '', price: '' });
    api.getDrones({ firm_id: id }).then(setDrones);
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex items-start gap-4">
            <img src={firm.logo_url || '/logo-black.svg'} alt={firm.name} className="h-16 w-16 rounded-full object-contain bg-neutral-50 p-2" />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-semibold">{firm.name}</h1>
                {firm.verified && <span className="text-xs font-mono text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Verified</span>}
              </div>
              <p className="mt-2 text-neutral-600">{firm.location || 'Location not listed'}</p>
              <p className="mt-3 max-w-2xl text-neutral-600">{firm.description || 'A partner in the VTOL ecosystem.'}</p>
            </div>
          </div>
          <div className="text-sm text-neutral-600">
            {firm.website_url && <p className="mb-2"><a href={firm.website_url} className="text-beacon">{firm.website_url}</a></p>}
            {firm.contact_email && <p>{firm.contact_email}</p>}
            {firm.contact_phone && <p>{firm.contact_phone}</p>}
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {isAdmin && (
            <button onClick={() => handleVerify(!firm.verified)} className="border border-neutral-300 rounded-md px-4 py-2 text-sm font-medium">
              {firm.verified ? 'Unverify firm' : 'Verify firm'}
            </button>
          )}

          {(isOwner || isAdmin) && (
            <button onClick={() => setEditing(!editing)} className="text-sm text-beacon font-medium">{editing ? 'Cancel edit' : 'Edit firm'}</button>
          )}
        </div>

        {(isOwner || isAdmin) && editing && (
          <form onSubmit={handleEdit} className="mt-4 space-y-2 border border-neutral-200 rounded-lg p-4">
            <input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Name" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
            <input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Location" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
            <textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" rows={3} />
            <button type="submit" className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">Save</button>
          </form>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Drones</h2>
          {isOwner && (
            <button onClick={() => setCreatingDrone(!creatingDrone)} className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">
              {creatingDrone ? 'Cancel' : 'Add drone'}
            </button>
          )}
        </div>
        {creatingDrone && (
          <form onSubmit={handleCreateDrone} className="border border-neutral-200 rounded-lg p-4 space-y-2 mb-6">
            <input value={droneForm.name} onChange={(e) => setDroneForm({ ...droneForm, name: e.target.value })} placeholder="Name" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" required />
            <input value={droneForm.slug} onChange={(e) => setDroneForm({ ...droneForm, slug: e.target.value })} placeholder="Slug" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" required />
            <input value={droneForm.category} onChange={(e) => setDroneForm({ ...droneForm, category: e.target.value })} placeholder="Category" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
            <input value={droneForm.price} onChange={(e) => setDroneForm({ ...droneForm, price: e.target.value })} placeholder="Price" type="number" className="w-full border border-neutral-300 rounded-md px-3 py-2 text-sm" />
            <button type="submit" className="bg-neutral-900 text-white rounded-md px-4 py-2 text-sm font-medium">Create</button>
          </form>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drones.map((d) => <DroneCard key={d.id} drone={d} />)}
        </div>
      </div>
    </div>
  );
}