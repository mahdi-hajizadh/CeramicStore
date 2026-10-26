import { useCallback, useEffect, useState } from "react";
import { apiJson } from "../api.js";
import { PERMISSIONS } from "../auth/permissions.js";
import { formatDateTime } from "../utils.js";

function StaffTab() {
  const [staff, setStaff] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [form, setForm] = useState({ username: "", password: "", fullName: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);
  const [editingPermissions, setEditingPermissions] = useState(null);
  const [savingPermissions, setSavingPermissions] = useState(false);

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await apiJson("/api/owner/staff");
        if (!cancelled) setStaff(list);
      } catch (err) {
        if (!cancelled) setError(err.message || "دریافت لیست ناموفق بود.");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleCreate(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!/^[A-Za-z0-9_.]{3,30}$/.test(form.username.trim())) {
      setError("نام کاربری باید ۳ تا ۳۰ کاراکتر و فقط شامل حروف انگلیسی، عدد، _ و . باشد.");
      return;
    }

    if (form.password.length < 8) {
      setError("رمز عبور باید حداقل ۸ کاراکتر باشد.");
      return;
    }

    setBusy(true);

    try {
      await apiJson("/api/owner/staff", {
        method: "POST",
        json: {
          username: form.username.trim(),
          password: form.password,
          fullName: form.fullName.trim() || null,
        },
      });

      setForm({ username: "", password: "", fullName: "" });
      setSuccess("حساب ادمین ساخته شد.");
      refresh();
    } catch (err) {
      setError(err.message || "ساخت حساب ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  async function savePermissions(member) {
    setError(""); setSuccess(""); setSavingPermissions(true);
    try {
      const updated = await apiJson(`/api/owner/staff/${member.id}/permissions`, {
        method: "PUT", json: { permissions: editingPermissions?.permissions ?? [] }
      });
      setStaff((current) => current.map((item) => item.id === member.id ? updated : item));
      setEditingPermissions(null);
      setSuccess(`دسترسی‌های ${member.username} ذخیره شد.`);
    } catch (err) { setError(err.message || "ذخیره دسترسی‌ها ناموفق بود."); }
    finally { setSavingPermissions(false); }
  }

  async function handleDelete(member) {
    if (!window.confirm(`حساب «${member.username}» حذف شود؟`)) return;

    setError("");
    setSuccess("");

    try {
      await apiJson(`/api/owner/staff/${member.id}`, { method: "DELETE" });
      setSuccess("حساب حذف شد.");
      refresh();
    } catch (err) {
      setError(err.message || "حذف ناموفق بود.");
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <span className="admin-eyebrow">STAFF</span>
          <h3>ادمین‌های فروشگاه</h3>
        </div>
      </div>

      <p className="admin-muted">
        برای هر ادمین، بخش‌های مجاز را جداگانه انتخاب کنید. دسترسی‌ها در سمت سرور هم بررسی می‌شوند و بلافاصله اعمال می‌شوند.
      </p>

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

      <form className="admin-form" onSubmit={handleCreate}>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>نام کاربری (انگلیسی)</span>
            <input name="username" value={form.username} onChange={handleChange} dir="ltr" autoComplete="off" />
          </label>

          <label className="admin-field">
            <span>رمز عبور (حداقل ۸ کاراکتر)</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              dir="ltr"
              autoComplete="new-password"
            />
          </label>

          <label className="admin-field">
            <span>نام (اختیاری)</span>
            <input name="fullName" value={form.fullName} onChange={handleChange} />
          </label>
        </div>

        <div className="admin-form-actions">
          <button type="submit" className="admin-primary-button" disabled={busy}>
            {busy ? "در حال ساخت..." : "+ ساخت ادمین"}
          </button>
        </div>
      </form>

      {loaded && staff.length === 0 && <p className="admin-empty">هنوز ادمینی ساخته نشده است.</p>}

      {staff.length > 0 && (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>نام کاربری</th>
                <th>نام</th>
                <th>تاریخ ساخت</th>
                <th>دسترسی‌ها</th>
                <th>عملیات</th>
              </tr>
            </thead>

            <tbody>
              {staff.map((member) => (
                <tr key={member.id}>
                  <td dir="ltr">{member.username}</td>
                  <td>{member.fullName ?? "—"}</td>
                  <td>{formatDateTime(member.createdAt)}</td>
                  <td>
                    <button type="button" className="admin-secondary-button" onClick={() => setEditingPermissions(editingPermissions?.memberId === member.id ? null : { memberId: member.id, permissions: [...(member.permissions ?? [])] })}>
                      {editingPermissions?.memberId === member.id ? "بستن دسترسی‌ها" : "تنظیم دسترسی"}
                    </button>
                    {editingPermissions?.memberId === member.id && (
                      <div className="admin-permission-editor">
                        {PERMISSIONS.map(({ key, label }) => (
                          <label key={key} className="admin-permission-option">
                            <input type="checkbox" checked={editingPermissions.permissions.includes(key)} onChange={(e) => setEditingPermissions((current) => ({ ...current, permissions: e.target.checked ? [...current.permissions, key] : current.permissions.filter((x) => x !== key) }))} /> {label}
                          </label>
                        ))}
                        <button type="button" className="admin-primary-button" disabled={savingPermissions} onClick={() => savePermissions(member)}>ذخیره مجوزها</button>
                        <button type="button" className="admin-secondary-button" onClick={() => setEditingPermissions(null)}>انصراف</button>
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      type="button"
                      className="admin-delete-button"
                      onClick={() => handleDelete(member)}
                    >
                      حذف
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default StaffTab;
