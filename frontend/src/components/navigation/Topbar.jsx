export default function Topbar({ onMenuClick }) {
  return (
    <div className="w-full flex items-center justify-between">
      <div className="flex items-center gap-4">
        <button
          type="button"
          aria-label="Open sidebar"
          onClick={onMenuClick}
          className="grid h-10 w-10 place-items-center rounded-md border border-slate-200 text-slate-700 transition hover:bg-slate-50 hover:text-slate-950"
        >
          <span className="space-y-1.5">
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
          </span>
        </button>

        <div>
          <div className="text-lg font-semibold text-slate-900">
            SmartTrace
          </div>
          <div className="text-xs text-slate-500">
            Label generation, verification, and hierarchy controls
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          DEV
        </span>
        <span className="text-sm text-slate-500">
          v1.0
        </span>
      </div>
    </div>
  );
}
