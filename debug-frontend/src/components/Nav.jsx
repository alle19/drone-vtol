import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LuMenu, LuX } from 'react-icons/lu';
import { useAuth } from '../context/AuthContext.jsx';
import BrandLogo from './BrandLogo.jsx';

export default function Nav() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  function close() {
    setOpen(false);
  }

  function handleLogout() {
    logout();
    close();
  }

  return (
    <header className="border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3" onClick={close}>
            <BrandLogo className="h-9" />
            <span className="font-semibold text-lg tracking-tight text-neutral-900">PunctulDeZbor</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm text-neutral-600">
            <Link to="/drones" className="hover:text-neutral-900">Drones</Link>
            <Link to="/articles" className="hover:text-neutral-900">Articles</Link>
            <Link to="/gallery" className="hover:text-neutral-900">Gallery</Link>
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-4 text-sm">
          {user ? (
            <>
              <Link to="/favorites" className="text-neutral-600 hover:text-neutral-900">Favorites</Link>
              {user.role === 'admin' && (
                <Link to="/admin/stats" className="text-neutral-600 hover:text-neutral-900">Stats</Link>
              )}
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

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="md:hidden flex items-center justify-center w-11 h-11 -mr-2 text-neutral-700"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <LuX className="w-6 h-6" /> : <LuMenu className="w-6 h-6" />}
        </button>
      </div>

      {open && (
        <nav className="md:hidden border-t border-neutral-200 bg-white px-4 pb-3">
          <Link to="/drones" onClick={close} className="flex items-center min-h-11 text-neutral-700">Drones</Link>
          <Link to="/articles" onClick={close} className="flex items-center min-h-11 text-neutral-700">Articles</Link>
          <Link to="/gallery" onClick={close} className="flex items-center min-h-11 text-neutral-700">Gallery</Link>

          <div className="border-t border-neutral-200 my-2" />

          {user ? (
            <>
              <Link to="/favorites" onClick={close} className="flex items-center min-h-11 text-neutral-700">Favorites</Link>
              {user.role === 'admin' && (
                <Link to="/admin/stats" onClick={close} className="flex items-center min-h-11 text-neutral-700">Stats</Link>
              )}
              <Link to="/account" onClick={close} className="flex items-center justify-between min-h-11 text-neutral-700">
                <span>{user.name}</span>
                <span className="px-2 py-1 rounded-full bg-beacon/10 text-beacon text-xs font-mono uppercase">{user.role}</span>
              </Link>
              <button onClick={handleLogout} className="flex items-center min-h-11 w-full text-left text-neutral-700">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={close} className="flex items-center min-h-11 text-neutral-700">Login</Link>
              <Link to="/signup" onClick={close} className="flex items-center justify-center min-h-11 my-1 rounded-md bg-neutral-900 text-white font-medium">Sign up</Link>
            </>
          )}
        </nav>
      )}
    </header>
  );
}
