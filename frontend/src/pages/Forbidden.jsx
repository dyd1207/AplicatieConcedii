import { Link } from "react-router-dom";
import PageContainer from "../components/layout/PageContainer";

export default function Forbidden() {
  return (
    <PageContainer title="Acces interzis">
      <div className="app-card p-4 text-center">
        <h3 className="text-danger mb-3">403</h3>
        <p className="mb-2 fw-semibold">Nu aveți drepturi pentru această pagină.</p>
        <p className="text-muted mb-4">
          Contul curent nu are permisiunile necesare pentru a accesa această secțiune.
        </p>

        <div className="d-flex justify-content-center gap-2">
          <Link to="/dashboard" className="btn btn-primary">
            Înapoi la Dashboard
          </Link>
        </div>
      </div>
    </PageContainer>
  );
}