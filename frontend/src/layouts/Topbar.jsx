import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July',
  'August', 'September', 'October', 'November', 'December'];

/** Live clock, ported from the original assets/js/app.js. */
function useClock() {
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const day = String(now.getDate()).padStart(2, '0');
  const mins = String(now.getMinutes()).padStart(2, '0');
  const secs = String(now.getSeconds()).padStart(2, '0');
  const ampm = now.getHours() >= 12 ? 'PM' : 'AM';
  const hours = now.getHours() % 12 || 12;

  return `${DAYS[now.getDay()]}, ${day} ${MONTHS[now.getMonth()]} ${now.getFullYear()} | ${hours}:${mins}:${secs} ${ampm}`;
}

export default function Topbar({ title, onToggleSidebar }) {
  const { user } = useAuth();
  const clock = useClock();

  return (
    <header className="app-topbar">
      <div className="app-topbar-left">
        <button
          className="sidebar-toggle-btn d-lg-none"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation"
        >
          <i className="bi bi-list" />
        </button>
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="app-topbar-right">
        <span className="live-clock">{clock}</span>
        <div className="topbar-user">
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user?.full_name}</span>
            <span className="topbar-user-role">{user?.role_name}</span>
          </div>
          <div className="topbar-user-avatar">
            {(user?.full_name || 'U').charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
}
