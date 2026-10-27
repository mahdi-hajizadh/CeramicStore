import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { isValidMobile, normalizeMobile, normalizeOtpCode } from "./auth/phone.js";
import { useAuth } from "./auth/useAuth.js";

function ForgotPasswordPage() {
  const { user, sendOtp, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
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
      const result = await sendOtp(normalizeMobile(phone), "reset");
      setDevCode(result.devCode || "");
      setStep(2);
    } catch (err) {
      setError(err.message || "ارسال کد ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  async function handleReset(event) {
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
      await resetPassword({
        phone: normalizeMobile(phone),
        code: normalizedCode,
        newPassword: password,
      });

      navigate(from ?? "/account", { replace: true });
    } catch (err) {
      setError(err.message || "بازیابی رمز ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="shop-page auth-page">
      <div className="auth-card">
        <h1>فراموشی رمز عبور</h1>
        <p className="muted">
          {step === 1
            ? "شماره موبایلی که با آن ثبت‌نام کرده‌ای را وارد کن."
            : "کد پیامک‌شده و رمز جدید را وارد کن."}
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
              {busy ? "در حال ارسال..." : "ارسال کد بازیابی"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleReset}>
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
              <span>رمز عبور جدید</span>
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
              <span>تکرار رمز عبور جدید</span>
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
                {busy ? "در حال ذخیره..." : "ثبت رمز جدید و ورود"}
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
          <Link to="/login" state={location.state}>
            بازگشت به ورود
          </Link>
        </p>
      </div>
    </section>
  );
}

export default ForgotPasswordPage;
