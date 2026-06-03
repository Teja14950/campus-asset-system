import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home             from "./pages/Home";
import Login            from "./pages/Login";
import Register         from "./pages/Register";
import Dashboard        from "./pages/Dashboard";
import RepairerDashboard from "./pages/repairerDashboard";
import RepairDetails    from "./pages/repairDetails";
import ProtectedRoute   from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* FIX: Dashboard routes are now wrapped in ProtectedRoute.
            requiredRole enforces that a repairer can't access /dashboard
            and a reporter can't access /repair-dashboard. */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="reporter">
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repair-dashboard"
          element={
            <ProtectedRoute requiredRole="repairer">
              <RepairerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/repair/:id"
          element={
            <ProtectedRoute>
              <RepairDetails />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;