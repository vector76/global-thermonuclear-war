import { Navigate } from 'react-router-dom';

function ProtectedRoute({ isAuthenticated, isAdmin, children }) {
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}

export default ProtectedRoute; 