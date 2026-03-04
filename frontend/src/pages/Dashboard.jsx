import { useEffect, useMemo, useState } from "react";
import PageContainer from "../components/layout/PageContainer";
import { getLeaveRequests } from "../api/leaveRequests.api";

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setError("");

        const data = await getLeaveRequests();
        const list = Array.isArray(data) ? data : data?.items || [];

        if (!alive) return;
        setItems(list);
      } catch (e) {
        if (!alive) return;
        const msg =
          e?.response?.data?.message ||
          e?.response?.data?.error ||
          "Nu s-au putut încărca datele pentru dashboard.";
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

  const stats = useMemo(() => {
    const submitted = items.filter((x) => x?.status === "SUBMITTED").length;
    const approved = items.filter((x) => x?.status === "APPROVED").length;
    const rejected = items.filter((x) => x?.status === "REJECTED").length;

    return { submitted, approved, rejected };
  }, [items]);

  return (
    <PageContainer title="Dashboard">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="row g-3">
        <div className="col-md-4">
          <div className="app-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <span>Cereri în așteptare</span>
              <span className="badge badge-pending">SUBMITTED</span>
            </div>
            <h3 className="mt-2 mb-0">{loading ? "..." : stats.submitted}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="app-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <span>Cereri aprobate</span>
              <span className="badge badge-approved">APPROVED</span>
            </div>
            <h3 className="mt-2 mb-0">{loading ? "..." : stats.approved}</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="app-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <span>Cereri respinse</span>
              <span className="badge badge-rejected">REJECTED</span>
            </div>
            <h3 className="mt-2 mb-0">{loading ? "..." : stats.rejected}</h3>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}