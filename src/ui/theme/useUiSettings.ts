import { useContext } from "react";
import { UiSettingsContext } from "./UiSettingsProvider";

export function useUiSettings() {
  const context = useContext(UiSettingsContext);
  if (!context) {
    throw new Error("useUiSettings must be used inside UiSettingsProvider");
  }
  return context;
}
