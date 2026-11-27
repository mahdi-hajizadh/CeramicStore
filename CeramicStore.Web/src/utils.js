import { API_ORIGIN } from "./config.js";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function formatNumber(value) {
  return Number(value).toLocaleString("fa-IR");
}

// Round prices to whole tomans because area-based totals can be fractional.
export function formatPrice(price) {
  return `${formatNumber(Math.round(Number(price)))} تومان`;
}

// Use a small epsilon when rounding up the number of boxes needed for an area.
// For example, JavaScript gives 9.000000000000002 for 4.32 / 0.48, so rounding up directly would yield 10 boxes.
export function boxesNeeded(area, coverage) {
  const ratio = Number(area) / Number(coverage);

  if (!Number.isFinite(ratio) || ratio <= 0) return 0;

  return Math.max(1, Math.ceil(ratio - 1e-9));
}

export function imageSrc(imageUrl) {
  if (!imageUrl) return "";
  if (/^https?:\/\//i.test(imageUrl)) return imageUrl;
  return `${API_ORIGIN}${imageUrl}`;
}

// Convert Persian and Arabic numerals to ASCII for numeric input.
export function normalizeDigits(value) {
  return String(value ?? "")
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/[٫]/g, ".")
    .replace(/[,٬،\s]/g, "");
}

// Parse a number from the input text and return NaN on failure.
export function parseNumber(value) {
  const normalized = normalizeDigits(value);
  return normalized === "" ? Number.NaN : Number(normalized);
}

// Extract a readable error from the API response.
// Handle plain text, ProblemDetails, and ASP.NET validation errors.
export async function readApiError(response) {
  const fallback = `خطای سرور (${response.status})`;

  try {
    const text = await response.text();
    if (!text) return fallback;

    try {
      const data = JSON.parse(text);

      if (typeof data === "string") return data;

      if (data?.errors && typeof data.errors === "object") {
        const messages = Object.values(data.errors).flat();
        if (messages.length > 0) return messages.join(" ");
      }

      return data?.title || data?.detail || fallback;
    } catch {
      return text;
    }
  } catch {
    return fallback;
  }
}

// Normalize a phone number for a tel: link, such as 09123456789 to +989123456789.
export function toTelHref(phone) {
  const digits = normalizeDigits(phone).replace(/[^\d+]/g, "");

  if (!digits) return "";
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.startsWith("00")) return `tel:+${digits.slice(2)}`;
  if (digits.startsWith("0")) return `tel:+98${digits.slice(1)}`;

  return `tel:+98${digits}`;
}

// Convert an Instagram handle, username, or full URL to a profile link.
export function instagramUrl(value) {
  const handle = String(value ?? "")
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, "")
    .replace(/^@/, "")
    .replace(/[/?#].*$/, "");

  return handle ? `https://instagram.com/${encodeURIComponent(handle)}` : "";
}

export const ORDER_STATUS_LABELS = {
  Pending: "در انتظار بررسی",
  Processing: "در حال آماده‌سازی",
  Shipped: "ارسال شده",
  Delivered: "تحویل داده شده",
  Cancelled: "لغو شده",
};

export function formatDateTime(value) {
  return new Date(value).toLocaleString("fa-IR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

// Split a CamelCase name such as CeramicStore for two-tone logo styling.
export function splitStoreName(storeName) {
  const name = String(storeName ?? "").trim() || "CeramicStore";

  if (/^[A-Z][a-z]+[A-Z][A-Za-z]*$/.test(name)) {
    const parts = name.split(/(?=[A-Z])/);
    return { first: parts[0], rest: parts.slice(1).join("") };
  }

  return { first: name, rest: "" };
}
