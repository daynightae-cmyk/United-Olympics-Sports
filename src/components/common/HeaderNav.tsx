import React from 'react';
import { Logo } from '../brand/Logo';
import { PortalType, UserProfile } from '../../types';
import {
  Globe,
  User,
  Users,
  ShieldCheck,
  Award,
  Sparkles,
  Phone,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface HeaderNavProps {
  currentPortal: PortalType;
  onSelectPortal: (portal: PortalType) => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  userProfiles: UserProfile[];
  onReplaySplash: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentPortal,
  onSelectPortal,
  currentUser,
  onSelectUser,
  userProfiles,
  onReplaySplash,
}) => {
  const portals: { id: PortalType; labelEn: string; labelAr: string; icon: React.ReactNode }[] = [
    { id: 'public', labelEn: 'Public Showcase', labelAr: 'البوابة العامة', icon: <Globe className="w-4 h-4" /> },
    { id: 'player', labelEn: 'Player Passport', labelAr: 'تطبيق اللاعب', icon: <Award className="w-4 h-4" /> },
    { id: 'parent', labelEn: 'Parent Portal', labelAr: 'بوابة ولي الأمر', icon: <Users className="w-4 h-4" /> },
    { id: 'coach', labelEn: 'Coach Tactical HQ', labelAr: 'منظومة المدرب', icon: <User className="w-4 h-4" /> },
    { id: 'admin', labelEn: 'Super Admin', labelAr: 'الإدارة العليا', icon: <ShieldCheck className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#0a0a0e]/95 backdrop-blur-md border-b border-amber-500/20 shadow-lg shadow-black/40">
      {/* Top Gold Utility Bar */}
      <div className="bg-gradient-to-r from-[#121218] via-[#1a1710] to-[#121218] border-b border-amber-500/10 px-4 py-1 text-xs text-amber-200/80">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-amber-300">OLYMPIC ENROLLMENT 2026 ACTIVE</span>
            <span className="text-zinc-500">•</span>
            <span className="font-arabic">باب التسجيل وتجارب الأداء مفتوح لكافة الرياضات</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              id="replay-splash-button"
              onClick={onReplaySplash}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 transition text-[11px] font-medium cursor-pointer"
            >
              <Sparkles className="w-3 h-3" />
              <span>Cinematic Intro • إعادة العرض</span>
            </button>

            <a
              href="https://wa.me/971503281920?text=Hello%20United%20Olympics%20Sports%20Hotline"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition text-[11px] font-mono"
            >
              <Phone className="w-3 h-3" />
              <span>Direct WhatsApp Hotline • الخط الساخن: +971 50 328 1920</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <button
          id="nav-logo-btn"
          onClick={() => onSelectPortal('public')}
          className="cursor-pointer text-left transition hover:opacity-90"
        >
          <Logo size="md" />
        </button>

        {/* 5-Product Portal Switcher Tabs */}
        <nav className="hidden lg:flex items-center gap-1 p-1 rounded-xl bg-zinc-900/90 border border-amber-500/20">
          {portals.map((p) => {
            const isActive = currentPortal === p.id;
            return (
              <button
                key={p.id}
                id={`nav-portal-${p.id}`}
                onClick={() => onSelectPortal(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_12px_rgba(212,175,55,0.4)]'
                    : 'text-zinc-300 hover:text-amber-200 hover:bg-zinc-800/60'
                }`}
              >
                {p.icon}
                <div className="flex flex-col items-start leading-tight">
                  <span className={isActive ? 'font-bold' : ''}>{p.labelEn}</span>
                  <span className={`text-[10px] font-arabic ${isActive ? 'text-zinc-950 font-semibold' : 'text-zinc-400'}`}>
                    {p.labelAr}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        {/* User Role Quick Switcher & Mobile Portal Select */}
        <div className="flex items-center gap-3">
          {/* Active User Persona Pill */}
          <div className="relative group">
            <button
              id="persona-switcher-btn"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900/80 border border-amber-500/30 text-amber-200 hover:border-amber-400 transition cursor-pointer"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name.en}
                className="w-7 h-7 rounded-full object-cover border border-amber-400/50"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-amber-100 line-clamp-1">{currentUser.name.en}</span>
                <span className="text-[10px] font-arabic text-amber-400/80 line-clamp-1">{currentUser.name.ar}</span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-amber-400 opacity-80" />
            </button>

            {/* Dropdown Menu to switch active session */}
            <div className="absolute right-0 top-full mt-2 w-72 rounded-xl bg-[#121218] border border-amber-500/30 shadow-2xl p-2 hidden group-hover:block group-focus-within:block z-50">
              <div className="px-2 py-1.5 border-b border-zinc-800 mb-1">
                <span className="text-[10px] uppercase tracking-wider text-amber-400/80 font-mono">
                  Switch Active Persona • تبديل المستخدم
                </span>
              </div>
              {userProfiles.map((user) => (
                <button
                  key={user.id}
                  id={`user-select-${user.id}`}
                  onClick={() => {
                    onSelectUser(user);
                    onSelectPortal(user.portal);
                  }}
                  className={`w-full text-left p-2 rounded-lg flex items-center gap-2.5 transition text-xs cursor-pointer ${
                    currentUser.id === user.id ? 'bg-amber-500/20 border border-amber-500/40 text-amber-100' : 'hover:bg-zinc-800/80 text-zinc-300'
                  }`}
                >
                  <img src={user.avatar} alt={user.name.en} className="w-7 h-7 rounded-full object-cover shrink-0" />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-semibold truncate">{user.name.en}</span>
                    <span className="text-[10px] text-zinc-400 font-arabic truncate">{user.name.ar}</span>
                  </div>
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 font-mono">
                    {user.role}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Portal Navigation Bar */}
      <div className="lg:hidden border-t border-zinc-800/80 bg-[#0d0d12] px-2 py-1.5 overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          {portals.map((p) => {
            const isActive = currentPortal === p.id;
            return (
              <button
                key={p.id}
                onClick={() => onSelectPortal(p.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-500 text-black font-bold'
                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                }`}
              >
                {p.icon}
                <span>{p.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
