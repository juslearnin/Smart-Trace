import { useState } from "react";
import { verifyHierarchy } from "../../api/verifyApi";

/**
 * HierarchyVerify
 * Verify if a child serial belongs to a given parent serial.
 * Connected to POST /hierarchy
 */
export default function HierarchyVerify() {
  const [form, setForm] = useState({
    childSerial: "",
    parentSerial: "",
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
      const data = await verifyHierarchy({
        childSerial: form.childSerial,
        parentSerial: form.parentSerial,
      });

      setResult(data);
    } catch (err) {
      console.error("Hierarchy verify error:", err);
      setError("Failed to verify hierarchy.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">

      {/* Page Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          Hierarchy Verification
        </h1>
        <p className="text-gray-500 mt-1">
          Verify whether a unit belongs to a claimed package.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow p-8 space-y-6">

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Child Serial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Child Serial Number
            </label>
            <input
              type="text"
              name="childSerial"
              value={form.childSerial}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 font-mono"
              placeholder="Enter primary/secondary serial"
            />
          </div>

          {/* Parent Serial */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Parent Serial Number
            </label>
            <input
              type="text"
              name="parentSerial"
              value={form.parentSerial}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-500 font-mono"
              placeholder="Enter secondary/tertiary serial"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-teal-700 disabled:opacity-50 transition"
          >
            {loading ? "Verifying..." : "Verify Hierarchy"}
          </button>
        </form>
      </div>

      {/* Result Panel */}
      {result && (
        <div
          className={`border rounded-xl p-6 space-y-3 ${
            result.valid
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          <h2 className="text-xl font-bold">
            {result.valid ? "VALID HIERARCHY" : "INVALID HIERARCHY"}
          </h2>

          <p className="font-semibold">
            {result.message}
          </p>

          <div className="text-sm space-y-1">
            <p>
              <span className="font-medium">Child Serial:</span>{" "}
              <span className="font-mono">{form.childSerial}</span>
            </p>
            <p>
              <span className="font-medium">Parent Serial:</span>{" "}
              <span className="font-mono">{form.parentSerial}</span>
            </p>
          </div>

          {result.childLevel && result.parentLevel && (
            <p className="text-sm">
              Relationship:{" "}
              <span className="font-semibold capitalize">
                {result.childLevel} → {result.parentLevel}
              </span>
            </p>
          )}
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
