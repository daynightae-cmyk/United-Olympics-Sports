import { Link2, MessageSquareText } from 'lucide-react';
import { BilingualText, bi } from '../../components/bilingual/BilingualText';
import { PlayerFeedbackCard } from '../../components/player/PlayerFeedbackCard';
import { usePlayerPreview } from '../../components/player/PlayerPreviewContext';
import { PlayerEmptyState, PlayerSectionHeader } from '../../components/player/PlayerUI';

export function PlayerFeedbackPage() {
  const { player } = usePlayerPreview();
  if (!player) return null;
  const feedback = player.coachFeedback.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return <div className="player-page">
    <PlayerSectionHeader eyebrow={bi('Coach Feedback', 'تقييم المدرب')} title={bi('Structured Development Feedback', 'تقييم منظم للتطور')} description={bi('This page reads the same structured preview feedback contract that the Admin athlete record can inspect.', 'تقرأ هذه الصفحة نفس عقد التقييم التجريبي المنظم الذي يستطيع سجل الرياضي في لوحة الإدارة عرضه.')} />
    <section className="player-pipeline-truth"><Link2 aria-hidden="true" /><div><strong><BilingualText value={bi('Shared Preview Contract', 'عقد معاينة مشترك')} /></strong><p><BilingualText value={bi('Shared preview data demonstrates the intended cross-product contract.', 'بيانات المعاينة المشتركة توضح عقد الربط المقصود بين المنتجات.')} /></p><span><BilingualText value={bi('Coach Evaluation → Player Record → Player App', 'تقييم المدرب ← سجل اللاعب ← تطبيق اللاعب')} /></span><small><BilingualText value={bi('No backend or realtime transmission is active.', 'لا يوجد خادم أو نقل فوري مفعل.')} /></small></div></section>
    {feedback.length ? <div className="player-feedback-list">{feedback.map(item => <PlayerFeedbackCard key={item.id} feedback={item} />)}</div> : <PlayerEmptyState title={bi('No Preview Feedback', 'لا يوجد تقييم تجريبي')} description={bi('No structured coach feedback is recorded for this anonymized preview identity.', 'لا يوجد تقييم مدرب منظم مسجل لهذه الهوية التجريبية المجهولة.')} />}
    <section className="player-feedback-footnote"><MessageSquareText aria-hidden="true" /><BilingualText value={bi('Coach references remain anonymized preview identifiers. No real coach identity or contact data is shown.', 'تظل مراجع المدربين معرفات تجريبية مجهولة. لا يتم عرض هوية حقيقية للمدرب أو بيانات تواصل.')} /></section>
  </div>;
}
