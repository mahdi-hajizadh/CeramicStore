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
    // If the browser blocks storage, the session lasts until the tab closes.
  }
}

// Send an API request with the Authorization header when a token is available.
// Use the json option to send a JSON body.
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

  // AuthProvider signs the user out when the token is invalid or expired.
  if (response.status === 401 && token) {
    window.dispatchEvent(new Event("auth:expired"));
  }

  return response;
}

// Parse the API response as JSON and throw an error with a Persian message on failure.
export async function apiJson(path, options) {
  const response = await apiFetch(path, options);

  if (!response.ok) {
    throw new Error(await readApiError(response));
  }

  return response.status === 204 ? null : response.json();
}
