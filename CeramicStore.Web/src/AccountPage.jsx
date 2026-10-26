import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { apiJson } from "./api.js";
import { emptyAddress, toAddressPayload, validateAddress } from "./addressUtils.js";
import AddressForm from "./components/AddressForm.jsx";
import { useAuth } from "./auth/useAuth.js";
import {
  ORDER_STATUS_LABELS,
  formatDateTime,
  formatNumber,
  formatPrice,
} from "./utils.js";

function AccountPage() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const placedOrderId = location.state?.placedOrderId;

  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyAddress);

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [loadedOrders, loadedAddresses] = await Promise.all([
          apiJson("/api/orders/mine"),
          apiJson("/api/addresses"),
        ]);

        if (cancelled) return;

        setOrders(loadedOrders);
        setAddresses(loadedAddresses);
      } catch (err) {
        console.error(err);
        if (!cancelled) setError(err.message || "دریافت اطلاعات ناموفق بود.");
      } finally {
        if (!cancelled) setLoaded(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  async function handleAddAddress(event) {
    event.preventDefault();
    setError("");

    const problem = validateAddress(form);

    if (problem) {
      setError(problem);
      return;
    }

    try {
      await apiJson("/api/addresses", { method: "POST", json: toAddressPayload(form) });
      setShowForm(false);
      setForm(emptyAddress);
      refresh();
    } catch (err) {
      setError(err.message || "ذخیره آدرس ناموفق بود.");
    }
  }

  async function handleDeleteAddress(id) {
    if (!window.confirm("این آدرس حذف شود؟")) return;

    try {
      await apiJson(`/api/addresses/${id}`, { method: "DELETE" });
      refresh();
    } catch (err) {
      setError(err.message || "حذف آدرس ناموفق بود.");
    }
  }

  async function handleCancelOrder(id) {
    if (!window.confirm("این سفارش لغو شود؟")) return;

    try {
      await apiJson(`/api/orders/${id}/cancel`, { method: "POST" });
      refresh();
    } catch (err) {
      setError(err.message || "لغو سفارش ناموفق بود.");
    }
  }

  return (
    <section className="shop-page">
      <div className="account-heading">
        <div>
          <h1>حساب من</h1>
          <p className="muted">
            {user.fullName ? `${user.fullName} · ` : ""}
            <span dir="ltr">{user.username}</span>
          </p>
        </div>

        <button type="button" className="link-button" onClick={logout}>
          خروج از حساب
        </button>
      </div>

      {placedOrderId && (
        <p className="message success" role="status">
          سفارش شماره {formatNumber(placedOrderId)} با موفقیت ثبت شد. فروشگاه برای هماهنگی
          پرداخت و ارسال با شما تماس می‌گیرد.
        </p>
      )}

      {error && (
        <p className="message error" role="alert">
          {error}
        </p>
      )}

      <div className="panel-card">
        <h2>سفارش‌های من</h2>

        {!loaded && <p className="muted">در حال دریافت...</p>}

        {loaded && orders.length === 0 && (
          <p className="muted">هنوز سفارشی ثبت نکرده‌ای.</p>
        )}

        {orders.map((order) => (
          <article className="order-card" key={order.id}>
            <header>
              <strong>سفارش {formatNumber(order.id)}</strong>
              <span className={`status-badge status-${order.status}`}>
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span className="muted">{formatDateTime(order.createdAt)}</span>
            </header>

            <ul className="summary-items">
              {order.items.map((item) => (
                <li key={`${order.id}-${item.productId}`}>
                  <span>
                    {item.productName} × {formatNumber(item.quantity)} کارتن
                  </span>
                  <strong>{formatPrice(item.lineTotal)}</strong>
                </li>
              ))}
            </ul>

            <div className="summary-row">
              <span>جمع کل</span>
              <strong>{formatPrice(order.totalPrice)}</strong>
            </div>

            <p className="muted">
              ارسال به: {order.recipientName}، {order.province}، {order.city}،{" "}
              {order.addressLine}
            </p>

            {order.status === "Pending" && (
              <button
                type="button"
                className="link-button"
                onClick={() => handleCancelOrder(order.id)}
              >
                لغو سفارش
              </button>
            )}
          </article>
        ))}
      </div>

      <div className="panel-card">
        <div className="account-heading">
          <h2>آدرس‌های من</h2>

          {!showForm && (
            <button
              type="button"
              className="link-button"
              onClick={() => setShowForm(true)}
            >
              + آدرس جدید
            </button>
          )}
        </div>

        {loaded && addresses.length === 0 && !showForm && (
          <p className="muted">آدرسی ذخیره نشده است.</p>
        )}

        {addresses.map((address) => (
          <div className="address-option" key={address.id}>
            <span>
              <strong>{address.recipientName}</strong> · {address.phone}
              <br />
              {address.province}، {address.city}، {address.addressLine} (کد پستی{" "}
              {address.postalCode})
            </span>

            <button
              type="button"
              className="link-button"
              onClick={() => handleDeleteAddress(address.id)}
            >
              حذف
            </button>
          </div>
        ))}

        {showForm && (
          <form onSubmit={handleAddAddress}>
            <AddressForm value={form} onChange={setForm} />

            <div className="form-actions">
              <button type="submit" className="primary-button">
                ذخیره آدرس
              </button>
              <button
                type="button"
                className="link-button"
                onClick={() => setShowForm(false)}
              >
                انصراف
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default AccountPage;
