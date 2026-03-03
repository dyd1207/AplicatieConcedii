import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import StatusBadge from "../components/ui/StatusBadge";
import { getLeaveRequests } from "../api/leaveRequests.api";
import { formatDateRO, formatLeaveType } from "../utils/formatters";

export default function Cereri() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // filtre (simple, fără să depindem de backend)
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [type, setType] = useState("ALL");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        // Dacă backend-ul suportă parametri, îi poți trimite aici.
        // Momentan cerem tot și filtrăm client-side (safe).
        const data = await getLeaveRequests();

        // Acceptăm 2 forme comune:
        // - array direct
        // - { items: [...] }
        const list = Array.isArray(data) ? data : data?.items || [];

        if (!alive) return;
        setItems(list);
      } catch (e) {
        if (!alive) return;
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Nu s-au putut încărca cererile.";
        setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();

    return items.filter((x) => {
      const matchesText =
        !text ||
        String(x?.id ?? "").toLowerCase().includes(text) ||
        String(x?.reason ?? "").toLowerCase().includes(text);

      const matchesStatus = status === "ALL" || x?.status === status;
      const matchesType = type === "ALL" || x?.type === type;

      return matchesText && matchesStatus && matchesType;
    });
  }, [items, q, status, type]);

  return (
    <PageContainer title="Cereri">
      <div className="app-card p-3 mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-md-5">
            <label className="form-label">Căutare (ID / motiv)</label>
            <input
              className="form-control"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ex: 12 / medical / concediu..."
            />
          </div>

          <div className="col-md-3">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ALL">Toate</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SUBMITTED">SUBMITTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="REJECTED">REJECTED</option>
              <option value="CANCELLED">CANCELLED</option>
              <option value="INTERRUPTED">INTERRUPTED</option>
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label">Tip</label>
            <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
              <option value="ALL">Toate</option>
              <option value="CO">CO</option>
              <option value="COR">COR</option>
            </select>
          </div>

          <div className="col-md-2 d-grid">
            <button className="btn btn-primary" disabled>
              Cerere nouă
            </button>
          </div>
        </div>
        <small className="text-muted d-block mt-2">
          * „Cerere nouă” o implementăm în pasul următor (CardBox).
        </small>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="app-card p-3">
        {loading ? (
          <div>Se încarcă cererile...</div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">
                Total: <b>{filtered.length}</b>
              </span>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 90 }}>ID</th>
                    <th style={{ width: 90 }}>Tip</th>
                    <th style={{ width: 140 }}>Start</th>
                    <th style={{ width: 140 }}>End</th>
                    <th style={{ width: 110 }}>Zile</th>
                    <th style={{ width: 140 }}>Status</th>
                    <th>Motiv</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-muted py-4 text-center">
                        Nu există cereri pentru filtrele selectate.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((x) => (
                      <tr key={x.id}>
                        <td>#{x.id}</td>
                        <td>{formatLeaveType(x.type)}</td>
                        <td>{formatDateRO(x.startDate)}</td>
                        <td>{formatDateRO(x.endDate)}</td>
                        <td>{x.daysCount ?? "-"}</td>
                        <td>
                          <StatusBadge status={x.status} />
                        </td>
                        <td className="text-truncate" style={{ maxWidth: 360 }}>
                          {x.reason || <span className="text-muted">—</span>}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}