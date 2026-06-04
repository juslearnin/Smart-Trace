import { useState } from "react";
import { decommissionBatch } from "../../../api/serialApi";

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
      const data = await decommissionBatch({ serialNumbers });
      setResult(data);
    } catch (err) {
      console.error("Decommission error:", err);
      setError("Failed to decommission serial numbers.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-w-0 px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Decommission Serial Numbers
          </h1>
          <p className="mt-1 text-slate-500">
            Deactivate expired, recalled, or retired labels in bulk.
          </p>
        </div>

        <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between gap-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Serial Numbers
                </label>
                <span className="text-xs text-slate-500">
                  One per line
                </span>
              </div>
              <textarea
                rows={9}
                value={input}
                onChange={e => setInput(e.target.value)}
                className="w-full resize-y rounded-md border border-slate-300 px-3 py-2 font-mono text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder={`890123...\n890124...\n890125...`}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-red-600 py-3 text-base font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
            >
              {loading ? "Decommissioning..." : "Decommission Batch"}
            </button>
          </form>
        </section>

        {result && (
          <section className="rounded-md border border-green-200 bg-green-50 p-5">
            <h2 className="text-lg font-semibold text-green-800">Decommission Successful</h2>
            <p className="mt-2 text-green-700">
              Modified Records: <span className="font-bold">{result.modified}</span>
            </p>
          </section>
        )}

        {error && (
          <section className="rounded-md border border-red-200 bg-red-50 p-5 text-red-700">
            {error}
          </section>
        )}
      </div>
    </div>
  );
}
