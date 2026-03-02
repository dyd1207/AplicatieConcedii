import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roles = user?.roles || [];

  const canSee = (role) => roles.includes(role);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-app-primary">
      <div className="container">
        <Link className="navbar-brand fw-semibold" to="/dashboard">
          Concedii
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link" to="/dashboard">
                Dashboard
              </NavLink>
            </li>

            <li className="nav-item">
              <NavLink className="nav-link" to="/cereri">
                Cereri
              </NavLink>
            </li>

            {(canSee("SEF") || canSee("PONTATOR")) && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/avizare">
                  Avizare
                </NavLink>
              </li>
            )}

            {(canSee("DIRECTOR") || canSee("DIRECTOR_GENERAL")) && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/aprobare">
                  Aprobare
                </NavLink>
              </li>
            )}

            {canSee("SECRETARIAT") && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/secretariat">
                  Secretariat
                </NavLink>
              </li>
            )}

            {canSee("PONTATOR") && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/pontator">
                  Pontator
                </NavLink>
              </li>
            )}

            {canSee("ADMIN") && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/admin">
                  Administrare
                </NavLink>
              </li>
            )}

            <li className="nav-item">
              <NavLink className="nav-link" to="/rapoarte">
                Rapoarte
              </NavLink>
            </li>
          </ul>

          <div className="d-flex align-items-center gap-2">
            <span className="text-white-50 small d-none d-lg-inline">
              {user?.fullName || "—"}
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}