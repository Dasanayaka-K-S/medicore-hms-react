import { Link } from 'react-router-dom';

export default function AccessDenied() {
  return (
    <div className="access-denied-box text-center mx-auto">
      <h1 className="mb-2">403</h1>
      <h4 className="mb-3">Access denied</h4>
      <p className="text-muted mb-4">
        Your role does not have permission to view this page.
      </p>
      <Link to="/dashboard" className="btn app-btn-primary">Back to dashboard</Link>
    </div>
  );
}
