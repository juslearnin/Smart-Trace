import { NavLink } from "react-router-dom";

const sections = [
  {
    title: "Overview",
    links: [
      { to: "/admin/dashboard", label: "Dashboard" }
    ]
  },
  {
    title: "Label Management",
    links: [
      { to: "/admin/generation/generate", label: "Generate Batch" }
    ]
  },
  {
    title: "Hierarchy",
    links: [
      { to: "/admin/hierarchy/aggregate", label: "Aggregate" },
      { to: "/admin/hierarchy/decommission", label: "Decommission" }
    ]
  },
  {
    title: "Verification",
    links: [
      { to: "/admin/verify", label: "Scan & Verify" },
      { to: "/admin/qr-scan", label: "QR Scan & Verify" },
      { to: "/admin/trace", label: "Trace View" },
      { to: "/admin/verify-hierarchy", label: "Hierarchy Verify" }
    ]
  }
];

export default function Sidebar({ onNavigate, onClose }) {
  const linkClass = ({ isActive }) =>
    `block rounded-md px-3 py-2 text-sm font-medium transition ${
      isActive
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
    }`;

  return (
    <div className="h-full flex flex-col px-5 py-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="text-2xl font-bold tracking-tight text-slate-950">
            SmartTrace
          </div>
          <div className="mt-1 text-xs uppercase tracking-widest text-slate-400">
            Admin Console
          </div>
        </div>
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-md border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-950"
        >
          <span className="text-xl leading-none">&times;</span>
        </button>
      </div>

      <nav className="flex-1 space-y-6">
        {sections.map(section => (
          <div key={section.title}>
            <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {section.title}
            </div>
            <div className="space-y-1">
              {section.links.map(link => (
                <NavLink key={link.to} to={link.to} className={linkClass} onClick={onNavigate}>
                  {link.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-3">
        <div className="text-xs font-semibold text-slate-700">System Status</div>
        <div className="mt-1 text-xs text-slate-500">Backend: localhost:5000</div>
      </div>

      <div className="mt-5 text-xs text-slate-400">
        (c) 2026 SmartTrace
      </div>
    </div>
  );
}
