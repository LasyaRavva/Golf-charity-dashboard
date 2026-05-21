import { NavLink } from 'react-router-dom';
import Button from './Button';
import { useAuth } from '../../hooks/useAuth';

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <NavLink to="/" className="brand">
          Golf Charity Platform
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/charities">Charities</NavLink>
          <NavLink to="/subscribe">Subscribe</NavLink>
          {isAuthenticated && <NavLink to="/dashboard">Dashboard</NavLink>}
          {isAdmin && <NavLink to="/admin">Admin</NavLink>}
        </nav>
        <div className="inline-actions">
          {isAuthenticated ? (
            <>
              <span>{user?.name}</span>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/signup">Join</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
