import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_URL } from "./config.js";
import { useCart } from "./cart/useCart.js";
import { formatNumber, formatPrice, imageSrc } from "./utils.js";

function CartPage() {
  const { items, total, setQuantity, removeItem, clear, syncProducts } = useCart();
  const navigate = useNavigate();

  // قیمت و موجودی تازه را از سرور می‌گیریم تا سبد قدیمی نماند.
  const idsKey = items.map((item) => item.productId).join(",");

  useEffect(() => {
    if (!idsKey) return undefined;

    const controller = new AbortController();

    (async () => {
      const fresh = {};

      await Promise.all(
        idsKey.split(",").map(async (id) => {
          try {
            const response = await fetch(`${API_URL}/${id}`, {
              signal: controller.signal,
            });

            if (response.status === 404) fresh[id] = null;
            else if (response.ok) fresh[id] = await response.json();
          } catch (err) {
            if (err.name !== "AbortError") console.error(err);
          }
        })
      );

      if (!controller.signal.aborted && Object.keys(fresh).length > 0) {
        syncProducts(fresh);
      }
    })();

    return () => controller.abort();
  }, [idsKey, syncProducts]);

  if (items.length === 0) {
    return (
      <section className="shop-page">
        <h1>سبد خرید</h1>
        <p className="message">سبد خرید شما خالی است.</p>
        <Link className="primary-button" to="/#products">
          مشاهده محصولات
        </Link>
      </section>
    );
  }

  return (
    <section className="shop-page">
      <h1>سبد خرید</h1>

      <div className="cart-layout">
        <ul className="cart-list">
          {items.map((item) => {
            const area = item.quantity * item.boxCoverage;

            return (
              <li className="cart-item" key={item.productId}>
                <div className="cart-item-image">
                  {item.imageUrl ? (
                    <img src={imageSrc(item.imageUrl)} alt={item.name} />
                  ) : (
                    <div className="product-tile-pattern" />
                  )}
                </div>

                <div className="cart-item-info">
                  <span className="product-brand">{item.brand}</span>
                  <Link to={`/products/${item.productId}`}>
                    <h3>{item.name}</h3>
                  </Link>
                  <span className="muted">
                    {formatPrice(item.price)} برای هر متر مربع ·{" "}
                    {formatNumber(item.boxCoverage)} متر مربع در هر کارتن
                  </span>
                </div>

                <div className="cart-item-qty">
                  <label>
                    <span>تعداد کارتن</span>
                    <input
                      type="number"
                      min="1"
                      max={item.stock}
                      value={item.quantity}
                      onChange={(event) => {
                        const value = Number.parseInt(event.target.value, 10);
                        if (Number.isFinite(value)) setQuantity(item.productId, value);
                      }}
                    />
                  </label>
                  <span className="muted">
                    موجودی: {formatNumber(item.stock)} · {formatNumber(area)} متر مربع
                  </span>
                </div>

                <div className="cart-item-total">
                  <strong>{formatPrice(area * item.price)}</strong>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => removeItem(item.productId)}
                  >
                    حذف
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="cart-summary">
          <h2>خلاصه سفارش</h2>

          <div className="summary-row">
            <span>جمع کل</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <p className="muted">هزینه ارسال پس از ثبت سفارش و هماهنگی با فروشگاه مشخص می‌شود.</p>

          <button
            type="button"
            className="primary-button"
            onClick={() => navigate("/checkout")}
          >
            ادامه فرایند خرید
          </button>

          <button type="button" className="link-button" onClick={clear}>
            خالی کردن سبد
          </button>
        </aside>
      </div>
    </section>
  );
}

export default CartPage;
