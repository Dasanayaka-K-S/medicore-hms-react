import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../services/api.js';

// Demo account shipped with the original project (login.php had a
// "Demo Login" button that filled these in and submitted the form).
const DEMO_USERNAME = 'demo';
const DEMO_PASSWORD = 'admin123';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  async function submit(user, pass, rememberMe) {
    setError('');

    if (!user || !pass) {
      setError('Please enter both username and password.');
      return;
    }

    setSubmitting(true);
    try {
      await login(user, pass, rememberMe);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(getErrorMessage(err, 'Unable to sign in. Please try again.'));
    } finally {
      setSubmitting(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    submit(username.trim(), password, remember);
  }

  function handleDemoLogin() {
    setUsername(DEMO_USERNAME);
    setPassword(DEMO_PASSWORD);
    setRemember(false);
    submit(DEMO_USERNAME, DEMO_PASSWORD, false);
  }

  return (
    <div className="login-body">
      <div className="login-wrapper">
        <div className="login-brand-panel">
          <div className="login-brand-inner">
            <i className="bi bi-heart-pulse-fill login-brand-icon" />
            <h2>MediCore</h2>
            <p>Hospital Management System</p>
            <p className="login-tagline">
              Simple, reliable and secure care coordination for your hospital's
              daily operations.
            </p>
          </div>
        </div>

        <div className="login-form-panel">
          <div className="login-form-box">
            <h3 className="mb-1">Welcome back</h3>
            <p className="text-muted mb-4">Sign in to continue to your dashboard</p>

            {error && <div className="alert alert-danger app-alert">{error}</div>}

            <form onSubmit={handleSubmit} autoComplete="off">
              <div className="mb-3">
                <label className="form-label" htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  className="form-control"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label" htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="mb-4 form-check">
                <input
                  id="remember"
                  type="checkbox"
                  className="form-check-input"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <label className="form-check-label" htmlFor="remember">Remember me</label>
              </div>

              <button type="submit" className="btn app-btn-primary w-100" disabled={submitting}>
                <i className="bi bi-box-arrow-in-right me-1" />
                {submitting ? 'Signing in...' : 'Log in'}
              </button>

              <div className="d-flex align-items-center my-3">
                <div className="flex-grow-1 login-divider" />
                <span className="px-3 text-muted small">OR</span>
                <div className="flex-grow-1 login-divider" />
              </div>

              <button
                type="button"
                className="btn btn-outline-secondary w-100"
                onClick={handleDemoLogin}
                disabled={submitting}
              >
                <i className="bi bi-play-circle-fill me-1" />
                Demo login
              </button>

              <div className="text-center mt-3">
                <small className="text-muted">Use demo login to explore the system.</small>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
