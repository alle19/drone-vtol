import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      await signup(email, password, name);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="max-w-sm mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Sign up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-neutral-300 rounded-md px-3 py-2" required />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border border-neutral-300 rounded-md px-3 py-2" required />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-neutral-300 rounded-md px-3 py-2" required />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button type="submit" className="w-full bg-neutral-900 text-white rounded-md py-2 font-medium">Sign up</button>
      </form>
      <p className="text-sm text-neutral-600 mt-4">Already have an account? <Link to="/login" className="text-beacon">Log in</Link></p>
    </div>
  );
}