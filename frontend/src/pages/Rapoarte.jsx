import { useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import { downloadReportExcel } from "../api/reports.api";
import { downloadBlob } from "../utils/download";

export default function Rapoarte() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  const [mode, setMode] = useState("WEEKLY"); // WEEKLY | MONTHLY | YEARLY
  const [from, setFrom] = useState(`${yyyy}-${mm}-01`);
  const [to, setTo] = useState(`${yyyy}-${mm}-${dd}`);
  const [year, setYear] = useState(String(yyyy));
  const [month, setMonth] = useState(String(Number(mm)));

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filename = useMemo(() => {
    if (mode === "WEEKLY") return `raport_saptamanal_${from}_${to}.xlsx`;
    if (mode === "MONTHLY") return `raport_lunar_${year}_${String(month).padStart(2, "0")}.xlsx`;
    return `raport_anual_${year}.xlsx`;
  }, [mode, from, to, year, month]);

  const handleDownload = async () => {
    try {
      setLoading(true);
      setError("");

      // IMPORTANT: adaptează path-urile la backend-ul tău dacă diferă
      let path = "";
      let params = {};

      if (mode === "WEEKLY") {
        path = "/reports/weekly";
        params = { from, to };
      } else if (mode === "MONTHLY") {
        path = "/reports/monthly";
        params = { year: Number(year), month: Number(month) };
      } else {
        path = "/reports/yearly";
        params = { year: Number(year) };
      }

      const blob = await downloadReportExcel(path, params);
      downloadBlob(blob, filename);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Nu s-a putut genera raportul. Verifică endpoint-urile din backend.";
      setError(typeof msg === "string" ? msg : "Nu s-a putut genera raportul.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer title="Rapoarte">
      <div className="app-card p-3 mb-3">
        <div className="row g-3">
          <div className="col-md-4">
            <label className="form-label">Tip raport</label>
            <select className="form-select" value={mode} onChange={(e) => setMode(e.target.value)}>
              <option value="WEEKLY">Săptămânal (interval)</option>
              <option value="MONTHLY">Lunar</option>
              <option value="YEARLY">Anual</option>
            </select>
          </div>

          {mode === "WEEKLY" && (
            <>
              <div className="col-md-4">
                <label className="form-label">De la</label>
                <input type="date" className="form-control" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="col-md-4">
                <label className="form-label">Până la</label>
                <input type="date" className="form-control" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
            </>
          )}

          {mode === "MONTHLY" && (
            <>
              <div className="col-md-4">
                <label className="form-label">An</label>
                <input className="form-control" value={year} onChange={(e) => setYear(e.target.value)} />
              </div>
              <div className="col-md-4">
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
            <button className="btn btn-primary" onClick={handleDownload} disabled={loading}>
              {loading ? "Se generează..." : "Descarcă Excel"}
            </button>
          </div>
        </div>

        <small className="text-muted d-block mt-2">
          Exportul este în format Excel (.xlsx). Dacă apare eroare, verifică rutele backend din modulul Reports.
        </small>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
    </PageContainer>
  );
}