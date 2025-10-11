import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export function UserRoute({ children }) {
  const { user, isUser } = useAuth();

  if (!user || !isUser) {
    return <Navigate to="/" replace />;
  }

  return children;
}