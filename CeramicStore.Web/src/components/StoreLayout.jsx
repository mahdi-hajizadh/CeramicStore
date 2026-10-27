import { Link, Outlet } from "react-router-dom";
import "../App.css";
import "../Shop.css";
import { homePathFor } from "../auth/paths.js";
import { useAuth } from "../auth/useAuth.js";
import { useCart } from "../cart/useCart.js";
import { formatNumber } from "../utils.js";
import Footer from "./Footer.jsx";

function StoreLayout() {
  const { user } = useAuth();
  const { count } = useCart();

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
          </nav>
        </div>

        <div className="header-actions">
          {user ? (
            <Link className="header-link" to={homePathFor(user)}>
              {user.role === "Customer" ? "حساب من" : "پنل مدیریت"}
            </Link>
          ) : (
            <Link className="header-link" to="/login">
              ورود / ثبت‌نام
            </Link>
          )}

          <Link className="cart-link" to="/cart" aria-label="سبد خرید">
            سبد خرید
            {count > 0 && <span className="cart-badge">{formatNumber(count)}</span>}
          </Link>

          <Link className="contact-button" to={{ pathname: "/", hash: "#about" }}>
            تماس با فروشگاه
          </Link>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default StoreLayout;
