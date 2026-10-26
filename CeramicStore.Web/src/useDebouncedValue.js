import { useEffect, useState } from "react";

// مقدار را با تأخیر برمی‌گرداند تا با هر کلید یک درخواست به سرور نرود.
export function useDebouncedValue(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
