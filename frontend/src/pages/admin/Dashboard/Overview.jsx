import { useEffect, useState } from "react";
import { getAdminStats } from "../../../api/serialApi";

import StatCard from "../../../components/cards/StatCard";
import ScanStatsChart from "../../../components/charts/ScanStatsChart";
import ScanLogTable from "../../../components/tables/ScanLogTable";

export default function Overview() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (err) {
        console.error("Dashboard stats error:", err);
        setError("Failed to load dashboard statistics.");
      }
    }

    fetchStats();
  }, []);

  if (error) {
    return (
      <div className="px-5 py-6 lg:px-8">
        <div className="mx-auto max-w-7xl bg-red-50 border border-red-200 rounded-md p-5 text-red-700">
          {error}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="px-5 py-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-slate-500">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Dashboard Overview
        </h1>
        <p className="text-slate-500 mt-1">
          Real-time traceability and verification statistics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Serials"
          value={stats.totalSerials}
          color="text-blue-600"
        />
        <StatCard
          title="Active Serials"
          value={stats.activeSerials}
          color="text-green-600"
        />
        <StatCard
          title="Decommissioned"
          value={stats.decommissionedSerials}
          color="text-red-600"
        />
        <StatCard
          title="Total Scans"
          value={stats.totalScans}
          color="text-purple-600"
        />
      </div>

      {/* Charts + Tables */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">

        {/* Scan Stats Chart */}
        <ScanStatsChart
          stats={{
            valid: stats.validScans,
            suspect: stats.suspectScans,
            invalid: stats.invalidScans,
          }}
        />

        {/* Recent Scans Table */}
        <ScanLogTable scans={stats.recentScans} />

      </div>
      </div>
    </div>
  );
}
