import { API_ORIGIN } from "./config.js";
import { readApiError } from "./utils.js";

const TOKEN_KEY = "ceramicstore-token";

export function getToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? "";
  } catch {
    return "";
  }
}

export function setToken(token) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    // اگر مرورگر ذخیره‌سازی را مسدود کرده باشد، ورود فقط تا بستن تب می‌ماند.
  }
}

// درخواست به API؛ در صورت وجود توکن، هدر Authorization اضافه می‌شود.
// با گزینه json بدنه JSON ارسال می‌شود.
export async function apiFetch(path, { json, headers, ...options } = {}) {
  const finalHeaders = { ...(headers ?? {}) };
  const token = getToken();

  if (token) finalHeaders.Authorization = `Bearer ${token}`;

  let body = options.body;

  if (json !== undefined) {
    finalHeaders["Content-Type"] = "application/json";
    body = JSON.stringify(json);
  }

  const url = path.startsWith("http") ? path : `${API_ORIGIN}${path}`;
  const response = await fetch(url, { ...options, headers: finalHeaders, body });

  // توکن منقضی یا نامعتبر: AuthProvider کاربر را از سیستم خارج می‌کند.
  if (response.status === 401 && token) {
    window.dispatchEvent(new Event("auth:expired"));
  }

  return response;
}

// درخواست و تبدیل پاسخ به JSON؛ در خطا Error با پیام فارسی پرتاب می‌شود.
export async function apiJson(path, options) {
  const response = await apiFetch(path, options);

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.status === 204 ? null : response.json();
}
