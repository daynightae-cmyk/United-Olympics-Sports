import { Bell, Menu, Search, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../bilingual/BilingualText';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageOrderToggle } from '../ui/LanguageOrderToggle';

type Props = { title: { en: string; ar: string }; onMenu: () => void };
const quickLinks = [
  { to: '/admin/players', label: bi('Players', 'اللاعبون') },
  { to: '/admin/attendance', label: bi('Attendance', 'الحضور') },
  { to: '/admin/payments', label: bi('Payments', 'المدفوعات') },
  { to: '/admin/reports', label: bi('Reports', 'التقارير') },
];

export function AdminTopbar({ title, onMenu }: Props) {
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') { setSearchOpen(false); setNotificationsOpen(false); setProfileOpen(false); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const results = quickLinks.filter(item => `${item.label.en} ${item.label.ar}`.toLowerCase().includes(query.toLowerCase()));
  return <header className="admin-topbar">
    <div className="admin-topbar-title"><button className="admin-icon-button mobile-only" onClick={onMenu} aria-label="Open navigation | فتح القائمة"><Menu /></button><div><small><BilingualText value={bi('Current Page', 'الصفحة الحالية')} /></small><BilingualText value={title} /></div></div>
    <div className="admin-command-search"><label className="admin-search"><Search /><span className="sr-only"><BilingualText value={bi('Global search', 'البحث العام')} /></span><input value={query} onFocus={() => setSearchOpen(true)} onChange={event => { setQuery(event.target.value); setSearchOpen(true); }} placeholder="Search | البحث" aria-label="Search | البحث" /></label>{searchOpen && <div className="admin-command-results" role="dialog" aria-label="Global search results | نتائج البحث العام"><div className="admin-command-results-head"><BilingualText value={bi('Quick navigation', 'تنقل سريع')} /><button type="button" className="admin-icon-button" onClick={() => setSearchOpen(false)} aria-label="Close search | إغلاق البحث"><X size={15} /></button></div>{results.length ? results.map(item => <Link to={item.to} key={item.to} onClick={() => setSearchOpen(false)}><BilingualText value={item.label} /><span>↗</span></Link>) : <p><BilingualText value={bi('No matching destinations', 'لا توجد وجهات مطابقة')} /></p>}</div>}</div>
    <div className="admin-topbar-actions"><LanguageOrderToggle compact /><ThemeToggle compact /><span className="preview-badge"><span className="preview-dot" /><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span><div className="admin-command-popover"><button className="admin-icon-button" type="button" onClick={() => { setNotificationsOpen(value => !value); setProfileOpen(false); }} aria-label="Notifications | الإشعارات" aria-expanded={notificationsOpen}><Bell /><i className="admin-notification-dot" /></button>{notificationsOpen && <div className="admin-popover"><strong><BilingualText value={bi('Preview notifications', 'إشعارات المعاينة')} /></strong><p><BilingualText value={bi('Roster review is ready for local inspection.', 'مراجعة القائمة جاهزة للفحص المحلي.')} /></p><small><BilingualText value={bi('No server delivery claimed', 'لا ادعاء بتسليم خادمي')} /></small></div>}</div><div className="admin-command-popover"><button className="admin-profile" type="button" onClick={() => { setProfileOpen(value => !value); setNotificationsOpen(false); }} aria-expanded={profileOpen}><UserRound /><BilingualText value={bi('Admin Profile', 'ملف المدير')} /></button>{profileOpen && <div className="admin-popover admin-profile-popover"><strong><BilingualText value={bi('Super Admin', 'الإدارة الرئيسية')} /></strong><p><BilingualText value={bi('Preview workspace', 'مساحة عمل تجريبية')} /></p><Link to="/admin/settings" onClick={() => setProfileOpen(false)}><BilingualText value={bi('Open settings', 'فتح الإعدادات')} /></Link><Link to="/" onClick={() => setProfileOpen(false)}><BilingualText value={bi('Public website', 'الموقع العام')} /></Link></div>}</div></div>
  </header>;
}
