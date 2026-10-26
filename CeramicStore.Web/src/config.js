// آدرس بک‌اند از متغیر VITE_API_URL خوانده می‌شود (فایل .env)
export const API_ORIGIN = (
  import.meta.env.VITE_API_URL ?? "http://localhost:5158"
).replace(/\/+$/, "");

export const API_URL = `${API_ORIGIN}/api/products`;
export const PRODUCT_STATS_URL = `${API_URL}/stats`;

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
