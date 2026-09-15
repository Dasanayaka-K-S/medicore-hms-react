import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import FlashMessages from '../components/FlashMessages.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { MODULES } from '../config/modules.js';

/** Derives the page title from the current route, like $pageTitle did. */
function usePageTitle() {
  const { pathname } = useLocation();
  const segment = pathname.split('/')[1] || 'dashboard';
  const mod = MODULES.find((m) => m.key === segment);
  return mod ? mod.label : 'MediCore HMS';
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const title = usePageTitle();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="app-wrapper">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="app-content">
        <Topbar title={title} onToggleSidebar={() => setSidebarOpen((o) => !o)} />

        <main className="app-main">
          <FlashMessages />
          <Outlet />
        </main>

        <footer className="app-footer">
          &copy; {new Date().getFullYear()} MediCore HMS &mdash; Hospital Management System
        </footer>
      </div>
    </div>
  );
}
