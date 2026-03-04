import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import { getUsers, setUserSubstitute } from "../api/users.api";

export default function Secretariat() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [savingId, setSavingId] = useState(null);

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

  const userLabel = (u) => {
    const name = u?.fullName || u?.username || "—";
    return `${name}${u?.username ? ` (${u.username})` : ""}`;
  };

  return (
    <PageContainer title="Secretariat">
      <div className="app-card p-3 mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-md-6">
            <label className="form-label">Căutare utilizator</label>
            <input
              className="form-control"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="nume / username / email"
            />
          </div>
          <div className="col-md-6">
            <small className="text-muted d-block">
              Aici se gestionează înlocuitorii (substitute) pentru fluxul de aprobare atunci când directorul este în
              concediu / indisponibil.
            </small>
          </div>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      <div className="app-card p-3">
        {loading ? (
          <div>Se încarcă utilizatorii...</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th>Nume</th>
                  <th style={{ width: 200 }}>Username</th>
                  <th style={{ width: 260 }}>Email</th>
                  <th style={{ width: 130 }}>Activ</th>
                  <th style={{ width: 320 }}>Înlocuitor</th>
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
        )}
      </div>
    </PageContainer>
  );
}