import api from "./axios";

/**
 * Listare cereri.
 * Presupunem endpoint: GET /leave-requests
 * Dacă la tine e alt path (ex: /leave-requests/my), schimbi DOAR aici.
 */
export async function getLeaveRequests(params = {}) {
  const res = await api.get("/leave-requests", { params });
  return res.data;
}