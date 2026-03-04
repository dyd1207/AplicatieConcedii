import api from "./axios";

// JSON reports
export async function getWeeklyReport(weekStart) {
  const res = await api.get("/reports/weekly", { params: { weekStart } });
  return res.data;
}

export async function getMonthlyReport(year, month) {
  const res = await api.get("/reports/monthly", {
    params: { year: Number(year), month: Number(month) },
  });
  return res.data;
}

export async function getYearlyReport(year) {
  const res = await api.get("/reports/yearly", { params: { year: Number(year) } });
  return res.data;
}

// Excel reports
export async function downloadWeeklyExcel(weekStart) {
  const res = await api.get("/reports/weekly/excel", {
    params: { weekStart },
    responseType: "blob",
  });
  return res.data;
}

export async function downloadMonthlyExcel(year, month) {
  const res = await api.get("/reports/monthly/excel", {
    params: { year: Number(year), month: Number(month) },
    responseType: "blob",
  });
  return res.data;
}

export async function downloadYearlyExcel(year) {
  const res = await api.get("/reports/yearly/excel", {
    params: { year: Number(year) },
    responseType: "blob",
  });
  return res.data;
}