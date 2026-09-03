import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  Globe,
  Bell,
  User,
  LogOut,
  Shield,
  Smartphone,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import { usePlayerSession } from '../../../portals/player/PlayerSessionContext';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { useUiSettings } from '../../../ui/theme/useUiSettings';

export function PlayerPortalSettingsPage() {
  const { player, parent, allPlayers, switchPlayer, logout } = usePlayerSession();
  const { bilingualOrder, appearance, setSetting } = useUiSettings();
  const navigate = useNavigate();

  if (!player) return null;

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [sessionReminders, setSessionReminders] = useState(true);
  const [evaluationAlerts, setEvaluationAlerts] = useState(true);

  const handleLanguageChange = (lang: 'en' | 'ar') => {
    if (lang === 'ar') {
      setSetting('bilingualOrder', 'ar-first');
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
    } else {
      setSetting('bilingualOrder', 'en-first');
      document.documentElement.lang = 'en';
      document.documentElement.dir = 'ltr';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/player/login');
  };

  return (
    <div className="space-y-6" id="player-settings-page">
      {/* Header Banner */}
      <div className="athlete-glass-card p-6 border-amber-400/25">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-400/10 text-amber-400">
              <Settings size={18} />
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
              <BilingualText value={bi('Portal Configurations', 'إعدادات البوابة وتفضيلات الحساب')} />
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">
            <BilingualText value={bi('Athlete Settings & Preferences', 'إعدادات حساب الرياضي')} />
          </h1>
          <p className="text-xs text-slate-300">
            <BilingualText
              value={bi(
                'Manage bilingual display, communication preferences, and active athlete profile.',
                'إدارة لغة العرض، وتفضيلات الإشعارات، وملف الرياضي النشط.'
              )}
            />
          </p>
        </div>
      </div>

      {/* Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Language & Regional Settings */}
        <div className="athlete-glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
            <Globe size={16} className="text-amber-400" />
            <BilingualText value={bi('Language & Regional Display', 'اللغة وعرض البوابة')} />
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleLanguageChange('en')}
              className={`p-3.5 rounded-xl border text-center transition-all ${
                bilingualOrder === 'en-first'
                  ? 'bg-amber-400 text-black font-bold border-amber-400 shadow-md shadow-amber-400/20'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="text-sm font-bold block">English</span>
              <span className="text-[10px] opacity-80">Default LTR</span>
            </button>
            <button
              onClick={() => handleLanguageChange('ar')}
              className={`p-3.5 rounded-xl border text-center transition-all ${
                bilingualOrder === 'ar-first'
                  ? 'bg-amber-400 text-black font-bold border-amber-400 shadow-md shadow-amber-400/20'
                  : 'bg-white/5 text-slate-300 border-white/10 hover:bg-white/10'
              }`}
            >
              <span className="text-sm font-bold block">العربية</span>
              <span className="text-[10px] opacity-80">واجهة عربية كاملة RTL</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-400 leading-relaxed">
            <BilingualText
              value={bi(
                'United Olympics Sports treats Arabic and English as equal first-class languages across all portal views.',
                'تعتمد يونايتد أوليمبيكس سبورت اللغتين العربية والإنجليزية كلغات رئيسية متساوية في كافة صفحات البوابة.'
              )}
            />
          </p>
        </div>

        {/* Multi-Athlete / Sibling Switcher */}
        <div className="athlete-glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
            <User size={16} className="text-amber-400" />
            <BilingualText value={bi('Switch Active Athlete Profile', 'تبديل ملف الرياضي النشط')} />
          </h3>

          <div className="space-y-2">
            {allPlayers.map((p) => {
              const isActive = p.id === player.id;
              return (
                <div
                  key={p.id}
                  onClick={() => switchPlayer(p.id)}
                  className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isActive
                      ? 'bg-amber-400/10 border-amber-400/40 text-white'
                      : 'bg-white/5 border-white/5 text-slate-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 font-bold text-xs flex items-center justify-center">
                      {p.nameEn.charAt(0)}
                    </div>
                    <div>
                      <strong className="text-xs font-bold block">{p.nameEn}</strong>
                      <span className="text-[10px] text-amber-400/80">{p.nameAr}</span>
                    </div>
                  </div>

                  {isActive ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400 text-black">
                      <BilingualText value={bi('Active', 'النشط')} />
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400 hover:text-white">
                      <BilingualText value={bi('Switch', 'اختيار')} />
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Notifications Preferences */}
        <div className="athlete-glass-card p-6 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
            <Bell size={16} className="text-amber-400" />
            <BilingualText value={bi('Alerts & Notification Preferences', 'تفضيلات التنبيهات والإشعارات')} />
          </h3>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer">
              <span><BilingualText value={bi('Training Session Reminders', 'تنبيهات مواعيد الحصص التدريبية')} /></span>
              <input
                type="checkbox"
                checked={sessionReminders}
                onChange={(e) => setSessionReminders(e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer">
              <span><BilingualText value={bi('New Coach Evaluation Alerts', 'إشعارات التقييمات الفنية الجديدة')} /></span>
              <input
                type="checkbox"
                checked={evaluationAlerts}
                onChange={(e) => setEvaluationAlerts(e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded"
              />
            </label>
            <label className="flex items-center justify-between p-3 rounded-xl bg-white/5 cursor-pointer">
              <span><BilingualText value={bi('Administrative Announcements', 'تعميمات وإعلانات الإدارة')} /></span>
              <input
                type="checkbox"
                checked={notificationsEnabled}
                onChange={(e) => setNotificationsEnabled(e.target.checked)}
                className="w-4 h-4 accent-amber-400 rounded"
              />
            </label>
          </div>
        </div>

        {/* Organization Support & Signout */}
        <div className="athlete-glass-card p-6 space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Shield size={16} className="text-amber-400" />
              <BilingualText value={bi('Administration & Support', 'الدعم والإدارة')} />
            </h3>            <div className="py-3 text-xs text-slate-300">
              <div className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
                <Info size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <BilingualText value={bi(
                  'Support contact is not configured yet.',
                  'بيانات التواصل مع الدعم غير متاحة بعد.'
                )} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full py-2.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut size={15} />
              <span><BilingualText value={bi('Sign Out of Athlete Portal', 'تسجيل الخروج من بوابة اللاعب')} /></span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
