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
  shouldSuppressAssistant,
} from './assistantService';
import { SportMindCore } from '../components/sportmind/SportMindCore';
import { SportMindArenaReveal } from '../components/sportmind/SportMindArenaReveal';
import { SportMindModuleRenderer } from '../components/sportmind/SportMindModules';
import type { SportMindModule } from '../server/sportmind/types';

export const SPORTMIND_SEEN_KEY = 'uos:sportmind-intro-seen';
export const SPORTMIND_DISMISSED_KEY = 'uos:sportmind-intro-dismissed';
const LEGACY_DISMISS_KEY = 'uos:assistant-dismissed';

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
  const isSuppressed = shouldSuppressAssistant(location.pathname);
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
    if (open || isSuppressed) return;
    const isDismissed = (() => {
      try {
        return (
          window.sessionStorage.getItem(SPORTMIND_DISMISSED_KEY) === '1' ||
          window.sessionStorage.getItem(LEGACY_DISMISS_KEY) === '1'
        );
      } catch {
        return false;
      }
    })();
    if (isDismissed) return;

    const isSeen = (() => {
      try {
        return window.sessionStorage.getItem(SPORTMIND_SEEN_KEY) === '1';
      } catch {
        return false;
      }
    })();
    if (isSeen) return;

    // Splash-safe timing:
    // Wait until OlympicLuxurySplash is complete/dismissed before starting the reveal timer.
    // If the route changes or becomes suppressed before the timer fires, cancel the pending timer.
    let timer: number | null = null;
    let splashCheckInterval: number | null = null;

    const checkSplashAndStartTimer = () => {
      const splashSeen = (() => {
        try {
          return (
            window.sessionStorage.getItem('uos:luxury-splash-seen') === 'true' ||
            window.sessionStorage.getItem('uos:splash-seen') === 'true'
          );
        } catch {
          return true;
        }
      })();

      const splashInDom =
        typeof document !== 'undefined' &&
        Boolean(document.getElementById('olympic-luxury-splash-root'));

      if (splashSeen && !splashInDom) {
        if (splashCheckInterval) {
          window.clearInterval(splashCheckInterval);
          splashCheckInterval = null;
        }
        timer = window.setTimeout(() => {
          setInvited(true);
        }, 2600);
      }
    };

    checkSplashAndStartTimer();

    if (!timer) {
      splashCheckInterval = window.setInterval(checkSplashAndStartTimer, 200);
    }

    return () => {
      if (timer) window.clearTimeout(timer);
      if (splashCheckInterval) window.clearInterval(splashCheckInterval);
    };
  }, [open, isSuppressed, location.pathname]);

  useEffect(() => {
    if (open) composerRef.current?.focus();
  }, [open]);

  useEffect(() => {
    if (!open && !invited) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (open) {
          setOpen(false);
        } else if (invited) {
          dismissInvitation();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, invited]);

  if (isSuppressed) return null;

  const handleAutoCollapse = () => {
    setInvited(false);
    try {
      window.sessionStorage.setItem(SPORTMIND_SEEN_KEY, '1');
    } catch {
      /* session storage unavailable */
    }
  };

  const dismissInvitation = () => {
    setInvited(false);
    try {
      window.sessionStorage.setItem(SPORTMIND_SEEN_KEY, '1');
      window.sessionStorage.setItem(SPORTMIND_DISMISSED_KEY, '1');
      window.sessionStorage.setItem(LEGACY_DISMISS_KEY, '1');
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
    dismissInvitation();
    setOpen(true);
  };

  const autoCollapseMs =
    typeof window !== 'undefined' &&
    typeof (window as unknown as { __UOS_SPORTMIND_AUTO_COLLAPSE_MS__?: number }).__UOS_SPORTMIND_AUTO_COLLAPSE_MS__ === 'number'
      ? (window as unknown as { __UOS_SPORTMIND_AUTO_COLLAPSE_MS__?: number }).__UOS_SPORTMIND_AUTO_COLLAPSE_MS__!
      : 10000;

  return (
    <>
      {invited && !open ? (
        <SportMindArenaReveal
          onOpenArena={() => {
            handleAutoCollapse();
            navigate('/assistant');
          }}
          onAskSportMind={() => {
            handleAutoCollapse();
            setOpen(true);
          }}
          onDismiss={dismissInvitation}
          onAutoCollapse={handleAutoCollapse}
          autoCollapseMs={autoCollapseMs}
        />
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
