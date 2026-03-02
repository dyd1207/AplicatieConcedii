import PageContainer from "../components/layout/PageContainer";

export default function Dashboard() {
  return (
    <PageContainer title="Dashboard">
      <div className="row g-3">
        <div className="col-md-4">
          <div className="app-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <span>Cereri în așteptare</span>
              <span className="badge badge-pending">SUBMITTED</span>
            </div>
            <h3 className="mt-2 mb-0">0</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="app-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <span>Cereri aprobate</span>
              <span className="badge badge-approved">APPROVED</span>
            </div>
            <h3 className="mt-2 mb-0">0</h3>
          </div>
        </div>

        <div className="col-md-4">
          <div className="app-card p-3">
            <div className="d-flex justify-content-between align-items-center">
              <span>Cereri respinse</span>
              <span className="badge badge-rejected">REJECTED</span>
            </div>
            <h3 className="mt-2 mb-0">0</h3>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}