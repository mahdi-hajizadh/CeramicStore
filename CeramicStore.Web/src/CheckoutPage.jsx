import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiJson } from "./api.js";
import { emptyAddress, toAddressPayload, validateAddress } from "./addressUtils.js";
import AddressForm from "./components/AddressForm.jsx";
import { useAuth } from "./auth/useAuth.js";
import { useCart } from "./cart/useCart.js";
import { formatNumber, formatPrice } from "./utils.js";

const NEW_ADDRESS = "new";

function CheckoutPage() {
  const { user } = useAuth();
  const { items, total, clear } = useCart();
  const navigate = useNavigate();

  const [saved, setSaved] = useState({ loaded: false, items: [] });
  const [selected, setSelected] = useState(NEW_ADDRESS);
  const [newAddress, setNewAddress] = useState({
    ...emptyAddress,
    recipientName: user?.fullName ?? "",
    phone: user?.phone ?? "",
  });
  const [saveForLater, setSaveForLater] = useState(true);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await apiJson("/api/addresses");

        if (cancelled) return;

        setSaved({ loaded: true, items: list });
        if (list.length > 0) setSelected(String(list[0].id));
      } catch (err) {
        console.error(err);
        if (!cancelled) setSaved({ loaded: true, items: [] });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (items.length === 0) {
    return (
      <section className="shop-page">
        <h1>تکمیل خرید</h1>
        <p className="message">سبد خرید شما خالی است.</p>
        <Link className="primary-button" to="/#products">
          مشاهده محصولات
        </Link>
      </section>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const payload = {
      items: items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      note: note.trim() || null,
    };

    if (selected === NEW_ADDRESS) {
      const problem = validateAddress(newAddress);

      if (problem) {
        setError(problem);
        return;
      }

      payload.address = toAddressPayload(newAddress);
    } else {
      payload.addressId = Number(selected);
    }

    setBusy(true);

    try {
      const order = await apiJson("/api/orders", { method: "POST", json: payload });

      // آدرس فقط بعد از ثبت موفق سفارش ذخیره می‌شود؛ قبلاً با هر تلاش ناموفق یک آدرس تکراری ساخته می‌شد.
      if (selected === NEW_ADDRESS && saveForLater) {
        try {
          await apiJson("/api/addresses", {
            method: "POST",
            json: toAddressPayload(newAddress),
          });
        } catch (err) {
          // ذخیره آدرس اختیاری است (مثلاً سقف تعداد پر شده)؛ سفارش ثبت شده است.
          console.error(err);
        }
      }

      clear();
      navigate("/account", { replace: true, state: { placedOrderId: order.id } });
    } catch (err) {
      setError(err.message || "ثبت سفارش ناموفق بود.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="shop-page">
      <h1>تکمیل خرید</h1>

      <form className="cart-layout" onSubmit={handleSubmit}>
        <div className="checkout-main">
          <div className="panel-card">
            <h2>آدرس تحویل</h2>

            {!saved.loaded && <p className="muted">در حال دریافت آدرس‌ها...</p>}

            {saved.items.map((address) => (
              <label className="address-option" key={address.id}>
                <input
                  type="radio"
                  name="address"
                  value={address.id}
                  checked={selected === String(address.id)}
                  onChange={(event) => setSelected(event.target.value)}
                />
                <span>
                  <strong>{address.recipientName}</strong> · {address.phone}
                  <br />
                  {address.province}، {address.city}، {address.addressLine} (کد پستی{" "}
                  {address.postalCode})
                </span>
              </label>
            ))}

            {saved.items.length > 0 && (
              <label className="address-option">
                <input
                  type="radio"
                  name="address"
                  value={NEW_ADDRESS}
                  checked={selected === NEW_ADDRESS}
                  onChange={(event) => setSelected(event.target.value)}
                />
                <span>آدرس جدید</span>
              </label>
            )}

            {selected === NEW_ADDRESS && (
              <>
                <AddressForm value={newAddress} onChange={setNewAddress} />

                <label className="check-field">
                  <input
                    type="checkbox"
                    checked={saveForLater}
                    onChange={(event) => setSaveForLater(event.target.checked)}
                  />
                  <span>ذخیره این آدرس برای خریدهای بعدی</span>
                </label>
              </>
            )}
          </div>

          <div className="panel-card">
            <h2>توضیحات سفارش (اختیاری)</h2>
            <textarea
              className="note-input"
              rows={3}
              maxLength={500}
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="مثلاً ساعت مناسب تحویل یا توضیح درباره آدرس"
            />
          </div>
        </div>

        <aside className="cart-summary">
          <h2>خلاصه سفارش</h2>

          <ul className="summary-items">
            {items.map((item) => (
              <li key={item.productId}>
                <span>
                  {item.name} × {formatNumber(item.quantity)} کارتن
                </span>
                <strong>
                  {formatPrice(item.quantity * item.boxCoverage * item.price)}
                </strong>
              </li>
            ))}
          </ul>

          <div className="summary-row">
            <span>جمع کل</span>
            <strong>{formatPrice(total)}</strong>
          </div>

          <p className="muted">
            پرداخت آنلاین فعلاً فعال نیست؛ پس از ثبت سفارش، فروشگاه برای هماهنگی پرداخت و
            ارسال با شما تماس می‌گیرد.
          </p>

          {error && (
            <p className="message error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="primary-button" disabled={busy}>
            {busy ? "در حال ثبت سفارش..." : "ثبت نهایی سفارش"}
          </button>

          <Link className="link-button" to="/cart">
            بازگشت به سبد خرید
          </Link>
        </aside>
      </form>
    </section>
  );
}

export default CheckoutPage;
