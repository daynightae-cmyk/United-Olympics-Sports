import type { CSSProperties, ReactNode } from 'react';
import type { BilingualText as BilingualValue } from '../../domain/contracts';
import { BilingualText, bi } from '../bilingual/BilingualText';

export type UosLoadingPortal = 'player' | 'parent' | 'coach' | 'admin' | 'generic';

export const portalLoadingCopy: Record<UosLoadingPortal, { title: BilingualValue; status: BilingualValue }> = {
  player: {
    title: bi('Preparing your athlete workspace', 'جارِ تجهيز مساحة اللاعب'),
    status: bi('Preparing verified portal modules', 'جارِ تجهيز وحدات البوابة الموثقة'),
  },
  parent: {
    title: bi('Preparing your family sports workspace', 'جارِ تجهيز مساحة الأسرة الرياضية'),
    status: bi('Preparing family sports tools', 'جارِ تجهيز أدوات الأسرة الرياضية'),
  },
  coach: {
    title: bi('Preparing your training workspace', 'جارِ تجهيز مساحة التدريب'),
    status: bi('Preparing coaching operations', 'جارِ تجهيز عمليات التدريب'),
  },
  admin: {
    title: bi('Preparing the operations command center', 'جارِ تجهيز مركز العمليات'),
    status: bi('Checking secure workspace access', 'جارِ التحقق من الوصول الآمن لمساحة العمل'),
  },
  generic: {
    title: bi('Preparing your sports workspace', 'جارِ تجهيز مساحة العمل الرياضية'),
    status: bi('Preparing the platform experience', 'جارِ تجهيز تجربة المنصة'),
  },
};

const timingTicks = Array.from({ length: 12 }, (_, index) => index);

export function UosFieldPulse({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`uos-field-pulse ${compact ? 'is-compact' : ''}`.trim()} aria-hidden="true">
      <div className="uos-field-pulse__orbit">
        <span className="uos-field-pulse__beacon" />
      </div>
      <svg className="uos-field-pulse__geometry" viewBox="0 0 180 180" focusable="false">
        <defs>
          <linearGradient id="uos-field-pulse-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="currentColor" stopOpacity="0.25" />
            <stop offset="0.52" stopColor="currentColor" stopOpacity="1" />
            <stop offset="1" stopColor="currentColor" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <circle className="uos-field-pulse__ring uos-field-pulse__ring--outer" cx="90" cy="90" r="72" />
        <circle className="uos-field-pulse__ring" cx="90" cy="90" r="55" />
        <rect className="uos-field-pulse__field" x="52" y="43" width="76" height="94" rx="8" />
        <path className="uos-field-pulse__field" d="M52 90h76M90 43v94M52 69h16v42H52m76-42h-16v42h16" />
        <circle className="uos-field-pulse__field" cx="90" cy="90" r="12" />
        <path className="uos-field-pulse__signal" d="M32 90c13-34 34-51 58-51 29 0 48 22 58 51-10 29-29 51-58 51-24 0-45-17-58-51Z" />
      </svg>
      <div className="uos-field-pulse__core">
        <span className="uos-field-pulse__monogram">UOS</span>
        <span className="uos-field-pulse__core-dot" />
      </div>
      <div className="uos-field-pulse__ticks">
        {timingTicks.map((tick) => <i key={tick} style={{ '--uos-tick': tick } as CSSProperties} />)}
      </div>
    </div>
  );
}

export function RouteLoadingExperience({
  portal = 'generic',
  contained = false,
}: {
  portal?: UosLoadingPortal;
  contained?: boolean;
}) {
  const copy = portalLoadingCopy[portal];

  return (
    <section
      className={`uos-loading-stage ${contained ? 'is-contained' : 'is-workspace'}`}
      data-loading-system="uos-field-pulse"
      data-loading-level="route"
      data-loading-portal={portal}
      data-route-loading="true"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      aria-busy="true"
    >
      <div className="uos-loading-stage__field" aria-hidden="true" />
      <div className="uos-loading-stage__content">
        <UosFieldPulse />
        <div className="uos-loading-stage__copy">
          <span className="uos-loading-stage__eyebrow">
            <span lang="en" dir="ltr">UOS FIELD PULSE</span>
            <span lang="ar" dir="rtl">نبض الملعب</span>
          </span>
          <h1><BilingualText value={copy.title} /></h1>
          <p><BilingualText value={copy.status} /></p>
        </div>
        <div className="uos-loading-stage__telemetry" aria-hidden="true">
          <span className="uos-loading-stage__telemetry-pulse" />
          <div className="uos-loading-stage__telemetry-rail"><i /><i /><i /><i /><i /></div>
          <span className="uos-loading-stage__telemetry-code">UOS / 01</span>
        </div>
        <div className="uos-loading-stage__skeleton" aria-hidden="true">
          <i /><i /><i />
        </div>
      </div>
    </section>
  );
}

export function UosSectionSkeleton({
  kind = 'cards',
  rows = 3,
  label = bi('Loading this section', 'جارِ تحميل هذا القسم'),
}: {
  kind?: 'cards' | 'table';
  rows?: number;
  label?: BilingualValue;
}) {
  return (
    <section
      className={`uos-section-skeleton is-${kind}`}
      data-loading-level="section"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <span className="sr-only"><BilingualText value={label} /></span>
      <div className="uos-section-skeleton__head" aria-hidden="true"><i /><i /></div>
      <div className="uos-section-skeleton__body" aria-hidden="true">
        {Array.from({ length: rows }, (_, index) => (
          <div className="uos-section-skeleton__item" key={index}><i /><i /><i /></div>
        ))}
      </div>
    </section>
  );
}

export function InlineActionLoader({ label }: { label?: ReactNode }) {
  return (
    <span className="uos-inline-loader" data-loading-level="action">
      <span className="uos-inline-loader__signal" aria-hidden="true"><i /><i /><i /></span>
      {label ? <span className="uos-inline-loader__label">{label}</span> : null}
    </span>
  );
}
