import { API_ORIGIN } from "./config.js";

const PERSIAN_DIGITS = "۰۱۲۳۴۵۶۷۸۹";
const ARABIC_DIGITS = "٠١٢٣٤٥٦٧٨٩";

export function formatNumber(value) {
  return Number(value).toLocaleString("fa-IR");
}

// قیمت‌ها به تومان صحیح گرد می‌شوند (حاصل‌ضرب متراژ در قیمت می‌تواند اعشاری شود).
export function formatPrice(price) {
  return `${formatNumber(Math.round(Number(price)))} تومان`;
}

// تعداد کارتن لازم برای پوشش یک متراژ. اپسیلون جلوی خطای اعشاری را می‌گیرد:
// مثلاً 4.32 / 0.48 در جاوااسکریپت 9.000000000000002 است و بدون آن ۱۰ کارتن (به‌جای ۹) حساب می‌شد.
export function boxesNeeded(area, coverage) {
  const ratio = Number(area) / Number(coverage);

  if (!Number.isFinite(ratio) || ratio <= 0) return 0;

  return Math.max(1, Math.ceil(ratio - 1e-9));
}

export function imageSrc(imageUrl) {
  return imageUrl ? `${API_ORIGIN}${imageUrl}` : "";
}

// ارقام فارسی و عربی را به انگلیسی تبدیل می‌کند تا ورودی عددی درست خوانده شود.
export function normalizeDigits(value) {
  return String(value ?? "")
    .replace(/[۰-۹]/g, (digit) => String(PERSIAN_DIGITS.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String(ARABIC_DIGITS.indexOf(digit)))
    .replace(/[٫]/g, ".")
    .replace(/[,٬،\s]/g, "");
}

// متن ورودی را به عدد تبدیل می‌کند؛ اگر نامعتبر بود NaN برمی‌گرداند.
export function parseNumber(value) {
  const normalized = normalizeDigits(value);
  return normalized === "" ? Number.NaN : Number(normalized);
}

// پیام خطای قابل‌فهم را از پاسخ API بیرون می‌کشد
// (متن ساده، ProblemDetails یا خطاهای اعتبارسنجی ASP.NET).
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

// شماره تماس را برای لینک tel: آماده می‌کند (09123456789 → +989123456789).
export function toTelHref(phone) {
  const digits = normalizeDigits(phone).replace(/[^\d+]/g, "");

  if (!digits) return "";
  if (digits.startsWith("+")) return `tel:${digits}`;
  if (digits.startsWith("00")) return `tel:+${digits.slice(2)}`;
  if (digits.startsWith("0")) return `tel:+98${digits.slice(1)}`;

  return `tel:+98${digits}`;
}

// آیدی (@shop)، نام ساده یا آدرس کامل اینستاگرام را به لینک پروفایل تبدیل می‌کند.
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
