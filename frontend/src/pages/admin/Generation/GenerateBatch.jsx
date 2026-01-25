import { useState } from "react";
import { generateBatch } from "../../../api/serialApi";

/**
 * GenerateBatch
 * Enhanced admin UI for batch generation with progress and status.
 */
export default function GenerateBatch() {
  const [form, setForm] = useState({
    companyPrefix: "",
    productCode: "",
    level: "primary",
    quantity: "",
  });

  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
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
    setProgress(10);

    try {
      // Fake smooth progress while waiting for backend
      const interval = setInterval(() => {
        setProgress(prev => (prev < 90 ? prev + 5 : prev));
      }, 200);

      const data = await generateBatch({
        companyPrefix: form.companyPrefix,
        productCode: form.productCode,
        level: form.level,
        quantity: Number(form.quantity),
      });

      clearInterval(interval);
      setProgress(100);
      setResult(data);
    } catch (err) {
      console.error("Generate batch error:", err);
      setError("Failed to generate batch. Please try again.");
      setProgress(0);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8 w-full">

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          Generate Label Batch
        </h1>
        <p className="text-gray-500 mt-1">
          Generate GS1-compliant serial labels for primary, secondary, or tertiary packaging.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow p-8 w-full">

        {/* Progress Bar */}
        {loading && (
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Generating labels...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Form Grid */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

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
          <div>
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

          {/* Packaging Level */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Packaging Level
            </label>
            <select
              name="level"
              value={form.level}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="primary">Primary (Unit)</option>
              <option value="secondary">Secondary (Carton)</option>
              <option value="tertiary">Tertiary (Pallet)</option>
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity
            </label>
            <input
              type="number"
              name="quantity"
              value={form.quantity}
              onChange={handleChange}
              required
              min="1"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500"
              placeholder="e.g. 1000"
            />
          </div>

          {/* Submit Button - Full Width */}
          <div className="md:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 disabled:opacity-50 transition"
            >
              {loading ? "Generating..." : "Generate Batch"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Panel */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 space-y-2">
          <h2 className="text-lg font-semibold text-green-800">
            Batch Generated Successfully 🎉
          </h2>
          <p className="text-green-700">
            Generated Labels: <span className="font-bold">{result.generated}</span>
          </p>
          <p className="text-sm text-green-600">
            You can now proceed to aggregation or printing.
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
