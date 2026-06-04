import { useState } from "react";
import { aggregateSerials } from "../../../api/hierarchyApi";

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
      setError("Failed to aggregate serials. Check inputs and available child serials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-w-0 px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Hierarchy Aggregation
          </h1>
          <p className="mt-1 text-slate-500">
            Pack lower-level labels into higher-level packages.
          </p>
        </div>

        <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Child Level
              </label>
              <select
                name="childLevel"
                value={form.childLevel}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Parent Level
              </label>
              <select
                name="parentLevel"
                value={form.parentLevel}
                onChange={handleChange}
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
              >
                <option value="secondary">Secondary</option>
                <option value="tertiary">Tertiary</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Aggregation Ratio
              </label>
              <input
                type="number"
                name="ratio"
                value={form.ratio}
                onChange={handleChange}
                required
                min="1"
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Company Prefix
              </label>
              <input
                type="text"
                name="companyPrefix"
                value={form.companyPrefix}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="890123"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Product Code
              </label>
              <input
                type="text"
                name="productCode"
                value={form.productCode}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-slate-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                placeholder="PCM001"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-md bg-blue-600 py-3 text-base font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Aggregating..." : "Create Aggregation"}
              </button>
            </div>
          </form>
        </section>

        {result && (
          <section className="rounded-md border border-green-200 bg-green-50 p-5">
            <h2 className="text-lg font-semibold text-green-800">Aggregation Successful</h2>
            <p className="mt-2 text-green-700">
              Parent Serial: <span className="break-all font-mono font-bold">{result.parent}</span>
            </p>
            <div className="mt-4">
              <p className="mb-2 font-semibold text-green-700">Child Serials Packed</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {result.children.map((serial, idx) => (
                  <div key={idx} className="break-all rounded-md bg-white/70 px-3 py-2 font-mono text-xs text-green-900">
                    {serial}
                  </div>
                ))}
              </div>
            </div>
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
