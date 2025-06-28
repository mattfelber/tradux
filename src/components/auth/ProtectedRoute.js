import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, loading } = useAuth();
  
  // If still loading auth state, don't render anything yet
  if (loading) {
    return null;
  }
  
  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // TEMPORARY: Bypass admin check for development
  // In production, uncomment this code:
  
  if (adminOnly && !user.user_metadata?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  
  // For development, log that we're bypassing admin check
  if (adminOnly) {
    console.log('DEVELOPMENT MODE: Bypassing admin check for', user.email);
  }
  
  // User is authenticated (and is admin if required), render the protected component
  return children;
};

export default ProtectedRoute;
