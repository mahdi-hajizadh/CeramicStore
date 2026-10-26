import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "./auth/useAuth.js";
import { normalizeDigits } from "./utils.js";

function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    username: "",
    password: "",
    confirm: "",
    fullName: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const from = location.state?.from?.pathname;

  if (user) {
    return <Navigate to={from ?? "/account"} replace />;
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!/^[A-Za-z0-9_.]{3,30}$/.test(form.username.trim())) {
      setError("نام کاربری باید ۳ تا ۳۰ کاراکتر و فقط شامل حروف انگلیسی، عدد، _ و . باشد.");
      return;
    }

    if (form.password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    if (form.password !== form.confirm) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    setBusy(true);

    try {
      await register({
        username: form.username.trim(),
        password: form.password,
        fullName: form.fullName.trim() || null,
        phone: normalizeDigits(form.phone) || null,
      });

      navigate(from ?? "/account", { replace: true });
    } catch (err) {
      setError(err.message || "ثبت‌نام ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="shop-page auth-page">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h1>ثبت‌نام</h1>

        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}

        <label className="form-field">
          <span>نام کاربری (انگلیسی)</span>
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            autoComplete="username"
            dir="ltr"
            required
          />
        </label>

        <label className="form-field">
          <span>نام و نام خانوادگی (اختیاری)</span>
          <input name="fullName" value={form.fullName} onChange={handleChange} />
        </label>

        <label className="form-field">
          <span>شماره موبایل (اختیاری)</span>
          <input
            name="phone"
            value={form.phone}
            onChange={handleChange}
            inputMode="tel"
            autoComplete="tel"
          />
        </label>

        <label className="form-field">
          <span>رمز عبور (حداقل ۸ کاراکتر)</span>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            dir="ltr"
            required
          />
        </label>

        <label className="form-field">
          <span>تکرار رمز عبور</span>
          <input
            type="password"
            name="confirm"
            value={form.confirm}
            onChange={handleChange}
            autoComplete="new-password"
            dir="ltr"
            required
          />
        </label>

        <button type="submit" className="primary-button" disabled={busy}>
          {busy ? "در حال ثبت‌نام..." : "ساخت حساب"}
        </button>

        <p className="muted">
          قبلاً ثبت‌نام کرده‌ای؟ <Link to="/login" state={location.state}>وارد شو</Link>
        </p>
      </form>
    </section>
  );
}

export default RegisterPage;
