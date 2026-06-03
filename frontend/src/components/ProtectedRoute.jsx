import { Navigate } from "react-router-dom";

// FIX: Previously any user could navigate directly to /dashboard or
// /repair-dashboard without being logged in. This wrapper checks for a
// valid token and optionally enforces a required role.
function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const user  = JSON.parse(localStorage.getItem("user") || "null");

  // No token at all → send to login
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  // Token exists but wrong role (e.g. reporter trying to hit /repair-dashboard)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;