import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import AdminLayout from "./layouts/AdminLayout";
import QRScanVerify from "./pages/public/QRScanVerify";

// Admin pages
import Overview from "./pages/admin/Dashboard/Overview";
import Reports from "./pages/admin/Dashboard/Reports";
import GenerateBatch from "./pages/admin/Generation/GenerateBatch";
import Aggregate from "./pages/admin/Hierarchy/Aggregate";
import Decommission from "./pages/admin/Hierarchy/Decommission";

// Public pages
import ScanVerify from "./pages/public/ScanVerify";
import TraceView from "./pages/public/TraceView";
import HierarchyVerify from "./pages/public/HierarchyVerify";

import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Routes>
          
          
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* -------- ADMIN ROUTES -------- */}
        <Route path="/admin" element={<AdminLayout />}>
          {/* Default admin route */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />

          {/* Dashboard */}
          <Route path="dashboard" element={<Overview />} />
          <Route path="dashboard/reports" element={<Reports />} />

          {/* Generation */}
          <Route path="generation/generate" element={<GenerateBatch />} />

          {/* Hierarchy */}
          <Route path="hierarchy/aggregate" element={<Aggregate />} />
          <Route path="hierarchy/decommission" element={<Decommission />} />
          <Route path="verify" element={<ScanVerify />} />
          <Route path="trace" element={<TraceView />} />
          <Route path="verify-hierarchy" element={<HierarchyVerify />} />
          
          <Route path="qr-scan" element={<QRScanVerify />} />

        </Route>

        {/* Redirect root to public verify */}
        <Route path="/" element={<Navigate to="/verify" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
