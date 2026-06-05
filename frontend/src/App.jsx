import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home              from "./pages/home";
import Login             from "./pages/login";
import Register          from "./pages/register";
import Dashboard         from "./pages/dashboard";
import RepairerDashboard from "./pages/repairerDashboard";
import RepairDetails     from "./pages/repairDetails";
import RoomQR            from "./pages/RoomQR";
import ProtectedRoute    from "./components/ProtectedRoute";
import AdminLayout       from "./pages/admin/AdminLayout";
import AdminOverview     from "./pages/admin/AdminOverview";
import AdminApprovals    from "./pages/admin/AdminApprovals";
import RoomEditor        from "./pages/admin/RoomEditor";
import AdminReports      from "./pages/admin/AdminReports";
import AdminUsers        from "./pages/admin/AdminUsers";
import AdminSettings     from "./pages/admin/AdminSettings";
import AdminQR           from "./pages/admin/AdminQR";
import ReporterMyReports from "./pages/ReporterMyReports";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/room/:id" element={<RoomQR />} />
        <Route
          path="/my-reports"
          element={<ReporterMyReports />}
        />
        <Route path="/dashboard" element={
          <ProtectedRoute requiredRole="reporter"><Dashboard /></ProtectedRoute>
        } />
        <Route path="/repair-dashboard" element={
          <ProtectedRoute requiredRole="repairer"><RepairerDashboard /></ProtectedRoute>
        } />
        <Route path="/repair/:id" element={
          <ProtectedRoute><RepairDetails /></ProtectedRoute>
        } />

        <Route path="/admin" element={
          <ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>
        }>
          <Route index            element={<AdminOverview />} />
          <Route path="approvals" element={<AdminApprovals />} />
          <Route path="rooms"     element={<RoomEditor />} />
          <Route path="reports"   element={<AdminReports />} />
          <Route path="users"     element={<AdminUsers />} />
          <Route path="qr"        element={<AdminQR />} />
          <Route path="settings"  element={<AdminSettings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
export default App;