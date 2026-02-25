export default function Login() {
  return (
    <div className="container d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="app-card p-4" style={{ width: 380 }}>
        <h3 className="text-app-primary mb-3">Autentificare</h3>
        <p className="text-muted mb-4">Introduceți credențialele pentru acces.</p>

        <div className="mb-3">
          <label className="form-label">Email / Username</label>
          <input className="form-control" placeholder="ex: danut.tenchiu" />
        </div>

        <div className="mb-3">
          <label className="form-label">Parolă</label>
          <input type="password" className="form-control" placeholder="••••••••" />
        </div>

        <button className="btn btn-primary w-100">Login</button>
      </div>
    </div>
  );
}