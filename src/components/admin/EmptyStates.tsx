import { AlertTriangle, WifiOff, Clock, AlertCircle } from 'lucide-react';
import { BilingualText, bi } from '../bilingual/BilingualText';

export function EmptyState({ label }: { label?: { en: string; ar: string } }) {
  return <div className="admin-empty-state"><AlertTriangle size={32} /><BilingualText value={label ?? bi('No data yet', 'لا توجد بيانات بعد')} /></div>;
}

export function NotFoundState() {
  return <div className="admin-empty-state"><WifiOff size={32} /><BilingualText value={bi('Not found', 'غير موجود')} /></div>;
}

export function LoadingState() {
  return <div className="admin-empty-state"><Clock size={32} /><BilingualText value={bi('Loading', 'جارٍ التحميل')} /></div>;
}

export function ErrorState() {
  return <div className="admin-empty-state"><AlertCircle size={32} /><BilingualText value={bi('Something went wrong', 'حدث خطأ ما')} /></div>;
}
