import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Wraps a route that requires authentication.
 * While the token is still being validated it shows nothing (the whole
 * app is gated by a similar check in App.js). Unauthenticated users are
 * redirected to /login with the attempted location saved for a post-login
 * return.
 */
const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
};

export default PrivateRoute;
