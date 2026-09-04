import { Bell, Check, Eye, Globe, LogOut, Monitor, RotateCcw, Settings, Shield, Type, User } from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { useUiSettings } from '../../../ui/theme/useUiSettings';

const PREF_KEY = 'uos:player-portal:notification-preferences:v1';
type NotificationPrefs = { sessionReminders: boolean; evaluationAlerts: boolean; recordAlerts: boolean };
const defaultPrefs: NotificationPrefs = { sessionReminders: true, evaluationAlerts: true, recordAlerts: true };

function loadPrefs(): NotificationPrefs {
  if (typeof window === 'undefined') return defaultPrefs;
  try {
    const parsed = JSON.parse(localStorage.getItem(PREF_KEY) ?? '') as Partial<NotificationPrefs>;
    return {
      sessionReminders: typeof parsed.sessionReminders === 'boolean' ? parsed.sessionReminders : true,
      evaluationAlerts: typeof parsed.evaluationAlerts === 'boolean' ? parsed.evaluationAlerts : true,
      recordAlerts: typeof parsed.recordAlerts === 'boolean' ? parsed.recordAlerts : true,
    };
  } catch {
    return defaultPrefs;
  }
}

function readPreviewSession() {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('uos:player-portal:session');
    if (!raw) return false;
    return (JSON.parse(raw) as { provider?: string }).provider === 'preview';
  } catch {
    return false;
  }
}

export function PlayerPortalSettingsPage() {
  const { player, allPlayers, switchPlayer, logout } = usePlayerSession();
  const { appearance, bilingualOrder, density, motion, fontScale, setAppearance, setSetting, resetSettings } = useUiSettings();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<NotificationPrefs>(() => loadPrefs());
  if (!player) return null;

  const isPreviewSession = readPreviewSession();

  const savePrefs = (next: NotificationPrefs) => {
    setPrefs(next);
    try { localStorage.setItem(PREF_KEY, JSON.stringify(next)); } catch { /* local preference storage may be unavailable */ }
  };

  const setLanguage = (language: 'en' | 'ar') => {
    setSetting('bilingualOrder', language === 'ar' ? 'ar-first' : 'en-first');
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  };

  const handleReset = () => {
    resetSettings();
    savePrefs(defaultPrefs);
  };

  const handleLogout = () => {
    logout();
    navigate('/player/login');
  };

  return (
    <div className="space-y-6" id="player-settings-page">
      <section className="athlete-glass-card p-6 border-amber-400/25">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="max-w-3xl"><div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400"><Settings size={18} /><BilingualText value={bi('Player Portal Preferences', 'تفضيلات بوابة اللاعب')} /></div><h1 className="mt-2 text-xl sm:text-2xl font-bold text-white"><BilingualText value={bi('Appearance, Language & Local Preferences', 'المظهر واللغة والتفضيلات المحلية')} /></h1><p className="mt-1 text-xs leading-6 text-slate-300"><BilingualText value={bi('Display preferences persist on this browser. Notification toggles are local product preferences until a notification delivery backend is connected.', 'تستمر تفضيلات العرض في هذا المتصفح. وتظل مفاتيح الإشعارات تفضيلات محلية للمنتج حتى يتم ربط خدمة إرسال إشعارات خلفية.')} /></p></div>
          <span className="athlete-data-scope"><Shield size={13} /><BilingualText value={bi('Device-local settings', 'إعدادات محلية للجهاز')} /></span>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <SettingCard icon={<Globe size={16} />} title={bi('Language & Direction', 'اللغة واتجاه العرض')}>
          <div className="grid grid-cols-2 gap-3">
            <ChoiceButton active={bilingualOrder === 'en-first'} onClick={() => setLanguage('en')} title="English · الإنجليزية" description="LTR · من اليسار لليمين" />
            <ChoiceButton active={bilingualOrder === 'ar-first'} onClick={() => setLanguage('ar')} title="العربية · Arabic" description="RTL · من اليمين لليسار" />
          </div>
        </SettingCard>

        <SettingCard icon={<Monitor size={16} />} title={bi('Appearance', 'المظهر')}>
          <div className="grid grid-cols-3 gap-2">
            {(['system', 'dark', 'light'] as const).map((value) => <ChoiceButton key={value} active={appearance === value} onClick={() => setAppearance(value)} title={value === 'system' ? 'System · النظام' : value === 'dark' ? 'Dark · داكن' : 'Light · فاتح'} compact />)}
          </div>
        </SettingCard>

        <SettingCard icon={<Eye size={16} />} title={bi('Reading Density & Motion', 'كثافة العرض والحركة')}>
          <div className="space-y-4">
            <div><span className="text-[11px] text-slate-400"><BilingualText value={bi('Content density', 'كثافة المحتوى')} /></span><div className="grid grid-cols-2 gap-2 mt-2"><ChoiceButton active={density === 'comfortable'} onClick={() => setSetting('density', 'comfortable')} title="Comfortable · مريح" compact /><ChoiceButton active={density === 'compact'} onClick={() => setSetting('density', 'compact')} title="Compact · مضغوط" compact /></div></div>
            <div><span className="text-[11px] text-slate-400"><BilingualText value={bi('Motion', 'الحركة')} /></span><div className="grid grid-cols-2 gap-2 mt-2"><ChoiceButton active={motion === 'system'} onClick={() => setSetting('motion', 'system')} title="System · النظام" compact /><ChoiceButton active={motion === 'reduced'} onClick={() => setSetting('motion', 'reduced')} title="Reduced · مخففة" compact /></div></div>
          </div>
        </SettingCard>

        <SettingCard icon={<Type size={16} />} title={bi('Text Size', 'حجم النص')}>
          <div className="grid grid-cols-2 gap-2"><ChoiceButton active={fontScale === 'default'} onClick={() => setSetting('fontScale', 'default')} title="Default · افتراضي" compact /><ChoiceButton active={fontScale === 'large'} onClick={() => setSetting('fontScale', 'large')} title="Large · كبير" compact /></div>
        </SettingCard>

        <SettingCard icon={<Bell size={16} />} title={bi('Notification Preferences', 'تفضيلات الإشعارات')}>
          <div className="space-y-2">
            <ToggleRow checked={prefs.sessionReminders} onChange={(value) => savePrefs({ ...prefs, sessionReminders: value })} label={bi('Training session reminders', 'تذكيرات الحصص التدريبية')} />
            <ToggleRow checked={prefs.evaluationAlerts} onChange={(value) => savePrefs({ ...prefs, evaluationAlerts: value })} label={bi('Recorded feedback alerts', 'تنبيهات الملاحظات المسجلة')} />
            <ToggleRow checked={prefs.recordAlerts} onChange={(value) => savePrefs({ ...prefs, recordAlerts: value })} label={bi('Player record updates', 'تحديثات سجل اللاعب')} />
          </div>
          <div className="athlete-truth-note mt-4"><Bell size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('These preferences are saved locally; push, SMS and email delivery are not claimed.', 'يتم حفظ هذه التفضيلات محليًا؛ ولا يتم ادعاء وجود إرسال Push أو SMS أو بريد إلكتروني.')} /></div>
        </SettingCard>

        <SettingCard icon={<User size={16} />} title={bi('Active Preview Athlete', 'لاعب المعاينة النشط')}>
          {isPreviewSession ? (
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 rtl:pr-0 rtl:pl-1">
              {allPlayers.map((item) => {
                const active = item.id === player.id;
                return <button key={item.id} type="button" onClick={() => switchPlayer(item.id)} className={`w-full min-h-14 p-3 rounded-xl border flex items-center justify-between gap-3 text-left rtl:text-right ${active ? 'bg-amber-400/10 border-amber-400/35' : 'bg-white/[.025] border-white/8 hover:bg-white/5'}`}><div className="min-w-0"><strong className="block text-xs text-white truncate">{item.nameEn}</strong><span lang="ar" dir="rtl" className="block text-[10px] text-amber-300 truncate">{item.nameAr}</span></div>{active ? <span className="athlete-data-scope"><Check size={12} /><BilingualText value={bi('Active', 'نشط')} /></span> : <span className="text-[10px] text-slate-500"><BilingualText value={bi('Switch', 'تبديل')} /></span>}</button>;
              })}
            </div>
          ) : <div className="athlete-truth-note"><Shield size={14} className="text-amber-400 flex-shrink-0 mt-0.5" /><BilingualText value={bi('Athlete switching is available only for explicit Preview Athlete sessions.', 'تبديل اللاعب متاح فقط في جلسات معاينة اللاعب الصريحة.')} /></div>}
        </SettingCard>
      </div>

      <section className="athlete-glass-card p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4"><div><span className="text-[10px] uppercase tracking-[.16em] text-amber-400 font-black"><BilingualText value={bi('Session controls', 'إدارة الجلسة')} /></span><h2 className="mt-1 text-base font-black text-white"><BilingualText value={bi('Reset & Sign Out', 'إعادة الضبط وتسجيل الخروج')} /></h2><p className="mt-1 text-xs text-slate-400"><BilingualText value={bi('Support contact is not configured, so no phone, email or chat destination is invented here.', 'بيانات الدعم غير مهيأة، لذلك لا يتم اختلاق هاتف أو بريد أو وجهة محادثة هنا.')} /></p></div><div className="athlete-action-row"><button type="button" onClick={handleReset} className="athlete-action-secondary"><RotateCcw size={14} /><BilingualText value={bi('Reset local preferences', 'إعادة ضبط التفضيلات المحلية')} /></button><button type="button" onClick={handleLogout} className="inline-flex min-h-11 items-center justify-center gap-2 px-4 rounded-xl border border-red-500/25 bg-red-500/10 text-red-300 text-xs font-bold"><LogOut size={14} /><BilingualText value={bi('Sign out', 'تسجيل الخروج')} /></button></div></div>
      </section>
    </div>
  );
}

function SettingCard({ icon, title, children }: { icon: ReactNode; title: { en: string; ar: string }; children: ReactNode }) {
  return <section className="athlete-glass-card p-5 sm:p-6"><header className="flex items-center gap-2 pb-4 border-b border-white/10 text-amber-400">{icon}<h2 className="text-sm font-bold text-white"><BilingualText value={title} /></h2></header><div className="mt-4">{children}</div></section>;
}

function ChoiceButton({ active, onClick, title, description, compact = false }: { active: boolean; onClick: () => void; title: string; description?: string; compact?: boolean }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={`${compact ? 'min-h-11 px-3' : 'min-h-16 p-3'} rounded-xl border text-center transition-all ${active ? 'bg-amber-400 text-black border-amber-400 shadow-md shadow-amber-400/15' : 'bg-white/[.025] text-slate-300 border-white/10 hover:bg-white/5'}`}><strong className="block text-xs">{title}</strong>{description && <span className="block mt-1 text-[9px] opacity-70">{description}</span>}</button>;
}

function ToggleRow({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => void; label: { en: string; ar: string } }) {
  return <label className="flex min-h-12 items-center justify-between gap-3 rounded-xl border border-white/8 bg-white/[.025] px-3 cursor-pointer"><span className="text-xs text-slate-300"><BilingualText value={label} /></span><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="w-4 h-4 accent-amber-400" /></label>;
}
