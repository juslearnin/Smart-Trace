import api from "./axios";

export async function scanAndVerify(data) {
  const response = await api.post("/verify/scan", data);
  return response.data;
}
export async function verifyHierarchy(data) {
  const response = await api.post("/verify/hierarchy", data);
  return response.data;
}