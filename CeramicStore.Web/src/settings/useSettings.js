import { useContext } from "react";
import { SettingsContext } from "./SettingsContext.js";

export function useSettings() {
  const value = useContext(SettingsContext);

  if (!value) {
    throw new Error("useSettings باید داخل SettingsProvider استفاده شود.");
  }

  return value;
}
