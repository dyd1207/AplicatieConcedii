import api from "./axios";

/**
 * Download raport Excel.
 * Exemplu rute (alege una existentă în backend):
 * - GET /reports/weekly?from=YYYY-MM-DD&to=YYYY-MM-DD
 * - GET /reports/monthly?year=2026&month=3
 * - GET /reports/yearly?year=2026
 *
 * Important: responseType blob ca să descarci fișier.
 */
export async function downloadReportExcel(path, params = {}) {
  const res = await api.get(path, {
    params,
    responseType: "blob",
  });
  return res.data; // Blob
}