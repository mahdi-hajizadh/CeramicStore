import { Link, Outlet } from "react-router-dom";
import "../App.css";
import "../Shop.css";
import { homePathFor } from "../auth/paths.js";
import { useAuth } from "../auth/useAuth.js";
import { useCart } from "../cart/useCart.js";
import { useSettings } from "../settings/useSettings.js";
import { formatNumber } from "../utils.js";

function StoreLayout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { settings, images } = useSettings();

  return (
    <div className="store">
      <header className="store-header">
        <div className="header-start">
          <Link className="header-brand" to="/" aria-label="CeramicStore">
            <img className="brand-logo" src="/logo.jpg" alt="" width={36} height={36} />
            <span className="brand-copy">
              <strong>CeramicStore</strong>
              <small>مرجع تخصصی کاشی و سرامیک</small>
            </span>
          </Link>

          <nav className="header-nav" aria-label="منوی اصلی">
            <Link to={{ pathname: "/", hash: "#products" }}>محصولات</Link>
            {images.length > 0 && (
              <Link to={{ pathname: "/", hash: "#gallery" }}>فروشگاه ما</Link>
            )}
            <Link to={{ pathname: "/", hash: "#about" }}>تماس و آدرس</Link>
          </nav>
        </div>

        <div className="header-actions">
          <Link className="contact-button" to={{ pathname: "/", hash: "#about" }}>
            تماس با فروشگاه
          </Link>

          {user ? (
            <>
              <button type="button" className="header-link" onClick={logout}>
                خروج
              </button>
              <Link className="cart-link" to="/cart" aria-label="سبد خرید">
                سبد خرید
                {count > 0 && (
                  <span className="cart-badge">{formatNumber(count)}</span>
                )}
              </Link>
              <Link className="header-link" to={homePathFor(user)}>
                {user.role === "Customer" ? "حساب من" : "پنل مدیریت"}
              </Link>
            </>
          ) : (
            <>
              <Link className="cart-link" to="/cart" aria-label="سبد خرید">
                سبد خرید
                {count > 0 && (
                  <span className="cart-badge">{formatNumber(count)}</span>
                )}
              </Link>
              <Link className="header-link" to="/login">
                ورود / ثبت‌نام
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="store-footer" id="contact">
        <div className="footer-brand">
          <img className="brand-logo" src="/logo.jpg" alt="" width={32} height={32} />
          <div>
            <span className="footer-name">{settings.storeName || "CeramicStore"}</span>
            <p>{settings.about || "انتخابی مطمئن برای ساختن فضاهای ماندگار."}</p>
          </div>
        </div>

        {(settings.phone || settings.address) && (
          <div className="footer-contact">
            {settings.phone && (
              <a href={`tel:${settings.phone}`} dir="ltr">
                {settings.phone}
              </a>
            )}
            {settings.address && <span>{settings.address}</span>}
          </div>
        )}
      </footer>
    </div>
  );
}

export default StoreLayout;
