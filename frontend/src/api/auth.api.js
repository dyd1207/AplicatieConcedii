import api from "./axios";

export async function loginRequest(username, password) {
  const res = await api.post("/auth/login", { username, password });
  return res.data;
}

export async function meRequest() {
  const res = await api.get("/auth/me");
  return res.data;
}