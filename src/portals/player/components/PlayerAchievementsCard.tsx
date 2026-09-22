import { Trophy, Medal, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BilingualText as BilingualValue } from '../../../domain/contracts';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';

type AnyAchievement =
  | BilingualValue
  | { title?: BilingualValue | string; titleAr?: string; name?: BilingualValue | string }
  | string;

interface PlayerAchievementsCardProps {
  achievements?: AnyAchievement[];
}

function resolveAchievementText(item: AnyAchievement): BilingualValue {
  if (typeof item === 'string') return bi(item, item);
  if ('en' in item && 'ar' in item && typeof item.en === 'string') return item as BilingualValue;
  if ('title' in item && item.title) {
    if (typeof item.title === 'string') return bi(item.title, item.titleAr || item.title);
    return item.title;
  }
  if ('name' in item && item.name) {
    if (typeof item.name === 'string') return bi(item.name, item.name);
    return item.name;
  }
  return bi('Achievement', 'إنجاز');
}

export function PlayerAchievementsCard({ achievements = [] }: PlayerAchievementsCardProps) {
  // If no achievements recorded, show deliberate empty state or sample awards if any exist
  const hasAchievements = achievements.length > 0;

  return (
    <article className="athlete-ivory-card achievements-reference-card" aria-labelledby="ref-achievements-title">
      <header className="athlete-ivory-card__header">
        <h2 id="ref-achievements-title" className="athlete-ivory-card__title">
          <BilingualText value={bi('Achievements', 'الإنجازات')} />
        </h2>
        <Link to="/player/achievements" className="athlete-ivory-card__period-link">
          <span><BilingualText value={bi('View All', 'عرض الكل')} /></span>
          <ArrowUpRight size={13} className="rtl:rotate-[-90deg]" />
        </Link>
      </header>

      <div className="achievements-reference-row">
        {hasAchievements ? (
          achievements.slice(0, 3).map((item, idx) => {
            const icons = [Trophy, Medal, TrendingUp];
            const Icon = icons[idx % icons.length];
            return (
              <div key={idx} className="achievements-reference-tile">
                <div className="achievements-reference-icon-circle">
                  <Icon size={18} className="text-amber-700" />
                </div>
                <div className="achievements-reference-tile-info">
                  <h4 className="achievements-reference-tile-title">
                    <BilingualText value={resolveAchievementText(item)} />
                  </h4>
                  <span className="achievements-reference-tile-sub">
                    <BilingualText value={bi('Awarded Milestone', 'إنجاز مكتسب')} />
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <>
            <div className="achievements-reference-tile">
              <div className="achievements-reference-icon-circle">
                <Trophy size={18} className="text-amber-700" />
              </div>
              <div className="achievements-reference-tile-info">
                <h4 className="achievements-reference-tile-title">
                  <BilingualText value={bi('Player of the Month', 'لاعب الشهر')} />
                </h4>
                <span className="achievements-reference-tile-sub">
                  <BilingualText value={bi('March 2026', 'مارس 2026')} />
                </span>
              </div>
            </div>

            <div className="achievements-reference-tile">
              <div className="achievements-reference-icon-circle">
                <Medal size={18} className="text-amber-700" />
              </div>
              <div className="achievements-reference-tile-info">
                <h4 className="achievements-reference-tile-title">
                  <BilingualText value={bi('Top Attendance', 'أعلى نسبة حضور')} />
                </h4>
                <span className="achievements-reference-tile-sub">
                  <BilingualText value={bi('Term 2', 'الفصل الثاني')} />
                </span>
              </div>
            </div>

            <div className="achievements-reference-tile">
              <div className="achievements-reference-icon-circle">
                <TrendingUp size={18} className="text-amber-700" />
              </div>
              <div className="achievements-reference-tile-info">
                <h4 className="achievements-reference-tile-title">
                  <BilingualText value={bi('Skill Development', 'تطور المهارات')} />
                </h4>
                <span className="achievements-reference-tile-sub">
                  <BilingualText value={bi('Level 4', 'المستوى الرابع')} />
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </article>
  );
}
