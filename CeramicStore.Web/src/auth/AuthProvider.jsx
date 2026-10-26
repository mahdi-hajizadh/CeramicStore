import { useCallback, useEffect, useMemo, useState } from "react";
import { apiJson, getToken, setToken } from "../api.js";
import { AuthContext } from "./AuthContext.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // اگر توکنی ذخیره شده باشد، باید اول اعتبارش از سرور بررسی شود.
  const [status, setStatus] = useState(() => (getToken() ? "loading" : "ready"));

  useEffect(() => {
    if (!getToken()) return undefined;

    let cancelled = false;

    (async () => {
      try {
        const me = await apiJson("/api/auth/me");
        if (!cancelled) setUser(me);
      } catch {
        setToken("");
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setStatus("ready");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(() => {
    setToken("");
    setUser(null);
  }, []);

  useEffect(() => {
    window.addEventListener("auth:expired", logout);
    return () => window.removeEventListener("auth:expired", logout);
  }, [logout]);

  const authenticate = useCallback(async (path, payload) => {
    const result = await apiJson(path, { method: "POST", json: payload });
    setToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const login = useCallback(
    (username, password) =>
      authenticate("/api/auth/login", { username, password }),
    [authenticate]
  );

  const register = useCallback(
    (payload) => authenticate("/api/auth/register", payload),
    [authenticate]
  );

  const value = useMemo(
    () => ({ user, status, login, register, logout }),
    [user, status, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
