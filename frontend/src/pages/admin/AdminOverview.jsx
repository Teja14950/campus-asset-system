import Header from "../../components/Header";
import StatCard from "../../components/StatCard";


import { useEffect, useState } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
  Legend,
} from "recharts";

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000";

const STATUS_COLORS = {
  pending: "#e74c3c",
  assigned: "#f39c12",
  resolved: "#27ae60",
};

function AdminOverview() {
  const [loading, setLoading] = useState(true);

  const [reports, setReports] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [damaged, setDamaged] = useState([]);
  const [avgRepair, setAvgRepair] = useState(null);

  const token = localStorage.getItem("token");

  useEffect(() => {
    const h = {
      Authorization: `Bearer ${token}`,
    };

    Promise.all([
      fetch(`${API_URL}/reports`, {
        headers: h,
      }).then((r) => r.json()),

      fetch(`${API_URL}/admin/rooms`, {
        headers: h,
      }).then((r) => r.json()),

      fetch(
        `${API_URL}/reports/analytics/damaged-assets`
      ).then((r) => r.json()),

      fetch(
        `${API_URL}/reports/analytics/repair-time`
      ).then((r) => r.json()),
    ])
      .then(([reps, rms, dmg, avg]) => {
        setReports(
          Array.isArray(reps) ? reps : []
        );

        setRooms(
          Array.isArray(rms) ? rms : []
        );

        setDamaged(
          Array.isArray(dmg)
            ? dmg.slice(0, 8)
            : []
        );

        setAvgRepair(
          avg?.avg_repair_time || null
        );

        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [token]);

  const pending = reports.filter(
    (r) => r.status === "pending"
  ).length;

  const inProgress = reports.filter(
    (r) => r.status === "assigned"
  ).length;

  const resolved = reports.filter(
    (r) => r.status === "resolved"
  ).length;

  const pieData = [
    {
      name: "Pending",
      value: pending,
      color: "#e74c3c",
    },
    {
      name: "In Progress",
      value: inProgress,
      color: "#f39c12",
    },
    {
      name: "Resolved",
      value: resolved,
      color: "#27ae60",
    },
  ].filter((d) => d.value > 0);

  if (loading) {
    return (
      <div className="p-8">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <Header />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Reports"
          value={reports.length}
          icon={<span>📄</span>}
          change="+12% this month"
        />

        <StatCard
          title="Pending"
          value={pending}
          icon={<span>⏳</span>}
          change="Needs attention"
        />

        <StatCard
          title="Resolved"
          value={resolved}
          icon={<span>✅</span>}
          change="Good progress"
        />

        <StatCard
          title="Rooms"
          value={rooms.length}
          icon={<span>🏢</span>}
          change="Campus coverage"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <div className="xl:col-span-2 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Most Reported Assets
          </h2>

          {damaged.length === 0 ? (
            <p className="text-slate-400 text-center py-12">
              No data available
            </p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <BarChart
                data={damaged}
                margin={{
                  top: 10,
                  right: 20,
                  left: 0,
                  bottom: 50,
                }}
              >
                <XAxis
                  dataKey="name"
                  angle={-30}
                  textAnchor="end"
                  tick={{ fontSize: 11 }}
                />

                <YAxis allowDecimals={false} />

                <Tooltip />

                <Bar
                  dataKey="report_count"
                  radius={[8, 8, 0, 0]}
                >
                  {damaged.map((_, i) => (
                    <Cell
                      key={i}
                      fill={
                        i === 0
                          ? "#ef4444"
                          : i === 1
                          ? "#f59e0b"
                          : "#2563eb"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="xl:col-span-1 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">
            Report Status
          </h2>

          {pieData.length === 0 ? (
            <p className="text-slate-400 text-center py-12">
              No data available
            </p>
          ) : (
            <ResponsiveContainer
              width="100%"
              height={300}
            >
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={95}
                  paddingAngle={4}
                >
                  {pieData.map(
                    (entry, index) => (
                      <Cell
                        key={index}
                        fill={entry.color}
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h2 className="text-lg font-semibold">
            Recent Reports
          </h2>

          <button className="text-blue-600 text-sm font-medium">
            View All
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                  ID
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                  Asset
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                  Reporter
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                  Status
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>

            <tbody>
              {reports.slice(0, 8).map((r) => {
                const c =
                  STATUS_COLORS[r.status] ||
                  "#64748b";

                return (
                  <tr
                    key={r.id}
                    className="border-t hover:bg-slate-50"
                  >
                    <td className="px-6 py-4 text-slate-500">
                      #{r.id}
                    </td>

                    <td className="px-6 py-4 font-medium">
                      {r.asset_name}
                    </td>

                    <td className="px-6 py-4">
                      {r.user_name}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          background:
                            c + "20",
                          color: c,
                        }}
                      >
                        {r.status}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-slate-500">
                      {new Date(
                        r.created_at
                      ).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminOverview;
