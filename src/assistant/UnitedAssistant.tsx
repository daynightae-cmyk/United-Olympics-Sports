/**
 * United Assistant — floating launcher, first-visit invitation, drawer.
 * Local guide mode until an AI provider is connected (see assistantService).
 * Auth routes: no auto-invitation, launcher stays available but quiet.
 */
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MessageCircleHeart, Send, Sparkles, X } from 'lucide-react';
import { BilingualText, bi } from '../components/bilingual/BilingualText';
import { ASSISTANT_IDENTITY, answerLocally, getAssistantProviderStatus, getAssistantQuickActions } from './assistantService';

const DISMISS_KEY = 'uos:assistant-dismissed';
const AUTH_PREFIXES = ['/player/login', '/player/auth', '/player/phone', '/player/otp'];

interface ChatEntry {
  id: number;
  from: 'user' | 'assistant';
  text: { en: string; ar: string };
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
    if (open || isAuthRoute) return;
    let dismissed = false;
    try {
      dismissed = window.sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      dismissed = false;
    }
    if (dismissed) return;
    const timer = window.setTimeout(() => setInvited(true), 2600);
    return () => window.clearTimeout(timer);
  }, [open, isAuthRoute, location.pathname]);

  useEffect(() => {
    if (open) composerRef.current?.focus();
  }, [open ]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open ]);

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
          <p className="uos-assistant-invite-title"><BilingualText value={bi('السلام عليكم 👋', 'Welcome 👋')} /></p>
          <p className="uos-assistant-invite-body">
            <BilingualText
              value={bi(
                'أهلًا بك في يونايتد أوليمبيكس سبورت. أنا مساعد يونايتد، ويمكنني مساعدتك في الوصول إلى الأقسام والخدمات المناسبة بسرعة.',
                "Welcome to United Olympics Sports. I'm United Assistant, and I can help you quickly find the right sections and services.",
              )}
            />
          </p>
          <div className="uos-assistant-invite-actions">
            <button type="button" className="uos-btn-primary uos-touch" onClick={openAssistant}>
              <BilingualText value={bi('Open assistant', 'فتح المساعد')} />
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
        aria-label="United Assistant | مساعد يونايتد"
        aria-expanded={open}
        title="United Assistant | مساعد يونايتد"
      >
        {open ? <X size={20} /> : <MessageCircleHeart size={20} />}
      </button>

      {open ? (
        <div className="uos-assistant-backdrop" onClick={() => setOpen(false)} aria-hidden="true" />
      ) : null}
      {open ? (
        <section
          className="uos-assistant-panel uos-glass-4 uos-safe-bottom"
          role="dialog"
          aria-modal="true"
          aria-label="United Assistant | مساعد يونايتد"
        >
          <header className="uos-assistant-head">
            <span className="uos-assistant-avatar" aria-hidden="true"><Sparkles size={16} /></span>
            <div>
              <h2><BilingualText value={bi(ASSISTANT_IDENTITY.en, ASSISTANT_IDENTITY.ar)} /></h2>
              <small>
                {online ? (
                  <BilingualText value={bi('Local guide mode', 'وضع الإرشاد المحلي')} />
                ) : (
                  <BilingualText value={bi("You're offline", 'أنت غير متصل بالإنترنت')} />
                )}
              </small>
            </div>
            <button type="button" className="uos-btn-ghost uos-touch" onClick={() => setOpen(false)} aria-label="Close assistant | إغلاق المساعد">
              <X size={17} />
            </button>
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
                    setEntries((current) => [...current, { id: ++entryId, from: 'assistant', text: action.help as { en: string; ar: string } }]);
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
                    'Ask where to find sports, programs, schedules, or sign-in — I answer from verified app information only.',
                    'اسأل عن الرياضات أو البرامج أو الجداول أو تسجيل الدخول — أجيب من معلومات التطبيق الموثقة فقط.',
                  )}
                />
              </p>
            ) : (
              entries.map((entry) => (
                <div key={entry.id} className={`uos-assistant-msg uos-assistant-msg--${entry.from}`}>
                  <p><BilingualText value={entry.text} /></p>
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
              placeholder="Ask United Assistant… | اسأل مساعد يونايتد…"
              aria-label="Ask United Assistant | اسأل مساعد يونايتد"
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
                  ? bi('Connected assistant', 'مساعد متصل')
                  : bi('AI provider not connected — deterministic local guidance.', 'موفر الذكاء الاصطناعي غير مربوط — إرشادات محلية محددة.')
              }
            />
          </p>
        </section>
      ) : null}
    </>
  );
}
