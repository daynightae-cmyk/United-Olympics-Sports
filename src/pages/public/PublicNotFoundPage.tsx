import { ArrowLeft, Home, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';

export function PublicNotFoundPage() {
  return (
    <main className="public-not-found" aria-labelledby="public-not-found-title">
      <div className="public-not-found__brand">
        <img src="/brand/united-olympics-sports-logo.png" alt="United Olympics Sports | يونايتد أوليمبيكس سبورت" />
        <span><strong>United Olympics Sports</strong><small lang="ar" dir="rtl">يونايتد أوليمبيكس سبورت</small></span>
      </div>
      <section className="public-not-found__panel">
        <div className="public-not-found__icon"><SearchX aria-hidden="true" /></div>
        <span className="eyebrow"><BilingualText value={bi('404 · Route not found', '404 · المسار غير موجود')} /></span>
        <h1 id="public-not-found-title"><BilingualText value={bi('There is nothing at this address.', 'لا توجد صفحة في هذا العنوان.')} /></h1>
        <p><BilingualText value={bi('Use a verified navigation route to continue through United Olympics Sports.', 'استخدم أحد مسارات التنقل المعتمدة للمتابعة داخل يونايتد أوليمبيكس سبورت.')} /></p>
        <div className="public-not-found__actions">
          <Link to="/" className="button primary"><Home size={16} /><BilingualText value={bi('Home', 'الرئيسية')} /></Link>
          <Link to="/sports" className="button secondary"><ArrowLeft size={16} /><BilingualText value={bi('Explore sports', 'استكشف الرياضات')} /></Link>
        </div>
      </section>
    </main>
  );
}
