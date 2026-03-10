import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { loginRequest } from "../api/auth.api";

export default function Login() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!identifier || !password) {
      setError("Completează email/username și parola.");
      toast.error("Completează email/username și parola.");
      return;
    }

    try {
      setLoading(true);

      const data = await loginRequest(identifier, password);

      const token = data.accessToken || data.token;
      const user = data.user || data;

      if (!token) {
        setError("Login eșuat: lipsă token în răspunsul backend.");
        toast.error("Login eșuat.");
        return;
      }
      if (!user) {
        setError("Login eșuat: lipsă user în răspunsul backend.");
        toast.error("Login eșuat.");
        return;
      }

      login({ token, user });
      toast.success("Autentificare reușită.");
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Autentificare eșuată. Verifică datele sau conexiunea la server.";
      setError(msg);
      toast.error("Autentificare eșuată.");
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

          <button className="btn btn-primary w-100" type="submit" disabled={loading}>
            {loading ? "Se autentifică..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}