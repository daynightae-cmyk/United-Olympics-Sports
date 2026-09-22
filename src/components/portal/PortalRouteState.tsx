import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, ArrowLeft, Home, RefreshCw, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../bilingual/BilingualText';
import { RouteLoadingExperience, type UosLoadingPortal } from '../loading/UosLoadingSystem';

export type SharedPortalKind = Exclude<UosLoadingPortal, 'generic'>;

const portalHome: Record<SharedPortalKind, string> = { player: '/player', parent: '/parent', coach: '/coach', admin: '/admin' };
const portalLogin: Record<SharedPortalKind, string> = { player: '/player/login', parent: '/parent/login', coach: '/coach/login', admin: '/admin/login' };

export function PortalRouteLoader({ portal, contained = false }: { portal: SharedPortalKind; contained?: boolean }) {
  return <RouteLoadingExperience portal={portal} contained={contained} />;
}

export function PortalRuntimeError({ portal, onRetry }: { portal: SharedPortalKind; onRetry?: () => void }) {
  return (
    <section data-route-terminal="error" className="portal-route-state portal-route-error" role="alert">
      <div className="portal-route-state__icon"><AlertTriangle aria-hidden="true" /></div>
      <div className="portal-route-state__copy">
        <span className="portal-route-state__eyebrow"><BilingualText value={bi('Workspace unavailable', 'مساحة العمل غير متاحة')} /></span>
        <h1><BilingualText value={bi('The portal could not finish loading.', 'تعذر إكمال تحميل البوابة.')} /></h1>
        <p><BilingualText value={bi(
          'The request reached its safe runtime limit or the production data service is unavailable. No action was reported as completed.',
          'وصل الطلب إلى الحد الزمني الآمن أو أن خدمة بيانات الإنتاج غير متاحة. لم يتم اعتبار أي إجراء مكتملاً.',
        )} /></p>
      </div>
      <div className="portal-route-state__actions">
        {onRetry ? (
          <button type="button" className="button primary" onClick={onRetry}><RefreshCw size={15} /><BilingualText value={bi('Retry', 'إعادة المحاولة')} /></button>
        ) : null}
        <Link to={portalLogin[portal]} className="button secondary"><ArrowLeft size={15} /><BilingualText value={bi('Sign in again', 'تسجيل الدخول من جديد')} /></Link>
      </div>
    </section>
  );
}

export function PortalNotFoundPage({ portal }: { portal: SharedPortalKind }) {
  return (
    <section data-route-terminal="not-found" className="portal-route-state portal-route-error" aria-labelledby={`${portal}-not-found-title`}>
      <div className="portal-route-state__icon"><SearchX aria-hidden="true" /></div>
      <div className="portal-route-state__copy">
        <span className="portal-route-state__eyebrow"><BilingualText value={bi('404 · Route not found', '404 · المسار غير موجود')} /></span>
        <h1 id={`${portal}-not-found-title`}><BilingualText value={bi('This workspace does not exist.', 'مساحة العمل هذه غير موجودة.')} /></h1>
        <p><BilingualText value={bi('The requested portal address is not part of the current route registry.', 'العنوان المطلوب ليس ضمن مسارات البوابة الحالية.')} /></p>
      </div>
      <div className="portal-route-state__actions">
        <Link to={portalHome[portal]} className="button primary"><Home size={15} /><BilingualText value={bi('Portal home', 'رئيسية البوابة')} /></Link>
        <Link to="/" className="button secondary"><ArrowLeft size={15} /><BilingualText value={bi('Public website', 'الموقع العام')} /></Link>
      </div>
    </section>
  );
}

interface PortalErrorBoundaryProps { portal: SharedPortalKind; children: ReactNode }
interface PortalErrorBoundaryState { hasError: boolean }

export class PortalErrorBoundary extends Component<PortalErrorBoundaryProps, PortalErrorBoundaryState> {
  state: PortalErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): PortalErrorBoundaryState { return { hasError: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[${this.props.portal}-portal] route render failure`, error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <section data-route-terminal="error" className="portal-route-state portal-route-error" role="alert">
        <div className="portal-route-state__icon"><AlertTriangle aria-hidden="true" /></div>
        <div className="portal-route-state__copy">
          <span className="portal-route-state__eyebrow"><BilingualText value={bi('Workspace error', 'خطأ في مساحة العمل')} /></span>
          <h1><BilingualText value={bi('This page could not be rendered.', 'تعذر عرض هذه الصفحة.')} /></h1>
          <p><BilingualText value={bi('Return to the portal home and try the route again. No action is reported as completed.', 'ارجع إلى رئيسية البوابة ثم حاول فتح المسار مرة أخرى. لم يتم اعتبار أي إجراء مكتملاً.')} /></p>
        </div>
        <div className="portal-route-state__actions">
          <Link to={portalHome[this.props.portal]} className="button primary"><Home size={15} /><BilingualText value={bi('Portal home', 'رئيسية البوابة')} /></Link>
        </div>
      </section>
    );
  }
}
