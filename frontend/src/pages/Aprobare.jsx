import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import StatusBadge from "../components/ui/StatusBadge";
import { getLeaveRequests, approveLeaveRequest, rejectLeaveRequest } from "../api/leaveRequests.api";
import { formatDateRO, formatLeaveType } from "../utils/formatters";
import Modal from "../components/ui/Modal";

export default function Aprobare() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [actingId, setActingId] = useState(null);

  const [confirmApproveId, setConfirmApproveId] = useState(null);

  const [openReject, setOpenReject] = useState(false);
  const [rejectId, setRejectId] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

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
        "Nu s-au putut încărca cererile.";
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
      .filter((x) => x?.status === "SUBMITTED")
      .filter((x) => {
        if (!text) return true;
        return (
          String(x?.id ?? "").toLowerCase().includes(text) ||
          String(x?.reason ?? "").toLowerCase().includes(text)
        );
      });
  }, [items, q]);

  const handleApprove = async (id) => {
    try {
      setActingId(id);
      setError("");
      await approveLeaveRequest(id);
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Nu s-a putut aproba cererea.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setActingId(null);
    }
  };

  const openRejectModal = (id) => {
    setRejectId(id);
    setRejectReason("");
    setOpenReject(true);
  };

  const handleReject = async () => {
    if (!rejectId) return;

    try {
      setActingId(rejectId);
      setError("");
      await rejectLeaveRequest(rejectId, rejectReason?.trim() || undefined);
      setOpenReject(false);
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Nu s-a putut respinge cererea.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setActingId(null);
    }
  };

  return (
    <PageContainer title="Aprobare">
      <div className="app-card p-3 mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-md-6">
            <label className="form-label">Căutare (ID / motiv)</label>
            <input
              className="form-control"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ex: 12 / concediu / medical..."
            />
          </div>

          <div className="col-md-6">
            <small className="text-muted d-block">
              În această pagină apar doar cererile cu status <b>SUBMITTED</b>. Dreptul de aprobare este validat de
              backend (CanApproveGuard).
            </small>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="app-card p-3">
        {loading ? (
          <div>Se încarcă cererile...</div>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-muted">
                În așteptare aprobare: <b>{filtered.length}</b>
              </span>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th style={{ width: 190 }}>Acțiuni</th>
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
                      <td colSpan={8} className="text-muted py-4 text-center">
                        Nu există cereri SUBMITTED pentru aprobare.
                      </td>
                    </tr>
                  ) : (
                    filtered.map((x) => (
                      <tr key={x.id}>
                        <td className="d-flex gap-2">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => setConfirmApproveId(x.id)}
                            disabled={actingId === x.id}
                          >
                            {actingId === x.id ? "..." : "Aprobă"}
                          </button>

                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => openRejectModal(x.id)}
                            disabled={actingId === x.id}
                          >
                            Respinge
                          </button>
                        </td>

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

      <Modal
        title="Confirmare aprobare"
        open={confirmApproveId !== null}
        onClose={() => !actingId && setConfirmApproveId(null)}
        footer={
          <>
            <button
              className="btn btn-outline-secondary"
              onClick={() => setConfirmApproveId(null)}
              disabled={!!actingId}
            >
              Anulează
            </button>
            <button
              className="btn btn-success"
              onClick={async () => {
                const id = confirmApproveId;
                setConfirmApproveId(null);
                await handleApprove(id);
              }}
              disabled={!!actingId}
            >
              Confirmă
            </button>
          </>
        }
      >
        <p className="mb-0">Sigur vrei să aprobi această cerere?</p>
      </Modal>

      <Modal
        title="Respinge cererea"
        open={openReject}
        onClose={() => !actingId && setOpenReject(false)}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setOpenReject(false)} disabled={!!actingId}>
              Renunță
            </button>
            <button className="btn btn-danger" onClick={handleReject} disabled={!!actingId}>
              {actingId ? "Se respinge..." : "Respinge"}
            </button>
          </>
        }
      >
        <div className="mb-2">
          <label className="form-label">Motiv (opțional)</label>
          <textarea
            className="form-control"
            rows={3}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="ex: perioadă necorespunzătoare / lipsă documente..."
            disabled={!!actingId}
          />
        </div>
      </Modal>
    </PageContainer>
  );
}