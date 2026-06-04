export default function StatCard({ title, value, color }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`mt-2 truncate text-3xl font-bold ${color}`} title={String(value)}>
        {value}
      </p>
    </div>
  );
}
