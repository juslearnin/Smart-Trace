import { Outlet } from "react-router-dom";

/**
 * PublicLayout
 * This layout wraps all public pages like:
 * - Scan & Verify
 * - Trace View
 *
 * It provides:
 * - Centered container
 * - Minimal UI
 * - Mobile-friendly layout
 */
export default function PublicLayout() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="w-full max-w-2xl p-4">
        <Outlet />
      </div>
    </div>
  );
}
