import { Outlet } from "react-router-dom";
import Sidebar from "../components/navigation/Sidebar";
import Topbar from "../components/navigation/Topbar";

/**
 * AdminLayout
 * This layout wraps all /admin/* pages.
 * It provides:
 * - Left sidebar navigation
 * - Topbar header
 * - Main content area for admin pages
 */
export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-gray-100">

      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white">
        <Sidebar />
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col">

        {/* Topbar */}
        <div className="h-14 bg-white border-b flex items-center px-6">
          <Topbar />
        </div>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </div>

      </div>
    </div>
  );
}
