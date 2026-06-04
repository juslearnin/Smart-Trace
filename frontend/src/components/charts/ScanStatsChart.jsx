export default function ScanStatsChart({ stats }) {
  const total =
    stats.valid + stats.suspect + stats.invalid || 1;

  function barWidth(count) {
    return `${Math.round((count / total) * 100)}%`;
  }

  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-white p-5 shadow-sm space-y-4">
      <h3 className="text-lg font-semibold text-slate-950">
        Scan Status Distribution
      </h3>

      {/* VALID */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-green-700 font-medium">VALID</span>
          <span>{stats.valid}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-green-500 h-3 rounded-full"
            style={{ width: barWidth(stats.valid) }}
          />
        </div>
      </div>

      {/* SUSPECT */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-orange-700 font-medium">SUSPECT</span>
          <span>{stats.suspect}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-orange-500 h-3 rounded-full"
            style={{ width: barWidth(stats.suspect) }}
          />
        </div>
      </div>

      {/* INVALID */}
      <div>
        <div className="flex justify-between text-sm mb-1">
          <span className="text-red-700 font-medium">INVALID</span>
          <span>{stats.invalid}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-red-500 h-3 rounded-full"
            style={{ width: barWidth(stats.invalid) }}
          />
        </div>
      </div>
    </div>
  );
}
