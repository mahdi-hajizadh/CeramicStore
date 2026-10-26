import { useState } from "react";
import { apiJson } from "../api.js";
import { useSettings } from "../settings/useSettings.js";
import { normalizeDigits } from "../utils.js";

// فرم فقط بعد از رسیدن تنظیمات واقعی ساخته می‌شود؛ وگرنه ذخیره‌ی فرمِ خالی اطلاعات فروشگاه را پاک می‌کرد.
function SettingsTab() {
  const { ready } = useSettings();

  if (!ready) {
    return <p className="admin-empty">در حال دریافت تنظیمات...</p>;
  }

  return <SettingsForm />;
}

function SettingsForm() {
  const { settings, reload } = useSettings();
  const [form, setForm] = useState({
    storeName: settings.storeName ?? "",
    phone: settings.phone ?? "",
    address: settings.address ?? "",
    email: settings.email ?? "",
    workingHours: settings.workingHours ?? "",
    about: settings.about ?? "",
    instagram: settings.instagram ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.storeName.trim().length < 2) {
      setError("نام فروشگاه را وارد کن.");
      return;
    }

    if (!form.address.trim()) {
      setError("نشانی فروشگاه را وارد کن.");
      return;
    }

    if (!/^[\d+\-\s]{7,30}$/.test(normalizeDigits(form.phone))) {
      setError("شماره تماس معتبر نیست.");
      return;
    }

    setSaving(true);

    try {
      await apiJson("/api/settings", {
        method: "PUT",
        json: {
          storeName: form.storeName.trim(),
          phone: normalizeDigits(form.phone),
          address: form.address.trim(),
          email: form.email.trim() || null,
          workingHours: form.workingHours.trim() || null,
          about: form.about.trim() || null,
          instagram: form.instagram.trim() || null,
        },
      });

      reload();
      setSuccess("تنظیمات ذخیره شد و در سایت اعمال شد.");
    } catch (err) {
      setError(err.message || "ذخیره تنظیمات ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <span className="admin-eyebrow">SITE SETTINGS</span>
          <h3>اطلاعات فروشگاه</h3>
        </div>
      </div>

      {error && (
        <div className="admin-alert admin-alert-error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-alert admin-alert-success" role="status">
          {success}
        </div>
      )}

      <form className="admin-form" onSubmit={handleSubmit} noValidate>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>نام فروشگاه</span>
            <input name="storeName" value={form.storeName} onChange={handleChange} maxLength={100} />
          </label>

          <label className="admin-field">
            <span>شماره تماس سایت</span>
            <input name="phone" value={form.phone} onChange={handleChange} inputMode="tel" />
          </label>

          <label className="admin-field">
            <span>نشانی فروشگاه</span>
            <input name="address" value={form.address} onChange={handleChange} maxLength={400} />
          </label>

          <label className="admin-field">
            <span>ساعت کاری</span>
            <input name="workingHours" value={form.workingHours} onChange={handleChange} maxLength={200} />
          </label>

          <label className="admin-field">
            <span>ایمیل (اختیاری)</span>
            <input name="email" value={form.email} onChange={handleChange} dir="ltr" />
          </label>

          <label className="admin-field">
            <span>اینستاگرام (اختیاری)</span>
            <input name="instagram" value={form.instagram} onChange={handleChange} dir="ltr" />
          </label>
        </div>

        <label className="admin-field">
          <span>متن درباره فروشگاه</span>
          <textarea name="about" rows={4} value={form.about} onChange={handleChange} maxLength={2000} />
        </label>

        <div className="admin-form-actions">
          <button type="submit" className="admin-primary-button" disabled={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default SettingsTab;
