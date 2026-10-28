import { useState } from "react";
import { apiJson } from "../api.js";
import { useSettings } from "../settings/useSettings.js";
import {
  GUIDE_CARD_KEYS,
  LEGAL_PAGE_KEYS,
  LEGAL_PAGE_LABELS,
  mergeSiteContent,
} from "../settings/siteContent.js";
import { normalizeDigits } from "../utils.js";

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
  const [content, setContent] = useState(() => mergeSiteContent(settings.content));
  const [legalKey, setLegalKey] = useState("terms");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function patchContent(path, value) {
    setContent((current) => {
      const next = structuredClone(current);
      const parts = path.split(".");
      let cursor = next;
      for (let i = 0; i < parts.length - 1; i += 1) {
        cursor = cursor[parts[i]];
      }
      cursor[parts[parts.length - 1]] = value;
      return next;
    });
  }

  function patchGuideCard(key, field, value) {
    setContent((current) => ({
      ...current,
      buyingGuide: {
        ...current.buyingGuide,
        cards: current.buyingGuide.cards.map((card) =>
          card.key === key ? { ...card, [field]: value } : card
        ),
      },
    }));
  }

  function patchLegal(field, value) {
    setContent((current) => ({
      ...current,
      legal: {
        ...current.legal,
        [legalKey]: {
          ...current.legal[legalKey],
          [field]: value,
        },
      },
    }));
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
          content: mergeSiteContent(content),
        },
      });

      reload();
      setSuccess("تنظیمات و محتوای سایت ذخیره شد و در ویترین اعمال می‌شود.");
    } catch (err) {
      setError(err.message || "ذخیره تنظیمات ناموفق بود.");
    } finally {
      setSaving(false);
    }
  }

  const legalPage = content.legal[legalKey];

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <span className="admin-eyebrow">SITE CMS</span>
          <h3>ویرایش کامل سایت</h3>
          <p className="admin-panel-note">
            هدر، هیرو، تماس، فوتر، راهنمای خرید و صفحات حقوقی را از اینجا مدیریت کن.
          </p>
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

      <form className="admin-form site-cms-form" onSubmit={handleSubmit} noValidate>
        <fieldset className="site-cms-section">
          <legend>اطلاعات تماس و برند</legend>
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
              <span>ایمیل</span>
              <input name="email" value={form.email} onChange={handleChange} dir="ltr" />
            </label>
            <label className="admin-field">
              <span>اینستاگرام</span>
              <input name="instagram" value={form.instagram} onChange={handleChange} dir="ltr" />
            </label>
          </div>
          <label className="admin-field">
            <span>متن کوتاه درباره فروشگاه (اختیاری)</span>
            <textarea name="about" rows={3} value={form.about} onChange={handleChange} maxLength={2000} />
          </label>
        </fieldset>

        <fieldset className="site-cms-section">
          <legend>هدر</legend>
          <label className="admin-field">
            <span>شعار زیر نام برند در هدر</span>
            <input
              value={content.headerTagline}
              onChange={(e) => patchContent("headerTagline", e.target.value)}
              maxLength={120}
            />
          </label>
        </fieldset>

        <fieldset className="site-cms-section">
          <legend>هیرو صفحه اصلی</legend>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>Eyebrow</span>
              <input
                value={content.hero.eyebrow}
                onChange={(e) => patchContent("hero.eyebrow", e.target.value)}
                dir="ltr"
              />
            </label>
            <label className="admin-field">
              <span>خط اول عنوان</span>
              <input
                value={content.hero.titleLine1}
                onChange={(e) => patchContent("hero.titleLine1", e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>پیشوند خط دوم</span>
              <input
                value={content.hero.titleLine2Prefix}
                onChange={(e) => patchContent("hero.titleLine2Prefix", e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>کلمه برجسته خط دوم</span>
              <input
                value={content.hero.titleLine2Highlight}
                onChange={(e) => patchContent("hero.titleLine2Highlight", e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>متن دکمه اصلی</span>
              <input
                value={content.hero.primaryCta}
                onChange={(e) => patchContent("hero.primaryCta", e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>متن دکمه فرعی</span>
              <input
                value={content.hero.secondaryCta}
                onChange={(e) => patchContent("hero.secondaryCta", e.target.value)}
              />
            </label>
          </div>
          <label className="admin-field">
            <span>توضیح هیرو</span>
            <textarea
              rows={3}
              value={content.hero.subtitle}
              onChange={(e) => patchContent("hero.subtitle", e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="site-cms-section">
          <legend>بخش تماس</legend>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>Eyebrow</span>
              <input
                value={content.contact.eyebrow}
                onChange={(e) => patchContent("contact.eyebrow", e.target.value)}
                dir="ltr"
              />
            </label>
            <label className="admin-field">
              <span>عنوان</span>
              <input
                value={content.contact.heading}
                onChange={(e) => patchContent("contact.heading", e.target.value)}
              />
            </label>
          </div>
          <label className="admin-field">
            <span>توضیح کوتاه</span>
            <textarea
              rows={3}
              value={content.contact.intro}
              onChange={(e) => patchContent("contact.intro", e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="site-cms-section">
          <legend>فوتر</legend>
          <label className="admin-field">
            <span>شعار فوتر</span>
            <input
              value={content.footer.tagline}
              onChange={(e) => patchContent("footer.tagline", e.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>توضیح فوتر</span>
            <textarea
              rows={3}
              value={content.footer.description}
              onChange={(e) => patchContent("footer.description", e.target.value)}
            />
          </label>
        </fieldset>

        <fieldset className="site-cms-section">
          <legend>راهنمای خرید</legend>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>عنوان بخش</span>
              <input
                value={content.buyingGuide.heading}
                onChange={(e) => patchContent("buyingGuide.heading", e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>توضیح بخش</span>
              <input
                value={content.buyingGuide.intro}
                onChange={(e) => patchContent("buyingGuide.intro", e.target.value)}
              />
            </label>
          </div>

          {GUIDE_CARD_KEYS.map((key) => {
            const card = content.buyingGuide.cards.find((item) => item.key === key);
            return (
              <div className="site-cms-card-editor" key={key}>
                <h4>{LEGAL_PAGE_LABELS[key] || key}</h4>
                <div className="admin-form-grid">
                  <label className="admin-field">
                    <span>عنوان کارت</span>
                    <input
                      value={card?.title ?? ""}
                      onChange={(e) => patchGuideCard(key, "title", e.target.value)}
                    />
                  </label>
                  <label className="admin-field">
                    <span>خلاصه کارت</span>
                    <input
                      value={card?.summary ?? ""}
                      onChange={(e) => patchGuideCard(key, "summary", e.target.value)}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </fieldset>

        <fieldset className="site-cms-section">
          <legend>صفحات راهنما و حقوقی</legend>
          <label className="admin-field">
            <span>انتخاب صفحه</span>
            <select value={legalKey} onChange={(e) => setLegalKey(e.target.value)}>
              {LEGAL_PAGE_KEYS.map((key) => (
                <option key={key} value={key}>
                  {LEGAL_PAGE_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>عنوان صفحه</span>
              <input
                value={legalPage?.title ?? ""}
                onChange={(e) => patchLegal("title", e.target.value)}
              />
            </label>
            <label className="admin-field">
              <span>یادداشت تأیید مالک</span>
              <input
                value={legalPage?.note ?? ""}
                onChange={(e) => patchLegal("note", e.target.value)}
              />
            </label>
          </div>
          <label className="admin-field">
            <span>مقدمه</span>
            <textarea
              rows={2}
              value={legalPage?.intro ?? ""}
              onChange={(e) => patchLegal("intro", e.target.value)}
            />
          </label>
          <label className="admin-field">
            <span>نکات (هر خط یک مورد)</span>
            <textarea
              rows={5}
              value={(legalPage?.points ?? []).join("\n")}
              onChange={(e) =>
                patchLegal(
                  "points",
                  e.target.value
                    .split("\n")
                    .map((line) => line.trim())
                    .filter(Boolean)
                )
              }
            />
          </label>
        </fieldset>

        <div className="admin-form-actions">
          <button type="submit" className="admin-primary-button" disabled={saving}>
            {saving ? "در حال ذخیره..." : "ذخیره همه تغییرات سایت"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default SettingsTab;
