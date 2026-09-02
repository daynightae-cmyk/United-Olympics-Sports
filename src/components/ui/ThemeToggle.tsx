import { MonitorSmartphone, MoonStar, SunMedium } from "lucide-react";
import { useUiSettings } from "../../ui/theme/useUiSettings";
import { BilingualText, bi } from "../bilingual/BilingualText";

type ThemeToggleProps = {
  compact?: boolean;
};

const labels = {
  light: bi("Day", "الوضع النهاري"),
  dark: bi("Night", "الوضع الليلي"),
  system: bi("System", "حسب النظام"),
};

export function ThemeToggle({ compact = false }: ThemeToggleProps) {
  const { appearance, setAppearance } = useUiSettings();

  return (
    <div
      className={compact ? "theme-toggle compact" : "theme-toggle"}
      aria-label="Theme settings | إعدادات المظهر"
    >
      {[
        { value: "light", icon: SunMedium, label: labels.light },
        { value: "dark", icon: MoonStar, label: labels.dark },
        { value: "system", icon: MonitorSmartphone, label: labels.system },
      ].map(({ value, icon: Icon, label }) => {
        const active = appearance === value;
        return (
          <button
            key={value}
            type="button"
            className={active ? "theme-toggle-button active" : "theme-toggle-button"}
            aria-pressed={active}
            aria-label={`${label.en} | ${label.ar}`}
            title={`${label.en} | ${label.ar}`}
            onClick={() => setAppearance(value as "light" | "dark" | "system")}
          >
            <Icon size={compact ? 14 : 16} />
            {!compact && <BilingualText value={label} />}
          </button>
        );
      })}
    </div>
  );
}
