import { Bell, Menu, Search, UserRound } from "lucide-react";
import { BilingualText, bi } from "../bilingual/BilingualText";
import { ThemeToggle } from "../ui/ThemeToggle";

type Props = { title: { en: string; ar: string }; onMenu: () => void };

export function AdminTopbar({ title, onMenu }: Props) {
  return (
    <header className="admin-topbar" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.06), transparent 42%), linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.005)), rgba(14,16,20,0.92)', borderBottom: '1px solid rgba(212,175,55,0.18)', backdropFilter: 'blur(14px) saturate(120%)', WebkitBackdropFilter: 'blur(14px) saturate(120%)', boxShadow: '0 8px 32px rgba(0,0,0,0.35)' }}>
      <div className="admin-topbar-title">
        <button
          className="admin-icon-button mobile-only"
          onClick={onMenu}
          aria-label="Open navigation | فتح القائمة"
        >
          <Menu />
        </button>
        <div>
          <small>
            <BilingualText value={bi("Current Page", "الصفحة الحالية")} />
          </small>
          <BilingualText value={title} />
        </div>
      </div>
      <label className="admin-search">
        <Search />
        <span className="sr-only">Search | البحث</span>
        <input placeholder="Search | البحث" aria-label="Search | البحث" />
      </label>
      <div className="admin-topbar-actions">
        <ThemeToggle compact />
        <span className="preview-badge">
          <span className="preview-dot" />
          <BilingualText value={bi("Preview Data", "بيانات تجريبية")} />
        </span>
        <button className="admin-icon-button" aria-label="Notifications | الإشعارات">
          <Bell />
        </button>
        <button className="admin-profile">
          <UserRound />
          <BilingualText value={bi("Admin Profile", "ملف المدير")} />
        </button>
      </div>
    </header>
  );
}
