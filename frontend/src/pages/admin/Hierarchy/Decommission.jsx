import { useState } from "react";
import { decommissionBatch } from "../../../api/serialApi";

/**
 * Decommission
 * Admin page to decommission a batch of serial numbers.
 * Connected to POST /decommission
 */
export default function Decommission() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function parseSerialNumbers(text) {
    return text
      .split("\n")
      .map(s => s.trim())
      .filter(Boolean);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    const serialNumbers = parseSerialNumbers(input);

    if (serialNumbers.length === 0) {
      setError("Please enter at least one serial number.");
      setLoading(false);
      return;
    }

    try {
      const data = await decommissionBatch({
        serialNumbers,
      });

      setResult(data);
    } catch (err) {
      console.error("Decommission error:", err);
      setError("Failed to decommission serial numbers.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 w-full">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Decommission Serial Numbers
        </h1>
        <p className="text-gray-500 mt-1">
          Deactivate expired or recalled product serials in bulk.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow p-8 w-full space-y-6">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Textarea Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Serial Numbers (one per line)
            </label>
            <textarea
              rows={8}
              value={input}
              onChange={e => setInput(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring focus:border-blue-500"
              placeholder={`Enter serial numbers, for example:\n890123...\n890124...\n890125...`}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-red-700 disabled:opacity-50 transition"
          >
            {loading ? "Decommissioning..." : "Decommission Batch"}
          </button>
        </form>
      </div>

      {/* Success Panel */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-2">
          <h2 className="text-lg font-semibold text-green-800">
            Decommission Successful 🗑️
          </h2>
          <p className="text-green-700">
            Modified Records:{" "}
            <span className="font-bold">
              {result.modified}
            </span>
          </p>
          <p className="text-sm text-green-600">
            The selected serial numbers are now deactivated.
          </p>
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
