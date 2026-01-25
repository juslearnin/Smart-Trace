import { useState } from "react";
import { aggregateSerials } from "../../../api/hierarchyApi";

/**
 * Aggregate
 * Admin page to aggregate child serials into a parent package.
 * Connected to POST /aggregate
 */
export default function Aggregate() {
  const [form, setForm] = useState({
    childLevel: "primary",
    parentLevel: "secondary",
    ratio: "",
    companyPrefix: "",
    productCode: "",
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await aggregateSerials({
        childLevel: form.childLevel,
        parentLevel: form.parentLevel,
        ratio: Number(form.ratio),
        companyPrefix: form.companyPrefix,
        productCode: form.productCode,
      });

      setResult(data);
    } catch (err) {
      console.error("Aggregation error:", err);
      setError("Failed to aggregate serials. Check inputs and availability.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 w-full">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Hierarchy Aggregation
        </h1>
        <p className="text-gray-500 mt-1">
          Pack lower-level units into higher-level packages (Primary → Secondary → Tertiary).
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow p-8 w-full">

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Child Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child Level
            </label>
            <select
              name="childLevel"
              value={form.childLevel}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="primary">Primary (Unit)</option>
              <option value="secondary">Secondary (Carton)</option>
            </select>
          </div>

          {/* Parent Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Level
            </label>
            <select
              name="parentLevel"
              value={form.parentLevel}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="secondary">Secondary (Carton)</option>
              <option value="tertiary">Tertiary (Pallet)</option>
            </select>
          </div>

          {/* Ratio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aggregation Ratio
            </label>
            <input
              type="number"
              name="ratio"
              value={form.ratio}
              onChange={handleChange}
              required
              min="1"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              placeholder="e.g. 10 units per package"
            />
          </div>

          {/* Company Prefix */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Prefix
            </label>
            <input
              type="text"
              name="companyPrefix"
              value={form.companyPrefix}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              placeholder="e.g. 890123"
            />
          </div>

          {/* Product Code */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Code
            </label>
            <input
              type="text"
              name="productCode"
              value={form.productCode}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              placeholder="e.g. PCM001"
            />
          </div>

          {/* Submit Button */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-purple-700 disabled:opacity-50 transition"
            >
              {loading ? "Aggregating..." : "Create Aggregation"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Panel */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-3">
          <h2 className="text-lg font-semibold text-green-800">
            Aggregation Successful 🎯
          </h2>

          <p className="text-green-700">
            Parent Serial:{" "}
            <span className="font-mono font-bold">
              {result.parent}
            </span>
          </p>

          <div>
            <p className="text-green-700 font-semibold mb-1">
              Child Serials Packed:
            </p>
            <ul className="list-disc ml-6 text-sm text-green-700 max-h-40 overflow-y-auto">
              {result.children.map((s, idx) => (
                <li key={idx} className="font-mono">
                  {s}
                </li>
              ))}
            </ul>
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
