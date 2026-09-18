import { useMemo, useState } from "react";
import { Activity, ArrowRight, Dumbbell, Shield, Sparkles, Trophy, Waves } from "lucide-react";
import { Link } from "react-router-dom";
import { BilingualText, bi } from "../../components/bilingual/BilingualText";
import { SportConceptVisual } from "../../components/owner-demo/OwnerDemoVisuals";
import { PUBLIC_PROGRAMS } from "../../data/public/publicContent";
import { getSportPreviewMedia } from "../../data/media";
import "../../styles/owner-demo.css";

const filters = [
  { id: "all", label: bi("All", "الكل"), icon: Sparkles },
  { id: "football", label: bi("Football", "كرة القدم"), icon: Dumbbell },
  { id: "swimming", label: bi("Swimming", "السباحة"), icon: Waves },
  { id: "basketball", label: bi("Basketball", "كرة السلة"), icon: Trophy },
  { id: "tennis", label: bi("Tennis", "التنس"), icon: Sparkles },
  { id: "gymnastics", label: bi("Gymnastics", "الجمباز"), icon: Activity },
  { id: "martial-arts", label: bi("Martial Arts", "الفنون القتالية"), icon: Shield },
];

export function ProgramsPage() {
  const [filter, setFilter] = useState("all");
  const filtered = useMemo(
    () =>
      filter === "all"
        ? PUBLIC_PROGRAMS
        : PUBLIC_PROGRAMS.filter((program) => program.sportId === filter),
    [filter]
  );
  const heroMedia = ["football", "swimming", "basketball"].map((id) => getSportPreviewMedia(id));

  function MediaWithFallback({
    media,
    sportId,
    className,
  }: {
    media: any;
    sportId: string;
    className?: string;
  }) {
    const [ok, setOk] = useState(true);
    if (!media || !ok) return <SportConceptVisual sportId={sportId} compact={!!className} />;

    return (
      <img
        className={className}
        src={media.url}
        alt={`${media.altEn} | ${media.altAr}`}
        width={1648}
        height={928}
        loading="lazy"
        decoding="async"
        onError={() => setOk(false)}
      />
    );
  }

  return (
    <div className="od-public-page od-programs-page">
      <section className="od-programs-hero">
        <div className="od-programs-hero-copy">
          <span className="od-kicker">
            <BilingualText value={bi("Six Sports • Structured Development", "ست رياضات • تطوير منظم")} />
          </span>
          <h1>
            <BilingualText value={bi("Programs Built for Progress", "برامج مصممة للتطور")} />
          </h1>
          <p>
            <BilingualText
              value={bi(
                "Explore training pathways across all six United Olympics Sports disciplines. Each pathway explains its development focus without inventing schedules, prices or operational availability.",
                "استكشف مسارات التدريب في الرياضات الست لدى يونايتد أوليمبيكس سبورت. يوضح كل مسار محاور التطور دون اختلاق جداول أو أسعار أو إتاحة تشغيلية."
              )}
            />
          </p>
        </div>
        <div
          className="od-program-mosaic"
          aria-label="Programs sports visual | المشهد البصري للبرامج"
        >
          {heroMedia.map(
            (media, index) =>
              media && (
                <MediaWithFallback
                  key={media.id}
                  media={media}
                  sportId={media.id}
                  className={`mosaic-${index + 1}`}
                />
              )
          )}
          <div className="mosaic-tennis">
            <SportConceptVisual sportId="tennis" compact />
          </div>
          <div className="od-mosaic-shade" />
        </div>
      </section>

      <section className="od-program-catalogue">
        <div className="od-section-heading">
          <span>
            <BilingualText value={bi("Choose a sport", "اختر الرياضة")} />
          </span>
          <h2>
            <BilingualText
              value={bi(
                "A clear route into every training pathway",
                "مدخل واضح إلى كل مسار تدريبي"
              )}
            />
          </h2>
        </div>
        <div
          className="od-sport-filter"
          role="group"
          aria-label="Filter programmes by sport | تصفية البرامج حسب الرياضة"
        >
          {filters.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                className={filter === item.id ? "active" : ""}
                aria-pressed={filter === item.id}
                onClick={() => setFilter(item.id)}
              >
                <Icon />
                <BilingualText value={item.label} />
              </button>
            );
          })}
        </div>
        <div className={`od-program-grid ${filtered.length === 1 ? "is-featured" : ""}`}>
          {filtered.map((program) => {
            const media = getSportPreviewMedia(program.sportId);
            return (
              <article className={`od-program-card sport-${program.sportId}`} key={program.id}>
                <div className="od-program-visual">
                  {media ? (
                    <MediaWithFallback media={media} sportId={program.sportId} />
                  ) : (
                    <SportConceptVisual sportId={program.sportId} />
                  )}
                  <div className="od-program-visual-overlay" />
                  <span className="od-program-sport">
                    <BilingualText value={program.sport} />
                  </span>
                </div>
                <div className="od-program-card-copy">
                  <div className="od-program-chips">
                    <span>
                      <BilingualText value={program.ageGroup} />
                    </span>
                    <span>
                      <BilingualText value={program.level} />
                    </span>
                  </div>
                  <h3>
                    <BilingualText value={program.name} />
                  </h3>
                  <p>
                    <BilingualText value={program.description} />
                  </p>
                  <div className="od-program-focus">
                    <small>
                      <BilingualText value={bi("Training Focus", "محور التدريب")} />
                    </small>
                    <strong>
                      <BilingualText value={program.focus} />
                    </strong>
                  </div>
                  <Link className="od-cta-link" to={`/programs/${program.slug}`}>
                    <BilingualText value={bi("Explore Program", "استكشف البرنامج")} />
                    <ArrowRight />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
