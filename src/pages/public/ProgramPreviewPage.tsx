import React, { useState } from "react";
import { ArrowRight, CheckCircle2, CircleDot, Compass, UsersRound } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { BilingualText, bi } from "../../components/bilingual/BilingualText";
import { SportConceptVisual } from "../../components/owner-demo/OwnerDemoVisuals";
import { getPublicProgram } from "../../data/public/publicContent";
import { getSportPreviewMedia } from "../../data/media";
import "../../styles/owner-demo.css";

const stages = [
  bi("Foundation", "الأساس"),
  bi("Development", "التطوير"),
  bi("Performance", "الأداء"),
  bi("Advanced Focus", "التركيز المتقدم"),
];

export function ProgramPreviewPage() {
  const { programSlug } = useParams();
  const program = getPublicProgram(programSlug);
  if (!program) return <Navigate to="/programs" replace />;

  const media = getSportPreviewMedia(program.sportId);
  const [mediaAvailable, setMediaAvailable] = useState(true);

  return (
    <div className={`od-public-page od-program-detail sport-${program.sportId}`}>
      <section className="od-program-detail-hero">
        <div className="od-program-detail-media">
          {media && mediaAvailable ? (
            <img
              src={media.url}
              alt={`${media.altEn} | ${media.altAr}`}
              width={1648}
              height={928}
              loading="eager"
              decoding="async"
              onError={() => setMediaAvailable(false)}
            />
          ) : (
            <SportConceptVisual sportId={program.sportId} />
          )}
          <div className="od-program-detail-shade" />
        </div>
        <div className="od-program-detail-copy">
          <Link className="od-back-link" to="/programs">
            <BilingualText value={bi("All Programs", "كل البرامج")} />
          </Link>
          <span className="od-kicker">
            <BilingualText value={program.sport} />
          </span>
          <h1>
            <BilingualText value={program.name} />
          </h1>
          <p>
            <BilingualText value={program.description} />
          </p>
          <div className="od-program-chips">
            <span>
              <BilingualText value={program.ageGroup} />
            </span>
            <span>
              <BilingualText value={program.level} />
            </span>
          </div>
        </div>
      </section>

      <section className="od-detail-section">
        <div className="od-section-heading">
          <span>
            <BilingualText value={bi("Development Path", "مسار التطور")} />
          </span>
          <h2>
            <BilingualText value={bi("A clear progression pathway", "مسار واضح للتدرج")} />
          </h2>
        </div>
        <div className="od-pathway">
          {stages.map((stage, index) => (
            <div key={stage.en} className="od-path-stage">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <BilingualText value={stage} />
              {index < stages.length - 1 && <ArrowRight aria-hidden="true" />}
            </div>
          ))}
        </div>
        <p className="od-preview-note">
          <BilingualText
            value={bi(
              "Athletes progress according to readiness and training needs. Exact groups, schedules and placement are confirmed only from verified operational data.",
              "يتدرج الرياضي حسب الجاهزية واحتياجات التدريب، ولا تُعرض المجموعات والجداول والتسكين الفعلي إلا من بيانات تشغيلية موثقة."
            )}
          />
        </p>
      </section>

      <section className="od-detail-section od-detail-split">
        <div>
          <div className="od-section-heading">
            <span>
              <BilingualText value={bi("Training Pillars", "ركائز التدريب")} />
            </span>
            <h2>
              <BilingualText value={program.focus} />
            </h2>
          </div>
          <div className="od-pillar-list">
            {program.pillars.map((pillar, index) => (
              <article key={pillar.en}>
                <CheckCircle2 />
                <span>{String(index + 1).padStart(2, "0")}</span>
                <BilingualText value={pillar} />
              </article>
            ))}
          </div>
        </div>
        <div className="od-coach-approach">
          <UsersRound />
          <small>
            <BilingualText value={bi("Coach Approach", "منهج المدرب")} />
          </small>
          <h3>
            <BilingualText value={program.coachApproach} />
          </h3>
          <p>
            <BilingualText
              value={bi(
                "Coaching combines demonstration, observation, correction and a clear next focus for the athlete.",
                "يجمع التدريب بين الشرح والملاحظة والتصحيح وتحديد التركيز التالي بوضوح للرياضي."
              )}
            />
          </p>
        </div>
      </section>

      <section className="od-detail-section">
        <div className="od-section-heading">
          <span>
            <BilingualText value={bi("Session Experience", "تجربة الحصة")} />
          </span>
          <h2>
            <BilingualText
              value={bi("How a training session is structured", "كيف تُبنى الحصة التدريبية")}
            />
          </h2>
        </div>
        <div className="od-session-flow">
          <article>
            <CircleDot />
            <BilingualText value={bi("Prepare", "التهيئة")} />
          </article>
          <article>
            <Compass />
            <BilingualText value={program.sessionExperience} />
          </article>
          <article>
            <CheckCircle2 />
            <BilingualText value={bi("Review & next focus", "المراجعة والتركيز القادم")} />
          </article>
        </div>
      </section>

      <section className="od-owner-cta">
        <div>
          <h2>
            <BilingualText
              value={bi("Interested in this training pathway?", "مهتم بهذا المسار التدريبي؟")}
            />
          </h2>
          <p>
            <BilingualText
              value={bi(
                "Use the official contact channel to ask about verified group availability and the most suitable next step.",
                "استخدم قناة التواصل الرسمية للاستفسار عن المجموعات المتاحة بعد التحقق والخطوة التالية الأنسب."
              )}
            />
          </p>
        </div>
        <Link className="button primary" to="/contact">
          <BilingualText value={bi("Contact About Program", "تواصل بخصوص البرنامج")} />
          <ArrowRight />
        </Link>
      </section>
    </div>
  );
}
