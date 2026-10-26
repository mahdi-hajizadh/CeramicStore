import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "../api.js";
import Pagination from "../components/Pagination.jsx";
import {
  ORDER_STATUS_LABELS,
  formatDateTime,
  formatNumber,
  formatPrice,
  readApiError,
} from "../utils.js";

const PAGE_SIZE = 10;

function OrdersTab() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [reloadToken, setReloadToken] = useState(0);
  const [result, setResult] = useState({ key: null, orders: [], total: 0, error: "" });
  const [actionError, setActionError] = useState("");

  const key = `${status}|${page}|${reloadToken}`;

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
        });

        if (status) params.set("status", status);

        const response = await apiFetch(`/api/manage/orders?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(await readApiError(response));

        const orders = await response.json();
        const total = Number(response.headers.get("X-Total-Count")) || orders.length;

        setResult({ key, orders, total, error: "" });
      } catch (err) {
        if (err.name === "AbortError") return;

        setResult({ key, orders: [], total: 0, error: err.message });
      }
    })();

    return () => controller.abort();
  }, [key, status, page]);

  const loading = result.key !== key;
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  const refresh = useCallback(() => setReloadToken((token) => token + 1), []);

  async function changeStatus(orderId, nextStatus) {
    setActionError("");

    if (
      nextStatus === "Cancelled" &&
      !window.confirm("با لغو سفارش، موجودی کارتن‌ها به انبار برمی‌گردد. ادامه می‌دهی؟")
    ) {
      return;
    }

    try {
      const response = await apiFetch(`/api/manage/orders/${orderId}/status`, {
        method: "PUT",
        json: { status: nextStatus },
      });

      if (!response.ok) throw new Error(await readApiError(response));

      refresh();
    } catch (err) {
      setActionError(err.message || "تغییر وضعیت ناموفق بود.");
    }
  }

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <span className="admin-eyebrow">ORDERS</span>
          <h3>سفارش‌های مشتریان</h3>
        </div>

        <select
          className="admin-select"
          value={status}
          onChange={(event) => {
            setStatus(event.target.value);
            setPage(1);
          }}
          aria-label="فیلتر وضعیت"
        >
          <option value="">همه وضعیت‌ها</option>
          {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {actionError && (
        <div className="admin-alert admin-alert-error" role="alert">
          {actionError}
        </div>
      )}

      {result.error && (
        <div className="admin-alert admin-alert-error" role="alert">
          {result.error}
        </div>
      )}

      {!loading && !result.error && result.orders.length === 0 && (
        <p className="admin-empty">سفارشی پیدا نشد.</p>
      )}

      <div className={loading ? "admin-table-wrapper is-loading" : ""}>
        {result.orders.map((order) => (
          <article className="admin-order" key={order.id}>
            <header>
              <strong>سفارش {formatNumber(order.id)}</strong>
              <span className={`status-badge status-${order.status}`}>
                {ORDER_STATUS_LABELS[order.status] ?? order.status}
              </span>
              <span className="admin-muted">{formatDateTime(order.createdAt)}</span>
              <span className="admin-muted" dir="ltr">
                @{order.username}
              </span>
            </header>

            <p className="admin-muted">
              گیرنده: {order.recipientName} · {order.phone}
              <br />
              {order.province}، {order.city}، {order.addressLine} · کد پستی {order.postalCode}
              {order.note && (
                <>
                  <br />
                  توضیحات: {order.note}
                </>
              )}
            </p>

            <ul className="admin-order-items">
              {order.items.map((item) => (
                <li key={`${order.id}-${item.productId}`}>
                  <span>
                    {item.productName} ({item.brand}) × {formatNumber(item.quantity)} کارتن
                  </span>
                  <strong>{formatPrice(item.lineTotal)}</strong>
                </li>
              ))}
            </ul>

            <footer>
              <strong>جمع کل: {formatPrice(order.totalPrice)}</strong>

              {order.status !== "Cancelled" && (
                <select
                  className="admin-select"
                  value={order.status}
                  onChange={(event) => changeStatus(order.id, event.target.value)}
                  aria-label={`وضعیت سفارش ${order.id}`}
                >
                  {Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            </footer>
          </article>
        ))}
      </div>

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        className="admin-pagination"
      />
    </section>
  );
}

export default OrdersTab;
