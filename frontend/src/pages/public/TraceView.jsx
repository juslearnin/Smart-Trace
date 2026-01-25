import { useState } from "react";
import { traceSerial } from "../../api/hierarchyApi";

/**
 * TraceView
 * Visualizes the full packaging hierarchy (Red Thread)
 * Connected to GET /trace/:serialNumber
 */
export default function TraceView() {
  const [serialNumber, setSerialNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await traceSerial(serialNumber);
      setResult(data);
    } catch (err) {
      console.error("Trace error:", err);
      setError("Failed to trace serial number. Please check and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-10">

      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Red Thread Traceability
        </h1>
        <p className="text-gray-500 mt-1">
          Visualize the complete packaging hierarchy for a product serial.
        </p>
      </div>

      {/* Input Card */}
      <div className="bg-white rounded-xl shadow p-8 space-y-6">

        <form onSubmit={handleSubmit} className="flex gap-4">

          <input
            type="text"
            value={serialNumber}
            onChange={e => setSerialNumber(e.target.value)}
            required
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 font-mono"
            placeholder="Enter serial number to trace"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            {loading ? "Tracing..." : "Trace"}
          </button>

        </form>
      </div>

      {/* Result Visualization */}
      {result && (
        <div className="bg-white rounded-xl shadow p-10 space-y-8">

          <h2 className="text-xl font-semibold text-gray-800">
            Trace Path
          </h2>

          {/* Timeline */}
          <div className="flex items-center justify-center flex-wrap gap-10">

            {/* Start Node (Primary) */}
            <div className="flex flex-col items-center">

              <div
                title={result.start}
                className="w-24 h-24 rounded-full bg-blue-100 border-2 border-blue-400 
                           flex items-center justify-center p-2 text-blue-800"
              >
                <span className="font-mono text-xs break-all line-clamp-3 text-center">
                  {result.start}
                </span>
              </div>

              <p className="mt-3 text-sm font-medium text-gray-700 capitalize">
                {result.level}
              </p>
            </div>

            {/* Parent Nodes */}
            {result.tracePath.map((node, idx) => (
              <div key={idx} className="flex items-center gap-10">

                {/* Arrow */}
                <div className="text-3xl text-gray-400">
                  →
                </div>

                {/* Node */}
                <div className="flex flex-col items-center">

                  <div
                    title={node.serialNumber}
                    className="w-24 h-24 rounded-full bg-green-100 border-2 border-green-400 
                               flex items-center justify-center p-2 text-green-800"
                  >
                    <span className="font-mono text-xs break-all line-clamp-3 text-center">
                      {node.serialNumber}
                    </span>
                  </div>

                  <p className="mt-3 text-sm font-medium text-gray-700 capitalize">
                    {node.level}
                  </p>
                </div>

              </div>
            ))}

          </div>
        </div>
      )}

      {/* Error Panel */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
