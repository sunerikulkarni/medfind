import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap route elements: <ProtectedRoute allow={["patient"]}><X/></ProtectedRoute>
const ProtectedRoute = ({ children, allow }) => {
  const { user, role } = useAuth();

  if (!user || !role) {
    return <Navigate to="/login" replace />;
  }
  if (allow && !allow.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default ProtectedRoute;
