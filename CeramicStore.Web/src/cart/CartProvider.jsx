import { useCallback, useEffect, useMemo, useState } from "react";
import { CartContext } from "./CartContext.js";

const STORAGE_KEY = "ceramicstore-cart";

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");

    return Array.isArray(parsed)
      ? parsed.filter(
          (item) =>
            Number.isInteger(item?.productId) &&
            Number.isInteger(item?.quantity) &&
            item.quantity > 0
        )
      : [];
  } catch {
    return [];
  }
}

// هر ردیف سبد: { productId, quantity, name, brand, price, boxCoverage, stock, imageUrl }
// quantity تعداد کارتن است. قیمت‌ها فقط برای نمایش‌اند؛ سرور هنگام ثبت سفارش دوباره محاسبه می‌کند.
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ذخیره‌سازی در دسترس نیست؛ سبد فقط در همین نشست می‌ماند.
    }
  }, [items]);

  const addItem = useCallback((product, quantity = 1) => {
    setItems((current) => {
      const existing = current.find((item) => item.productId === product.id);
      const max = Math.max(product.stock, 0);
      const nextQuantity = Math.min((existing?.quantity ?? 0) + quantity, max);

      if (nextQuantity < 1) return current;

      const snapshot = {
        productId: product.id,
        quantity: nextQuantity,
        name: product.name,
        brand: product.brand,
        price: product.pricePerSquareMeter,
        boxCoverage: product.boxCoverage,
        stock: product.stock,
        imageUrl: product.imageUrl ?? null,
      };

      return existing
        ? current.map((item) =>
            item.productId === product.id ? snapshot : item
          )
        : [...current, snapshot];
    });
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              quantity: Math.max(1, Math.min(quantity, item.stock || 1)),
            }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((productId) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  // اطلاعات تازه محصولات را روی سبد اعمال می‌کند؛ محصولات حذف‌شده یا ناموجود از سبد خارج می‌شوند.
  const syncProducts = useCallback((freshById) => {
    setItems((current) =>
      current.flatMap((item) => {
        if (!(item.productId in freshById)) return [item];

        const product = freshById[item.productId];

        if (!product || product.stock < 1) return [];

        return [
          {
            ...item,
            name: product.name,
            brand: product.brand,
            price: product.pricePerSquareMeter,
            boxCoverage: product.boxCoverage,
            stock: product.stock,
            imageUrl: product.imageUrl ?? null,
            quantity: Math.min(item.quantity, product.stock),
          },
        ];
      })
    );
  }, []);

  const value = useMemo(() => {
    const count = items.reduce((sum, item) => sum + item.quantity, 0);
    const total = items.reduce(
      (sum, item) => sum + item.quantity * item.boxCoverage * item.price,
      0
    );

    return {
      items,
      count,
      total,
      addItem,
      setQuantity,
      removeItem,
      clear,
      syncProducts,
    };
  }, [items, addItem, setQuantity, removeItem, clear, syncProducts]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}
