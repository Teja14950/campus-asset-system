import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();

  const links = [
    { name: "Overview", path: "/admin" },
    { name: "Reports", path: "/admin/reports" },
    { name: "Users", path: "/admin/users" },
    { name: "Approvals", path: "/admin/approvals" },
    { name: "QR Codes", path: "/admin/qr" },
    { name: "Settings", path: "/admin/settings" },
  ];

  return (
    <div className="w-64 min-h-screen bg-slate-900 text-white p-6">
      <h1 className="text-2xl font-bold">
        AssetTrack
      </h1>

      <p className="text-slate-400 text-sm mt-1">
        Campus Intelligence
      </p>

      <div className="mt-10 flex flex-col gap-2">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`
              px-4 py-3 rounded-xl transition
              ${
                location.pathname === link.path
                  ? "bg-blue-600"
                  : "hover:bg-slate-800"
              }
            `}
          >
            {link.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Sidebar;