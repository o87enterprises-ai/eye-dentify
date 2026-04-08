import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

function ProtectedRoute({ children, requireEmailVerified = true }) {
  const { user, loading, isAuthenticated, isEmailVerified } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-navy flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-gold border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gold text-sm uppercase tracking-widest">Verifying Access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireEmailVerified && !isEmailVerified) {
    return <Navigate to="/verify-pending" state={{ email: user?.email }} replace />;
  }

  return children;
}

export default ProtectedRoute;
