import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import Modal from "../components/ui/Modal";

import { getUsers, setUserSubstitute } from "../api/users.api";
import { getUserLeaveBalance, upsertUserEntitlement } from "../api/leaveBalance.api";

function pickEntitlement(balance, type) {
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

export default function Secretariat() {
  const currentYear = new Date().getFullYear();

  // common
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [savingId, setSavingId] = useState(null);

  // view selector
  const [view, setView] = useState("SUBSTITUTES"); // SUBSTITUTES | ENTITLEMENTS

  // entitlement modal
  const [openEnt, setOpenEnt] = useState(false);
  const [entUser, setEntUser] = useState(null);
  const [entYear, setEntYear] = useState(String(currentYear));
  const [entLoading, setEntLoading] = useState(false);
  const [entSaving, setEntSaving] = useState(false);

  const [coAnnual, setCoAnnual] = useState("0");
  const [coCarry, setCoCarry] = useState("0");
  const [corAnnual, setCorAnnual] = useState("0");
  const [corCarry, setCorCarry] = useState("0");

  const load = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();
      const list = Array.isArray(data) ? data : data?.items || [];
      setItems(list);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Nu s-au putut încărca utilizatorii.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return items;

    return items.filter((u) => {
      return (
        String(u?.fullName ?? "").toLowerCase().includes(text) ||
        String(u?.username ?? "").toLowerCase().includes(text) ||
        String(u?.email ?? "").toLowerCase().includes(text)
      );
    });
  }, [items, q]);

  const userLabel = (u) => {
    const name = u?.fullName || u?.username || "—";
    return `${name}${u?.username ? ` (${u.username})` : ""}`;
  };

  // -------------------------
  // Substitutes
  // -------------------------
  const handleChangeSubstitute = async (userId, substituteIdRaw) => {
    const substituteId = substituteIdRaw ? Number(substituteIdRaw) : null;

    try {
      setSavingId(userId);
      setError("");
      await setUserSubstitute(userId, substituteId);
      await load();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Nu s-a putut salva înlocuitorul.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setSavingId(null);
    }
  };

  // -------------------------
  // Entitlements (CO/COR)
  // -------------------------
  const openEntitlements = async (u) => {
    try {
      setError("");
      setEntUser(u);
      setOpenEnt(true);
      setEntLoading(true);

      const bal = await getUserLeaveBalance(u.id, entYear);

      const co = pickEntitlement(bal, "CO");
      const cor = pickEntitlement(bal, "COR");

      setCoAnnual(String(co?.annualDays ?? 0));
      setCoCarry(String(co?.carryoverDays ?? 0));
      setCorAnnual(String(cor?.annualDays ?? 0));
      setCorCarry(String(cor?.carryoverDays ?? 0));
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Nu s-au putut încărca drepturile.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
      setOpenEnt(false);
    } finally {
      setEntLoading(false);
    }
  };

  const saveEntitlements = async () => {
    if (!entUser) return;

    try {
      setError("");
      setEntSaving(true);

      // CO
      await upsertUserEntitlement(entUser.id, {
        year: Number(entYear),
        type: "CO",
        annualDays: Number(coAnnual),
        carryoverDays: Number(coCarry),
      });

      // COR
      await upsertUserEntitlement(entUser.id, {
        year: Number(entYear),
        type: "COR",
        annualDays: Number(corAnnual),
        carryoverDays: Number(corCarry),
      });

      setOpenEnt(false);
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Nu s-au putut salva drepturile.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setEntSaving(false);
    }
  };

  return (
    <PageContainer title="Secretariat">
      {/* Header + dropdown view */}
      <div className="app-card p-3 mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Mod lucru</label>
            <select className="form-select" value={view} onChange={(e) => setView(e.target.value)}>
              <option value="SUBSTITUTES">Înlocuitori</option>
              <option value="ENTITLEMENTS">Drepturi concediu</option>
            </select>
          </div>

          <div className="col-md-4">
            <label className="form-label">Căutare utilizator</label>
            <input
              className="form-control"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="nume / username / email"
            />
          </div>

          <div className="col-md-4">
            <small className="text-muted d-block">
              {view === "SUBSTITUTES"
                ? "Gestionează înlocuitorii pentru fluxul de aprobare."
                : "Gestionează drepturile CO/COR pe an (annual + restanțe)."}
            </small>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* Content */}
      <div className="app-card p-3">
        {loading ? (
          <div>Se încarcă utilizatorii...</div>
        ) : view === "SUBSTITUTES" ? (
          // -------------------------
          // TABLE: SUBSTITUTES
          // -------------------------
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Nume</th>
                  <th style={{ width: 200 }}>Username</th>
                  <th style={{ width: 260 }}>Email</th>
                  <th style={{ width: 130 }}>Activ</th>
                  <th style={{ width: 340 }}>Înlocuitor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-muted py-4 text-center">
                      Nu există utilizatori pentru căutarea curentă.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-semibold">{u.fullName || "—"}</td>
                      <td>{u.username || "—"}</td>
                      <td>{u.email || "—"}</td>
                      <td>
                        {u.isActive ? (
                          <span className="badge bg-success">DA</span>
                        ) : (
                          <span className="badge bg-secondary">NU</span>
                        )}
                      </td>
                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={u.substituteId ?? ""}
                          onChange={(e) => handleChangeSubstitute(u.id, e.target.value)}
                          disabled={savingId === u.id}
                        >
                          <option value="">— fără înlocuitor —</option>
                          {items
                            .filter((x) => x.id !== u.id)
                            .map((x) => (
                              <option key={x.id} value={x.id}>
                                {userLabel(x)}
                              </option>
                            ))}
                        </select>
                        {savingId === u.id && <small className="text-muted">Se salvează...</small>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          // -------------------------
          // TABLE: ENTITLEMENTS
          // -------------------------
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Nume</th>
                  <th style={{ width: 200 }}>Username</th>
                  <th style={{ width: 260 }}>Email</th>
                  <th style={{ width: 130 }}>Activ</th>
                  <th style={{ width: 160 }}>Drepturi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-muted py-4 text-center">
                      Nu există utilizatori pentru căutarea curentă.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-semibold">{u.fullName || "—"}</td>
                      <td>{u.username || "—"}</td>
                      <td>{u.email || "—"}</td>
                      <td>
                        {u.isActive ? (
                          <span className="badge bg-success">DA</span>
                        ) : (
                          <span className="badge bg-secondary">NU</span>
                        )}
                      </td>
                      <td>
                        <button className="btn btn-outline-primary btn-sm" onClick={() => openEntitlements(u)}>
                          Drepturi
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: entitlements */}
      <Modal
        title={`Drepturi concediu — ${entUser?.fullName || ""}`}
        open={openEnt}
        onClose={() => !entSaving && setOpenEnt(false)}
        footer={
          <>
            <button className="btn btn-outline-secondary" onClick={() => setOpenEnt(false)} disabled={entSaving}>
              Închide
            </button>
            <button className="btn btn-primary" onClick={saveEntitlements} disabled={entSaving || entLoading}>
              {entSaving ? "Se salvează..." : "Salvează"}
            </button>
          </>
        }
      >
        <div className="row g-3">
          <div className="col-md-3">
            <label className="form-label">An</label>
            <input
              className="form-control"
              value={entYear}
              onChange={(e) => setEntYear(e.target.value)}
              disabled={entLoading || entSaving}
            />
            <div className="form-text">Valorile se salvează pentru anul selectat.</div>
          </div>

          <div className="col-12">
            <hr className="my-1" />
          </div>

          <div className="col-md-6">
            <div className="app-card p-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">CO</span>
                <span className="badge bg-app-primary">CO</span>
              </div>

              {entLoading ? (
                <div className="text-muted mt-2">Se încarcă...</div>
              ) : (
                <div className="mt-2">
                  <label className="form-label">Drept anual</label>
                  <input
                    className="form-control"
                    value={coAnnual}
                    onChange={(e) => setCoAnnual(e.target.value)}
                    disabled={entSaving}
                  />

                  <label className="form-label mt-2">Restanțe</label>
                  <input
                    className="form-control"
                    value={coCarry}
                    onChange={(e) => setCoCarry(e.target.value)}
                    disabled={entSaving}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="app-card p-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-semibold">COR</span>
                <span className="badge bg-app-primary">COR</span>
              </div>

              {entLoading ? (
                <div className="text-muted mt-2">Se încarcă...</div>
              ) : (
                <div className="mt-2">
                  <label className="form-label">Drept anual</label>
                  <input
                    className="form-control"
                    value={corAnnual}
                    onChange={(e) => setCorAnnual(e.target.value)}
                    disabled={entSaving}
                  />

                  <label className="form-label mt-2">Restanțe</label>
                  <input
                    className="form-control"
                    value={corCarry}
                    onChange={(e) => setCorCarry(e.target.value)}
                    disabled={entSaving}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </PageContainer>
  );
}