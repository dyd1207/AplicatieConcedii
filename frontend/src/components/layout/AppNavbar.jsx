import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function AppNavbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roles = user?.roles || [];

  const has = (role) => roles.includes(role);
  const hasAny = (...wanted) => wanted.some((r) => roles.includes(r));

  // Roluri (acceptăm și variantele “vechi” ca să nu te încurce)
  const isAdmin = hasAny("ADMINISTRATOR", "ADMIN");
  const isSecretariat = has("SECRETARIAT");

  const isSef = hasAny("SEF_STRUCTURA", "SEF");
  const isPontator = has("PONTATOR");
  const isDirectorAdj = has("DIRECTOR_ADJUNCT");
  const isDirector = hasAny("DIRECTOR", "DIRECTOR_GENERAL"); // dacă nu ai DIRECTOR_GENERAL, rămâne doar DIRECTOR

  /**
   * Cerințe vizibilitate:
   * - Secretariat: acces la /secretariat
   * - Administrator: full acces (avizare, aprobare, secretariat, admin)
   * - Sefii + director adjunct + directorii + pontatorii: acces la secretariat, avizare, aprobare
   * - Director adjunct + director: full acces mai puțin administrare (deci au tot, fără /admin)
   */

  // Avizare: șefi + director adjunct + directori + pontatori + admin
  const canSeeAvizare = isAdmin || isSef || isDirectorAdj || isDirector || isPontator;

  // Aprobare: șefi + director adjunct + directori + pontatori + admin
  const canSeeAprobare = isAdmin || isSef || isDirectorAdj || isDirector || isPontator;

  // Secretariat: secretariat + șefi + director adjunct + directori + pontatori + admin
  const canSeeSecretariat = isSecretariat || isAdmin || isSef || isDirectorAdj || isDirector || isPontator;

  // Administrare: doar admin
  const canSeeAdmin = isAdmin;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-app-primary w-100 sticky-top">
      <div className="container-fluid px-3">
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

            {canSeeAvizare && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/avizare">
                  Avizare
                </NavLink>
              </li>
            )}

            {canSeeAprobare && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/aprobare">
                  Aprobare
                </NavLink>
              </li>
            )}

            {canSeeSecretariat && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/secretariat">
                  Secretariat
                </NavLink>
              </li>
            )}

            {/* Pontator page (dacă există ca pagină separată) */}
            {isPontator && (
              <li className="nav-item">
                <NavLink className="nav-link" to="/pontator">
                  Pontator
                </NavLink>
              </li>
            )}

            {canSeeAdmin && (
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
            <span className="text-white-50 small d-none d-lg-inline">{user?.fullName || "—"}</span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}