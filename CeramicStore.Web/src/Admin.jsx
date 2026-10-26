import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "./Admin.css";
import Pagination from "./components/Pagination.jsx";
import {
  ALLOWED_IMAGE_TYPES,
  API_URL,
  MAX_IMAGE_BYTES,
  PRODUCT_STATS_URL,
} from "./config.js";
import { apiFetch } from "./api.js";
import { canOpenPanel } from "./auth/permissions.js";
import { useAuth } from "./auth/useAuth.js";
import { useDebouncedValue } from "./useDebouncedValue.js";
import { useProducts } from "./useProducts.js";
import {
  formatNumber,
  formatPrice,
  imageSrc,
  parseNumber,
  readApiError,
} from "./utils.js";

const PAGE_SIZE = 10;

const emptyForm = {
  name: "",
  brand: "",
  pricePerSquareMeter: "",
  boxCoverage: "",
  stock: "",
};

/* ---------- داشبورد مدیریت ---------- */

function Admin() {
  const { user, logout } = useAuth();
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [fileInputKey, setFileInputKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [stats, setStats] = useState(null);

  const search = useDebouncedValue(searchInput.trim());

  const {
    items: products,
    total,
    loading,
    error: listError,
  } = useProducts({
    search,
    sortBy: "id",
    descending: true,
    page,
    pageSize: PAGE_SIZE,
    reloadToken,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  // آمار کل محصولات (مستقل از صفحه‌بندی)
  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(PRODUCT_STATS_URL, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        setStats(await response.json());
      } catch (err) {
        if (err.name !== "AbortError") console.error(err);
      }
    })();

    return () => controller.abort();
  }, [reloadToken]);

  // پیش‌نمایش تصویر انتخاب‌شده؛ آدرس موقت هنگام تغییر آزاد می‌شود.
  const localPreview = useMemo(
    () => (selectedImage ? URL.createObjectURL(selectedImage) : ""),
    [selectedImage]
  );

  useEffect(() => {
    return () => {
      if (localPreview) URL.revokeObjectURL(localPreview);
    };
  }, [localPreview]);

  const previewSrc = localPreview || imageSrc(currentImageUrl);

  // درخواست‌های مدیریتی با توکن ورود؛ در صورت 401 کاربر خودکار خارج می‌شود.
  const adminFetch = useCallback(async (url, options = {}) => {
    const response = await apiFetch(url, options);

    if (response.status === 401) {
      throw new Error("نشست منقضی شده؛ دوباره وارد شو.");
    }

    if (response.status === 403) {
      throw new Error("اجازه انجام این کار را نداری.");
    }

    return response;
  }, []);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function clearSelectedImage() {
    setSelectedImage(null);
    setFileInputKey((key) => key + 1);
  }

  function resetForm() {
    setForm(emptyForm);
    clearSelectedImage();
    setCurrentImageUrl("");
    setEditingId(null);
    setError("");
    setSuccess("");
  }

  function startEditing(product) {
    setEditingId(product.id);
    clearSelectedImage();
    setCurrentImageUrl(product.imageUrl ?? "");

    setForm({
      name: product.name ?? "",
      brand: product.brand ?? "",
      pricePerSquareMeter: String(product.pricePerSquareMeter ?? ""),
      boxCoverage: String(product.boxCoverage ?? ""),
      stock: String(product.stock ?? ""),
    });

    setError("");
    setSuccess("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleImageChange(event) {
    const file = event.target.files?.[0] ?? null;

    if (!file) {
      setSelectedImage(null);
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("فرمت تصویر باید JPG، PNG یا WEBP باشد.");
      clearSelectedImage();
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setError("حجم تصویر نباید بیشتر از ۵ مگابایت باشد.");
      clearSelectedImage();
      return;
    }

    setError("");
    setSelectedImage(file);
  }

  async function handleRemoveCurrentImage() {
    if (editingId === null) return;

    if (!window.confirm("تصویر فعلی این محصول حذف شود؟")) return;

    setError("");
    setSuccess("");

    try {
      const response = await adminFetch(`${API_URL}/${editingId}/image`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(await readApiError(response));

      setCurrentImageUrl("");
      setSuccess("تصویر محصول حذف شد.");
      refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "حذف تصویر ناموفق بود.");
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    const price = parseNumber(form.pricePerSquareMeter);
    const coverage = parseNumber(form.boxCoverage);
    const stock = parseNumber(form.stock);

    if (!form.name.trim() || !form.brand.trim()) {
      setError("نام محصول و برند را وارد کن.");
      return;
    }

    if (form.name.trim().length < 2) {
      setError("نام محصول باید حداقل ۲ کاراکتر باشد.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      setError("قیمت باید عددی بزرگ‌تر از صفر باشد.");
      return;
    }

    if (!Number.isFinite(coverage) || coverage <= 0) {
      setError("پوشش کارتن باید عددی بزرگ‌تر از صفر باشد.");
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      setError("موجودی باید عدد صحیح و صفر یا بیشتر باشد.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      pricePerSquareMeter: price,
      boxCoverage: coverage,
      stock,
    };

    const isEditing = editingId !== null;
    const url = isEditing ? `${API_URL}/${editingId}` : API_URL;

    setSaving(true);

    try {
      const response = await adminFetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error(await readApiError(response));

      const savedProduct = await response.json();

      if (selectedImage) {
        const imageData = new FormData();
        imageData.append("image", selectedImage);

        const imageResponse = await adminFetch(
          `${API_URL}/${savedProduct.id}/image`,
          { method: "POST", body: imageData }
        );

        if (!imageResponse.ok) {
          // محصول ذخیره شده است؛ فرم را به حالت ویرایش می‌بریم تا با تلاش
          // دوباره، محصول تکراری ساخته نشود.
          setEditingId(savedProduct.id);
          setCurrentImageUrl(savedProduct.imageUrl ?? "");
          refresh();

          throw new Error(
            `اطلاعات محصول ذخیره شد، اما بارگذاری تصویر ناموفق بود: ${await readApiError(imageResponse)}`
          );
        }
      }

      resetForm();
      setSuccess(
        isEditing
          ? "محصول با موفقیت ویرایش شد."
          : "محصول جدید با موفقیت ثبت شد."
      );

      if (!isEditing) setPage(1);
      refresh();
    } catch (err) {
      console.error(err);
      setError(
        err.message || "عملیات انجام نشد. اتصال بک‌اند را بررسی کن."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(product) {
    const confirmed = window.confirm(
      `آیا از حذف محصول «${product.name}» مطمئنی؟`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");

    try {
      const response = await adminFetch(`${API_URL}/${product.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error(await readApiError(response));

      if (editingId === product.id) resetForm();

      // اگر آخرین محصول صفحه حذف شد، به صفحه قبل برگرد.
      if (products.length === 1 && page > 1) setPage(page - 1);

      setSuccess("محصول با موفقیت حذف شد.");
      refresh();
    } catch (err) {
      console.error(err);
      setError(err.message || "حذف محصول ناموفق بود.");
    }
  }

  function handleSearchChange(event) {
    setSearchInput(event.target.value);
    setPage(1);
  }

  const statValue = (value) =>
    stats ? formatNumber(value) : "—";

  return (
    <main className="admin-page" dir="rtl">
      <header className="admin-header">
        <div className="admin-brand">
          <div className="admin-brand-icon">CS</div>

          <div>
            <h1>CeramicStore</h1>
            <p>پنل ادمین · مدیریت محصولات</p>
          </div>
        </div>

        <div className="admin-header-actions">
          <Link className="admin-back-link" to="/">
            مشاهده فروشگاه ↗
          </Link>

          {canOpenPanel(user) && (
            <Link className="admin-back-link" to="/owner">
              {user.role === "Owner" ? "پنل صاحب فروشگاه" : "پنل مدیریت"}
            </Link>
          )}

          <button
            type="button"
            className="admin-secondary-button"
            onClick={logout}
          >
            خروج
          </button>
        </div>
      </header>

      <section className="admin-welcome">
        <div>
          <span className="admin-eyebrow">MANAGEMENT DASHBOARD</span>

          <h2>مدیریت محصولات</h2>

          <p>محصولات فروشگاه را از این بخش ثبت، ویرایش و حذف کن.</p>
        </div>

        <button
          type="button"
          className="admin-refresh-button"
          onClick={refresh}
          disabled={loading}
        >
          ↻ به‌روزرسانی فهرست
        </button>
      </section>

      <section className="admin-stats">
        <article className="admin-stat-card">
          <span>تعداد کل محصولات</span>
          <strong>{statValue(stats?.total)}</strong>
        </article>

        <article className="admin-stat-card">
          <span>محصولات موجود</span>
          <strong>{statValue(stats?.inStock)}</strong>
        </article>

        <article className="admin-stat-card">
          <span>محصولات ناموجود</span>
          <strong>{statValue(stats?.outOfStock)}</strong>
        </article>
      </section>

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

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="admin-eyebrow">PRODUCT FORM</span>

            <h3>
              {editingId !== null ? "ویرایش محصول" : "افزودن محصول جدید"}
            </h3>
          </div>

          {editingId !== null && (
            <button
              type="button"
              className="admin-cancel-button"
              onClick={resetForm}
            >
              لغو ویرایش
            </button>
          )}
        </div>

        <form className="admin-form" onSubmit={handleSubmit} noValidate>
          <div className="admin-form-grid">
            <label className="admin-field">
              <span>نام محصول</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="مثلاً سرامیک پرسلان ۶۰×۱۲۰"
                maxLength={150}
                required
              />
            </label>

            <label className="admin-field">
              <span>برند</span>
              <input
                name="brand"
                value={form.brand}
                onChange={handleChange}
                placeholder="نام برند"
                maxLength={100}
                required
              />
            </label>

            <label className="admin-field">
              <span>قیمت هر متر مربع (تومان)</span>
              <input
                name="pricePerSquareMeter"
                inputMode="decimal"
                value={form.pricePerSquareMeter}
                onChange={handleChange}
                placeholder="مثلاً ۵۵۰۰۰۰"
                required
              />
            </label>

            <label className="admin-field">
              <span>پوشش هر کارتن (متر مربع)</span>
              <input
                name="boxCoverage"
                inputMode="decimal"
                value={form.boxCoverage}
                onChange={handleChange}
                placeholder="مثلاً ۱.۴۴"
                required
              />
            </label>

            <label className="admin-field">
              <span>موجودی (تعداد کارتن)</span>
              <input
                name="stock"
                inputMode="numeric"
                value={form.stock}
                onChange={handleChange}
                placeholder="مثلاً ۹۰"
                required
              />
            </label>
          </div>

          <div className="admin-image-upload">
            <label className="admin-field">
              <span>تصویر محصول (JPG، PNG یا WEBP؛ حداکثر ۵ مگابایت)</span>
              <input
                key={fileInputKey}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
              />
            </label>

            {previewSrc && (
              <div className="admin-image-preview-wrap">
                <img
                  className="admin-image-preview"
                  src={previewSrc}
                  alt="پیش‌نمایش تصویر محصول"
                />

                {selectedImage ? (
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={clearSelectedImage}
                  >
                    حذف تصویر انتخاب‌شده
                  </button>
                ) : (
                  editingId !== null && (
                    <button
                      type="button"
                      className="admin-secondary-button"
                      onClick={handleRemoveCurrentImage}
                    >
                      حذف تصویر محصول
                    </button>
                  )
                )}
              </div>
            )}
          </div>

          <div className="admin-form-actions">
            <button
              type="submit"
              className="admin-primary-button"
              disabled={saving}
            >
              {saving
                ? "در حال ذخیره..."
                : editingId !== null
                  ? "ذخیره تغییرات"
                  : "+ ثبت محصول"}
            </button>

            <button
              type="button"
              className="admin-secondary-button"
              onClick={resetForm}
              disabled={saving}
            >
              پاک کردن فرم
            </button>
          </div>
        </form>
      </section>

      <section className="admin-panel admin-products-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="admin-eyebrow">INVENTORY</span>

            <h3>فهرست محصولات</h3>
          </div>

          <span className="admin-total-count">
            {formatNumber(total)} محصول
          </span>
        </div>

        <div className="admin-search">
          <input
            type="search"
            value={searchInput}
            onChange={handleSearchChange}
            placeholder="جست‌وجو بر اساس نام یا برند..."
            aria-label="جست‌وجوی محصولات پنل مدیریت"
          />
        </div>

        {listError ? (
          <div className="admin-alert admin-alert-error" role="alert">
            {listError}
          </div>
        ) : loading && products.length === 0 ? (
          <p className="admin-empty">در حال دریافت محصولات...</p>
        ) : products.length === 0 ? (
          <p className="admin-empty">محصولی برای نمایش پیدا نشد.</p>
        ) : (
          <div
            className={`admin-table-wrapper${loading ? " is-loading" : ""}`}
            aria-busy={loading}
          >
            <table className="admin-table">
              <thead>
                <tr>
                  <th>تصویر</th>
                  <th>شناسه</th>
                  <th>نام محصول</th>
                  <th>برند</th>
                  <th>قیمت هر متر</th>
                  <th>پوشش کارتن</th>
                  <th>موجودی</th>
                  <th>عملیات</th>
                </tr>
              </thead>

              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      {product.imageUrl ? (
                        <img
                          className="admin-table-image"
                          src={imageSrc(product.imageUrl)}
                          alt={product.name}
                          loading="lazy"
                        />
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>#{product.id}</td>

                    <td className="admin-product-name">{product.name}</td>

                    <td>{product.brand}</td>

                    <td>{formatPrice(product.pricePerSquareMeter)}</td>

                    <td>{formatNumber(product.boxCoverage)} متر</td>

                    <td>
                      <span
                        className={
                          product.stock > 0
                            ? "admin-stock-badge"
                            : "admin-stock-badge is-empty"
                        }
                      >
                        {formatNumber(product.stock)} کارتن
                      </span>
                    </td>

                    <td>
                      <div className="admin-row-actions">
                        <button
                          type="button"
                          className="admin-edit-button"
                          onClick={() => startEditing(product)}
                        >
                          ویرایش
                        </button>

                        <button
                          type="button"
                          className="admin-delete-button"
                          onClick={() => handleDelete(product)}
                        >
                          حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!listError && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            className="admin-pagination"
          />
        )}
      </section>

      <footer className="admin-footer">
        CeramicStore Admin · مدیریت محصولات فروشگاه
      </footer>
    </main>
  );
}

export default Admin;
