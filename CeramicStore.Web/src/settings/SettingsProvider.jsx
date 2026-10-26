import { useCallback, useEffect, useMemo, useState } from "react";
import { apiJson } from "../api.js";
import { SettingsContext } from "./SettingsContext.js";

const DEFAULT_SETTINGS = {
  storeName: "CeramicStore",
  phone: "",
  address: "",
  email: null,
  workingHours: null,
  about: null,
  instagram: null,
};

// تنظیمات عمومی سایت (شماره تماس، آدرس، ...) و گالری تصاویر فروشگاه
export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [images, setImages] = useState([]);
  const [reloadToken, setReloadToken] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [loadedSettings, loadedImages] = await Promise.all([
          apiJson("/api/settings"),
          apiJson("/api/store-images"),
        ]);

        if (cancelled) return;

        setSettings({ ...DEFAULT_SETTINGS, ...loadedSettings });
        setImages(Array.isArray(loadedImages) ? loadedImages : []);
        setReady(true);
      } catch (err) {
        console.error("Settings load error:", err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const reload = useCallback(() => setReloadToken((token) => token + 1), []);

  const value = useMemo(
    () => ({ settings, images, ready, reload }),
    [settings, images, ready, reload]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
