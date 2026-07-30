import { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, LabelList,
} from 'recharts';
import * as api from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import { SkeletonBlock } from '../components/Skeleton.jsx';
import { useCountUp } from '../hooks/useCountUp';

const COLORS = {
  blue: '#2a78d6',
  orange: '#eb6834',
  aqua: '#1baf7a',
  beacon: '#FF6A1A',
};

function formatDuration(seconds) {
  if (seconds == null) return '—';
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours === 0 ? `${minutes}m` : `${hours}h ${minutes}m`;
}

function formatShortDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function GroupedBarChart({ data, xKey, series }) {
  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={data} margin={{ bottom: 32 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={{ fontSize: 11 }}
          stroke="#898781"
          angle={-30}
          textAnchor="end"
          interval={0}
          height={60}
        />
        <YAxis tick={{ fontSize: 12 }} stroke="#898781" allowDecimals={false} />
        <Tooltip />
        <Legend />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} fill={s.color} radius={[4, 4, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

function TrendLineChart({ data, color }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e1e0d9" vertical={false} />
        <XAxis dataKey="date" tickFormatter={formatShortDate} tick={{ fontSize: 12 }} stroke="#898781" />
        <YAxis tick={{ fontSize: 12 }} stroke="#898781" allowDecimals={false} />
        <Tooltip labelFormatter={formatShortDate} />
        <Line type="monotone" dataKey="count" stroke={color} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function StatusBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} layout="vertical" margin={{ left: 16, right: 24 }}>
        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#898781" allowDecimals={false} />
        <YAxis type="category" dataKey="status" tick={{ fontSize: 12 }} stroke="#898781" width={80} />
        <Tooltip />
        <Bar dataKey="count" fill={COLORS.blue} radius={[0, 4, 4, 0]}>
          <LabelList dataKey="count" position="right" fontSize={12} fill="#52514e" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function AdminStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const isAdmin = user?.role === 'admin';
  const totalUsers = stats ? stats.users_by_role.reduce((sum, r) => sum + r.count, 0) : null;

  const animatedSubscribers = useCountUp(stats?.subscriber_count ?? null);
  const animatedTotalUsers = useCountUp(totalUsers);
  const animatedContactSeconds = useCountUp(stats?.avg_time_to_contact_seconds ?? null);

  useEffect(() => {
    if (!isAdmin) return;
    api.getStats().then(setStats).catch((err) => setError(err.message));
  }, [isAdmin]);

  async function handleRefresh() {
    setRefreshing(true);
    setError('');
    try {
      const data = await api.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setRefreshing(false);
    }
  }

  if (!isAdmin) return null;

  if (!stats) {
    return (
      <div className="space-y-10">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Activity Stats</h1>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border border-neutral-200 rounded-lg p-4 space-y-2">
              <SkeletonBlock className="h-3 w-24" />
              <SkeletonBlock className="h-8 w-16" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonBlock className="h-80 w-full" />
          <SkeletonBlock className="h-80 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Activity Stats</h1>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="min-h-11 flex items-center justify-center border border-neutral-300 rounded-md px-3 text-sm font-medium disabled:opacity-50"
        >
          {refreshing ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="border border-neutral-200 rounded-lg p-4">
          <p className="text-xs font-mono uppercase text-neutral-500">Subscribers</p>
          <p className="text-3xl font-semibold mt-1">{Math.round(animatedSubscribers)}</p>
        </div>
        <div className="border border-neutral-200 rounded-lg p-4">
          <p className="text-xs font-mono uppercase text-neutral-500">Total users</p>
          <p className="text-3xl font-semibold mt-1">{Math.round(animatedTotalUsers)}</p>
        </div>
        <div className="border border-neutral-200 rounded-lg p-4">
          <p className="text-xs font-mono uppercase text-neutral-500">Avg time to contact</p>
          <p className="text-3xl font-semibold mt-1">{formatDuration(animatedContactSeconds)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border border-neutral-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Drone activity</h2>
          <GroupedBarChart
            data={stats.drone_stats}
            xKey="name"
            series={[
              { key: 'view_count', label: 'Views', color: COLORS.blue },
              { key: 'favorite_count', label: 'Favorites', color: COLORS.orange },
              { key: 'inquiry_count', label: 'Inquiries', color: COLORS.aqua },
            ]}
          />
        </div>
        <div className="border border-neutral-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Referral funnel</h2>
          <GroupedBarChart
            data={stats.referral_funnel}
            xKey="slug"
            series={[
              { key: 'click_count', label: 'Clicks', color: COLORS.blue },
              { key: 'signup_count', label: 'Signups', color: COLORS.orange },
              { key: 'inquiry_count', label: 'Inquiries', color: COLORS.aqua },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="border border-neutral-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Signups (30d)</h2>
          <TrendLineChart data={stats.signups_per_day} color={COLORS.beacon} />
        </div>
        <div className="border border-neutral-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-3">Newsletter subscribers (30d)</h2>
          <TrendLineChart data={stats.newsletter_subscribers_per_day} color={COLORS.blue} />
        </div>
      </div>

      <div className="border border-neutral-200 rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-3">Inquiries by status</h2>
        <StatusBarChart data={stats.inquiry_volume_by_status} />
      </div>
    </div>
  );
}
