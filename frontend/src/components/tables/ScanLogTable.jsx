export default function ScanLogTable({ scans }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Recent Scan Logs
      </h3>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b text-gray-500">
              <th className="text-left py-2">Serial</th>
              <th className="text-left py-2">Status</th>
              <th className="text-left py-2">Location</th>
              <th className="text-left py-2">Scanned At</th>
            </tr>
          </thead>

          <tbody>
            {scans.map((log, idx) => (
              <tr key={idx} className="border-b">
                <td className="py-2 font-mono text-xs">
                  {log.serialNumber}
                </td>

                <td className="py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      log.status === "VALID"
                        ? "bg-green-100 text-green-800"
                        : log.status === "SUSPECT"
                        ? "bg-orange-100 text-orange-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {log.status}
                  </span>
                </td>

                <td className="py-2">
                  {log.location || "-"}
                </td>

                <td className="py-2 text-gray-500">
                  {new Date(log.scannedAt).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
