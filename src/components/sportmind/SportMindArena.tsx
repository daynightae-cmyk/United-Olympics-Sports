import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  ChevronRight,
  Filter,
  Layers,
  Maximize2,
  RefreshCw,
  Shield,
  Users,
  X,
} from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';
import { answerLocally } from '../../assistant/assistantService';
import { SportMindCore, type SportMindState } from './SportMindCore';
import { SportMindModuleRenderer, EvidenceList } from './SportMindModules';
import { SportMindComposer } from './SportMindComposer';
import type {
  SportMindEvidenceItem,
  SportMindModule,
  SportMindRequest,
  SportMindRole,
  SportMindStreamChunk,
} from '../../server/sportmind/types';

interface MessageEntry {
  id: string;
  sender: 'user' | 'sportmind';
  text?: string;
  modules?: SportMindModule[];
  evidence?: SportMindEvidenceItem[];
  timestamp: string;
}

interface SportMindArenaProps {
  initialRole?: SportMindRole;
  initialEntity?: { type: string; id: string; name: string };
  initialSport?: string;
  isStandalonePage?: boolean;
  onClose?: () => void;
}

export const SportMindArena: React.FC<SportMindArenaProps> = ({
  initialRole,
  initialEntity,
  initialSport = 'Football',
  isStandalonePage = false,
  onClose,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Detect role from route if not provided
  const derivedRole: SportMindRole = initialRole || (() => {
    if (location.pathname.startsWith('/admin')) return 'admin';
    if (location.pathname.startsWith('/coach')) return 'coach';
    if (location.pathname.startsWith('/parent')) return 'parent';
    if (location.pathname.startsWith('/player')) return 'player';
    return 'player';
  })();

  const role: SportMindRole = derivedRole;
  const [sport, setSport] = useState<string>(initialSport);
  const [entity, setEntity] = useState(initialEntity);
  const [draft, setDraft] = useState('');
  const [state, setState] = useState<SportMindState>('idle');
  const [thinkingText, setThinkingText] = useState<{ en: string; ar: string } | null>(null);
  const [messages, setMessages] = useState<MessageEntry[]>([]);
  const [activeEvidence, setActiveEvidence] = useState<SportMindEvidenceItem[]>([]);
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const timelineEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll timeline to bottom
  useEffect(() => {
    timelineEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, thinkingText]);

  // Suggestions based on role
  const getSuggestions = () => {
    switch (role) {
      case 'coach':
        return [
          { id: 'c1', label: bi('Prepare Session Plan', 'إعداد خطة الحصة'), prompt: 'Prepare today’s tactical session plan with drill progression.' },
          { id: 'c2', label: bi('Review Group Attendance', 'مراجعة حضور المجموعة'), prompt: 'Check attendance readiness for our assigned groups.' },
          { id: 'c3', label: bi('Create Skill Drill', 'ابتكار تدريب مهاري'), prompt: 'Suggest a high-intensity transition drill for our players.' },
        ];
      case 'parent':
        return [
          { id: 'p1', label: bi('Child Schedule', 'جدول الابن القادم'), prompt: 'What are the upcoming training sessions on our family calendar?' },
          { id: 'p2', label: bi('Coach Feedback', 'ملاحظات الكادر التدريبي'), prompt: 'Explain the latest coach evaluations and feedback.' },
        ];
      case 'admin':
        return [
          { id: 'a1', label: bi('Operational Overview', 'نظرة عامة على العمليات'), prompt: 'Summarize today’s operational picture and branch readiness.' },
          { id: 'a2', label: bi('Branch Status', 'جاهزية الفروع'), prompt: 'Check status and program allocations for our branches.' },
        ];
      case 'player':
      default:
        return [
          { id: 'pl1', label: bi('What’s next today?', 'ما هي الحصة القادمة؟'), prompt: 'What is my next scheduled training session?' },
          { id: 'pl2', label: bi('Training Preparation', 'الاستعداد للتدريب'), prompt: 'How should I prepare for today’s session?' },
          { id: 'pl3', label: bi('Attendance Status', 'حالة حضوري'), prompt: 'Show my attendance and session participation context.' },
        ];
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setState('idle');
    setThinkingText(null);
  };

  const handleSend = async (messageText: string) => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    // Add user message
    const userMsg: MessageEntry = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setDraft('');
    setState('thinking');
    setThinkingText({
      en: 'Analyzing sports context and session parameters…',
      ar: 'تحليل السياق الرياضي وبيانات الحصة…',
    });

    const controller = new AbortController();
    abortControllerRef.current = controller;

    const requestPayload: SportMindRequest = {
      message: trimmed,
      locale: 'en',
      currentRoute: location.pathname,
      requestedContext: entity
        ? {
            entityType: entity.type as 'player' | 'coach' | 'branch' | 'session' | 'group' | 'sport',
            entityId: entity.id,
          }
        : undefined,
    };

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('uos:auth:token') ||
            sessionStorage.getItem('uos:auth:token') ||
            localStorage.getItem('sb-access-token')
          : null;

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/v1/sportmind', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
      });

      if (!response.ok) {
        // If API endpoint is unreachable (e.g. pure static preview / offline), use deterministic local guidance
        const localAnswer = answerLocally(trimmed);
        const assistantMsg: MessageEntry = {
          id: `sm-${Date.now()}`,
          sender: 'sportmind',
          modules: [
            {
              id: `mod-${Date.now()}`,
              type: 'INSIGHT',
              title: {
                en: 'SportMind Athletic Guidance',
                ar: 'إرشادات ساحة الذكاء الرياضي',
              },
              body: {
                en: localAnswer.text.en,
                ar: localAnswer.text.ar,
              },
              actions: localAnswer.to
                ? [
                    {
                      label: { en: 'Open Section', ar: 'فتح هذا القسم' },
                      to: localAnswer.to,
                      variant: 'primary',
                    },
                  ]
                : undefined,
              confidenceLabel: {
                en: 'Deterministic Athletic Guidance',
                ar: 'إرشادات رياضية محددة معتمدة',
              },
            },
          ],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setState('complete');
        setThinkingText(null);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response body is unavailable');

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      const accumulatedModules: SportMindModule[] = [];
      const accumulatedEvidence: SportMindEvidenceItem[] = [];

      setState('streaming');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const clean = line.trim();
          if (!clean || !clean.startsWith('data: ')) continue;
          const dataStr = clean.slice(6).trim();

          try {
            const chunk = JSON.parse(dataStr) as SportMindStreamChunk;

            if (chunk.type === 'thinking' && chunk.thinkingState) {
              setThinkingText(chunk.thinkingState);
            } else if (chunk.type === 'evidence' && chunk.evidence) {
              accumulatedEvidence.push(...chunk.evidence);
              setActiveEvidence([...accumulatedEvidence]);
            } else if (chunk.type === 'module' && chunk.module) {
              accumulatedModules.push(chunk.module);
            } else if (chunk.type === 'done') {
              setState('complete');
              setThinkingText(null);
            } else if (chunk.type === 'error') {
              setState('error');
              setThinkingText(null);
            }
          } catch {
            // line parse ignore
          }
        }
      }

      // Add SportMind response message entry
      const assistantMsg: MessageEntry = {
        id: `sm-${Date.now()}`,
        sender: 'sportmind',
        modules: accumulatedModules,
        evidence: accumulatedEvidence,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setState('complete');
      setThinkingText(null);
    } catch (err: unknown) {
      if (controller.signal.aborted) return;
      console.error('SportMind stream error:', err);
      setState('error');
      setThinkingText(null);

      // Add fallback graceful error message
      const errorMsg: MessageEntry = {
        id: `err-${Date.now()}`,
        sender: 'sportmind',
        modules: [
          {
            id: 'err-mod',
            type: 'ATTENTION',
            title: {
              en: 'Service Temporarily Unavailable',
              ar: 'الخدمة غير متاحة مؤقتًا',
            },
            body: {
              en: 'The sports intelligence engine could not complete the request. Please verify your connection or try again shortly.',
              ar: 'تعذر على محرك الذكاء الرياضي إكمال الطلب. يُرجى التحقق من الاتصال بالإنترنت والمحاولة مرة أخرى.',
            },
          },
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      abortControllerRef.current = null;
    }
  };

  const contextPills = [
    { id: 'role', label: { en: `Role: ${role.toUpperCase()}`, ar: `الدور: ${role === 'admin' ? 'الإدارة' : role === 'coach' ? 'المدرب' : role === 'player' ? 'الرياضي' : 'ولي الأمر'}` } },
    { id: 'sport', label: { en: `Sport: ${sport}`, ar: `الرياضة: ${sport}` } },
    ...(entity ? [{ id: 'entity', label: { en: entity.name, ar: entity.name }, onRemove: () => setEntity(undefined) }] : []),
  ];

  return (
    <div className={`sportmind-arena-layout ${isStandalonePage ? 'sportmind-arena-layout--standalone' : ''}`}>
      {/* Dynamic Sports Court / Field Linework Backdrop */}
      <div className="sportmind-field-backdrop" aria-hidden="true">
        <div className="sportmind-field-grid" />
        <div className="sportmind-field-center-circle" />
        <div className="sportmind-field-lanes" />
      </div>

      {/* Top Mobile Bar (for <=768px viewports) */}
      <div className="sportmind-mobile-bar">
        <div className="sportmind-mobile-title">
          <SportMindCore state={state} size={32} sport={sport} />
          <div>
            <h2><BilingualText value={bi('UOS SPORTMIND', 'ساحة الذكاء الرياضي')} /></h2>
            <small><BilingualText value={bi(`Role: ${role.toUpperCase()}`, `الدور: ${role}`)} /></small>
          </div>
        </div>
        <div className="sportmind-mobile-actions">
          <button
            type="button"
            className="uos-btn-ghost uos-touch"
            onClick={() => setShowMobileDrawer(!showMobileDrawer)}
            aria-label="Toggle Insights | عرض التحليلات"
          >
            <Layers size={18} />
          </button>
          {onClose && (
            <button
              type="button"
              className="uos-btn-ghost uos-touch"
              onClick={onClose}
              aria-label="Close Arena | إغلاق الساحة"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="sportmind-arena-body">
        {/* RAIL 1: CONTEXT RAIL (Desktop) */}
        <aside className="sportmind-rail sportmind-rail--context">
          <div className="sportmind-rail-header">
            <Filter size={15} className="sportmind-gold-icon" />
            <h3><BilingualText value={bi('CONTEXT RAIL', 'سياق التدريب')} /></h3>
          </div>

          <div className="sportmind-rail-section">
            <span className="sportmind-rail-label"><BilingualText value={bi('AUTHORIZED ROLE', 'الدور المصرح به')} /></span>
            <div className="sportmind-role-badge">
              <Shield size={13} className="sportmind-gold-icon" />
              <span>{role.toUpperCase()}</span>
            </div>
          </div>

          <div className="sportmind-rail-section">
            <span className="sportmind-rail-label"><BilingualText value={bi('DISCIPLINE / SPORT', 'الرياضة المعتمدة')} /></span>
            <div className="sportmind-sport-selector">
              {['Football', 'Swimming', 'Basketball', 'Athletics'].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`sportmind-sport-btn ${sport === s ? 'sportmind-sport-btn--active' : ''}`}
                  onClick={() => setSport(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {entity && (
            <div className="sportmind-rail-section">
              <span className="sportmind-rail-label"><BilingualText value={bi('ACTIVE RECORD', 'السجل النشط')} /></span>
              <div className="sportmind-entity-card uos-glass-2">
                <Users size={14} className="sportmind-gold-icon" />
                <div>
                  <strong>{entity.name}</strong>
                  <small>{entity.type}</small>
                </div>
              </div>
            </div>
          )}

          <div className="sportmind-rail-section">
            <span className="sportmind-rail-label"><BilingualText value={bi('QUICK NAVIGATION', 'تنقل سريع')} /></span>
            <div className="sportmind-quick-nav">
              <button
                type="button"
                className="sportmind-nav-link"
                onClick={() => navigate(`/${role}/schedule`)}
              >
                <span><BilingualText value={bi('Schedule Calendar', 'الجدول الزمني')} /></span>
                <ChevronRight size={12} />
              </button>
              <button
                type="button"
                className="sportmind-nav-link"
                onClick={() => navigate(`/${role}/feedback`)}
              >
                <span><BilingualText value={bi('Evaluations & Feedback', 'التقييمات والملاحظات')} /></span>
                <ChevronRight size={12} />
              </button>
            </div>
          </div>
        </aside>

        {/* RAIL 2: CENTRAL INTELLIGENCE ARENA */}
        <main className="sportmind-arena-center">
          {/* Arena Top Header */}
          <div className="sportmind-arena-header">
            <div className="sportmind-arena-brand">
              <SportMindCore state={state} size={48} sport={sport} />
              <div>
                <h1><BilingualText value={bi('UNITED SPORTS INTELLIGENCE ARENA', 'ساحة الذكاء الرياضي الموحدة')} /></h1>
                <p>
                  <BilingualText
                    value={bi(
                      'Role-aware performance analysis & tactical curriculum guidance.',
                      'تحليل أداء وتوجيه تدريبي تكتيكي مصرح به بحسب الدور.',
                    )}
                  />
                </p>
              </div>
            </div>

            <div className="sportmind-header-controls">
              {!isStandalonePage && (
                <button
                  type="button"
                  className="uos-btn-ghost uos-touch"
                  onClick={() => navigate('/assistant')}
                  title="Expand to Fullscreen Arena | توسيع الساحة"
                >
                  <Maximize2 size={16} />
                </button>
              )}
              {isStandalonePage && (
                <button
                  type="button"
                  className="uos-btn-ghost uos-touch"
                  onClick={() => navigate(-1)}
                  title="Back to Portal | العودة للبوابة"
                >
                  <ArrowLeft size={16} />
                </button>
              )}
              {onClose && !isStandalonePage && (
                <button
                  type="button"
                  className="uos-btn-ghost uos-touch"
                  onClick={onClose}
                  title="Close Assistant | إغلاق"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Timeline Messages & Modules */}
          <div className="sportmind-timeline" aria-live="polite">
            {messages.length === 0 && (
              <div className="sportmind-welcome-hero">
                <SportMindCore state={state} size={110} sport={sport} />
                <h2><BilingualText value={bi('Welcome to SportMind Arena', 'أهلاً بك في ساحة الذكاء الرياضي')} /></h2>
                <p>
                  <BilingualText
                    value={bi(
                      'Ask about your training schedule, drills, performance progressions, or operational readiness. Guidance is generated strictly from authorized records.',
                      'اسأل عن جدول تدريباتك، الخطط التكتيكية، تصعيد الأداء، أو الجاهزية التشغيلية. جميع الإرشادات مبنية بدقة على السجلات المعتمدة.',
                    )}
                  />
                </p>
              </div>
            )}

            {messages.map((entry) => (
              <div
                key={entry.id}
                className={`sportmind-message sportmind-message--${entry.sender}`}
              >
                {entry.text && (
                  <div className="sportmind-message-bubble">
                    <p>{entry.text}</p>
                    <span className="sportmind-message-time">{entry.timestamp}</span>
                  </div>
                )}

                {entry.modules && entry.modules.length > 0 && (
                  <div className="sportmind-modules-stack">
                    {entry.modules.map((mod) => (
                      <SportMindModuleRenderer key={mod.id} module={mod} />
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Thinking / Status Indicator */}
            {thinkingText && (
              <div className="sportmind-thinking-bar uos-glass-2">
                <RefreshCw size={14} className="sportmind-spin-icon" />
                <span><BilingualText value={bi(thinkingText.en, thinkingText.ar)} /></span>
              </div>
            )}

            <div ref={timelineEndRef} />
          </div>

          {/* Bottom Composer */}
          <SportMindComposer
            value={draft}
            onChange={setDraft}
            onSubmit={handleSend}
            onStop={stopGeneration}
            isStreaming={state === 'streaming' || state === 'thinking'}
            role={role}
            contextPills={contextPills}
            suggestions={getSuggestions()}
          />
        </main>

        {/* RAIL 3: INSIGHT & EVIDENCE RAIL (Desktop) */}
        <aside
          className={`sportmind-rail sportmind-rail--insight ${
            showMobileDrawer ? 'sportmind-rail--mobile-open' : ''
          }`}
        >
          <div className="sportmind-rail-header">
            <Activity size={15} className="sportmind-gold-icon" />
            <h3><BilingualText value={bi('INSIGHT & EVIDENCE', 'المصادر والتحليلات')} /></h3>
            {showMobileDrawer && (
              <button
                type="button"
                className="uos-btn-ghost uos-touch sportmind-drawer-close"
                onClick={() => setShowMobileDrawer(false)}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Evidence List */}
          <EvidenceList
            items={
              activeEvidence.length > 0
                ? activeEvidence
                : [
                    {
                      type: 'system',
                      description: {
                        en: `Session secured under ${role.toUpperCase()} authority`,
                        ar: `جلسة مؤمنة وفق صلاحيات ${role}`,
                      },
                    },
                  ]
            }
          />

          {/* Data Integrity & Medical Boundary Card */}
          <div className="sportmind-integrity-card uos-glass-2">
            <Shield size={14} className="sportmind-gold-icon" />
            <div>
              <strong><BilingualText value={bi('Zero Invented Data', 'لا بيانات مختلقة')} /></strong>
              <p>
                <BilingualText
                  value={bi(
                    'SportMind operates strictly from verified records. It does not provide medical diagnoses or invent attendance.',
                    'تعمل ساحة الذكاء الرياضي وفق السجلات الموثقة فقط، ولا تقدم تشخيصات طبية أو تخترع بيانات حضور.',
                  )}
                />
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
