import { formatNumber } from "../utils.js";

function Pagination({ page, totalPages, onChange, className = "pagination" }) {
  if (totalPages <= 1) return null;

  return (
    <nav className={className} aria-label="صفحه‌بندی">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
      >
        ← قبلی
      </button>

      <span aria-live="polite">
        صفحه {formatNumber(page)} از {formatNumber(totalPages)}
      </span>

      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
      >
        بعدی →
      </button>
    </nav>
  );
}

export default Pagination;
