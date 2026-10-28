import { useCallback, useEffect, useMemo, useState } from "react";
import { apiJson } from "../api.js";
import { SettingsContext } from "./SettingsContext.js";
import { defaultSiteContent, mergeSiteContent } from "./siteContent.js";

const DEFAULT_SETTINGS = {
  storeName: "CeramicStore",
  phone: "",
  address: "",
  email: null,
  workingHours: null,
  about: null,
  instagram: null,
  content: defaultSiteContent(),
};

function normalizeSettings(loaded) {
  const { content, contentJson, ...rest } = loaded ?? {};
  return {
    ...DEFAULT_SETTINGS,
    ...rest,
    content: mergeSiteContent(content ?? contentJson ?? DEFAULT_SETTINGS.content),
  };
}

// تنظیمات عمومی سایت (شماره تماس، آدرس، متون ویترین) و گالری تصاویر فروشگاه
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

        setSettings(normalizeSettings(loadedSettings));
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
