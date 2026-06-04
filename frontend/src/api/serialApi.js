import api from "./axios";

/**
 * Generate a batch of serial labels
 * POST /generate-batch
 */
export async function generateBatch(data) {
  const response = await api.post("/serials/generate-batch", data);
  return response.data;
}

/**
 * Validate a serial using check digit API
 * GET /validate/:serial
 */
export async function validateSerial(serial) {
  const response = await api.get(`/serials/validate/${serial}`);
  return response.data;
}

/**
 * Decommission a batch of serial numbers
 * POST /decommission
 */
export async function decommissionBatch(data) {
  const response = await api.post("/serials/decommission", data);
  return response.data;
}

/**
 * Get admin dashboard statistics
 * GET /admin/stats
 */
export async function getAdminStats() {
  const response = await api.get("/serials/admin/stats");
  return response.data;
}
export async function getQRBySerial(serialNumber) {
  const response = await api.get(`/qr/${serialNumber}`);
  return response.data;
}
