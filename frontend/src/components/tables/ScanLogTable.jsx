export default function ScanLogTable({ scans }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-950 mb-4">
        Recent Scan Logs
      </h3>

      <div className="overflow-hidden rounded-md border border-slate-100">
        <table className="w-full table-fixed text-sm">
          <thead>
            <tr className="border-b bg-slate-50 text-slate-500">
              <th className="w-[42%] text-left px-3 py-2">Serial</th>
              <th className="w-[18%] text-left px-3 py-2">Status</th>
              <th className="w-[16%] text-left px-3 py-2">Location</th>
              <th className="w-[24%] text-left px-3 py-2">Scanned At</th>
            </tr>
          </thead>

          <tbody>
            {scans.length === 0 && (
              <tr>
                <td className="px-3 py-6 text-center text-slate-500" colSpan="4">
                  No scan logs yet.
                </td>
              </tr>
            )}

            {scans.map((log, idx) => (
              <tr key={idx} className="border-b">
                <td className="break-all px-3 py-2 font-mono text-xs">
                  {log.serialNumber}
                </td>

                <td className="px-3 py-2">
                  <span
                    className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
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

                <td className="truncate px-3 py-2" title={log.location || "-"}>
                  {log.location || "-"}
                </td>

                <td className="px-3 py-2 text-slate-500">
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
