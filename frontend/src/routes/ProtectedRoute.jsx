import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import AccessDenied from '../pages/AccessDenied.jsx';

/**
 * Guards a route. Unauthenticated visitors go to /login; authenticated
 * users whose role is not allowed on this module get the 403 page - the
 * same two outcomes requireLogin() and requirePageAccess() produced.
 */
export default function ProtectedRoute({ moduleKey, children }) {
  const { isAuthenticated, can } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (moduleKey && !can(moduleKey)) {
    return <AccessDenied />;
  }

  return children;
}
