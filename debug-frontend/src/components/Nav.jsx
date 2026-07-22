import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Nav() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-semibold text-lg tracking-tight">PunctulDeZbor</Link>
          <nav className="flex items-center gap-6 text-sm text-neutral-600">
            <Link to="/drones" className="hover:text-neutral-900">Drones</Link>
            <Link to="/firms" className="hover:text-neutral-900">Firms</Link>
            <Link to="/articles" className="hover:text-neutral-900">Articles</Link>
            <Link to="/gallery" className="hover:text-neutral-900">Gallery</Link>
          </nav>
        </div>
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/favorites" className="text-neutral-600 hover:text-neutral-900">Favorites</Link>
              <Link to="/account" className="text-neutral-600 hover:text-neutral-900">{user.name}</Link>
              <span className="px-2 py-1 rounded-full bg-beacon/10 text-beacon text-xs font-mono uppercase">{user.role}</span>
              <button onClick={logout} className="text-neutral-600 hover:text-neutral-900">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-neutral-600 hover:text-neutral-900">Login</Link>
              <Link to="/signup" className="px-3 py-1.5 rounded-md bg-neutral-900 text-white hover:bg-neutral-800">Sign up</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}