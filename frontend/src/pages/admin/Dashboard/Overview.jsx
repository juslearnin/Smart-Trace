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
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
        {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-gray-500">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-8 w-full">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-1">
          Real-time traceability and verification statistics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

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
  );
}
