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
          <div className="achievements-reference-empty w-full py-6 px-4 text-center">
            <div className="mx-auto w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-700 mb-2">
              <Trophy size={20} />
            </div>
            <p className="text-sm font-bold text-slate-800 mb-0.5">
              <BilingualText value={bi('No achievements recorded yet.', 'لم يتم تسجيل إنجازات بعد.')} />
            </p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              <BilingualText value={bi('Earn milestones through training attendance and performance evaluations.', 'اكسب الإنجازات من خلال الالتزام بالتدريب وتقييمات الأداء.')} />
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
