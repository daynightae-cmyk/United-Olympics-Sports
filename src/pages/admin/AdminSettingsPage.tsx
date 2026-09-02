import {
  RotateCcw,
  ShieldCheck,
  SunMedium,
  MoonStar,
  MonitorSmartphone,
  Languages,
  Rows3,
  Type,
  Gauge,
  PanelLeftClose,
  Sparkles,
} from "lucide-react";
import { BilingualText, bi } from "../../components/bilingual/BilingualText";
import { ThemeToggle } from "../../components/ui/ThemeToggle";
import { useUiSettings } from "../../ui/theme/useUiSettings";

const appearanceMeta = {
  light: {
    title: bi("Day", "الوضع النهاري"),
    description: bi(
      "Warm ivory workspace for daytime operations.",
      "مساحة عمل دافئة باللون العاجي للعمل النهاري."
    ),
  },
  dark: {
    title: bi("Night", "الوضع الليلي"),
    description: bi(
      "Dark premium canvas tuned for late operations.",
      "لوحة سوداء احترافية مخصصة للعمل الليلي."
    ),
  },
  system: {
    title: bi("System", "حسب النظام"),
    description: bi("Follow the operating system preference.", "اتبع تفضيل نظام التشغيل."),
  },
};

export function AdminSettingsPage() {
  const {
    appearance,
    bilingualOrder,
    density,
    motion,
    fontScale,
    sidebarDefault,
    setSetting,
    resetSettings,
  } = useUiSettings();

  return (
    <div className="admin-page settings-page">
      <div className="admin-page-header">
        <div className="admin-page-header-copy">
          <span className="section-icon admin-page-header-icon" aria-hidden="true">
            <Settings2 />
          </span>
          <div>
            <BilingualText value={bi("Settings", "الإعدادات")} className="admin-eyebrow" />
            <h1>
              <BilingualText value={bi("Interface Settings", "إعدادات الواجهة")} />
            </h1>
            <p>
              <BilingualText
                value={bi(
                  "Applied on this browser. | تم التطبيق على هذا المتصفح.",
                  "تم التطبيق على هذا المتصفح."
                )}
              />
            </p>
          </div>
        </div>
        <div className="page-actions">
          <span className="truth-badge">
            <ShieldCheck size={14} />
            <BilingualText value={bi("Stored on This Browser", "محفوظ على هذا المتصفح")} />
          </span>
        </div>
      </div>

      <section className="settings-grid">
        <article className="setting-card">
          <h3>
            <BilingualText value={bi("Appearance", "المظهر")} />
          </h3>
          <p>
            <BilingualText
              value={bi(
                "Choose the interface mood for the current browser.",
                "اختر مزاج الواجهة لهذا المتصفح."
              )}
            />
          </p>
          <ThemeToggle />
          <div className="setting-option-group" style={{ marginTop: "0.75rem" }}>
            {(["light", "dark", "system"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={appearance === value ? "setting-option active" : "setting-option"}
                onClick={() => setSetting("appearance", value)}
              >
                <BilingualText value={appearanceMeta[value].title} />
              </button>
            ))}
          </div>
        </article>

        <article className="setting-card">
          <h3>
            <BilingualText value={bi("Bilingual Display Order", "ترتيب العرض ثنائي اللغة")} />
          </h3>
          <p>
            <BilingualText
              value={bi(
                "English and Arabic remain visible together.",
                "يظل كل من الإنجليزية والعربية مرئيين معًا."
              )}
            />
          </p>
          <div className="setting-option-group">
            {(["en-first", "ar-first"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={bilingualOrder === value ? "setting-option active" : "setting-option"}
                onClick={() => setSetting("bilingualOrder", value)}
              >
                <BilingualText
                  value={
                    value === "en-first"
                      ? bi("English First", "الإنجليزية أولًا")
                      : bi("Arabic First", "العربية أولًا")
                  }
                />
              </button>
            ))}
          </div>
        </article>

        <article className="setting-card">
          <h3>
            <BilingualText value={bi("Interface Density", "كثافة الواجهة")} />
          </h3>
          <p>
            <BilingualText
              value={bi(
                "Comfortable for operations; compact for dense admin lists.",
                "مريح للتشغيل؛ ومضغوط لقوائم الإدارة الكثيفة."
              )}
            />
          </p>
          <div className="setting-option-group">
            {(["comfortable", "compact"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={density === value ? "setting-option active" : "setting-option"}
                onClick={() => setSetting("density", value)}
              >
                <BilingualText
                  value={
                    value === "comfortable" ? bi("Comfortable", "مريح") : bi("Compact", "مضغوط")
                  }
                />
              </button>
            ))}
          </div>
        </article>

        <article className="setting-card">
          <h3>
            <BilingualText value={bi("Text Size", "حجم النص")} />
          </h3>
          <p>
            <BilingualText
              value={bi(
                "Use the default or a larger reading scale.",
                "استخدم الحجم الافتراضي أو مقاسًا أكبر للقراءة."
              )}
            />
          </p>
          <div className="setting-option-group">
            {(["default", "large"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={fontScale === value ? "setting-option active" : "setting-option"}
                onClick={() => setSetting("fontScale", value)}
              >
                <BilingualText
                  value={value === "default" ? bi("Default", "افتراضي") : bi("Large", "كبير")}
                />
              </button>
            ))}
          </div>
        </article>

        <article className="setting-card">
          <h3>
            <BilingualText value={bi("Motion", "الحركة")} />
          </h3>
          <p>
            <BilingualText
              value={bi(
                "Follow the OS motion preference or reduce movement.",
                "اتبع تفضيل نظام التشغيل أو قلل الحركة."
              )}
            />
          </p>
          <div className="setting-option-group">
            {(["system", "reduced"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={motion === value ? "setting-option active" : "setting-option"}
                onClick={() => setSetting("motion", value)}
              >
                <BilingualText
                  value={
                    value === "system"
                      ? bi("Follow System", "اتبع النظام")
                      : bi("Reduce Motion", "تقليل الحركة")
                  }
                />
              </button>
            ))}
          </div>
        </article>

        <article className="setting-card">
          <h3>
            <BilingualText value={bi("Sidebar Default", "حالة القائمة الجانبية")} />
          </h3>
          <p>
            <BilingualText
              value={bi(
                "Persist the default collapsed or expanded admin state.",
                "احفظ حالة القائمة الجانبية الافتراضية."
              )}
            />
          </p>
          <div className="setting-option-group">
            {(["expanded", "collapsed"] as const).map((value) => (
              <button
                key={value}
                type="button"
                className={sidebarDefault === value ? "setting-option active" : "setting-option"}
                onClick={() => setSetting("sidebarDefault", value)}
              >
                <BilingualText
                  value={value === "expanded" ? bi("Expanded", "موسع") : bi("Collapsed", "مضاعف")}
                />
              </button>
            ))}
          </div>
        </article>
      </section>

      <div className="setting-card settings-reset">
        <h3>
          <BilingualText value={bi("Reset Interface Settings", "إعادة ضبط إعدادات الواجهة")} />
        </h3>
        <p>
          <BilingualText
            value={bi(
              "Clear only the local UI settings saved in this browser.",
              "احذف فقط إعدادات الواجهة المحلية المحفوظة في هذا المتصفح."
            )}
          />
        </p>
        <button type="button" className="button secondary" onClick={() => resetSettings()}>
          <RotateCcw size={16} />
          <BilingualText value={bi("Reset Settings", "إعادة الضبط")} />
        </button>
      </div>
    </div>
  );
}

function Settings2() {
  return <Sparkles />;
}
