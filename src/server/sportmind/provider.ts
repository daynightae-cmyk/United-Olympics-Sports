import type {
  CoachBoardData,
  SportMindAction,
  SportMindHydratedContext,
  SportMindModule,
  SportMindRequest,
  SportMindStreamChunk,
} from './types.js';

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface SportsAiProvider {
  readonly name: string;
  isConfigured(): boolean;
  generateStream(
    context: SportMindHydratedContext,
    request: SportMindRequest,
    signal?: AbortSignal,
  ): AsyncIterable<SportMindStreamChunk>;
}

// ---------------------------------------------------------------------------
// Protocol type — explicit authority, no silent inference
// ---------------------------------------------------------------------------

export type OpenCodeProtocol = 'chat_completions' | 'responses';

export function isValidOpenCodeProtocol(val: unknown): val is OpenCodeProtocol {
  return val === 'chat_completions' || val === 'responses';
}

// ---------------------------------------------------------------------------
// Internal SSE helpers
// ---------------------------------------------------------------------------

/**
 * Parse a raw SSE buffer into discrete events.
 * Handles:
 * - standard LF framing (\n\n)
 * - CRLF framing (\r\n\r\n)
 * - mixed line endings
 * - fragmented TCP chunks
 * - multiple events per read
 * - split events across reads
 *
 * Returns: [parsedEvents, remainingBuffer]
 */
export function parseSseBuffer(buffer: string): [string[], string] {
  const events: string[] = [];

  while (true) {
    const match = buffer.match(/\r?\n\r?\n/);
    if (!match || match.index === undefined) {
      break;
    }

    const idx = match.index;
    const delimiterLength = match[0].length;
    const block = buffer.slice(0, idx);
    buffer = buffer.slice(idx + delimiterLength);

    const dataLines: string[] = [];
    for (const line of block.split(/\r?\n/)) {
      const trimmed = line.trimStart();
      if (trimmed.startsWith('data: ')) {
        dataLines.push(trimmed.slice(6));
      } else if (trimmed.startsWith('data:')) {
        dataLines.push(trimmed.slice(5));
      }
    }
    if (dataLines.length > 0) {
      events.push(dataLines.join('\n'));
    }
  }

  return [events, buffer];
}

/**
 * Extract text delta from a Chat Completions SSE JSON payload.
 */
export function extractChatCompletionsDelta(json: unknown): string | null {
  if (
    typeof json === 'object' &&
    json !== null &&
    'choices' in json &&
    Array.isArray((json as Record<string, unknown>).choices)
  ) {
    const choices = (json as { choices: Array<{ delta?: { content?: string } }> }).choices;
    const content = choices[0]?.delta?.content;
    if (typeof content === 'string') return content;
  }
  return null;
}

/**
 * Extract text delta from a Responses SSE JSON payload.
 * Handles response.output_text.delta events and content_part.delta.
 */
export function extractResponsesDelta(json: unknown): string | null {
  if (typeof json !== 'object' || json === null) return null;
  const obj = json as Record<string, unknown>;

  if (obj.type === 'response.output_text.delta' && typeof obj.delta === 'string') {
    return obj.delta;
  }

  if (obj.type === 'response.content_part.delta') {
    const part = obj.part as Record<string, unknown> | undefined;
    if (part && typeof part.text === 'string') return part.text;
  }

  return null;
}

/**
 * Classify an HTTP status code into a user-safe error code.
 */
export function classifyHttpError(
  status: number,
): { code: string; message: string; isFatal: boolean } {
  switch (status) {
    case 401:
      return {
        code: 'PROVIDER_AUTH_FAILED',
        message: 'Intelligence provider authentication failed.',
        isFatal: true,
      };
    case 403:
      return {
        code: 'PROVIDER_FORBIDDEN',
        message: 'Intelligence provider access denied.',
        isFatal: true,
      };
    case 404:
      return {
        code: 'PROVIDER_NOT_FOUND',
        message: 'Intelligence provider endpoint not found.',
        isFatal: true,
      };
    case 408:
      return {
        code: 'PROVIDER_TIMEOUT',
        message: 'Intelligence provider request timed out.',
        isFatal: false,
      };
    case 429:
      return {
        code: 'PROVIDER_RATE_LIMITED',
        message: 'Intelligence provider rate limit exceeded. Please try again shortly.',
        isFatal: false,
      };
    default:
      if (status >= 500) {
        return {
          code: 'PROVIDER_SERVER_ERROR',
          message: 'Intelligence provider encountered a server error.',
          isFatal: false,
        };
      }
      return {
        code: 'PROVIDER_ERROR',
        message: `Intelligence provider returned HTTP ${status}.`,
        isFatal: false,
      };
  }
}

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

const MEDICAL_DISCLAIMER_MODULE: SportMindModule = {
  id: 'med-boundary',
  type: 'ATTENTION',
  title: {
    en: 'Medical & Health Safety Notice',
    ar: 'تنبيه السلامة الطبية والصحية',
  },
  body: {
    en: 'SportMind provides athletic education and training planning only. It does not diagnose injuries or medical conditions. If an athlete experiences persistent pain, swelling, or suspected concussion, immediately suspend training and seek professional medical evaluation.',
    ar: 'يقدم ساحة الذكاء الرياضي إرشادات تدريبية وتعليمية رياضية فقط، ولا يقدم تشخيصًا طبيًا للإصابات. إذا كان الرياضي يعاني من ألم مستمر، تورم، أو اشتباه ارتجاج، يُرجى إيقاف التدريب فورًا ومراجعة طبيب رياضي مختص.',
  },
  actions: [
    {
      label: { en: 'Record Incident in Portal', ar: 'تسجيل تقرير إصابة في البوابة' },
      to: '/player/feedback',
      variant: 'accent',
    },
  ],
  confidenceLabel: {
    en: 'General Health Safety Guidance',
    ar: 'إرشادات السلامة الصحية العامة',
  },
};

function getSportsSpecificCoachBoard(sport = 'Football'): CoachBoardData {
  const normalized = sport.toLowerCase();
  if (normalized.includes('swim')) {
    return {
      objective: {
        en: 'Refine catch phase and streamline velocity under threshold fatigue',
        ar: 'تحسين مرحلة الإمساك بالماء وسرعة الانسياب تحت ضغط الجهد اللاهوائي',
      },
      warmUp: {
        title: { en: '400m Choice Aerobic + 4x50m Sculling Drills', ar: '400م إحماء هوائي متنوع + 4×50م تمارين التجديف بالكفين' },
        durationMinutes: 12,
        notes: { en: 'Focus on high elbow catch and continuous head alignment', ar: 'التركيز على المرفق المرتفع ومحاذاة الرأس المستمرة' },
      },
      mainDrill: {
        title: { en: '8x100m Freestyle at Race Pace (Pace -2s on 4th & 8th)', ar: '8×100م سباحة حرة بسرعة السباق (تسريع ثانيتين في الرابعة والثامنة)' },
        durationMinutes: 25,
        description: {
          en: 'Sets on 1:40 cycle. Maintain stroke count within 36-38 per 50m. Measure split times.',
          ar: 'انطلاق كل 1:40 دقيقة. الحفاظ على عدد الضربات بين 36-38 ضربة لكل 50م مع قياس الأزمنة الجزئية.',
        },
        progression: {
          en: 'Reduce rest interval by 5 seconds if stroke rate remains stable.',
          ar: 'تقليل فترة الراحة بمقدار 5 ثوانٍ إذا ظل معدل الضربات مستقرًا.',
        },
      },
      coolDown: {
        title: { en: '200m Easy Backstroke / Double-arm recovery', ar: '200م سباحة ظهر هادئة للاستشفاء والتهدئة' },
        durationMinutes: 8,
      },
      coachNotes: {
        en: 'Observe bilateral breathing balance and streamline exit off each turn.',
        ar: 'مراقبة توازن التنفس على الجانبين والانسياب السليم بعد الدوران.',
      },
    };
  }

  if (normalized.includes('basket')) {
    return {
      objective: {
        en: 'Rapid offensive transition and spacing against zone traps',
        ar: 'التحول الهجومي السريع وتوسيع المساحات ضد دفاع المنطقة الضاغط',
      },
      warmUp: {
        title: { en: 'Dynamic footwork, close-outs, and 3-man weave to rim', ar: 'حركات قدمين ديناميكية مع تدريب الاندفاع والتمرير الثلاثي السريع' },
        durationMinutes: 10,
      },
      mainDrill: {
        title: { en: '4v3 Overload Transition into 4v4 Secondary Break', ar: 'تحول هجومي 4 ضد 3 ثم استكمال هجومي 4 ضد 4' },
        durationMinutes: 25,
        description: {
          en: 'Offense must execute 2 reversals within 7 seconds before attacking the key.',
          ar: 'يجب على الهجوم تدوير الكرة مرتين خلال 7 ثوانٍ قبل مهاجمة المنطقة المحرمة.',
        },
        progression: {
          en: 'Add trailing defender to convert into full 5v5 transition.',
          ar: 'إضافة مدافع متأخر لتحويل التدريب إلى هجمة كاملة 5 ضد 5.',
        },
      },
      coolDown: {
        title: { en: 'Free-throw focus under simulated heart rate + stretch', ar: 'رميات حرة بتركيز مع نبض مرتفع + إطالات عضلية' },
        durationMinutes: 10,
      },
      coachNotes: {
        en: 'Demand vocal communication on help-side rotations.',
        ar: 'التأكيد على التواصل الصوتي والتوجيه في تغطية جانب المساعدة.',
      },
    };
  }

  // Default: Football / Multi-Sport
  return {
    objective: {
      en: 'Controlled build-up play and press evasion under spatial restriction',
      ar: 'بناء اللعب المنظم وتجاوز الضغط العالي في المساحات الضيقة',
    },
    warmUp: {
      title: { en: 'Rondo 4v2 with progressive two-touch restriction', ar: 'روندو 4 ضد 2 مع قيد اللمس السريع ولمستين كحد أقصى' },
      durationMinutes: 10,
      notes: { en: 'Body orientation open to both passing lanes prior to receiving', ar: 'وضعية الجسد مفتوحة لكلا مساري التمرير قبل استلام الكرة' },
    },
    mainDrill: {
      title: { en: 'Position Game 6v6 + 3 Neutrals in Central Grid', ar: 'لعبة تمركز 6 ضد 6 مع 3 لاعبين محايدين في المنطقة المتوسطة' },
      durationMinutes: 25,
      description: {
        en: 'Maintain possession through central midfield pivot; 5 consecutive passes earn forward penetration trigger.',
        ar: 'الاستحواذ عبر محور خط الوسط؛ 5 تمريرات متتالية تتيح التمرير العمودي لخط الهجوم.',
      },
      progression: {
        en: 'Introduce 10-second shot clock upon entering attacking third.',
        ar: 'تطبيق عداد زمني مدته 10 ثوانٍ للتسديد فور دخول الثلث الهجومي.',
      },
    },
    coolDown: {
      title: { en: 'Active low-intensity jogging, passing circles & mobility flow', ar: 'جري خفيف منخفض الشدة مع تمريرات دائرية وتمارين مرونة' },
      durationMinutes: 10,
    },
    coachNotes: {
      en: 'Praise anticipation over reaction; insist on scanning before first touch.',
      ar: 'الإشادة بتوقع مسار اللعب قبل رد الفعل، والتأكيد على المسح البصري قبل أول لمسة.',
    },
  };
}

// ---------------------------------------------------------------------------
// DeterministicSportsProvider — unchanged safe fallback
// ---------------------------------------------------------------------------

export class DeterministicSportsProvider implements SportsAiProvider {
  readonly name = 'DeterministicSportsProvider';

  isConfigured(): boolean {
    return true;
  }

  async *generateStream(
    context: SportMindHydratedContext,
    request: SportMindRequest,
    signal?: AbortSignal,
  ): AsyncIterable<SportMindStreamChunk> {
    if (signal?.aborted) return;

    // 1. Thinking step
    yield {
      type: 'thinking',
      thinkingState: {
        en: 'Analyzing authorized sports context and session parameters...',
        ar: 'تحليل السياق الرياضي المصرح به وبيانات الحصص...',
      },
    };

    // 2. Evidence
    yield {
      type: 'evidence',
      evidence: context.evidence,
    };

    // 3. Medical boundary check
    if (context.isMedicalInquiry) {
      yield {
        type: 'module',
        module: MEDICAL_DISCLAIMER_MODULE,
      };
      yield { type: 'done' };
      return;
    }

    // 4. Role-specific intelligence modules
    const { role, entity, recordsSummary, sport } = context;

    if (role === 'coach') {
      const coachBoard = getSportsSpecificCoachBoard(sport || 'Football');
      const coachBoardModule: SportMindModule = {
        id: 'cb-1',
        type: 'COACH_BOARD',
        title: {
          en: 'Coach Board: Tactical Session Plan',
          ar: 'لوحة المدرب: خطة الحصة التكتيكية',
        },
        coachBoard,
        actions: [
          {
            label: { en: 'Open Coach Schedule', ar: 'فتح جدول المدرب' },
            to: '/coach/schedule',
            variant: 'primary',
          },
          {
            label: { en: 'Record Attendance', ar: 'تسجيل الحضور' },
            to: '/coach/attendance',
            variant: 'secondary',
          },
        ],
        confidenceLabel: {
          en: 'Suggested Session Plan',
          ar: 'خطة حصة مقترحة',
        },
      };

      yield {
        type: 'module',
        module: coachBoardModule,
      };

      const sessionStatsModule: SportMindModule = {
        id: 'ins-coach-1',
        type: 'INSIGHT',
        title: {
          en: 'Session Preparation Guidance',
          ar: 'إرشادات الاستعداد للحصة',
        },
        body: {
          en: `Ensure training equipment is inspected at ${context.branchName || 'the assigned branch'} prior to athlete arrival. Monitor hydration and warm-up intensity.`,
          ar: `تأكد من فحص أدوات التدريب في ${context.branchName || 'الفرع المخصص'} قبل وصول الرياضيين. راقب مستوى شرب السوائل وشدة الإحماء.`,
        },
      };

      yield {
        type: 'module',
        module: sessionStatsModule,
      };
    } else if (role === 'player') {
      const actions: SportMindAction[] = [
        {
          label: { en: 'View Full Schedule', ar: 'عرض الجدول الكامل' },
          to: '/player/schedule',
          variant: 'primary',
        },
        {
          label: { en: 'Review Coach Feedback', ar: 'مراجعة ملاحظات المدرب' },
          to: '/player/feedback',
          variant: 'secondary',
        },
      ];

      const playerSummaryModule: SportMindModule = {
        id: 'ins-player-1',
        type: 'INSIGHT',
        title: {
          en: 'Athlete Path: Current Preparation',
          ar: 'مسار الرياضي: الاستعداد الحالي',
        },
        body: {
          en: recordsSummary.upcomingSessions > 0
            ? `You have ${recordsSummary.upcomingSessions} upcoming training sessions scheduled. Arrive 15 minutes before drill commencement for dynamic mobility.`
            : 'No upcoming sessions are currently scheduled on your calendar. Check with your coach or view the sports programs for schedule updates.',
          ar: recordsSummary.upcomingSessions > 0
            ? `لديك ${recordsSummary.upcomingSessions} حصص تدريبية مجدولة قادمة. احرص على الحضور قبل 15 دقيقة لبدء الإحماء الحركي.`
            : 'لا توجد حصص قادمة مجدولة في جدولك حاليًا. يرجى مراجعة المدرب أو الاطلاع على البرامج الرياضية لمعرفة المواعيد.',
        },
        actions,
        confidenceLabel: {
          en: 'Based on Available Portal Records',
          ar: 'بناءً على سجلات البوابة المتاحة',
        },
      };

      yield {
        type: 'module',
        module: playerSummaryModule,
      };

      if (recordsSummary.attendanceRecords === 0) {
        yield {
          type: 'module',
          module: {
            id: 'needs-data-att',
            type: 'NEEDS_DATA',
            title: {
              en: 'Attendance Records Notice',
              ar: 'تنبيه سجلات الحضور',
            },
            body: {
              en: 'No attendance records are available for this period. Attendance will reflect automatically once confirmed by your coach after each completed session.',
              ar: 'لا توجد سجلات حضور متاحة لهذه الفترة. سيتم تحديث الحضور تلقائيًا فور اعتماده من المدرب بعد انتهاء كل حصة.',
            },
          },
        };
      }
    } else if (role === 'parent') {
      const parentModule: SportMindModule = {
        id: 'ins-parent-1',
        type: 'INSIGHT',
        title: {
          en: 'Child Journey Overview',
          ar: 'نظرة عامة على مسيرة الابن الرياضية',
        },
        body: {
          en: entity
            ? `Tracking progress for ${entity.name}. ${recordsSummary.upcomingSessions} upcoming sessions are confirmed on the family calendar.`
            : 'Select a child profile in the Parent Portal to view targeted session schedules, coach evaluations, and attendance tracking.',
          ar: entity
            ? `متابعة تقدم ${entity.name}. هناك ${recordsSummary.upcomingSessions} حصص قادمة مؤكدة في جدول الأسرة.`
            : 'اختر ملف الابن من بوابة أولياء الأمور للاطلاع على جدول الحصص المخصص وتقييمات المدرب وسجلات الحضور.',
        },
        actions: [
          {
            label: { en: 'Family Schedule', ar: 'جدول الأسرة' },
            to: '/parent/schedule',
            variant: 'primary',
          },
          {
            label: { en: 'Coach Feedback', ar: 'ملاحظات المدربين' },
            to: '/parent/feedback',
            variant: 'secondary',
          },
        ],
        confidenceLabel: {
          en: 'Authorized Portal Context',
          ar: 'سياق البوابة المصرح به',
        },
      };

      yield {
        type: 'module',
        module: parentModule,
      };
    } else {
      // Admin / Operations
      const adminModule: SportMindModule = {
        id: 'ins-admin-1',
        type: 'INSIGHT',
        title: {
          en: 'Operational Status & Readiness',
          ar: 'الحالة التشغيلية والجاهزية',
        },
        body: {
          en: `Operational oversight active for ${context.branchName || 'United Olympics Sports branches'}. Branch rosters and session allocations are verified through secure system controls.`,
          ar: `المتابعة التشغيلية نشطة لـ ${context.branchName || 'فروع يونايتد أوليمبيكس سبورت'}. يتم التحقق من قوائم الفروع والحصص عبر ضوابط النظام المعتمدة.`,
        },
        actions: [
          {
            label: { en: 'Branch Directory', ar: 'دليل الفروع' },
            to: '/admin/branches',
            variant: 'primary',
          },
          {
            label: { en: 'Session Management', ar: 'إدارة الحصص' },
            to: '/admin/sessions',
            variant: 'secondary',
          },
        ],
        confidenceLabel: {
          en: 'Authorized Portal Context',
          ar: 'سياق البوابة المصرح به',
        },
      };

      yield {
        type: 'module',
        module: adminModule,
      };
    }

    yield { type: 'done' };
  }
}

// ---------------------------------------------------------------------------
// OpenCodeProvider — protocol-aware, hardened SSE streaming
// ---------------------------------------------------------------------------

export interface OpenCodeProviderOptions {
  apiKey?: string;
  baseUrl?: string;
  model?: string;
  protocol?: string;
  timeoutMs?: number;
}

export class OpenCodeProvider implements SportsAiProvider {
  readonly name = 'OpenCodeProvider';

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly protocol: OpenCodeProtocol | null;
  private readonly timeoutMs: number;

  constructor(opts?: OpenCodeProviderOptions) {
    this.apiKey = opts?.apiKey ?? (process.env.OPENCODE_API_KEY || '');
    this.baseUrl = (opts?.baseUrl ?? (process.env.OPENCODE_BASE_URL || 'https://opencode.ai/zen/v1')).replace(/\/+$/, '');
    this.model = opts?.model ?? (process.env.OPENCODE_MODEL || '');
    const rawProtocol = opts?.protocol ?? process.env.OPENCODE_PROTOCOL;
    this.protocol = isValidOpenCodeProtocol(rawProtocol) ? rawProtocol : null;
    this.timeoutMs = opts?.timeoutMs ?? (process.env.OPENCODE_TIMEOUT_MS ? parseInt(process.env.OPENCODE_TIMEOUT_MS, 10) : 30_000);
  }

  /**
   * Provider readiness requires ALL necessary configuration:
   * 1. Non-empty API key
   * 2. Non-empty Model (missing model MUST mean unconfigured)
   * 3. Explicitly valid Protocol ('chat_completions' | 'responses')
   */
  isConfigured(): boolean {
    return Boolean(
      this.apiKey.trim() &&
      this.model.trim() &&
      this.protocol !== null
    );
  }

  /** Build the correct endpoint URL based on protocol, avoiding double paths. */
  getEndpointUrl(): string {
    const base = this.baseUrl;
    if (this.protocol === 'responses') {
      return base.endsWith('/responses') ? base : `${base}/responses`;
    }
    return base.endsWith('/chat/completions') ? base : `${base}/chat/completions`;
  }

  /** Build the request body appropriate for the configured protocol. */
  private buildRequestBody(systemPrompt: string, userMessage: string): string {
    if (this.protocol === 'responses') {
      return JSON.stringify({
        model: this.model,
        input: [
          { role: 'developer', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        stream: true,
      });
    }

    // chat_completions
    return JSON.stringify({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      stream: true,
      temperature: 0.3,
    });
  }

  async *generateStream(
    context: SportMindHydratedContext,
    request: SportMindRequest,
    signal?: AbortSignal,
  ): AsyncIterable<SportMindStreamChunk> {
    if (!this.isConfigured()) {
      const fallback = new DeterministicSportsProvider();
      yield* fallback.generateStream(context, request, signal);
      return;
    }

    if (signal?.aborted) return;

    yield {
      type: 'thinking',
      thinkingState: {
        en: 'Connecting to sports intelligence engine...',
        ar: 'الاتصال بمحرك الذكاء الرياضي...',
      },
    };

    yield {
      type: 'evidence',
      evidence: context.evidence,
    };

    if (context.isMedicalInquiry) {
      yield {
        type: 'module',
        module: MEDICAL_DISCLAIMER_MODULE,
      };
      yield { type: 'done' };
      return;
    }

    const systemPrompt = `You are UOS SPORTMIND, the elite sports intelligence engine of United Olympics Sports (يونايتد أوليمبيكس سبورت).
Your role is to provide world-class, professional athletic guidance, training drill progressions, and operational clarity.

STRICT CONSTRAINTS:
1. NEVER invent or hallucinate athletes, scores, attendance, payments, or medical conditions.
2. If data is not present in the verified context, state clearly that it is unavailable.
3. Treat all user questions respectfully in both English and Arabic as requested.
4. If a question involves injury, bleeding, severe pain, or concussion, immediately advise consulting a qualified physician.
5. Provide structured, actionable sports guidance (Session Objectives, Warm-up, Main Drill, Progression, Cool-down, Coach Notes).

Current Authorized Context:
Role: ${context.role}
Sport: ${context.sport || 'Multi-Sport'}
Branch: ${context.branchName || 'Not specified'}
Active Entity: ${context.entity ? `${context.entity.type}: ${context.entity.name}` : 'None'}
Upcoming Sessions: ${context.recordsSummary.upcomingSessions}
Attendance Records: ${context.recordsSummary.attendanceRecords}`;

    const extractDelta =
      this.protocol === 'responses' ? extractResponsesDelta : extractChatCompletionsDelta;

    // Real server-side timeout mechanism composing safely with caller signal
    const timeoutController = new AbortController();
    let timeoutFired = false;
    const timeoutId = setTimeout(() => {
      timeoutFired = true;
      timeoutController.abort(new Error('PROVIDER_TIMEOUT'));
    }, this.timeoutMs);

    const combinedSignal = signal
      ? AbortSignal.any([signal, timeoutController.signal])
      : timeoutController.signal;

    try {
      const endpoint = this.getEndpointUrl();
      const body = this.buildRequestBody(systemPrompt, request.message);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body,
        signal: combinedSignal,
      });

      if (!response.ok || !response.body) {
        const classified = classifyHttpError(response.status);
        console.warn(
          `OpenCode API (${this.protocol}) responded with HTTP ${response.status} [${classified.code}]. Falling back to deterministic.`,
        );
        const fallback = new DeterministicSportsProvider();
        yield* fallback.generateStream(context, request, signal);
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      let fullText = '';

      while (true) {
        if (signal?.aborted) return;
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const [events, remaining] = parseSseBuffer(buffer);
        buffer = remaining;

        for (const eventData of events) {
          const trimmed = eventData.trim();
          if (trimmed === '[DONE]') continue;
          if (!trimmed) continue;

          try {
            const parsed = JSON.parse(trimmed);
            const delta = extractDelta(parsed);
            if (delta) {
              fullText += delta;
              yield { type: 'delta', delta };
            }
          } catch {
            // Non-fatal JSON parse error on event — safely ignored
          }
        }
      }

      // Flush any remaining buffer
      if (buffer.trim()) {
        const trimmed = buffer.trim();
        if (trimmed !== '[DONE]') {
          for (const line of trimmed.split(/\r?\n/)) {
            const lineStr = line.trim();
            let dataStr = '';
            if (lineStr.startsWith('data: ')) {
              dataStr = lineStr.slice(6).trim();
            } else if (lineStr.startsWith('data:')) {
              dataStr = lineStr.slice(5).trim();
            }
            if (dataStr && dataStr !== '[DONE]') {
              try {
                const parsed = JSON.parse(dataStr);
                const delta = extractDelta(parsed);
                if (delta) {
                  fullText += delta;
                  yield { type: 'delta', delta };
                }
              } catch {
                // Non-fatal
              }
            }
          }
        }
      }

      // Wrap accumulated text into a structured module
      if (fullText) {
        yield {
          type: 'module',
          module: {
            id: `ai-${Date.now()}`,
            type: 'INSIGHT',
            title: {
              en: 'SportMind Training Guidance',
              ar: 'إرشادات تدريب ساحة الذكاء الرياضي',
            },
            body: {
              en: fullText,
              ar: fullText,
            },
            confidenceLabel: {
              en: 'SportMind Intelligence Analysis',
              ar: 'تحليل ساحة الذكاء الرياضي',
            },
          },
        };
      }

      yield { type: 'done' };
    } catch (err) {
      if (signal?.aborted) return; // Caller cancelled -> immediate exit, zero late output
      if (timeoutFired || timeoutController.signal.aborted) {
        console.warn(`OpenCode provider timed out after ${this.timeoutMs}ms. Falling back to deterministic.`);
        const fallback = new DeterministicSportsProvider();
        yield* fallback.generateStream(context, request, signal);
        return;
      }
      const errorMessage =
        err instanceof Error ? err.message : 'Unknown provider error';
      console.warn(`OpenCode provider error (${this.protocol}): ${errorMessage}. Falling back to deterministic.`);
      const fallback = new DeterministicSportsProvider();
      yield* fallback.generateStream(context, request, signal);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function getSportsAiProvider(): SportsAiProvider {
  const opencode = new OpenCodeProvider();
  if (opencode.isConfigured()) {
    return opencode;
  }
  return new DeterministicSportsProvider();
}
