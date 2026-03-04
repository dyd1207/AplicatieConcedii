import api from "./axios";

export async function getMyLeaveBalance(year) {
  const res = await api.get("/leave-balance/me", {
    params: year ? { year: Number(year) } : {},
  });
  return res.data;
}