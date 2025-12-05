// import { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import { useAuth } from "../context/AuthContext.jsx";

// export default function AdminStats() {
//   const { user } = useAuth();
//   const [stats, setStats] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [err, setErr] = useState("");

//   const email =
//     user?.email ||
//     user?.["cognito:username"] ||
//     user?.username ||
//     "";

//   const isInternal = String(email).toLowerCase().endsWith("@me-dmz.com");

//   useEffect(() => {
//     if (!isInternal) {
//       setErr("Forbidden");
//       setLoading(false);
//       return;
//     }

//     const jwt = Cookies.get("idToken");
//     if (!jwt) {
//       setErr("Missing token");
//       setLoading(false);
//       return;
//     }

//     (async () => {
//       try {
//         const res = await fetch(
//           `${import.meta.env.VITE_API_BASE}/api/login-stats`,
//           {
//             headers: { Authorization: `Bearer ${jwt}` }
//           }
//         );

//         const data = await res.json();
//         if (!res.ok) throw new Error(data?.error || "Failed to load stats");
//         setStats(data);
//       } catch (e) {
//         setErr(e.message);
//       } finally {
//         setLoading(false);
//       }
//     })();
//   }, [isInternal]);

//   if (loading) return <div className="p-6 text-blue-900">Loading stats…</div>;
//   if (err) return <div className="p-6 text-red-600">{err}</div>;

//   const { totalLogins, uniqueUsers, topUsers, trendLast30Days } = stats || {};

//   return (
//     <div className="min-h-screen bg-white p-6">
//       <div className="flex items-center justify-between mb-6">
//         <div>
//           <h1 className="text-2xl font-extrabold text-blue-950">Usage Stats</h1>
//           <div className="text-sm text-blue-900/70">
//             Internal (ME-DMZ only)
//           </div>
//         </div>
//         <a
//           href="#/overview"
//           className="text-sm font-semibold text-blue-700 hover:underline"
//         >
//           ← Back to Overview
//         </a>
//       </div>

//       {/* Top KPIs */}
//       <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
//         <div className="rounded-2xl border bg-blue-50 p-4">
//           <div className="text-xs uppercase text-blue-800/70 font-bold">
//             Total Logins
//           </div>
//           <div className="text-3xl font-extrabold text-blue-950">
//             {totalLogins ?? 0}
//           </div>
//         </div>

//         <div className="rounded-2xl border bg-blue-50 p-4">
//           <div className="text-xs uppercase text-blue-800/70 font-bold">
//             Unique Users
//           </div>
//           <div className="text-3xl font-extrabold text-blue-950">
//             {uniqueUsers ?? 0}
//           </div>
//         </div>

//         <div className="rounded-2xl border bg-blue-50 p-4">
//           <div className="text-xs uppercase text-blue-800/70 font-bold">
//             Last 30 Days Logins
//           </div>
//           <div className="text-3xl font-extrabold text-blue-950">
//             {(trendLast30Days || []).reduce((a, b) => a + (b.count || 0), 0)}
//           </div>
//         </div>
//       </div>

//       {/* Top Users */}
//       <div className="mb-10">
//         <h2 className="text-lg font-bold text-blue-950 mb-3">
//           Top Users (by logins)
//         </h2>

//         <div className="overflow-x-auto rounded-2xl border">
//           <table className="w-full text-sm">
//             <thead className="bg-blue-100 text-blue-950">
//               <tr>
//                 <th className="text-left p-3">Email</th>
//                 <th className="text-left p-3">Logins</th>
//                 <th className="text-left p-3">Last Login</th>
//                 <th className="text-left p-3">Last App</th>
//               </tr>
//             </thead>
//             <tbody>
//               {(topUsers || []).map((u) => (
//                 <tr key={u.email} className="border-t">
//                   <td className="p-3 font-medium text-blue-950">{u.email}</td>
//                   <td className="p-3">{u.loginCount}</td>
//                   <td className="p-3">
//                     {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : "-"}
//                   </td>
//                   <td className="p-3">{u.lastAppId || "-"}</td>
//                 </tr>
//               ))}
//               {!topUsers?.length && (
//                 <tr>
//                   <td className="p-3 text-blue-900/70" colSpan={4}>
//                     No users yet.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Trend (simple + sleek) */}
//       <div>
//         <h2 className="text-lg font-bold text-blue-950 mb-3">
//           Logins by Day (last 30 days)
//         </h2>

//         <div className="overflow-x-auto rounded-2xl border">
//           <table className="w-full text-sm">
//             <thead className="bg-blue-100 text-blue-950">
//               <tr>
//                 <th className="text-left p-3">Day</th>
//                 <th className="text-left p-3">Logins</th>
//               </tr>
//             </thead>
//             <tbody>
//               {(trendLast30Days || []).map((d) => (
//                 <tr key={d.day} className="border-t">
//                   <td className="p-3">{d.day}</td>
//                   <td className="p-3">{d.count}</td>
//                 </tr>
//               ))}

//               {!trendLast30Days?.length && (
//                 <tr>
//                   <td className="p-3 text-blue-900/70" colSpan={2}>
//                     No recent logins.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         <div className="text-xs text-blue-900/60 mt-2">
//           (Keeping it minimal for now — we can add a few visuals later if Chris wants.)
//         </div>
//       </div>
//     </div>
//   );
// }


import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Link } from "react-router-dom";

const API_BASE =
  import.meta.env.VITE_API_BASE ||
  "https://ai-dashboard-react.onrender.com";

export default function AdminStats() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const token = Cookies.get("idToken");
        if (!token) {
          setErr("No session token. Please sign in again.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE}/api/login-stats`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const t = await res.text();
          setErr(
            t || "Not authorized to view stats."
          );
          setLoading(false);
          return;
        }

        const json = await res.json();
        setData(json);
      } catch (e) {
        console.error(e);
        setErr("Failed to load stats. Check backend/API base.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) return <div className="p-6">Loading…</div>;

  if (err) {
    return (
      <div className="min-h-screen bg-white p-8">
        <Link to="/details" className="text-blue-700 underline text-sm">
          ← Back to dashboard
        </Link>
        <div className="mt-6 text-red-600 font-semibold">
          {err}
        </div>
      </div>
    );
  }

  const totals = data?.totals || {};
  const topUsers = data?.topUsers || [];
  const recent = data?.recentEvents || [];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex items-center justify-between mb-6">
        <Link to="/details" className="text-blue-700 underline text-sm">
          ← Back to dashboard
        </Link>
        <div className="text-blue-950 font-bold text-lg">
          Admin Login Stats
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <StatCard label="Total Users" value={totals.totalUsers ?? "—"} />
        <StatCard label="Total Logins" value={totals.totalLogins ?? "—"} />
        <StatCard label="Last 24h Logins" value={totals.last24hLogins ?? "—"} />
      </div>

      {/* Top users */}
      <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
        <h2 className="text-lg font-bold text-blue-950 mb-3">
          Top Users
        </h2>
        {topUsers.length === 0 ? (
          <div className="text-slate-500">No data yet.</div>
        ) : (
          <div className="space-y-2 text-sm">
            {topUsers.map((u) => (
              <div
                key={u.email}
                className="flex items-center justify-between border-b pb-2"
              >
                <div className="font-semibold">{u.email}</div>
                <div className="text-slate-700">
                  {u.loginCount} logins
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent events */}
      <div className="bg-white rounded-2xl border shadow-sm p-6">
        <h2 className="text-lg font-bold text-blue-950 mb-3">
          Recent Logins
        </h2>

        {recent.length === 0 ? (
          <div className="text-slate-500">No recent events.</div>
        ) : (
          <div className="space-y-2 text-sm">
            {recent.map((e, idx) => (
              <div
                key={idx}
                className="grid grid-cols-1 md:grid-cols-3 gap-2 border-b pb-2"
              >
                <div className="font-semibold">{e.email}</div>
                <div className="text-slate-700">
                  {new Date(e.at).toLocaleString()}
                </div>
                <div className="text-slate-500">
                  {e.appId || "unknown-app"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-2xl border shadow-sm p-5">
      <div className="text-xs uppercase tracking-wide text-blue-900/60">
        {label}
      </div>
      <div className="text-2xl font-extrabold text-blue-950 mt-1">
        {value}
      </div>
    </div>
  );
}

