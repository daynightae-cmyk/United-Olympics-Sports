import { MessageCircle, Send, UserRound } from 'lucide-react';
import { useMemo, useState } from 'react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { PreviewNotice } from '../../../components/enterprise/EnterpriseUI';
import { PortalSection } from '../../../components/portal/PortalUI';
import { UiButton } from '../../../components/ui/UiPrimitives';
import { demoParents } from '../../../data/demo/parents';
import { demoPlayers } from '../../../data/demo/players';
import { useCoachSession } from '../../../portals/coach/CoachSessionContext';

type LocalMessage = { id: string; body: string };

export function CoachSessionMessagesPage() {
  const { coach } = useCoachSession();
  const scopedPlayers = useMemo(() => {
    if (!coach) return [];
    return demoPlayers.filter((player) => coach.playerIds.includes(player.id) || coach.groupIds.includes(player.groupId ?? ''));
  }, [coach]);
  const scopedPlayerIds = useMemo(() => new Set(scopedPlayers.map((player) => player.id)), [scopedPlayers]);
  const scopedParents = useMemo(() => demoParents.filter((parent) => parent.playerIds.some((id) => scopedPlayerIds.has(id))), [scopedPlayerIds]);
  const [selectedParentId, setSelectedParentId] = useState<string>('');
  const selectedParent = scopedParents.find((parent) => parent.id === selectedParentId) ?? scopedParents[0];
  const [messages, setMessages] = useState<Record<string, LocalMessage[]>>({});
  const [draft, setDraft] = useState('');

  const send = () => {
    if (!selectedParent || !draft.trim()) return;
    const body = draft.trim();
    setMessages((current) => ({
      ...current,
      [selectedParent.id]: [...(current[selectedParent.id] ?? []), { id: `${selectedParent.id}-${Date.now()}`, body }],
    }));
    setDraft('');
  };

  return (
    <div className="admin-page">
      <PageHeader
        icon={MessageCircle}
        eyebrow={bi('Coach Portal · Messages', 'بوابة المدرب · الرسائل')}
        title={bi('Session-Scoped Inbox', 'صندوق الرسائل حسب جلسة المدرب')}
        description={bi('Only family contacts connected to the active coach roster are available in this preview workspace.', 'تظهر في مساحة المعاينة هذه جهات الأسرة المرتبطة فقط بقائمة المدرب النشط.')}
        actions={<PreviewNotice />}
      />
      <div className="portal-card-grid">
        <PortalSection title={bi('Roster contacts', 'جهات اتصال القائمة')} description={bi('Derived from the active coach assignment.', 'مشتقة من تكليف المدرب النشط.')}>
          {scopedParents.length ? (
            <div className="message-thread">
              {scopedParents.map((parent) => (
                <button key={parent.id} type="button" className="message-bubble" onClick={() => setSelectedParentId(parent.id)} aria-pressed={selectedParent?.id === parent.id}>
                  <strong><BilingualText value={{ en: parent.nameEn, ar: parent.nameAr }} /></strong>
                  <p>{parent.playerIds.filter((id) => scopedPlayerIds.has(id)).length} <BilingualText value={bi('linked athlete(s)', 'رياضي/رياضيون مرتبطون')} /></p>
                </button>
              ))}
            </div>
          ) : (
            <div className="enterprise-empty"><UserRound size={24} /><h3><BilingualText value={bi('No family contacts in scope', 'لا توجد جهات أسرة ضمن النطاق')} /></h3></div>
          )}
        </PortalSection>
        <PortalSection title={selectedParent ? { en: selectedParent.nameEn, ar: selectedParent.nameAr } : bi('Conversation', 'المحادثة')} description={bi('Local preview only — no delivery or backend write is claimed.', 'معاينة محلية فقط — لا يوجد ادعاء تسليم أو كتابة إلى الخادم.')}>
          <div className="message-thread">
            {(selectedParent ? messages[selectedParent.id] ?? [] : []).map((message) => (
              <article className="message-bubble" key={message.id}><strong><BilingualText value={bi('Coach · Local preview', 'المدرب · معاينة محلية')} /></strong><p>{message.body}</p></article>
            ))}
            {selectedParent && !(messages[selectedParent.id]?.length) && <p><BilingualText value={bi('No local preview replies yet.', 'لا توجد ردود معاينة محلية بعد.')} /></p>}
          </div>
          <div className="portal-composer">
            <textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={3} disabled={!selectedParent} placeholder="Write local preview reply | اكتب ردًا تجريبيًا محليًا" />
            <UiButton type="button" variant="primary" onClick={send} disabled={!selectedParent || !draft.trim()}><Send size={14} /><BilingualText value={bi('Append locally', 'إضافة محليًا')} /></UiButton>
          </div>
        </PortalSection>
      </div>
    </div>
  );
}
