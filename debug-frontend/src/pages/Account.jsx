import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { SkeletonBlock } from '../components/Skeleton.jsx';

export default function Account() {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState([]);

  useEffect(() => {
    if (user) api.getInquiries().then(setInquiries);
  }, [user]);

  async function updateStatus(id, status) {
    await api.updateInquiry(id, { status });
    api.getInquiries().then(setInquiries);
  }

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-40" />
          <SkeletonBlock className="h-4 w-56" />
          <SkeletonBlock className="h-5 w-20 rounded-full" />
        </div>
        <SkeletonBlock className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold mb-2">{user.name}</h1>
        <p className="text-neutral-600">{user.email}</p>
        <span className="inline-block mt-2 text-xs font-mono uppercase px-2 py-1 rounded-full bg-beacon/10 text-beacon">{user.role}</span>
      </div>

      {(user.role === 'editor' || user.role === 'admin') && (
        <div className="border border-neutral-200 rounded-lg p-4 space-y-2">
          <Link to="/articles" className="text-sm text-beacon font-medium block">Manage articles</Link>
          <Link to="/gallery" className="text-sm text-beacon font-medium block">Manage gallery</Link>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-3">Inquiries</h2>
        <div className="space-y-3">
          {inquiries.map((i) => (
            <div key={i.id} className="border border-neutral-200 rounded-lg p-4">
              <p className="text-sm">{i.message}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-mono text-xs text-neutral-500">{i.status}</span>
                {user.role === 'admin' && (
                  <select value={i.status} onChange={(e) => updateStatus(i.id, e.target.value)} className="border border-neutral-300 rounded-md px-2 py-1 text-xs">
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="closed">Closed</option>
                  </select>
                )}
              </div>
            </div>
          ))}
          {inquiries.length === 0 && <p className="text-sm text-neutral-500">No inquiries.</p>}
        </div>
      </div>
    </div>
  );
}