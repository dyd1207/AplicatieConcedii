import api from "./axios";

export async function getMyLeaveBalance(year) {
  const res = await api.get("/leave-balance/me", {
    params: year ? { year: Number(year) } : {},
  });
  return res.data;
}

export async function getUserLeaveBalance(userId, year) {
  const res = await api.get(`/leave-balance/${userId}`, {
    params: year ? { year: Number(year) } : {},
  });
  return res.data;
}

export async function upsertUserEntitlement(userId, payload) {
  // payload: { year, type: "CO"|"COR", annualDays, carryoverDays }
  const res = await api.put(`/leave-balance/${userId}`, payload);
  return res.data;
}