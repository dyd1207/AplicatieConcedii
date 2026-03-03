import api from "./axios";

export async function getLeaveRequests(params = {}) {
  const res = await api.get("/leave-requests", { params });
  return res.data;
}

export async function createLeaveRequest(payload) {
  // backend: POST /leave-requests/draft
  const res = await api.post("/leave-requests/draft", payload);
  return res.data;
}

export async function submitLeaveRequest(id) {
  // backend: POST /leave-requests/:id/submit
  const res = await api.post(`/leave-requests/${id}/submit`);
  return res.data;
}