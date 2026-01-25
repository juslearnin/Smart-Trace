/**
 * Topbar
 * Header bar for admin layout.
 * Shows app name and simple system info.
 */
export default function Topbar() {
  return (
    <div className="w-full flex items-center justify-between">

      {/* Left: Page Title / App Name */}
      <div className="text-lg font-semibold text-gray-800">
        SmartTrace ❤️
      </div>

      {/* Right: Environment / Status */}
      <div className="flex items-center space-x-4">

        {/* Environment badge */}
        <span className="px-3 py-1 text-xs rounded bg-green-100 text-green-700">
          DEV
        </span>

        {/* Version info */}
        <span className="text-sm text-gray-500">
          v1.0
        </span>

      </div>
    </div>
  );
}
