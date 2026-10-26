import { useEffect, useState } from "react";
import { API_URL } from "./config.js";

// یک محصول را با شناسه از API می‌گیرد.
// status: loading | ready | notfound | error
export function useProduct(id) {
  const [result, setResult] = useState({ id: null, status: "loading", product: null });

  useEffect(() => {
    const controller = new AbortController();

    (async () => {
      try {
        const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          setResult({ id, status: "notfound", product: null });
          return;
        }

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        setResult({ id, status: "ready", product: await response.json() });
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setResult({ id, status: "error", product: null });
      }
    })();

    return () => controller.abort();
  }, [id]);

  return result.id === id
    ? result
    : { id, status: "loading", product: null };
}
