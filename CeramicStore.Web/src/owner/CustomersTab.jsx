import { useEffect, useState } from "react";
import { apiFetch } from "../api.js";
import Pagination from "../components/Pagination.jsx";
import { useDebouncedValue } from "../useDebouncedValue.js";
import {
  formatDateTime,
  formatNumber,
  formatPrice,
  readApiError,
} from "../utils.js";

const PAGE_SIZE = 10;

// فهرست مشتریان ثبت‌نام‌شده (فقط مشاهده)
function CustomersTab() {
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState({ key: null, customers: [], total: 0, error: "" });

  const search = useDebouncedValue(searchInput.trim());
  const key = `${search}|${page}`;

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(PAGE_SIZE),
        });

        if (search) params.set("search", search);

        const response = await apiFetch(`/api/manage/customers?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) throw new Error(await readApiError(response));

        const customers = await response.json();
        const total = Number(response.headers.get("X-Total-Count")) || customers.length;

        setResult({ key, customers, total, error: "" });
      } catch (err) {
        if (err.name === "AbortError") return;

        setResult({ key, customers: [], total: 0, error: err.message });
      }
    })();

    return () => controller.abort();
  }, [key, search, page]);

  const loading = result.key !== key;
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  return (
    <section className="admin-panel">
      <div className="admin-panel-heading">
        <div>
          <span className="admin-eyebrow">CUSTOMERS</span>
          <h3>مشتریان</h3>
        </div>

        <span className="admin-total-count">{formatNumber(result.total)} مشتری</span>
      </div>

      <div className="admin-search">
        <input
          type="search"
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setPage(1);
          }}
          placeholder="جست‌وجو بر اساس نام کاربری، نام یا شماره..."
          aria-label="جست‌وجوی مشتریان"
        />
      </div>

      {result.error && (
        <div className="admin-alert admin-alert-error" role="alert">
          {result.error}
        </div>
      )}

      {!loading && !result.error && result.customers.length === 0 && (
        <p className="admin-empty">مشتری‌ای پیدا نشد.</p>
      )}

      {result.customers.length > 0 && (
        <div className={`admin-table-wrapper${loading ? " is-loading" : ""}`}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>نام کاربری</th>
                <th>نام</th>
                <th>شماره تماس</th>
                <th>تاریخ ثبت‌نام</th>
                <th>تعداد سفارش</th>
                <th>مجموع خرید</th>
              </tr>
            </thead>

            <tbody>
              {result.customers.map((customer) => (
                <tr key={customer.id}>
                  <td dir="ltr">{customer.username}</td>
                  <td>{customer.fullName ?? "—"}</td>
                  <td dir="ltr">{customer.phone ?? "—"}</td>
                  <td>{formatDateTime(customer.createdAt)}</td>
                  <td>{formatNumber(customer.orderCount)}</td>
                  <td>{formatPrice(customer.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Pagination
        page={page}
        totalPages={totalPages}
        onChange={setPage}
        className="admin-pagination"
      />
    </section>
  );
}

export default CustomersTab;
