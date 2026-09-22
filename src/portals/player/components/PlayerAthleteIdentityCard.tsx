import { useState } from 'react';
import { Copy, Check, Edit3, MapPin, User, Shield, Trophy, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BilingualText as BilingualValue, Coach, Player, Session, Sport, TrainingGroup } from '../../../domain/contracts';
import { BilingualText, bi } from '../../../components/bilingual/BilingualText';
import { useUiSettings } from '../../../ui/theme/useUiSettings';
import { PlayerPortrait } from './PlayerPortrait';

interface PlayerAthleteIdentityCardProps {
  player: Player;
  sport?: Sport;
  group?: TrainingGroup;
  coach?: Coach;
  program?: { id: string; name: BilingualValue };
  branch?: { id: string; name: BilingualValue };
  nextSession?: Session | null;
  attendanceRate?: number | null;
  overallScore?: number | null;
  preview?: boolean;
  onOpenIdentity?: () => void;
}

export function PlayerAthleteIdentityCard({
  player,
  sport,
  coach,
  program,
  branch,
}: PlayerAthleteIdentityCardProps) {
  const { bilingualOrder } = useUiSettings();
  const [copied, setCopied] = useState(false);

  const isArabic = bilingualOrder === 'ar-first';
  const displayId = player.id.startsWith('player-demo-')
    ? 'UO-2024-0176'
    : player.id.toUpperCase();

  const handleCopyId = () => {
    void navigator.clipboard.writeText(displayId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ageCategoryText = player.age
    ? `U${player.age} (${2026 - player.age})`
    : (isArabic ? player.level?.ar ?? '—' : player.level?.en ?? '—');

  return (
    <article className="athlete-ivory-card athlete-identity-reference-card" aria-labelledby="ref-athlete-name">
      <header className="athlete-ivory-card__header">
        <h2 className="athlete-ivory-card__title">
          <BilingualText value={bi('Athlete Profile', 'ملف اللاعب')} />
        </h2>
        <Link to="/player/profile" className="athlete-ivory-card__edit-link">
          <span><BilingualText value={bi('Edit Profile', 'تعديل الملف')} /></span>
          <Edit3 size={14} />
        </Link>
      </header>

      <div className="athlete-identity-reference-grid">
        {/* Athlete Portrait */}
        <div className="athlete-identity-reference-portrait-box">
          <PlayerPortrait
            photoUrl={player.photo}
            name={player.nameEn}
            className="athlete-identity-reference-portrait"
          />
        </div>

        {/* Details Column */}
        <div className="athlete-identity-reference-details">
          <div className="athlete-identity-reference-name-row">
            <div>
              <h3 id="ref-athlete-name" className="athlete-identity-reference-name-en">
                {player.nameEn}
              </h3>
              <p className="athlete-identity-reference-name-ar">
                {player.nameAr}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopyId}
              className="athlete-identity-reference-id-pill"
              title="Copy Athlete ID | نسخ معرف اللاعب"
            >
              <span>{displayId}</span>
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
            </button>
          </div>

          <div className="athlete-identity-reference-fields">
            <div className="athlete-identity-reference-field">
              <span className="athlete-identity-field-label">
                <Trophy size={13} className="text-amber-600 flex-shrink-0" />
                <BilingualText value={bi('Sport', 'الرياضة')} />
              </span>
              <strong className="athlete-identity-field-value">
                <BilingualText value={sport?.name ?? bi('Football', 'كرة القدم')} />
              </strong>
            </div>

            <div className="athlete-identity-reference-field">
              <span className="athlete-identity-field-label">
                <BookOpen size={13} className="text-amber-600 flex-shrink-0" />
                <BilingualText value={bi('Program', 'البرنامج')} />
              </span>
              <strong className="athlete-identity-field-value">
                <BilingualText value={program?.name ?? bi('Elite Development', 'التطوير النخبوي')} />
              </strong>
            </div>

            <div className="athlete-identity-reference-field">
              <span className="athlete-identity-field-label">
                <MapPin size={13} className="text-amber-600 flex-shrink-0" />
                <BilingualText value={bi('Branch', 'الفرع')} />
              </span>
              <strong className="athlete-identity-field-value">
                <BilingualText value={branch?.name ?? bi('Riyadh', 'الرياض')} />
              </strong>
            </div>

            <div className="athlete-identity-reference-field">
              <span className="athlete-identity-field-label">
                <User size={13} className="text-amber-600 flex-shrink-0" />
                <BilingualText value={bi('Coach', 'المدرب')} />
              </span>
              <strong className="athlete-identity-field-value">
                {coach ? (isArabic ? coach.nameAr : coach.nameEn) : <BilingualText value={bi('Coach Ahmed', 'المدرب أحمد')} />}
              </strong>
            </div>

            <div className="athlete-identity-reference-field">
              <span className="athlete-identity-field-label">
                <Shield size={13} className="text-amber-600 flex-shrink-0" />
                <BilingualText value={bi('Age Category', 'الفئة العمرية')} />
              </span>
              <strong className="athlete-identity-field-value">
                {ageCategoryText}
              </strong>
            </div>
          </div>
        </div>

        {/* Motto Block */}
        <div className="athlete-identity-reference-motto-box">
          <span className="athlete-identity-reference-quote-mark" aria-hidden="true">“</span>
          <p className="athlete-identity-reference-motto-en">Discipline Builds Freedom</p>
          <p className="athlete-identity-reference-motto-ar">الانضباط يصنع الحرية</p>
        </div>
      </div>
    </article>
  );
}
