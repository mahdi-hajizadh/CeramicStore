import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { homePathFor } from "./auth/paths.js";
import { useAuth } from "./auth/useAuth.js";

function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const from = location.state?.from?.pathname;

  if (user) {
    return <Navigate to={from ?? homePathFor(user)} replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      const loggedIn = await login(username.trim(), password);
      navigate(from ?? homePathFor(loggedIn), { replace: true });
    } catch (err) {
      setError(err.message || "ورود ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="shop-page auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>ورود</h1>

        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}

        <label className="form-field">
          <span>نام کاربری</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            dir="ltr"
            required
          />
        </label>

        <label className="form-field">
          <span>رمز عبور</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            dir="ltr"
            required
          />
        </label>

        <button type="submit" className="primary-button" disabled={busy}>
          {busy ? "در حال ورود..." : "ورود"}
        </button>

        <p className="muted">
          حساب نداری؟ <Link to="/register" state={location.state}>ثبت‌نام کن</Link>
        </p>
      </form>
    </section>
  );
}

export default LoginPage;
