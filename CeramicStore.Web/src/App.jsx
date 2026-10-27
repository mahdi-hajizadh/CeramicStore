import { useEffect, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import "./App.css";
import BuyingGuide from "./components/BuyingGuide.jsx";
import ContactSection from "./components/ContactSection.jsx";
import Pagination from "./components/Pagination.jsx";
import { useDebouncedValue } from "./useDebouncedValue.js";
import { useProducts } from "./useProducts.js";
import { useSettings } from "./settings/useSettings.js";
import {
  formatNumber,
  formatPrice,
  imageSrc,
  splitStoreName,
} from "./utils.js";

const PAGE_SIZE = 12;

const SORT_OPTIONS = [
  { value: "", label: "ترتیب پیش‌فرض", sortBy: "", descending: false },
  { value: "newest", label: "جدیدترین", sortBy: "id", descending: true },
  { value: "price-asc", label: "قیمت: از کم به زیاد", sortBy: "price", descending: false },
  { value: "price-desc", label: "قیمت: از زیاد به کم", sortBy: "price", descending: true },
  { value: "stock-asc", label: "موجودی: از کم به زیاد", sortBy: "stock", descending: false },
  { value: "stock-desc", label: "موجودی: از زیاد به کم", sortBy: "stock", descending: true },
];

function App() {
  const [searchInput, setSearchInput] = useState("");
  const [sortValue, setSortValue] = useState("");
  const [page, setPage] = useState(1);
  const { settings, images } = useSettings();
  const { hash, key: locationKey } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q");
  const sortFromUrl = searchParams.get("sort");
  const activeSearchInput = queryFromUrl ?? searchInput;
  const activeSortValue =
    sortFromUrl === "newest" ? "newest" : sortValue;

  // با ورود به صفحه یا کلیک روی لینک‌های منو (/#products، /#gallery، ...) به بخش موردنظر برو.
  // وابستگی به key باعث می‌شود کلیک دوباره روی همان لینک هم اسکرول کند.
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }
  }, [hash, locationKey]);

  const search = useDebouncedValue(activeSearchInput.trim());
  const sort =
    SORT_OPTIONS.find((option) => option.value === activeSortValue) ??
    SORT_OPTIONS[0];

  const { items: products, total, loading, error } = useProducts({
    search,
    sortBy: sort.sortBy,
    descending: sort.descending,
    page,
    pageSize: PAGE_SIZE,
  });

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function clearProductQueryParams() {
    if (!searchParams.has("q") && !searchParams.has("sort")) return;
    const next = new URLSearchParams(searchParams);
    next.delete("q");
    next.delete("sort");
    setSearchParams(next, { replace: true });
  }

  function handleSearchChange(event) {
    setSearchInput(event.target.value);
    setPage(1);
    clearProductQueryParams();
  }

  function handleSortChange(event) {
    setSortValue(event.target.value);
    setPage(1);
    clearProductQueryParams();
  }

  function handlePageChange(nextPage) {
    setPage(nextPage);
    document
      .getElementById("products")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const firstLoad = loading && products.length === 0;
  const brand = splitStoreName(settings.storeName);

  return (
    <>
      <section className="hero" id="top">
        <div className="hero-content">
          <p className="hero-brand" aria-label={settings.storeName}>
            {brand.rest ? (
              <>
                {brand.first}
                <span>{brand.rest}</span>
              </>
            ) : (
              brand.first
            )}
          </p>

          <span className="eyebrow">CERAMIC &amp; TILE COLLECTION</span>

          <h1>
            زیبایی ماندگار،
            <br />
            کیفیت <span>بی‌نظیر</span>
          </h1>

          <p>
            مجموعه‌ای از کاشی و سرامیک باکیفیت برای ساختن فضایی
            زیباتر و ماندگارتر.
          </p>

          <div className="hero-actions">
            <a href="#products" className="primary-button">
              مشاهده محصولات
            </a>
            <a href="#about" className="text-link">
              تماس با ما
            </a>
          </div>
        </div>

        <div className="hero-decoration" aria-hidden="true">
          <div className="tile tile-one" />
          <div className="tile tile-two" />
          <div className="tile tile-three" />
          <div className="tile tile-four" />
        </div>
      </section>

      <section className="products-section" id="products">
        <div className="section-heading">
          <div>
            <span className="eyebrow">OUR PRODUCTS</span>
            <h2>محصولات فروشگاه</h2>
          </div>

          <span className="product-count">
            {formatNumber(total)} محصول
          </span>
        </div>

        <div className="product-toolbar">
          <input
            type="search"
            placeholder="جست‌وجوی نام محصول یا برند..."
            value={activeSearchInput}
            onChange={handleSearchChange}
            aria-label="جست‌وجوی محصولات"
          />

          <select
            value={activeSortValue}
            onChange={handleSortChange}
            aria-label="مرتب‌سازی محصولات"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {firstLoad && (
          <p className="message" role="status">
            در حال دریافت محصولات...
          </p>
        )}

        {error && (
          <p className="message error" role="alert">
            {error}
          </p>
        )}

        {!loading && !error && products.length === 0 && (
          <p className="message">محصولی با این مشخصات پیدا نشد.</p>
        )}

        {!error && products.length > 0 && (
          <div
            className={`product-grid${loading ? " is-loading" : ""}`}
            aria-busy={loading}
          >
            {products.map((product) => (
              <article className="product-card" key={product.id}>
                <Link
                  className="product-image"
                  to={`/products/${product.id}`}
                  aria-label={`مشاهده ${product.name}`}
                >
                  {product.imageUrl ? (
                    <img
                      className="product-photo"
                      src={imageSrc(product.imageUrl)}
                      alt={product.name}
                      loading="lazy"
                    />
                  ) : (
                    <div className="product-tile-pattern" />
                  )}
                </Link>

                <div className="product-info">
                  <span className="product-brand">{product.brand}</span>

                  <h3>
                    <Link to={`/products/${product.id}`}>{product.name}</Link>
                  </h3>

                  <div className="product-details">
                    <span>پوشش هر کارتن</span>
                    <strong>
                      {formatNumber(product.boxCoverage)} متر مربع
                    </strong>
                  </div>

                  <div className="product-details">
                    <span>موجودی</span>
                    <strong>
                      {product.stock > 0
                        ? `${formatNumber(product.stock)} کارتن`
                        : "ناموجود"}
                    </strong>
                  </div>

                  <div className="product-footer">
                    <div>
                      <span className="price-label">قیمت هر متر مربع</span>

                      <strong className="price">
                        {formatPrice(product.pricePerSquareMeter)}
                      </strong>
                    </div>
                    <Link
                      className="details-link"
                      to={`/products/${product.id}`}
                    >
                      جزئیات
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {!error && (
          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={handlePageChange}
          />
        )}
      </section>

      {images.length > 0 && (
        <section className="gallery-section" id="gallery">
          <div className="section-heading">
            <div>
              <span className="eyebrow">OUR SHOWROOM</span>
              <h2>فروشگاه ما</h2>
            </div>
          </div>

          <div className="gallery-grid">
            {images.map((image) => (
              <figure className="gallery-item" key={image.id}>
                <img
                  src={imageSrc(image.imageUrl)}
                  alt={image.caption || "تصویر فروشگاه"}
                  loading="lazy"
                />
                {image.caption && <figcaption>{image.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </section>
      )}

      <ContactSection />
      <BuyingGuide />
    </>
  );
}

export default App;
