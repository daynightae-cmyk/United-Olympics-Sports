import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

export function PlayerPortalNotFoundPage() {
  return (
    <main className="cgpt-not-found">
      <div className="cgpt-not-found__number">404</div>
      <div className="cgpt-not-found__icon"><Compass size={30} /></div>
      <h1><BilingualText value={bi('This athlete route does not exist', 'هذا المسار غير موجود في بوابة اللاعب')} /></h1>
      <p><BilingualText value={bi('Return to your athlete home without leaving the portal.', 'ارجع إلى الصفحة الرئيسية للاعب دون مغادرة البوابة.')} /></p>
      <Link to="/player/home"><ArrowLeft size={15} className="rtl:rotate-180" /><BilingualText value={bi('Back to athlete home', 'العودة للرئيسية')} /></Link>
    </main>
  );
}
