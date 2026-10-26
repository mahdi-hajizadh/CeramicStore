import { useEffect, useState } from "react";
import { apiJson } from "../api.js";
import { ORDER_STATUS_LABELS, formatNumber, formatPrice } from "../utils.js";

// گزارش فروش؛ سفارش‌های لغوشده در درآمد حساب نمی‌شوند.
function ReportsTab() {
  const [state, setState] = useState({ report: null, error: "" });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const report = await apiJson("/api/manage/reports/sales");
        if (!cancelled) setState({ report, error: "" });
      } catch (err) {
        if (!cancelled) setState({ report: null, error: err.message || "دریافت گزارش ناموفق بود." });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const { report, error } = state;

  if (error) {
    return (
      <section className="admin-panel">
        <div className="admin-alert admin-alert-error" role="alert">
          {error}
        </div>
      </section>
    );
  }

  if (!report) {
    return <p className="admin-empty">در حال دریافت گزارش...</p>;
  }

  const maxDaily = Math.max(1, ...report.last30Days.map((day) => day.revenue));

  return (
    <>
      <section className="admin-stats">
        <article className="admin-stat-card">
          <span>درآمد کل (بدون سفارش‌های لغوشده)</span>
          <strong>{formatPrice(report.revenue)}</strong>
        </article>

        <article className="admin-stat-card">
          <span>سفارش‌های فعال</span>
          <strong>{formatNumber(report.activeOrders)}</strong>
        </article>

        <article className="admin-stat-card">
          <span>مشتریان ثبت‌نام‌شده</span>
          <strong>{formatNumber(report.customerCount)}</strong>
        </article>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="admin-eyebrow">LAST 30 DAYS</span>
            <h3>فروش ۳۰ روز اخیر</h3>
          </div>
        </div>

        <div className="admin-bars" role="img" aria-label="نمودار فروش روزانه">
          {report.last30Days.map((day) => (
            <div
              key={day.date}
              className="admin-bar"
              title={`${new Date(day.date).toLocaleDateString("fa-IR")} — ${formatNumber(day.orders)} سفارش · ${formatPrice(day.revenue)}`}
            >
              <span style={{ height: `${Math.max(2, (day.revenue / maxDaily) * 100)}%` }} />
            </div>
          ))}
        </div>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="admin-eyebrow">STATUS</span>
            <h3>سفارش‌ها بر اساس وضعیت</h3>
          </div>
        </div>

        <ul className="admin-status-list">
          {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => (
            <li key={status}>
              <span className={`status-badge status-${status}`}>{label}</span>
              <strong>{formatNumber(report.ordersByStatus[status] ?? 0)}</strong>
            </li>
          ))}
        </ul>
      </section>

      <section className="admin-panel">
        <div className="admin-panel-heading">
          <div>
            <span className="admin-eyebrow">TOP PRODUCTS</span>
            <h3>پرفروش‌ترین محصولات</h3>
          </div>
        </div>

        {report.topProducts.length === 0 ? (
          <p className="admin-empty">هنوز فروشی ثبت نشده است.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>محصول</th>
                  <th>تعداد کارتن فروخته‌شده</th>
                  <th>درآمد</th>
                </tr>
              </thead>

              <tbody>
                {report.topProducts.map((product) => (
                  <tr key={product.productId}>
                    <td>{product.productName}</td>
                    <td>{formatNumber(product.boxes)}</td>
                    <td>{formatPrice(product.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

export default ReportsTab;
