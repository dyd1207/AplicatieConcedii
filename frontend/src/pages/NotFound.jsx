import PageContainer from "../components/layout/PageContainer";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <PageContainer title="404 - Pagina nu există">
      <div className="text-center py-5">

        <h1 className="display-4 text-app-primary">404</h1>

        <p className="lead">
          Pagina pe care încerci să o accesezi nu există.
        </p>

        <Link className="btn btn-primary mt-3" to="/dashboard">
          Înapoi la Dashboard
        </Link>

      </div>
    </PageContainer>
  );
}