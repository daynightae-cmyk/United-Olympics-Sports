import { Bell, Menu, Search, UserRound } from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';

type Props = { title: { en: string; ar: string }; onMenu: () => void };

export function AdminTopbar({ title, onMenu }: Props) {
  return (
    <header className="admin-topbar">
      <div className="admin-topbar-title">
        <button className="admin-icon-button mobile-only" onClick={onMenu} aria-label="Open navigation | فتح القائمة"><Menu /></button>
        <div><small><BilingualText value={bi('Current Page', 'الصفحة الحالية')} /></small><BilingualText value={title} /></div>
      </div>
      <label className="admin-search">
        <Search />
        <span className="sr-only">Search | البحث</span>
        <input placeholder="Search | البحث" aria-label="Search | البحث" />
      </label>
      <div className="admin-topbar-actions">
        <span className="preview-badge"><span className="preview-dot" /><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span>
        <button className="admin-icon-button" aria-label="Notifications | الإشعارات"><Bell /></button>
        <button className="admin-profile"><UserRound /><BilingualText value={bi('Admin Profile', 'ملف المدير')} /></button>
      </div>
    </header>
  );
}
