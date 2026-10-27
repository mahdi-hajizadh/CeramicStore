import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { isValidMobile, normalizeMobile, normalizeOtpCode } from "./auth/phone.js";
import { useAuth } from "./auth/useAuth.js";

function RegisterPage() {
  const { user, register, sendOtp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [devCode, setDevCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const from = location.state?.from?.pathname;

  if (user) {
    return <Navigate to={from ?? "/account"} replace />;
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
      const result = await sendOtp(normalizeMobile(phone), "register");
      setDevCode(result.devCode || "");
      setStep(2);
    } catch (err) {
      setError(err.message || "ارسال کد ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");

    const normalizedCode = normalizeOtpCode(code);
    if (normalizedCode.length !== 6) {
      setError("کد تأیید باید ۶ رقم باشد.");
      return;
    }

    if (password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    if (password !== confirm) {
      setError("رمز عبور و تکرار آن یکسان نیستند.");
      return;
    }

    setBusy(true);

    try {
      await register({
        phone: normalizeMobile(phone),
        code: normalizedCode,
        password,
        fullName: fullName.trim() || null,
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
      <div className="auth-card">
        <h1>ثبت‌نام با موبایل</h1>
        <p className="muted">
          {step === 1
            ? "شماره موبایل را وارد کن تا کد تأیید پیامک شود."
            : `کد پیامک‌شده به ${normalizeMobile(phone) || phone} را وارد کن.`}
        </p>

        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}

        {step === 1 ? (
          <form onSubmit={handleSendOtp}>
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
              />
            </label>

            <button type="submit" className="primary-button" disabled={busy}>
              {busy ? "در حال ارسال..." : "ارسال کد تأیید"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
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

            <label className="form-field">
              <span>نام و نام خانوادگی (اختیاری)</span>
              <input
                value={fullName}
                onChange={(event) => setFullName(event.target.value)}
                autoComplete="name"
              />
            </label>

            <label className="form-field">
              <span>رمز عبور (حداقل ۸ کاراکتر)</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                dir="ltr"
                required
              />
            </label>

            <label className="form-field">
              <span>تکرار رمز عبور</span>
              <input
                type="password"
                value={confirm}
                onChange={(event) => setConfirm(event.target.value)}
                autoComplete="new-password"
                dir="ltr"
                required
              />
            </label>

            <div className="form-actions">
              <button type="submit" className="primary-button" disabled={busy}>
                {busy ? "در حال ثبت‌نام..." : "تأیید و ساخت حساب"}
              </button>
              <button
                type="button"
                className="link-button"
                disabled={busy}
                onClick={() => {
                  setStep(1);
                  setCode("");
                  setError("");
                  setDevCode("");
                }}
              >
                تغییر شماره
              </button>
            </div>

            <button
              type="button"
              className="link-button"
              disabled={busy}
              onClick={handleSendOtp}
            >
              ارسال مجدد کد
            </button>
          </form>
        )}

        <p className="muted">
          قبلاً ثبت‌نام کرده‌ای؟{" "}
          <Link to="/login" state={location.state}>
            وارد شو
          </Link>
        </p>
      </div>
    </section>
  );
}

export default RegisterPage;
