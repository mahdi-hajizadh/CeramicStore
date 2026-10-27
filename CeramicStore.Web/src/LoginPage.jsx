import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { homePathFor } from "./auth/paths.js";
import { isValidMobile, normalizeMobile, normalizeOtpCode } from "./auth/phone.js";
import { useAuth } from "./auth/useAuth.js";

function LoginPage() {
  const { user, login, loginOtp, sendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const from = location.state?.from?.pathname;

  if (user) {
    return <Navigate to={from ?? homePathFor(user)} replace />;
  }

  function switchMode(next) {
    setMode(next);
    setError("");
    setOtpSent(false);
    setDevCode("");
    setCode("");
  }

  async function handlePasswordLogin(event) {
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

  async function handleSendOtp(event) {
    event.preventDefault();
    setError("");

    if (!isValidMobile(phone)) {
      setError("شماره موبایل معتبر نیست. مثال: 09123456789");
      return;
    }

    setBusy(true);

    try {
      const result = await sendOtp(normalizeMobile(phone), "login");
      setOtpSent(true);
      setDevCode(result.devCode || "");
    } catch (err) {
      setError(err.message || "ارسال کد ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  async function handleOtpLogin(event) {
    event.preventDefault();
    setError("");

    const normalizedCode = normalizeOtpCode(code);
    if (normalizedCode.length !== 6) {
      setError("کد تأیید باید ۶ رقم باشد.");
      return;
    }

    setBusy(true);

    try {
      const loggedIn = await loginOtp(normalizeMobile(phone), normalizedCode);
      navigate(from ?? homePathFor(loggedIn), { replace: true });
    } catch (err) {
      setError(err.message || "ورود ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="shop-page auth-page">
      <div className="auth-card">
        <h1>ورود</h1>

        <div className="auth-tabs" role="tablist" aria-label="روش ورود">
          <button
            type="button"
            role="tab"
            className={mode === "password" ? "is-active" : undefined}
            aria-selected={mode === "password"}
            onClick={() => switchMode("password")}
          >
            رمز عبور
          </button>
          <button
            type="button"
            role="tab"
            className={mode === "otp" ? "is-active" : undefined}
            aria-selected={mode === "otp"}
            onClick={() => switchMode("otp")}
          >
            کد پیامکی
          </button>
        </div>

        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}

        {mode === "password" ? (
          <form onSubmit={handlePasswordLogin}>
            <label className="form-field">
              <span>موبایل یا نام کاربری</span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                dir="ltr"
                placeholder="09123456789"
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

            <p className="auth-inline-links">
              <Link to="/forgot-password" state={location.state}>
                فراموشی رمز عبور
              </Link>
            </p>

            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? "در حال ورود..." : "ورود"}
            </button>
          </form>
        ) : (
          <form onSubmit={otpSent ? handleOtpLogin : handleSendOtp}>
            <label className="form-field">
              <span>شماره موبایل</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                placeholder="09123456789"
                required
                disabled={otpSent && busy}
              />
            </label>

            {otpSent && (
              <>
                <label className="form-field">
                  <span>کد پیامک‌شده</span>
                  <input
                    value={code}
                    onChange={(event) => setCode(normalizeOtpCode(event.target.value))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    dir="ltr"
                    maxLength={6}
                    placeholder="------"
                    required
                  />
                </label>

                {devCode && (
                  <p className="message success" role="status">
                    حالت توسعه — کد: <strong dir="ltr">{devCode}</strong>
                  </p>
                )}

                <button
                  type="button"
                  className="link-button"
                  disabled={busy}
                  onClick={handleSendOtp}
                >
                  ارسال مجدد کد
                </button>
              </>
            )}

            <button type="submit" className="primary-button" disabled={busy}>
              {busy
                ? "لطفاً صبر کن..."
                : otpSent
                  ? "تأیید و ورود"
                  : "ارسال کد ورود"}
            </button>
          </form>
        )}

        <p className="muted">
          حساب نداری؟{" "}
          <Link to="/register" state={location.state}>
            ثبت‌نام کن
          </Link>
        </p>
      </div>
    </section>
  );
}

export default LoginPage;
