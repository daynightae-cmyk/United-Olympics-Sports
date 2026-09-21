/**
 * UOS SPORTMIND — United Sports Intelligence Arena (Mission 10X Closure).
 * Evolved from canonical United Assistant.
 * Floating launcher, first-visit invitation, and quick drawer.
 * Can be expanded to the immersive full-screen Arena at /assistant.
 */
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Maximize2, Send, X } from 'lucide-react';
import { BilingualText, bi } from '../components/bilingual/BilingualText';
import {
  ASSISTANT_IDENTITY,
  answerLocally,
  getAssistantProviderStatus,
  getAssistantQuickActions,
} from './assistantService';
import { SportMindCore } from '../components/sportmind/SportMindCore';
import { SportMindModuleRenderer } from '../components/sportmind/SportMindModules';
import type { SportMindModule } from '../server/sportmind/types';

const DISMISS_KEY = 'uos:assistant-dismissed';
const AUTH_PREFIXES = ['/player/login', '/player/auth', '/player/phone', '/player/otp'];

interface ChatEntry {
  id: number;
  from: 'user' | 'assistant';
  text?: { en: string; ar: string };
  modules?: SportMindModule[];
  to?: string;
}

let entryId = 0;

export function UnitedAssistant() {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [invited, setInvited] = useState(false);
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [draft, setDraft] = useState('');
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine));
  const composerRef = useRef<HTMLInputElement>(null);
  const isAuthRoute = AUTH_PREFIXES.some((prefix) => location.pathname.startsWith(prefix));
  const provider = getAssistantProviderStatus();

  // Hide floating launcher on the dedicated full-screen /assistant page
  const isAssistantPage = location.pathname === '/assistant';

  useEffect(() => {
    const onStatus = () => setOnline(navigator.onLine);
    window.addEventListener('online', onStatus);
    window.addEventListener('offline', onStatus);
    return () => {
      window.removeEventListener('online', onStatus);
      window.removeEventListener('offline', onStatus);
    };
  }, []);

  useEffect(() => {
    if (open || isAuthRoute || isAssistantPage) return;
    const dismissed = (() => {
      try {
        return window.sessionStorage.getItem(DISMISS_KEY) === '1';
      } catch {
        return false;
      }
    })();
    if (dismissed) return;
    const timer = window.setTimeout(() => setInvited(true), 2600);
    return () => window.clearTimeout(timer);
  }, [open, isAuthRoute, isAssistantPage, location.pathname]);

  useEffect(() => {
    if (open) composerRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (isAssistantPage) return null;

  const dismissInvitation = () => {
    setInvited(false);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* session preference unavailable */
    }
  };

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    const answer = answerLocally(trimmed);
    setEntries((current) => [
      ...current,
      { id: ++entryId, from: 'user', text: { en: trimmed, ar: trimmed } },
      { id: ++entryId, from: 'assistant', text: answer.text, to: answer.to },
    ]);
    setDraft('');
  };

  const openAssistant = () => {
    setInvited(false);
    setOpen(true);
  };

  return (
    <>
      {invited && !open ? (
        <div className="uos-assistant-invite uos-glass-4 uos-safe-bottom" role="status">
          <div className="uos-assistant-invite-head">
            <SportMindCore size={28} state="idle" />
            <p className="uos-assistant-invite-title">
              <BilingualText value={bi('UOS SPORTMIND 👋', 'ساحة الذكاء الرياضي 👋')} />
            </p>
          </div>
          <p className="uos-assistant-invite-body">
            <BilingualText
              value={bi(
                'Welcome to United Olympics Sports. SportMind can help you prepare training plans, review schedules, or navigate directly to your portal.',
                'أهلًا بك في يونايتد أوليمبيكس سبورت. تساعدك ساحة الذكاء الرياضي في إعداد الخطط التدريبية، مراجعة الجداول، أو الوصول المباشر إلى بوابتك.',
              )}
            />
          </p>
          <div className="uos-assistant-invite-actions">
            <button type="button" className="uos-btn-primary uos-touch" onClick={openAssistant}>
              <BilingualText value={bi('Open SportMind', 'فتح ساحة الذكاء')} />
            </button>
            <button type="button" className="uos-btn-ghost uos-touch" onClick={dismissInvitation}>
              <BilingualText value={bi('Later', 'لاحقًا')} />
            </button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        className="uos-assistant-orb uos-touch"
        onClick={() => (open ? setOpen(false) : openAssistant())}
        aria-label="UOS SportMind | ساحة الذكاء الرياضي"
        aria-expanded={open}
        title="UOS SportMind | ساحة الذكاء الرياضي"
      >
        <SportMindCore size={32} state={open ? 'thinking' : 'idle'} />
      </button>

      {open ? (
        <div className="uos-assistant-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
      ) : null}
      {open ? (
        <section
          className="uos-assistant-panel uos-glass-4 uos-safe-bottom"
          role="dialog"
          aria-modal="true"
          aria-label="UOS SportMind | ساحة الذكاء الرياضي"
        >
          <header className="uos-assistant-head">
            <SportMindCore size={32} state="idle" />
            <div>
              <h2><BilingualText value={bi(ASSISTANT_IDENTITY.en, ASSISTANT_IDENTITY.ar)} /></h2>
              <small>
                {online ? (
                  <BilingualText value={bi('Sports Intelligence Arena', 'ساحة الذكاء الرياضي')} />
                ) : (
                  <BilingualText value={bi("You're offline", 'أنت غير متصل بالإنترنت')} />
                )}
              </small>
            </div>
            <div className="uos-assistant-head-actions">
              <button
                type="button"
                className="uos-btn-ghost uos-touch"
                onClick={() => {
                  setOpen(false);
                  navigate('/assistant');
                }}
                aria-label="Expand to Full Arena | توسيع الساحة"
                title="Expand to Full Arena | توسيع الساحة"
              >
                <Maximize2 size={16} />
              </button>
              <button
                type="button"
                className="uos-btn-ghost uos-touch"
                onClick={() => setOpen(false)}
                aria-label="Close assistant | إغلاق المساعد"
              >
                <X size={17} />
              </button>
            </div>
          </header>

          <div className="uos-assistant-quick">
            {getAssistantQuickActions().map((action) => (
              <button
                key={action.id}
                type="button"
                className="uos-assistant-chip uos-touch"
                onClick={() => {
                  if (action.to) {
                    setOpen(false);
                    navigate(action.to);
                  } else if (action.help) {
                    setEntries((current) => [
                      ...current,
                      { id: ++entryId, from: 'assistant', text: action.help as { en: string; ar: string } },
                    ]);
                  }
                }}
              >
                <BilingualText value={action.label} />
              </button>
            ))}
          </div>

          <div className="uos-assistant-log" aria-live="polite">
            {entries.length === 0 ? (
              <p className="uos-assistant-hint">
                <BilingualText
                  value={bi(
                    'Ask about training sessions, schedules, drill progressions, or portal navigation. I answer strictly from verified athletic records.',
                    'اسأل عن الحصص التدريبية، الجداول، تصعيد التدريبات، أو التنقل في البوابات. أجيب بدقة من السجلات الرياضية المعتمدة.',
                  )}
                />
              </p>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className={`uos-assistant-msg uos-assistant-msg--${entry.from}`}>
                  {entry.text && <p><BilingualText value={entry.text} /></p>}
                  {entry.modules && entry.modules.map((mod) => (
                    <SportMindModuleRenderer key={mod.id} module={mod} />
                  ))}
                  {entry.to ? (
                    <button
                      type="button"
                      className="uos-assistant-goto"
                      onClick={() => {
                        setOpen(false);
                        navigate(entry.to as string);
                      }}
                    >
                      <BilingualText value={bi('Open this section', 'فتح هذا القسم')} />
                    </button>
                  ) : null}
                </div>
              ))
            )}
          </div>

          <form
            className="uos-assistant-composer"
            onSubmit={(event) => {
              event.preventDefault();
              send(draft);
            }}
          >
            <input
              ref={composerRef}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Ask SportMind… | اسأل ساحة الذكاء الرياضي…"
              aria-label="Ask SportMind | اسأل ساحة الذكاء الرياضي"
              className="uos-input uos-halo"
              autoComplete="off"
            />
            <button type="submit" className="uos-btn-primary uos-touch" aria-label="Send | إرسال">
              <Send size={16} />
            </button>
          </form>
          <p className="uos-assistant-foot">
            <BilingualText
              value={
                provider.aiConnected
                  ? bi('Connected to OpenCode Sports Engine', 'متصل بمحرك الذكاء الرياضي المفتوح')
                  : bi('Deterministic sports intelligence mode active.', 'وضع الذكاء الرياضي المحدد نشط.')
              }
            />
          </p>
        </section>
      ) : null}
    </>
  );
}
