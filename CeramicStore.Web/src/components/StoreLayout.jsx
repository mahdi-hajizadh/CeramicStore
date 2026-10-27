import { Link, Outlet } from "react-router-dom";
import "../App.css";
import "../Shop.css";
import { homePathFor } from "../auth/paths.js";
import { useAuth } from "../auth/useAuth.js";
import { useCart } from "../cart/useCart.js";
import { useSettings } from "../settings/useSettings.js";
import { formatNumber, splitStoreName, toTelHref } from "../utils.js";

function StoreLayout() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const { settings, images } = useSettings();

  const telHref = toTelHref(settings.phone);
  const brand = splitStoreName(settings.storeName);

  return (
    <div className="store">
      <header className="store-header">
        <Link className="logo" to="/">
          {brand.rest ? (
            <>
              {brand.first}
              <span>{brand.rest}</span>
            </>
          ) : (
            brand.first
          )}
        </Link>

        <nav aria-label="منوی اصلی">
          <Link to={{ pathname: "/", hash: "#products" }}>محصولات</Link>
          {images.length > 0 && (
            <Link to={{ pathname: "/", hash: "#gallery" }}>فروشگاه ما</Link>
          )}
          <Link to={{ pathname: "/", hash: "#about" }}>تماس و آدرس</Link>
        </nav>

        <div className="header-actions">
          <Link className="cart-link" to="/cart" aria-label="سبد خرید">
            سبد خرید
            {count > 0 && <span className="cart-badge">{formatNumber(count)}</span>}
          </Link>

          {user ? (
            <>
              <Link className="header-link" to={homePathFor(user)}>
                {user.role === "Customer" ? "حساب من" : "پنل مدیریت"}
              </Link>
              <button type="button" className="header-link" onClick={logout}>
                خروج
              </button>
            </>
          ) : (
            <Link className="header-link" to="/login">
              ورود / ثبت‌نام
            </Link>
          )}

          {telHref && (
            <a className="contact-button" href={telHref}>
              تماس با فروشگاه
            </a>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="store-footer">
        <span className="logo">{settings.storeName}</span>

        <p>{settings.about || "انتخابی مطمئن برای ساختن فضاهای ماندگار."}</p>
      </footer>
    </div>
  );
}

export default StoreLayout;
