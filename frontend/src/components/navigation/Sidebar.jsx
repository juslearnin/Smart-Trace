import { NavLink } from "react-router-dom";

/**
 * Sidebar
 * Light sky-blue themed admin navigation
 */
export default function Sidebar() {
  const linkClass = ({ isActive }) =>
    `block px-4 py-2 rounded transition ${
      isActive
        ? "bg-sky-200 text-sky-800 font-semibold"
        : "text-sky-700 hover:bg-sky-200"
    }`;

  return (
    <div className="h-full flex flex-col p-4 space-y-6 bg-sky-300">

      {/* App Title */}
      <div className="text-xl font-bold text-sky-800 text-center">
        SmartTrace
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">

        {/* Dashboard */}
        <NavLink to="/admin/dashboard" className={linkClass}>
          Dashboard
        </NavLink>
{/* 
        <NavLink to="/admin/dashboard/reports" className={linkClass}>
          Reports
        </NavLink> */}

        {/* Section */}
        <div className="mt-4 text-xs text-sky-600 uppercase tracking-wider">
          Label Management
        </div>

        <NavLink to="/admin/generation/generate" className={linkClass}>
          Generate Batch
        </NavLink>

        {/* Section */}
        <div className="mt-4 text-xs text-sky-600 uppercase tracking-wider">
          Hierarchy
        </div>

        <NavLink to="/admin/hierarchy/aggregate" className={linkClass}>
          Aggregate
        </NavLink>

        <NavLink to="/admin/hierarchy/decommission" className={linkClass}>
          Decommission
        </NavLink>

        <div className="mt-4 text-xs text-sky-600 uppercase tracking-wider">
          Verification and Tracking
        </div>

        <NavLink to="/admin/verify" className={linkClass}>
          Scan & Verify
        </NavLink>

        
        <NavLink to="/admin/qr-scan" className={linkClass}>
            QR Scan & Verify
        </NavLink>


        <NavLink to="/admin/trace" className={linkClass}>
          Trace View
        </NavLink>

        <NavLink to="/admin/verify-hierarchy" className={linkClass}>
          Hierarchy Verify
                  </NavLink>


      </nav>

      {/* Footer */}
      <div className="text-xs text-sky-600 text-center">
        © 2026 SmartTrace
      </div>
    </div>
  );
}
