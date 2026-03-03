import { useMemo, useState } from "react";

function daysBetweenInclusive(start, end) {
  const s = new Date(start);
  const e = new Date(end);
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;

  // reset ore pentru calcul simplu
  s.setHours(0, 0, 0, 0);
  e.setHours(0, 0, 0, 0);

  const diff = e.getTime() - s.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
  return days > 0 ? days : null;
}

export default function LeaveRequestForm({ onSubmit, loading }) {
  const [type, setType] = useState("CO"); // CO / COR
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");

  const [error, setError] = useState("");

  const computedDays = useMemo(() => {
    if (!startDate || !endDate) return null;
    return daysBetweenInclusive(startDate, endDate);
  }, [startDate, endDate]);

  const handleSubmit = async () => {
    setError("");

    if (!type) return setError("Selectează tipul concediului.");
    if (!startDate || !endDate) return setError("Selectează perioada (start și end).");

    const days = computedDays;
    if (!days) return setError("Perioadă invalidă. Data de sfârșit trebuie să fie după data de start.");

    // Payload minim conform modelului tău: type, startDate, endDate, daysCount, reason?
    await onSubmit({
      type,
      startDate,
      endDate,
      daysCount: days,
      reason: reason?.trim() || null,
    });
  };

  return (
    <div className="app-card p-3">
      <div className="row g-3">
        <div className="col-md-3">
          <label className="form-label">Tip concediu</label>
          <select className="form-select" value={type} onChange={(e) => setType(e.target.value)} disabled={loading}>
            <option value="CO">CO</option>
            <option value="COR">COR</option>
          </select>
          <div className="form-text">Aplicația suportă doar CO și COR.</div>
        </div>

        <div className="col-md-3">
          <label className="form-label">Data start</label>
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Data sfârșit</label>
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="col-md-3">
          <label className="form-label">Număr zile</label>
          <input className="form-control" value={computedDays ?? ""} readOnly placeholder="—" />
          <div className="form-text">Calcul automat (inclusiv).</div>
        </div>

        <div className="col-12">
          <label className="form-label">Motiv (opțional)</label>
          <textarea
            className="form-control"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={loading}
            placeholder="ex: concediu planificat / situație personală..."
          />
        </div>
      </div>

      {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}

      <div className="d-flex justify-content-end gap-2 mt-3">
        <button type="button" className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
          {loading ? "Se salvează..." : "Salvează Draft"}
        </button>
      </div>
    </div>
  );
}