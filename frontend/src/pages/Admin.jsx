import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import { getUsers } from "../api/users.api";

export default function Admin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");

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
  }, []);

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    if (!text) return items;

    return items.filter((u) => {
      return (
        String(u?.fullName ?? "").toLowerCase().includes(text) ||
        String(u?.username ?? "").toLowerCase().includes(text) ||
        String(u?.email ?? "").toLowerCase().includes(text) ||
        String((u?.roles || []).join(" ")).toLowerCase().includes(text)
      );
    });
  }, [items, q]);

  return (
    <PageContainer title="Administrare">
      <div className="app-card p-3 mb-3">
        <div className="row g-2 align-items-end">
          <div className="col-md-6">
            <label className="form-label">Căutare utilizator</label>
            <input
              className="form-control"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="nume / username / email / rol"
            />
          </div>

          <div className="col-md-6">
            <small className="text-muted d-block">
              Modulul de administrare afișează utilizatorii existenți, rolurile alocate și starea contului.
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
                  <th style={{ width: 180 }}>Username</th>
                  <th style={{ width: 260 }}>Email</th>
                  <th style={{ width: 180 }}>Roluri</th>
                  <th style={{ width: 120 }}>Activ</th>
                  <th style={{ width: 220 }}>Înlocuitor</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-muted py-4 text-center">
                      Nu există utilizatori pentru filtrul selectat.
                    </td>
                  </tr>
                ) : (
                  filtered.map((u) => (
                    <tr key={u.id}>
                      <td className="fw-semibold">{u.fullName || "—"}</td>
                      <td>{u.username || "—"}</td>
                      <td>{u.email || "—"}</td>
                      <td>
                        {u.roles?.length ? (
                          <div className="d-flex flex-wrap gap-1">
                            {u.roles.map((role) => (
                              <span key={role} className="badge bg-primary-subtle text-dark border">
                                {role}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                      </td>
                      <td>
                        {u.isActive ? (
                          <span className="badge bg-success">DA</span>
                        ) : (
                          <span className="badge bg-secondary">NU</span>
                        )}
                      </td>
                      <td>
                        {u.substitute ? (
                          <span>{u.substitute.fullName || u.substitute.username}</span>
                        ) : (
                          <span className="text-muted">—</span>
                        )}
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