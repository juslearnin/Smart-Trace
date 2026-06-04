import { useMemo, useState } from "react";
import { generateBatch } from "../../../api/serialApi";

const packagingOptions = [
  {
    value: "primary",
    label: "Primary",
    code: "PRI",
    helper: "Unit-level labels with Luhn check digits."
  },
  {
    value: "secondary",
    label: "Secondary",
    code: "SEC",
    helper: "Carton-level labels with unique serials."
  },
  {
    value: "tertiary",
    label: "Tertiary",
    code: "SSCC",
    helper: "18-digit GS1 SSCC labels for pallets."
  }
];

const pageSizeOptions = [10, 25, 50, 100];

function getErrorMessage(err) {
  if (err?.response?.data?.error) return err.response.data.error;
  if (err?.response?.data?.message) return err.response.data.message;
  if (err?.code === "ECONNABORTED") return "The backend request timed out. Check that the server and database are running.";
  if (err?.request) return "Cannot reach the backend at localhost:5000. Start the backend server and try again.";
  return "Failed to generate batch. Please try again.";
}

function buildBatchRecord(data, form, quantity) {
  const generatedAt = new Date();
  return {
    id: `BT-${generatedAt.getTime()}`,
    generatedAt,
    generated: data.generated,
    labels: data.labels || [],
    companyPrefix: form.companyPrefix.trim(),
    productCode: form.productCode.trim(),
    level: form.level,
    quantity
  };
}

function downloadCsv(batch) {
  if (!batch?.labels?.length) return;

  const rows = [
    ["index", "serialNumber", "level", "productCode", "companyPrefix"],
    ...batch.labels.map((label, index) => [
      index + 1,
      label.serialNumber,
      batch.level,
      batch.productCode,
      batch.companyPrefix
    ])
  ];

  const csv = rows
    .map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${batch.id}-${batch.productCode}-${batch.level}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function formatLevel(level) {
  return level.charAt(0).toUpperCase() + level.slice(1);
}

export default function GenerateBatch() {
  const [form, setForm] = useState({
    companyPrefix: "890123",
    productCode: "PCM500",
    level: "primary",
    quantity: "100",
  });

  const [loading, setLoading] = useState(false);
  const [activeBatch, setActiveBatch] = useState(null);
  const [batchHistory, setBatchHistory] = useState([]);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [copied, setCopied] = useState(false);

  const selectedOption = useMemo(
    () => packagingOptions.find(option => option.value === form.level),
    [form.level]
  );

  const filteredLabels = useMemo(() => {
    const labels = activeBatch?.labels || [];
    const query = search.trim();
    if (!query) return labels;
    return labels.filter(label => label.serialNumber.includes(query));
  }, [activeBatch, search]);

  const totalPages = Math.max(1, Math.ceil(filteredLabels.length / pageSize));
  const visibleLabels = filteredLabels.slice((page - 1) * pageSize, page * pageSize);

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
    setCopied(false);

    try {
      const quantity = Number(form.quantity);
      const data = await generateBatch({
        companyPrefix: form.companyPrefix.trim(),
        productCode: form.productCode.trim(),
        level: form.level,
        quantity,
        includeQr: quantity <= 1000,
      });
      const batch = buildBatchRecord(data, form, quantity);

      setActiveBatch(batch);
      setBatchHistory(prev => [batch, ...prev]);
      setSearch("");
      setPage(1);
    } catch (err) {
      console.error("Generate batch error:", err);
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function copyVisibleSerials() {
    if (!visibleLabels.length) return;
    await navigator.clipboard.writeText(visibleLabels.map(label => label.serialNumber).join("\n"));
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  return (
    <div className="trace-workspace min-h-full px-5 py-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="lift-in flex flex-col gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Label Management
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
              Generate Label Batch
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Generate, review, search, copy, and export serial labels from one clean workspace.
            </p>
          </div>

          <div className="grid w-full max-w-lg grid-cols-3 rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="p-3">
              <div className="text-xs text-slate-500">Duplicates</div>
              <div className="text-sm font-bold text-emerald-700">Blocked</div>
            </div>
            <div className="border-l border-slate-200 p-3">
              <div className="text-xs text-slate-500">Check Digit</div>
              <div className="text-sm font-bold text-slate-950">Luhn / GS1</div>
            </div>
            <div className="border-l border-slate-200 p-3">
              <div className="text-xs text-slate-500">View</div>
              <div className="text-sm font-bold text-slate-950">Paged</div>
            </div>
          </div>
        </header>

        <section className="lift-in rounded-md border border-slate-200 bg-white shadow-sm">
          <form onSubmit={handleSubmit} className="p-5">
            <div className="grid gap-4 lg:grid-cols-[1fr_1fr_170px_140px]">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Company Prefix
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  name="companyPrefix"
                  value={form.companyPrefix}
                  onChange={handleChange}
                  required
                  pattern="[0-9]{6,12}"
                  className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="890123"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Product Code
                </label>
                <input
                  type="text"
                  name="productCode"
                  value={form.productCode}
                  onChange={handleChange}
                  required
                  className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="PCM500"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Level
                </label>
                <select
                  name="level"
                  value={form.level}
                  onChange={handleChange}
                  className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                >
                  {packagingOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Quantity
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  required
                  min="1"
                  max="50000"
                  className="w-full rounded-md border border-slate-300 px-3 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="100"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="rounded-md bg-slate-50 px-3 py-2 text-sm text-slate-600">
                <span className="font-semibold text-slate-900">{selectedOption?.code}</span>
                <span className="mx-2 text-slate-300">|</span>
                {selectedOption?.helper}
              </div>

              <div className="grid gap-3 sm:grid-cols-[220px_96px]">
                <button
                  type="submit"
                  disabled={loading}
                  className="launch-button inline-flex min-h-11 items-center justify-center rounded-md bg-blue-600 px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Generating..." : "Generate Batch"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveBatch(null);
                    setError(null);
                    setSearch("");
                    setPage(1);
                  }}
                  className="min-h-11 rounded-md border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Clear
                </button>
              </div>
            </div>
          </form>
        </section>

        {error && (
          <section className="lift-in rounded-md border border-red-200 bg-red-50 p-5 shadow-sm">
            <h2 className="text-base font-semibold text-red-900">Generation Failed</h2>
            <p className="mt-1 text-sm text-red-800">{error}</p>
          </section>
        )}

        <section className="lift-in min-w-0 rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Generated Labels</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Search and export every serial from the active batch.
                </p>
              </div>

              {activeBatch && (
                <div className="grid grid-cols-3 overflow-hidden rounded-md border border-slate-200 text-sm">
                  <div className="bg-slate-50 px-4 py-2">
                    <div className="text-xs text-slate-500">Batch</div>
                    <div className="max-w-[160px] truncate font-semibold text-slate-950">
                      {activeBatch.id}
                    </div>
                  </div>
                  <div className="border-l border-slate-200 px-4 py-2">
                    <div className="text-xs text-slate-500">Labels</div>
                    <div className="font-semibold text-slate-950">{activeBatch.generated}</div>
                  </div>
                  <div className="border-l border-slate-200 px-4 py-2">
                    <div className="text-xs text-slate-500">Level</div>
                    <div className="font-semibold text-slate-950">{formatLevel(activeBatch.level)}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {!activeBatch && !error && (
            <div className="p-5">
              <div className="grid min-h-[260px] place-items-center rounded-md border border-dashed border-slate-300 bg-slate-50">
                <div className="max-w-sm text-center">
                  <div className="mx-auto mb-4 h-1 w-24 rounded-full bg-blue-600" />
                  <h3 className="text-base font-semibold text-slate-950">No active batch yet</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Generate a batch to populate the label ledger.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeBatch && (
            <div className="p-5">
              <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_140px_120px_120px]">
                <input
                  type="search"
                  value={search}
                  onChange={e => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                  placeholder="Search serial number..."
                />
                <select
                  value={pageSize}
                  onChange={e => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                  className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  {pageSizeOptions.map(size => (
                    <option key={size} value={size}>
                      {size} / page
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={copyVisibleSerials}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {copied ? "Copied" : "Copy Page"}
                </button>
                <button
                  type="button"
                  onClick={() => downloadCsv(activeBatch)}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
                >
                  Export CSV
                </button>
              </div>

              <div className="overflow-hidden rounded-md border border-slate-200">
                <div className="grid grid-cols-[56px_minmax(0,1fr)_112px_92px] bg-slate-950 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white">
                  <div>#</div>
                  <div>Serial Number</div>
                  <div>Level</div>
                  <div>QR</div>
                </div>
                <div className="divide-y divide-slate-100 bg-white">
                  {visibleLabels.map((label, index) => {
                    const absoluteIndex = (page - 1) * pageSize + index + 1;
                    return (
                      <div
                        key={`${label.serialNumber}-${absoluteIndex}`}
                        className="serial-line grid grid-cols-[56px_minmax(0,1fr)_112px_92px] items-center px-4 py-3 text-sm hover:bg-blue-50/70"
                        style={{ animationDelay: `${Math.min(index, 10) * 18}ms` }}
                      >
                        <div className="text-slate-500">{absoluteIndex}</div>
                        <div className="min-w-0 break-all font-mono text-slate-950">{label.serialNumber}</div>
                        <div className="text-slate-600">{formatLevel(activeBatch.level)}</div>
                        <div>
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            label.qrCode
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}>
                            {label.qrCode ? "Ready" : "Skipped"}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-slate-500">
                  Showing {visibleLabels.length ? (page - 1) * pageSize + 1 : 0}
                  {" "}to {Math.min(page * pageSize, filteredLabels.length)}
                  {" "}of {filteredLabels.length} labels
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPage(prev => Math.max(1, prev - 1))}
                    disabled={page === 1}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-semibold text-slate-700">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={page === totalPages}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </section>

        {batchHistory.length > 0 && (
          <section className="lift-in rounded-md border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950">Batch Ledger</h2>
                <p className="mt-1 text-sm text-slate-500">Generated during this browser session.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {batchHistory.length} total
              </span>
            </div>
            <div className="flex flex-wrap gap-3">
              {batchHistory.map(batch => (
                <button
                  key={batch.id}
                  type="button"
                  onClick={() => {
                    setActiveBatch(batch);
                    setSearch("");
                    setPage(1);
                  }}
                  className={`min-w-[210px] rounded-md border px-4 py-3 text-left transition hover:border-blue-300 hover:bg-blue-50 ${
                    activeBatch?.id === batch.id
                      ? "border-blue-600 bg-blue-50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {batch.id}
                      </div>
                      <div className="mt-1 font-semibold text-slate-950">{batch.productCode}</div>
                    </div>
                    <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">
                      {batch.generated}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm text-slate-500">
                    <span>{formatLevel(batch.level)}</span>
                    <span>{batch.generatedAt.toLocaleTimeString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
