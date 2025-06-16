import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && user.login !== 'admin' && user.login !== 'sklad') {
    return <Navigate to="/orders" replace />;
  }

  return children;
};

export default ProtectedRoute;