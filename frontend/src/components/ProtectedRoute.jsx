import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, ready, user } = useAuth();

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading-spinner w-10 h-10" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
