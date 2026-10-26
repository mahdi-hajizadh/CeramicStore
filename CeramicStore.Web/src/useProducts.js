import { useEffect, useState } from "react";
import { API_URL } from "./config.js";
import { readApiError } from "./utils.js";

// لیست محصولات را با جست‌وجو، مرتب‌سازی و صفحه‌بندی از API می‌گیرد.
// با تغییر reloadToken می‌شود دوباره بارگذاری را اجبار کرد.
export function useProducts({
  search = "",
  sortBy = "",
  descending = false,
  page = 1,
  pageSize = 12,
  reloadToken = 0,
}) {
  const key = [search, sortBy, descending, page, pageSize, reloadToken].join(
    "|"
  );

  const [result, setResult] = useState({
    key: null,
    items: [],
    total: 0,
    error: "",
  });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const params = new URLSearchParams({
          page: String(page),
          pageSize: String(pageSize),
        });

        if (search) params.set("search", search);

        if (sortBy) {
          params.set("sortBy", sortBy);
          params.set("descending", String(descending));
        }

        const response = await fetch(`${API_URL}?${params}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(await readApiError(response));
        }

        const items = await response.json();

        if (!Array.isArray(items)) {
          throw new Error("پاسخ API آرایه محصولات نیست.");
        }

        const total = Number(response.headers.get("X-Total-Count"));

        setResult({
          key,
          items,
          total: Number.isFinite(total) && total >= 0 ? total : items.length,
          error: "",
        });
      } catch (err) {
        if (err.name === "AbortError") return;

        console.error("Products API error:", err);

        setResult({
          key,
          items: [],
          total: 0,
          error:
            "دریافت محصولات ناموفق بود. مطمئن شو بک‌اند در حال اجراست.",
        });
      }
    })();

    return () => controller.abort();
  }, [key, search, sortBy, descending, page, pageSize]);

  return {
    items: result.items,
    total: result.total,
    error: result.error,
    loading: result.key !== key,
  };
}
