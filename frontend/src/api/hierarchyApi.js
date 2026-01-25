import api from "./axios";

/**
 * Aggregate child serials into a parent
 * POST /aggregate
 */
export async function aggregateSerials(data) {
  const response = await api.post("/hierarchy/aggregate", data);
  return response.data;
}

/**
 * Verify hierarchy relationship between child and parent
 * POST /hierarchy
 */


/**
 * Trace full hierarchy path (Red Thread)
 * GET /trace/:serialNumber
 */
export async function traceSerial(serialNumber) {
  const response = await api.get(`/hierarchy/trace/${serialNumber}`);
  return response.data;
}
