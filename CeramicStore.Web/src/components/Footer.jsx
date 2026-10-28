import { Link } from "react-router-dom";
import { useSettings } from "../settings/useSettings.js";
import { instagramUrl } from "../utils.js";
import { IconInstagram } from "./icons.jsx";
import "./Footer.css";

const quickLinks = [
  { title: "صفحه اصلی", to: "/" },
  { title: "فروشگاه", to: { pathname: "/", hash: "#products" } },
  {
    title: "محصولات جدید",
    to: { pathname: "/", search: "?sort=newest", hash: "#products" },
  },
  { title: "درباره ما", to: { pathname: "/", hash: "#about" } },
  { title: "راهنمای خرید", to: { pathname: "/", hash: "#guide" } },
  { title: "سؤالات متداول", to: "/faq" },
];

const productCategories = [
  { title: "سرامیک کف", q: "سرامیک کف" },
  { title: "کاشی دیواری", q: "کاشی" },
  { title: "سرامیک پرسلان", q: "پرسلان" },
  { title: "سرامیک طرح سنگ", q: "سنگ" },
  { title: "سرامیک طرح چوب", q: "چوب" },
  { title: "مشاهده همه محصولات", q: null },
];

function Footer() {
  const { settings } = useSettings();
  const storeName = settings.storeName || "CeramicStore";
  const year = new Date().getFullYear();
  const ig = instagramUrl(settings.instagram || "madi.hajizadh");
  const footer = settings.content?.footer;

  return (
    <footer className="site-footer" dir="rtl">
      <div className="footer-container">
        <div className="footer-grid">
          <section className="footer-brand">
            <Link to="/" className="footer-brand__identity" aria-label={storeName}>
              <img
                className="footer-brand__logo"
                src="/logo.jpg"
                alt=""
                width={44}
                height={44}
              />
              <span className="footer-brand__name">{storeName}</span>
            </Link>

            <p className="footer-brand__tagline">
              {footer?.tagline || "انتخابی مطمئن برای ساختن فضاهای ماندگار"}
            </p>

            <p className="footer-brand__description">
              {footer?.description ||
                "فروشگاه تخصصی کاشی و سرامیک برای فضاهای داخلی و کاربری‌های متنوع؛ از انتخاب محصول تا آماده‌سازی سفارش در کنار شما هستیم."}
            </p>

            <Link
              to={{ pathname: "/", hash: "#about" }}
              className="footer-brand__link"
            >
              درباره فروشگاه
            </Link>
          </section>

          <nav className="footer-column" aria-label="دسترسی سریع">
            <h3 className="footer-column__title">دسترسی سریع</h3>
            <ul className="footer-links">
              {quickLinks.map((link) => (
                <li key={link.title}>
                  <Link to={link.to}>{link.title}</Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav className="footer-column" aria-label="دسته‌بندی محصولات">
            <h3 className="footer-column__title">دسته‌بندی محصولات</h3>
            <ul className="footer-links">
              {productCategories.map((category) => (
                <li key={category.title}>
                  <Link
                    to={
                      category.q
                        ? {
                            pathname: "/",
                            search: `?q=${encodeURIComponent(category.q)}`,
                            hash: "#products",
                          }
                        : { pathname: "/", hash: "#products" }
                    }
                  >
                    {category.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="footer-bottom">
          <p>
            © {year} {storeName} — تمامی حقوق محفوظ است.
          </p>

          <div className="footer-bottom__links">
            {ig && (
              <a
                href={ig}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-social"
                aria-label="اینستاگرام CeramicStore"
              >
                <IconInstagram size={18} />
              </a>
            )}
            <Link to="/terms">قوانین و مقررات</Link>
            <Link to="/privacy">حریم خصوصی</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
