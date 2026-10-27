import { normalizeDigits } from "../utils.js";

// موبایل ایران را به 09xxxxxxxxx تبدیل می‌کند؛ در غیر این صورت "".
export function normalizeMobile(value) {
  let digits = normalizeDigits(value).replace(/[^\d]/g, "");

  if (digits.startsWith("0098")) digits = `0${digits.slice(4)}`;
  else if (digits.startsWith("98") && digits.length === 12) digits = `0${digits.slice(2)}`;
  else if (digits.length === 10 && digits.startsWith("9")) digits = `0${digits}`;

  return /^09\d{9}$/.test(digits) ? digits : "";
}

export function isValidMobile(value) {
  return Boolean(normalizeMobile(value));
}

export function normalizeOtpCode(value) {
  return normalizeDigits(value).replace(/\D/g, "").slice(0, 6);
}
