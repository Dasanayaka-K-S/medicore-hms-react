import { NavLink } from 'react-router-dom';
import { MODULES } from '../config/modules.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Sidebar({ open, onClose, onLogout }) {
  const { user } = useAuth();
  const visible = MODULES.filter((m) => user && m.roles.includes(user.role_name));

  return (
    <>
      <aside className={`app-sidebar ${open ? 'show' : ''}`}>
        <div className="sidebar-brand">
          <i className="bi bi-heart-pulse-fill brand-icon" />
          <div>
            <div className="brand-title">MediCore</div>
            <div className="brand-subtitle">Hospital Management System</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {visible.map((m) => (
            <NavLink
              key={m.key}
              to={m.path}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <i className={`bi ${m.icon}`} />
              <span>{m.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <button type="button" className="sidebar-link sidebar-logout" onClick={onLogout}>
            <i className="bi bi-box-arrow-right" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <div className={`sidebar-backdrop ${open ? 'show' : ''}`} onClick={onClose} />
    </>
  );
}
