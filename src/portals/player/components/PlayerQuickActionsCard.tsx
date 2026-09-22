import { Calendar, FileText, Mail, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

interface PlayerQuickActionsCardProps {
  unreadCount?: number;
}

export function PlayerQuickActionsCard({ unreadCount = 0 }: PlayerQuickActionsCardProps) {
  const actions = [
    {
      to: '/player/schedule',
      icon: Calendar,
      labelEn: 'My Schedule',
      labelAr: 'جدولي التدريبي',
    },
    {
      to: '/player/documents',
      icon: FileText,
      labelEn: 'Documents',
      labelAr: 'مستنداتي',
    },
    {
      to: '/player/messages',
      icon: Mail,
      labelEn: 'Messages',
      labelAr: 'الرسائل',
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    {
      to: '/player/profile',
      icon: User,
      labelEn: 'My Profile',
      labelAr: 'ملفي الشخصي',
    },
  ];

  return (
    <article className="athlete-dark-card quick-actions-reference-card" aria-labelledby="ref-quick-actions-title">
      <header className="athlete-dark-card__header">
        <h2 id="ref-quick-actions-title" className="athlete-dark-card__title">
          <BilingualText value={bi('Quick Actions', 'الإجراءات السريعة')} />
        </h2>
      </header>

      <div className="quick-actions-reference-grid">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <Link
              key={act.to}
              to={act.to}
              className="quick-actions-reference-tile no-underline"
            >
              <div className="relative">
                <Icon size={20} className="quick-actions-tile-icon" />
                {act.badge !== undefined && (
                  <span className="quick-actions-tile-badge">
                    {act.badge}
                  </span>
                )}
              </div>
              <div className="quick-actions-tile-labels">
                <span className="quick-actions-tile-label-en">{act.labelEn}</span>
                <span className="quick-actions-tile-label-ar">{act.labelAr}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </article>
  );
}
