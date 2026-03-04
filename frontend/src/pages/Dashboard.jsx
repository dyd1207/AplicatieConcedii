import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import { getLeaveRequests } from "../api/leaveRequests.api";
import { getMyLeaveBalance } from "../api/leaveBalance.api";

function pickEntitlement(balance, type) {
  // Acceptăm mai multe forme posibile:
  // - balance.items: [{type, annualDays, carryoverDays, usedDays, ...}]
  // - balance.entitlements: [...]
  // - balance.CO / balance.COR
  if (!balance) return null;

  if (balance[type] && typeof balance[type] === "object") return balance[type];

  const list =
    (Array.isArray(balance.items) && balance.items) ||
    (Array.isArray(balance.entitlements) && balance.entitlements) ||
    (Array.isArray(balance.data) && balance.data) ||
    null;

  if (list) return list.find((x) => x?.type === type) || null;
  return null;
}

export default function Dashboard() {
  const currentYear = new Date().getFullYear();

  // cereri stats
  const [requests, setRequests] = useState([]);
  const [loadingReq, setLoadingReq] = useState(true);
  const [errorReq, setErrorReq] = useState("");

  // leave balance
  const [year, setYear] = useState(String(currentYear));
  const [balance, setBalance] = useState(null);
  const [loadingBal, setLoadingBal] = useState(true);
  const [errorBal, setErrorBal] = useState("");

  // Load requests (o singură dată)
  useEffect(() => {
    let alive = true;

    async function loadReq() {
      try {
        setLoadingReq(true);
        setErrorReq("");
        const data = await getLeaveRequests();
        const list = Array.isArray(data) ? data : data?.items || [];
        if (!alive) return;
        setRequests(list);
      } catch (e) {
        if (!alive) return;
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Nu s-au putut încărca cererile pentru dashboard.";
        setErrorReq(typeof msg === "string" ? msg : JSON.stringify(msg));
      } finally {
        if (alive) setLoadingReq(false);
      }
    }

    loadReq();
    return () => {
      alive = false;
    };
  }, []);

  // Load leave balance (când se schimbă anul)
  useEffect(() => {
    let alive = true;

    async function loadBal() {
      try {
        setLoadingBal(true);
        setErrorBal("");
        const data = await getMyLeaveBalance(year);
        if (!alive) return;
        setBalance(data);
      } catch (e) {
        if (!alive) return;
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Nu s-a putut încărca situația concediilor.";
        setErrorBal(typeof msg === "string" ? msg : JSON.stringify(msg));
        setBalance(null);
      } finally {
        if (alive) setLoadingBal(false);
      }
    }

    loadBal();
    return () => {
      alive = false;
    };
  }, [year]);

  const stats = useMemo(() => {
    const submitted = requests.filter((x) => x?.status === "SUBMITTED").length;
    const approved = requests.filter((x) => x?.status === "APPROVED").length;
    const rejected = requests.filter((x) => x?.status === "REJECTED").length;
    return { submitted, approved, rejected };
  }, [requests]);

  const co = useMemo(() => pickEntitlement(balance, "CO"), [balance]);
  const cor = useMemo(() => pickEntitlement(balance, "COR"), [balance]);

  const calcRemain = (e) => {
    if (!e) return null;
    const annual = Number(e.annualDays ?? 0);
    const carry = Number(e.carryoverDays ?? 0);
    const used = Number(e.usedDays ?? 0);
    return annual + carry - used;
  };

  return (
    <PageContainer title="Dashboard">
      {(errorReq || errorBal) && (
        <div className="alert alert-danger">
          {errorReq && <div>{errorReq}</div>}
          {errorBal && <div>{errorBal}</div>}
        </div>
      )}

      {/* 1) Stats cereri */}
      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="app-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <span>Cereri în așteptare</span>
              <span className="badge badge-pending">SUBMITTED</span>
            </div>
            <h3 className="mt-2 mb-0">{loadingReq ? "..." : stats.submitted}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="app-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <span>Cereri aprobate</span>
              <span className="badge badge-approved">APPROVED</span>
            </div>
            <h3 className="mt-2 mb-0">{loadingReq ? "..." : stats.approved}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="app-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <span>Cereri respinse</span>
              <span className="badge badge-rejected">REJECTED</span>
            </div>
            <h3 className="mt-2 mb-0">{loadingReq ? "..." : stats.rejected}</h3>
          </div>
        </div>
      </div>

      {/* 2) Situația concediilor */}
      <div className="app-card p-3">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
          <div>
            <h5 className="mb-0">Situația concediilor</h5>
            <small className="text-muted">CO / COR pentru anul selectat</small>
          </div>

          <div style={{ maxWidth: 160 }}>
            <label className="form-label mb-1">An</label>
            <input className="form-control form-control-sm" value={year} onChange={(e) => setYear(e.target.value)} />
          </div>
        </div>

        <div className="row g-3">
          {/* CO */}
          <div className="col-md-6">
            <div className="app-card p-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Concediu de odihnă (CO)</span>
                <span className="badge bg-app-primary">CO</span>
              </div>

              {loadingBal ? (
                <div className="mt-2 text-muted">Se încarcă...</div>
              ) : co ? (
                <div className="mt-2">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Drept anual</span>
                    <b>{co.annualDays ?? 0}</b>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Restanțe</span>
                    <b>{co.carryoverDays ?? 0}</b>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Efectuat</span>
                    <b>{co.usedDays ?? 0}</b>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Rămas</span>
                    <b>{calcRemain(co) ?? 0}</b>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-muted">Nu există date CO pentru anul {year}.</div>
              )}
            </div>
          </div>

          {/* COR */}
          <div className="col-md-6">
            <div className="app-card p-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">Concediu restant (COR)</span>
                <span className="badge bg-app-primary">COR</span>
              </div>

              {loadingBal ? (
                <div className="mt-2 text-muted">Se încarcă...</div>
              ) : cor ? (
                <div className="mt-2">
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Drept anual</span>
                    <b>{cor.annualDays ?? 0}</b>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Restanțe</span>
                    <b>{cor.carryoverDays ?? 0}</b>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Efectuat</span>
                    <b>{cor.usedDays ?? 0}</b>
                  </div>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Rămas</span>
                    <b>{calcRemain(cor) ?? 0}</b>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-muted">Nu există date COR pentru anul {year}.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}