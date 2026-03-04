import { useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import { downloadBlob } from "../utils/download";
import {
  getWeeklyReport,
  getMonthlyReport,
  getYearlyReport,
  downloadWeeklyExcel,
  downloadMonthlyExcel,
  downloadYearlyExcel,
} from "../api/reports.api";

function isoMondayOfCurrentWeek() {
  const d = new Date();
  const day = d.getDay(); // 0=Sun ... 6=Sat
  const diff = (day === 0 ? -6 : 1) - day; // Monday
  d.setDate(d.getDate() + diff);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toArrayMaybe(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  if (Array.isArray(data?.data)) return data.data;
  return null;
}

export default function Rapoarte() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [mode, setMode] = useState("WEEKLY"); // WEEKLY | MONTHLY | YEARLY
  const [weekStart, setWeekStart] = useState(isoMondayOfCurrentWeek());
  const [year, setYear] = useState(String(currentYear));
  const [month, setMonth] = useState(String(currentMonth));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // report shown in page
  const [report, setReport] = useState(null);

  const filename = useMemo(() => {
    if (mode === "WEEKLY") return `report_weekly_${weekStart}.xlsx`;
    if (mode === "MONTHLY") return `report_monthly_${year}_${String(month).padStart(2, "0")}.xlsx`;
    return `report_yearly_${year}.xlsx`;
  }, [mode, weekStart, year, month]);

  const handleShowReport = async () => {
    try {
      setLoading(true);
      setError("");

      let data;
      if (mode === "WEEKLY") data = await getWeeklyReport(weekStart);
      else if (mode === "MONTHLY") data = await getMonthlyReport(year, month);
      else data = await getYearlyReport(year);

      setReport(data);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Nu s-a putut genera raportul.";
      setError(typeof msg === "string" ? msg : "Nu s-a putut genera raportul.");
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setLoading(true);
      setError("");

      let blob;
      if (mode === "WEEKLY") blob = await downloadWeeklyExcel(weekStart);
      else if (mode === "MONTHLY") blob = await downloadMonthlyExcel(year, month);
      else blob = await downloadYearlyExcel(year);

      downloadBlob(blob, filename);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        e?.message ||
        "Nu s-a putut exporta raportul.";
      setError(typeof msg === "string" ? msg : "Nu s-a putut exporta raportul.");
    } finally {
      setLoading(false);
    }
  };

  // Render generic: dacă report-ul are un array de rânduri, îl afișăm tabel
  const rows = useMemo(() => toArrayMaybe(report), [report]);

  const columns = useMemo(() => {
    if (!rows || rows.length === 0) return [];
    // chei din primul obiect (tabel generic)
    const first = rows[0];
    if (typeof first !== "object" || first === null) return ["value"];
    return Object.keys(first);
  }, [rows]);

  return (
    <PageContainer title="Rapoarte">
      <div className="app-card p-3 mb-3">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Tip raport</label>
            <select className="form-select" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="WEEKLY">Săptămânal</option>
              <option value="MONTHLY">Lunar</option>
              <option value="YEARLY">Anual</option>
            </select>
          </div>

          {mode === "WEEKLY" && (
            <div className="col-md-4">
              <label className="form-label">Week start (Luni)</label>
              <input
                type="date"
                className="form-control"
                value={weekStart}
                onChange={(e) => setWeekStart(e.target.value)}
              />
            </div>
          )}

          {mode === "MONTHLY" && (
            <>
              <div className="col-md-3">
                <label className="form-label">An</label>
                <input className="form-control" value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
              <div className="col-md-3">
                <label className="form-label">Lună (1-12)</label>
                <input className="form-control" value={month} onChange={(e) => setMonth(e.target.value)} />
              </div>
            </>
          )}

          {mode === "YEARLY" && (
            <div className="col-md-4">
              <label className="form-label">An</label>
              <input className="form-control" value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
          )}

          <div className="col-12 d-flex justify-content-end gap-2">
            <button className="btn btn-outline-primary" onClick={handleShowReport} disabled={loading}>
              {loading ? "Se încarcă..." : "Afișează raport"}
            </button>
            <button className="btn btn-primary" onClick={handleDownloadExcel} disabled={loading}>
              {loading ? "..." : "Export Excel"}
            </button>
          </div>
        </div>

        <small className="text-muted d-block mt-2">
          „Afișează raport” folosește endpoint-urile JSON (weekly/monthly/yearly). „Export Excel” descarcă fișierul .xlsx.
        </small>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="app-card p-3">
        {!report ? (
          <div className="text-muted">Apasă „Afișează raport” pentru a vedea datele în pagină.</div>
        ) : rows ? (
          rows.length === 0 ? (
            <div className="text-muted">Raportul nu conține rânduri.</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    {columns.map((c) => (
                      <th key={c}>{c}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, idx) => (
                    <tr key={idx}>
                      {columns.map((c) => (
                        <td key={c}>
                          {typeof r === "object" && r !== null ? String(r[c] ?? "") : String(r)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          // fallback: afișăm JSON pentru cazuri unde reportul nu e listă
          <pre className="mb-0" style={{ whiteSpace: "pre-wrap" }}>
            {JSON.stringify(report, null, 2)}
          </pre>
        )}
      </div>
    </PageContainer>
  );
}