import { useMemo, useState, useEffect } from "react";
import { apiFetch } from "../api.js";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "../config.js";
import { useSettings } from "../settings/useSettings.js";
import { imageSrc, readApiError } from "../utils.js";

// تصاویر خود فروشگاه (نه تصاویر محصولات)
function GalleryTab() {
  const { images, reload } = useSettings();
  const [file, setFile] = useState(null);
  const [fileKey, setFileKey] = useState(0);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const preview = useMemo(() => (file ? URL.createObjectURL(file) : ""), [file]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  function clearFile() {
    setFile(null);
    setFileKey((key) => key + 1);
  }

  function handleFile(event) {
    const chosen = event.target.files?.[0] ?? null;

    if (!chosen) {
      setFile(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(chosen.type)) {
      setError("فرمت تصویر باید JPG، PNG یا WEBP باشد.");
      clearFile();
      return;
    }

    if (chosen.size > MAX_IMAGE_BYTES) {
      setError("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
      clearFile();
      return;
    }

    setError("");
    setFile(chosen);
  }

  async function handleUpload(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!file) {
      setError("یک تصویر انتخاب کن.");
      return;
    }

    setBusy(true);

    try {
      const data = new FormData();
      data.append("image", file);
      data.append("caption", caption.trim());

      const response = await apiFetch("/api/store-images", { method: "POST", body: data });

      if (!response.ok) throw new Error(await readApiError(response));

      clearFile();
      setCaption("");
      setSuccess("تصویر به گالری اضافه شد.");
      reload();
    } catch (err) {
      setError(err.message || "بارگذاری تصویر ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("این تصویر از گالری حذف شود؟")) return;

    setError("");
    setSuccess("");

    try {
      const response = await apiFetch(`/api/store-images/${id}`, { method: "DELETE" });

      if (!response.ok) throw new Error(await readApiError(response));

      setSuccess("تصویر حذف شد.");
      reload();
    } catch (err) {
      setError(err.message || "حذف تصویر ناموفق بود.");
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <span className="admin-eyebrow">STORE GALLERY</span>
          <h3>تصاویر فروشگاه</h3>
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

      <form className="admin-form" onSubmit={handleUpload}>
        <div className="admin-form-grid">
          <label className="admin-field">
            <span>تصویر (JPG، PNG یا WEBP؛ حداکثر ۵ مگابایت)</span>
            <input
              key={fileKey}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFile}
            />
          </label>

          <label className="admin-field">
            <span>توضیح کوتاه (اختیاری)</span>
            <input value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={200} />
          </label>
        </div>

        {preview && <img className="admin-image-preview" src={preview} alt="پیش‌نمایش" />}

        <div className="admin-form-actions">
          <button type="submit" className="admin-primary-button" disabled={busy || !file}>
            {busy ? "در حال بارگذاری..." : "+ افزودن به گالری"}
          </button>
        </div>
      </form>

      {images.length === 0 ? (
        <p className="admin-empty">هنوز تصویری برای فروشگاه اضافه نشده است.</p>
      ) : (
        <div className="admin-gallery">
          {images.map((image) => (
            <figure key={image.id}>
              <img src={imageSrc(image.imageUrl)} alt={image.caption || "تصویر فروشگاه"} />
              {image.caption && <figcaption>{image.caption}</figcaption>}
              <button
                type="button"
                className="admin-delete-button"
                onClick={() => handleDelete(image.id)}
              >
                حذف
              </button>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}

export default GalleryTab;
