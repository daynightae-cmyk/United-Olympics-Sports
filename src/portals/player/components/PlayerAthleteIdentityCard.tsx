import { Activity, CalendarClock, Medal, Shield, Sparkles, UserRound } from 'lucide-react';
import type { Coach, Player, Session, Sport, TrainingGroup } from '../../../domain/contracts';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { Sports3DStage, sports3DKeyForSportId } from '../../../design/sports3d';
import { useUiSettings } from '../../../ui/theme/useUiSettings';
import { formatPlayerDateTime } from '../foundation/playerLocale';
import { PlayerPortrait } from './PlayerPortrait';
import { PlayerDataStat } from './PlayerDataStat';

interface PlayerAthleteIdentityCardProps {
  player: Player;
  sport?: Sport;
  group?: TrainingGroup;
  coach?: Coach;
  nextSession?: Session | null;
  attendanceRate?: number | null;
  overallScore?: number | null;
  preview?: boolean;
  onOpenIdentity?: () => void;
}

function sportGeometryClass(sportId?: string) {
  switch (sportId) {
    case 'football':
    case 'swimming':
    case 'basketball':
    case 'tennis':
    case 'gymnastics':
      return `cgpt-athlete-id--${sportId}`;
    case 'martial-arts':
      return 'cgpt-athlete-id--martial';
    default:
      return 'cgpt-athlete-id--generic';
  }
}

export function PlayerAthleteIdentityCard({
  player,
  sport,
  group,
  coach,
  nextSession,
  attendanceRate,
  overallScore,
  preview = false,
  onOpenIdentity,
}: PlayerAthleteIdentityCardProps) {
  const { bilingualOrder } = useUiSettings();
  const nextSessionText = nextSession ? formatPlayerDateTime(nextSession.startsAt, bilingualOrder) : undefined;
  const sports3dKey = sports3DKeyForSportId(sport?.id);
  const primaryName = bilingualOrder === 'ar-first' ? player.nameAr : player.nameEn;

  return (
    <section className={`cgpt-athlete-id ${sportGeometryClass(sport?.id)}`} aria-labelledby="cgpt-athlete-name">
      <div className="cgpt-athlete-id__aurora" aria-hidden="true" />
      <div className="cgpt-athlete-id__geometry" aria-hidden="true" />
      <div className="cgpt-athlete-id__foil" aria-hidden="true" />

      <div className="cgpt-athlete-id__portrait-zone">
        <Sports3DStage assetKey={sports3dKey} size="hero" tone="athlete" opacity={0.16} className="cgpt-athlete-id__sport-3d" />
        <div className="cgpt-athlete-id__portrait-frame">
          <PlayerPortrait
            photoUrl={player.photo}
            name={primaryName}
            alt={`${player.nameEn} · ${player.nameAr}`}
            className="cgpt-athlete-id__portrait"
            eager
          />
          <span className="cgpt-athlete-id__portrait-ring" aria-hidden="true" />
        </div>
        <div className="cgpt-athlete-id__monogram" aria-hidden="true">UOS</div>
      </div>

      <div className="cgpt-athlete-id__content">
        <div className="cgpt-athlete-id__eyebrow">
          <span className="cgpt-athlete-id__sport"><BilingualText value={sport?.name ?? bi('Athlete', 'لاعب')} /></span>
          {preview && <span className="cgpt-athlete-id__preview"><Sparkles size={12} /><BilingualText value={bi('Preview data', 'بيانات معاينة')} /></span>}
        </div>

        <div className="cgpt-athlete-id__name-block">
          <h1 id="cgpt-athlete-name" className="cgpt-athlete-id__name-primary">{primaryName}</h1>
          <p className="cgpt-athlete-id__name-secondary" lang={bilingualOrder === 'ar-first' ? 'en' : 'ar'} dir={bilingualOrder === 'ar-first' ? 'ltr' : 'rtl'}>
            {bilingualOrder === 'ar-first' ? player.nameEn : player.nameAr}
          </p>
          <div className="cgpt-athlete-id__id" dir="ltr">#{player.id.toUpperCase()}</div>
        </div>

        <div className="cgpt-athlete-id__context">
          <span><Shield size={14} /><BilingualText value={player.level} /></span>
          {group && <span><UserRound size={14} /><BilingualText value={group.name} /></span>}
          {coach && <span><Medal size={14} />{bilingualOrder === 'ar-first' ? coach.nameAr : coach.nameEn}</span>}
        </div>

        <div className="cgpt-athlete-id__stats">
          <PlayerDataStat label={bi('Attendance', 'الحضور')} icon={<Activity size={13} />} accent="success" value={typeof attendanceRate === 'number' ? `${attendanceRate}%` : undefined} />
          <PlayerDataStat label={bi('Performance', 'الأداء')} icon={<Medal size={13} />} accent="gold" value={typeof overallScore === 'number' ? `${overallScore}/100` : undefined} />
          <PlayerDataStat label={bi('Next training', 'التدريب القادم')} icon={<CalendarClock size={13} />} accent="info" value={nextSessionText} />
        </div>

        {onOpenIdentity && (
          <button type="button" className="cgpt-athlete-id__action" onClick={onOpenIdentity}>
            <BilingualText value={bi('Open identity preview', 'فتح معاينة الهوية')} />
          </button>
        )}
      </div>
    </section>
  );
}
