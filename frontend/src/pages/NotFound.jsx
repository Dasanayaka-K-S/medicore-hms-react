import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="access-denied-body">
      <div className="access-denied-box text-center">
        <h1 className="mb-2">404</h1>
        <h4 className="mb-3">Page not found</h4>
        <p className="text-muted mb-4">That page doesn't exist in MediCore HMS.</p>
        <Link to="/dashboard" className="btn app-btn-primary">Back to dashboard</Link>
      </div>
    </div>
  );
}
