import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    // TEMP: login local ca să testăm rutele.
    // Când legăm backend-ul, înlocuim cu request axios către /auth/login.
    if (!identifier || !password) {
      setError("Completează email/username și parola.");
      return;
    }

    login({
      token: "dev-token",
      user: { fullName: "User Demo", roles: ["USER"] },
    });

    navigate("/dashboard");
  };

  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="app-card p-4" style={{ width: 380 }}>
        <h3 className="text-app-primary mb-3">Autentificare</h3>
        <p className="text-muted mb-4">Introduceți credențialele pentru acces.</p>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Email / Username</label>
            <input
              className="form-control"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="ex: danut.tenchiu"
              autoFocus
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Parolă</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button className="btn btn-primary w-100" type="submit">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}