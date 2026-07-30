import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import BrandLogo from '../components/BrandLogo.jsx';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  }

  return (
    <div className="max-w-sm mx-auto rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <BrandLogo className="h-10" />
        <div>
          <h1 className="text-xl font-semibold">Log in</h1>
          <p className="text-sm text-neutral-600">Access your VTOL account</p>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-neutral-300 rounded-md px-3 py-2" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-neutral-300 rounded-md px-3 py-2" required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full min-h-11 flex items-center justify-center bg-neutral-900 text-white rounded-md font-medium">Log in</button>
      </form>
      <p className="text-sm text-neutral-600 mt-4">No account? <Link to="/signup" className="text-beacon">Sign up</Link></p>
    </div>
  );
}