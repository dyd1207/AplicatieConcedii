import api from "./axios";

// GET /users (list)
export async function getUsers(params = {}) {
  const res = await api.get("/users", { params });
  return res.data;
}

// PATCH /users/:id/substitute  { substituteId: number | null }
export async function setUserSubstitute(userId, substituteId) {
  const res = await api.patch(`/users/${userId}/substitute`, { substituteId });
  return res.data;
}