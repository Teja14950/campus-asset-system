import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";

const NAV = [
  { to: "/admin",           label: "Overview",   exact: true },
  { to: "/admin/approvals", label: "Approvals"              },
  { to: "/admin/rooms",     label: "Room Editor"            },
  { to: "/admin/reports",   label: "Reports"                },
  { to: "/admin/users",     label: "Users"                  },
  { to: "/admin/qr",        label: "QR Codes"               },
  { to: "/admin/settings",  label: "Settings"               },
];

function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const user     = JSON.parse(localStorage.getItem("user"));

  return (
    <div style={{ display:"flex", minHeight:"100vh", fontFamily:"system-ui, sans-serif" }}>
      <div style={{ width:"220px", background:"#1a1a2e", color:"white",
        display:"flex", flexDirection:"column", flexShrink:0 }}>
        <div style={{ padding:"24px 20px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ fontSize:"11px", letterSpacing:"2px", color:"#666", marginBottom:"4px" }}>ASSETTRACK</div>
          <div style={{ fontSize:"16px", fontWeight:"600" }}>Admin Panel</div>
        </div>
        <nav style={{ flex:1, padding:"16px 12px" }}>
          {NAV.map(({ to, label, exact }) => {
            const active = exact ? location.pathname === to : location.pathname.startsWith(to);
            return (
              <Link key={to} to={to} style={{
                display:"block", padding:"10px 12px", marginBottom:"4px",
                borderRadius:"8px", textDecoration:"none", fontSize:"14px",
                color: active ? "white" : "#999",
                background: active ? "rgba(255,255,255,0.12)" : "transparent",
                fontWeight: active ? "600" : "400",
              }}>{label}</Link>
            );
          })}
        </nav>
        <div style={{ padding:"16px 20px", borderTop:"1px solid rgba(255,255,255,0.08)", fontSize:"13px" }}>
          <div style={{ color:"#ccc", marginBottom:"2px" }}>{user?.name}</div>
          <div style={{ color:"#555", marginBottom:"12px", fontSize:"11px" }}>Administrator</div>
          <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("user"); navigate("/login"); }}
            style={{ width:"100%", padding:"8px", cursor:"pointer", background:"rgba(255,255,255,0.07)",
              color:"#ccc", border:"1px solid rgba(255,255,255,0.1)", borderRadius:"6px", fontSize:"13px" }}>
            Logout
          </button>
        </div>
      </div>
      <div style={{ flex:1, background:"#f4f5f7", overflow:"auto" }}>
        <Outlet />
      </div>
    </div>
  );
}
export default AdminLayout;