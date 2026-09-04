import { MessageSquare, Send, Reply, ChevronRight, Check, CheckCheck, Clock, Users, Mail } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { demoCoaches } from '../../../data/demo/coaches';
import { demoPlayers } from '../../../data/demo/players';
import { demoParents } from '../../../data/demo/parents';
import { useState } from 'react';

type CoachMessage = {
  id: string;
  from: { id: string; name: { en: string; ar: string }; role: 'parent' | 'admin' | 'player' };
  subject: { en: string; ar: string };
  preview: { en: string; ar: string };
  time: string;
  read: boolean;
  threadId: string;
  playerId?: string;
  parentId?: string;
};

const coach = demoCoaches[0];
const coachPlayers = coach.playerIds.map(id => demoPlayers.find(p => p.id === id)).filter(Boolean);
const coachPlayerParents = coachPlayers.flatMap(p => 
  p ? demoParents.filter(par => par.playerIds.includes(p.id)) : []
);

const coachMessages: CoachMessage[] = [
  {
    id: 'cmsg-001',
    from: { id: 'parent-preview-01', name: { en: 'Parent Preview 01', ar: 'ولي أمر تجريبي 01' }, role: 'parent' },
    subject: { en: 'Question about Monday training', ar: 'سؤال حول تدريب الاثنين' },
    preview: { en: 'Will the session be indoors or outdoors? My child needs...', ar: 'هل ستكون الحصة في الداخل أم الخارج؟ ابني يحتاج...' },
    time: '2026-08-20T18:30:00Z',
    read: false,
    threadId: 'cthread-001',
    playerId: 'player-demo-001',
    parentId: 'parent-preview-01',
  },
  {
    id: 'cmsg-002',
    from: { id: 'parent-preview-02', name: { en: 'Parent Preview 02', ar: 'ولي أمر تجريبي 02' }, role: 'parent' },
    subject: { en: 'Absence notification - Wednesday', ar: 'إشعار غياب - الأربعاء' },
    preview: { en: 'My child will miss Wednesday session due to school event...', ar: 'سيغيب ابني عن حصة الأربعاء بسبب فعالية مدرسية...' },
    time: '2026-08-22T09:15:00Z',
    read: true,
    threadId: 'cthread-002',
    playerId: 'player-demo-003',
    parentId: 'parent-preview-02',
  },
  {
    id: 'cmsg-003',
    from: { id: 'admin-001', name: { en: 'Admin Preview', ar: 'إدارة تجريبية' }, role: 'admin' },
    subject: { en: 'New group roster published', ar: 'تم نشر قائمة المجموعة الجديدة' },
    preview: { en: 'Updated roster for U12 Development. Please review...', ar: 'تم تحديث قائمة تطوير تحت 12. يرجى المراجعة...' },
    time: '2026-08-25T10:00:00Z',
    read: false,
    threadId: 'cthread-003',
  },
];

export function CoachPortalMessagesPage() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatTimeAr = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const currentThread = selectedThread ? coachMessages.find(m => m.threadId === selectedThread) : null;

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={bi('Coach Portal | Messages', 'بوابة المدرب | الرسائل')}
        title={bi('Messages', 'الرسائل')}
        description={bi('Communication with parents and administration — preview data.', 'التواصل مع أولياء الأمور والإدارة — بيانات تجريبية.')}
        actions={<span className="preview-badge"><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span>}
      />

      <section className="messages-layout" aria-label="Messages">
        <aside className="messages-sidebar" aria-label="Message threads">
          <div className="messages-header">
            <h3><BilingualText value={bi('Conversations', 'المحادثات')} /></h3>
            <button className="compose-btn" aria-label={bi('New message', 'رسالة جديدة')}>
              <Send size={18} />
              <span className="compose-text"><BilingualText value={bi('New Message', 'رسالة جديدة')} /></span>
            </button>
          </div>
          <div className="messages-list">
            {coachMessages.map((msg) => {
              const player = msg.playerId ? coachPlayers.find(p => p!.id === msg.playerId) : null;
              const parent = msg.parentId ? coachPlayerParents.find(par => par.id === msg.parentId) : null;
              return (
                <article
                  key={msg.threadId}
                  className={`message-thread ${selectedThread === msg.threadId ? 'active' : ''} ${!msg.read ? 'unread' : ''}`}
                  onClick={() => setSelectedThread(msg.threadId)}
                >
                  <div className="thread-avatar">
                    {msg.from.role === 'parent' ? (
                      <span className="avatar-parent" aria-hidden="true">P</span>
                    ) : msg.from.role === 'admin' ? (
                      <span className="avatar-admin" aria-hidden="true">A</span>
                    ) : (
                      <span className="avatar-player" aria-hidden="true">👤</span>
                    )}
                    {!msg.read && <span className="unread-dot" aria-label={bi('Unread', 'غير مقروء')} />}
                  </div>
                  <div className="thread-content">
                    <div className="thread-header">
                      <h4><BilingualText value={msg.from.name} /></h4>
                      <time><BilingualText value={{ en: formatTime(msg.time), ar: formatTimeAr(msg.time) }} /></time>
                    </div>
                    <p className="thread-subject"><BilingualText value={msg.subject} /></p>
                    <p className="thread-preview"><BilingualText value={msg.preview} /></p>
                    {(player || parent) && (
                      <div className="thread-participants">
                        {player && (
                          <span className="thread-player">
                            <Users size={10} />
                            <BilingualText value={{ en: player.nameEn, ar: player.nameAr }} />
                          </span>
                        )}
                        {parent && (
                          <span className="thread-parent">
                            <Mail size={10} />
                            <BilingualText value={{ en: parent.nameEn, ar: parent.nameAr }} />
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </aside>

        <main className="messages-main" aria-label="Message content">
          {currentThread ? (
            <article className="message-thread-view">
              <header className="thread-view-header">
                <div className="thread-view-sender">
                  <div className="sender-avatar">
                    {currentThread.from.role === 'parent' ? (
                      <span className="avatar-parent" aria-hidden="true">P</span>
                    ) : currentThread.from.role === 'admin' ? (
                      <span className="avatar-admin" aria-hidden="true">A</span>
                    ) : (
                      <span className="avatar-player" aria-hidden="true">👤</span>
                    )}
                  </div>
                  <div>
                    <h3><BilingualText value={currentThread.from.name} /></h3>
                    <small>
                      <BilingualText value={
                        currentThread.from.role === 'parent' ? bi('Parent', 'ولي أمر') :
                        currentThread.from.role === 'admin' ? bi('Administration', 'الإدارة') :
                        bi('Player', 'لاعب')
                      } />
                    </small>
                  </div>
                </div>
                <div className="thread-view-meta">
                  <time><Clock size={14} /><BilingualText value={{ en: formatTime(currentThread.time), ar: formatTimeAr(currentThread.time) }} /></time>
                  <span className={`read-status ${currentThread.read ? 'read' : 'unread'}`}>
                    {currentThread.read ? (
                      <>
                        <CheckCheck size={14} />
                        <BilingualText value={bi('Read', 'مُقروء')} />
                      </>
                    ) : (
                      <>
                        <Clock size={14} />
                        <BilingualText value={bi('Unread', 'غير مقروء')} />
                      </>
                    )}
                  </span>
                </div>
              </header>

              <div className="thread-view-subject">
                <BilingualText value={currentThread.subject} />
              </div>

              <div className="thread-view-body">
                <p><BilingualText value={currentThread.preview} /></p>
                {(currentThread.playerId || currentThread.parentId) && (
                  <div style={{ marginTop: 12, padding: 8, background: 'rgba(212,175,55,0.08)', borderRadius: 8, border: '1px solid rgba(212,175,55,0.18)' }}>
                    {currentThread.playerId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <Users size={14} style={{ verticalAlign: 'middle' }} />
                        <BilingualText value={
                          coachPlayers.find(p => p!.id === currentThread.playerId)
                            ? bi(`Player: ${coachPlayers.find(p => p!.id === currentThread.playerId)!.nameEn}`, `اللاعب: ${coachPlayers.find(p => p!.id === currentThread.playerId)!.nameAr}`)
                            : bi('Player: Unknown', 'لاعب: غير معروف')
                        } />
                      </div>
                    )}
                    {currentThread.parentId && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Mail size={14} style={{ verticalAlign: 'middle' }} />
                        <BilingualText value={
                          coachPlayerParents.find(p => p.id === currentThread.parentId)
                            ? bi(`Parent: ${coachPlayerParents.find(p => p.id === currentThread.parentId)!.nameEn}`, `ولي الأمر: ${coachPlayerParents.find(p => p.id === currentThread.parentId)!.nameAr}`)
                            : bi('Parent: Unknown', 'ولي أمر: غير معروف')
                        } />
                      </div>
                    )}
                  </div>
                )}
                <p style={{ marginTop: 16, color: 'var(--color-text-muted)', fontSize: 13 }}>
                  <BilingualText value={bi('This is preview content. Real messages will load from backend when connected.', 'هذا محتوى تجريبي. الرسائل الحقيقية ستُحمّل من الخادم عند الاتصال.')} />
                </p>
              </div>

              <footer className="thread-view-footer">
                <button className="admin-secondary-button">
                  <Reply size={16} />
                  <BilingualText value={bi('Reply', 'رد')} />
                </button>
                <button className="admin-primary-button">
                  <Send size={16} />
                  <BilingualText value={bi('Send Message', 'إرسال رسالة')} />
                </button>
              </footer>
            </article>
          ) : (
            <div className="messages-empty">
              <MessageSquare size={64} style={{ color: 'var(--color-text-muted)', marginBottom: 16 }} />
              <h3><BilingualText value={bi('Select a Conversation', 'اختر محادثة')} /></h3>
              <p><BilingualText value={bi('Choose a message from the list to view and reply.', 'اختر رسالة من القائمة للعرض والرد.')} /></p>
            </div>
          )}
        </main>
      </section>

      <section className="messages-note" aria-label="Messages note">
        <div className="admin-preview-card" style={{ padding: 18 }}>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
            <BilingualText value={bi('Messaging is preview-only. Real-time chat requires live backend integration.', 'المراسلة تجريبية فقط. الدردشة الفورية تتطلب تكامل خادم مباشر.')} />
          </p>
        </div>
      </section>
    </div>
  );
}