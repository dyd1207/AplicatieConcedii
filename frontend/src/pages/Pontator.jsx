import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import StatusBadge from "../components/ui/StatusBadge";
import { getLeaveRequests } from "../api/leaveRequests.api";
import { formatDateRO, formatLeaveType } from "../utils/formatters";

export default function Pontator() {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [type, setType] = useState("ALL");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getLeaveRequests();
      const list = Array.isArray(data) ? data : data?.items || [];

      setItems(list);
    } catch (e) {

      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Nu s-au putut încărca concediile.";

      setError(typeof msg === "string" ? msg : JSON.stringify(msg));

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {

    const text = q.trim().toLowerCase();

    return items
      .filter(x => x.status === "APPROVED")
      .filter(x => {

        const matchesText =
          !text ||
          String(x?.requester?.fullName ?? "").toLowerCase().includes(text) ||
          String(x?.reason ?? "").toLowerCase().includes(text);

        const matchesType = type === "ALL" || x?.type === type;

        return matchesText && matchesType;
      });

  }, [items, q, type]);

  return (
    <PageContainer title="Pontator">

      <div className="app-card p-3 mb-3">

        <div className="row g-2 align-items-end">

          <div className="col-md-5">
            <label className="form-label">Căutare (nume / motiv)</label>

            <input
              className="form-control"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ex: Popescu / concediu..."
            />
          </div>

          <div className="col-md-3">

            <label className="form-label">Tip</label>

            <select
              className="form-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              <option value="ALL">Toate</option>
              <option value="CO">CO</option>
              <option value="COR">COR</option>
            </select>

          </div>

          <div className="col-md-4">
            <small className="text-muted">
              Pontatorul vede concediile aprobate pentru evidența pontajului.
            </small>
          </div>

        </div>

      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="app-card p-3">

        {loading ? (
          <div>Se încarcă concediile...</div>
        ) : (

          <div className="table-responsive">

            <table className="table table-hover align-middle mb-0">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Angajat</th>
                  <th>Tip</th>
                  <th>Start</th>
                  <th>End</th>
                  <th>Zile</th>
                  <th>Status</th>
                  <th>Motiv</th>
                </tr>
              </thead>

              <tbody>

                {filtered.length === 0 ? (

                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      Nu există concedii aprobate.
                    </td>
                  </tr>

                ) : (

                  filtered.map(x => (

                    <tr key={x.id}>

                      <td>#{x.id}</td>

                      <td>
                        {x.requester?.fullName ||
                         x.requesterName ||
                         "—"}
                      </td>

                      <td>{formatLeaveType(x.type)}</td>

                      <td>{formatDateRO(x.startDate)}</td>

                      <td>{formatDateRO(x.endDate)}</td>

                      <td>{x.daysCount ?? "-"}</td>

                      <td>
                        <StatusBadge status={x.status}/>
                      </td>

                      <td style={{maxWidth:300}} className="text-truncate">
                        {x.reason || "—"}
                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

        )}

      </div>

    </PageContainer>
  );
}