import { MessageSquare, Send, Reply, ChevronRight, Check, CheckCheck, Clock, Users } from 'lucide-react';
import { PageHeader } from '../../../components/admin/AdminUI';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { demoParents } from '../../../data/demo/parents';
import { demoPlayers } from '../../../data/demo/players';
import { demoCoaches } from '../../../data/demo/coaches';
import { useState } from 'react';

type ParentMessage = {
  id: string;
  from: { id: string; name: { en: string; ar: string }; role: 'coach' | 'admin' };
  subject: { en: string; ar: string };
  preview: { en: string; ar: string };
  time: string;
  read: boolean;
  threadId: string;
  childId?: string;
};

const parent = demoParents[0];
const children = parent.playerIds.map(id => demoPlayers.find(p => p.id === id)).filter(Boolean);

const parentMessages: ParentMessage[] = [
  {
    id: 'pmsg-001',
    from: { id: 'coach-demo-01', name: { en: 'Coach Preview 01', ar: 'مدرب تجريبي 01' }, role: 'coach' },
    subject: { en: 'Welcome to U12 Development Group', ar: 'مرحباً بكم في مجموعة تطوير تحت 12' },
    preview: { en: 'Welcome to the team! Training starts next Monday...', ar: 'مرحباً بالفريق! التدريب يبدأ يوم الاثنين القادم...' },
    time: '2026-08-20T10:30:00Z',
    read: false,
    threadId: 'pthread-001',
    childId: 'player-demo-001',
  },
  {
    id: 'pmsg-002',
    from: { id: 'coach-demo-03', name: { en: 'Coach Preview 03', ar: 'مدرب تجريبي 03' }, role: 'coach' },
    subject: { en: 'Swimming Schedule Update', ar: 'تحديث جدول السباحة' },
    preview: { en: 'Swim sessions moved to Tuesday 4 PM. Please confirm...', ar: 'حصص السباحة نُقلت للثلاثاء 4 مساءً. يرجى التأكيد...' },
    time: '2026-08-22T14:15:00Z',
    read: true,
    threadId: 'pthread-002',
    childId: 'player-demo-003',
  },
  {
    id: 'pmsg-003',
    from: { id: 'admin-001', name: { en: 'Admin Preview', ar: 'إدارة تجريبية' }, role: 'admin' },
    subject: { en: 'Medical Certificate Reminder', ar: 'تذكير بشهادة اللياقة الطبية' },
    preview: { en: 'Medical certificates for your children expire in 30 days...', ar: 'شهادات اللياقة الطبية لأطفالك تنتهي خلال 30 يوماً...' },
    time: '2026-08-25T09:00:00Z',
    read: false,
    threadId: 'pthread-003',
  },
];

export function ParentPortalMessagesPage() {
  const [selectedThread, setSelectedThread] = useState<string | null>(null);

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatTimeAr = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatDateAr = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' });
  };

  const currentThread = selectedThread ? parentMessages.find(m => m.threadId === selectedThread) : null;

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow={bi('Parent Portal | Messages', 'بوابة ولي الأمر | الرسائل')}
        title={bi('Messages', 'الرسائل')}
        description={bi('Communication with coaches and administration — preview data.', 'التواصل مع المدربين والإدارة — بيانات تجريبية.')}
        actions={<span className="preview-badge"><BilingualText value={bi('Preview Data', 'بيانات تجريبية')} /></span>}
      />

      <section className="messages-layout" aria-label="Messages">
        <aside className="messages-sidebar" aria-label="Message threads">
          <div className="messages-header">
            <h3><BilingualText value={bi('Conversations', 'المحادثات')} /></h3>
            <button className="compose-btn" aria-label={bi('New message', 'رسالة جديدة').en}>
              <Send size={18} />
              <span className="compose-text"><BilingualText value={bi('New Message', 'رسالة جديدة')} /></span>
            </button>
          </div>
          <div className="messages-list">
            {parentMessages.map((msg) => {
              const child = msg.childId ? children.find(c => c!.id === msg.childId) : null;
              return (
                <article
                  key={msg.threadId}
                  className={`message-thread ${selectedThread === msg.threadId ? 'active' : ''} ${!msg.read ? 'unread' : ''}`}
                  onClick={() => setSelectedThread(msg.threadId)}
                >
                  <div className="thread-avatar">
                    {msg.from.role === 'coach' ? (
                      <span className="avatar-coach" aria-hidden="true">C</span>
                    ) : (
                      <span className="avatar-admin" aria-hidden="true">A</span>
                    )}
                    {!msg.read && <span className="unread-dot" aria-label={bi('Unread', 'غير مقروء').en} />}
                  </div>
                  <div className="thread-content">
                    <div className="thread-header">
                      <h4><BilingualText value={msg.from.name} /></h4>
                      <time><BilingualText value={{ en: formatTime(msg.time), ar: formatTimeAr(msg.time) }} /></time>
                    </div>
                    <p className="thread-subject"><BilingualText value={msg.subject} /></p>
                    <p className="thread-preview"><BilingualText value={msg.preview} /></p>
                    {child && (
                      <span className="thread-child">
                        <Users size={10} />
                        <BilingualText value={{ en: child.nameEn, ar: child.nameAr }} />
                      </span>
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
                    {currentThread.from.role === 'coach' ? (
                      <span className="avatar-coach" aria-hidden="true">C</span>
                    ) : (
                      <span className="avatar-admin" aria-hidden="true">A</span>
                    )}
                  </div>
                  <div>
                    <h3><BilingualText value={currentThread.from.name} /></h3>
                    <small><BilingualText value={currentThread.from.role === 'coach' ? bi('Coach', 'مدرب') : bi('Administration', 'الإدارة')} /></small>
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
                {currentThread.childId && (
                  <div style={{ marginTop: 12, padding: 8, background: 'rgba(212,175,55,0.08)', borderRadius: 8, border: '1px solid rgba(212,175,55,0.18)' }}>
                    <Users size={14} style={{ verticalAlign: 'middle', marginRight: 6 }} />
                    <BilingualText value={
                      children.find(c => c!.id === currentThread.childId)
                        ? bi(`Regarding: ${children.find(c => c!.id === currentThread.childId)!.nameEn}`, `بخصوص: ${children.find(c => c!.id === currentThread.childId)!.nameAr}`)
                        : bi('Regarding: Child', 'بخصوص: طفل')
                    } />
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