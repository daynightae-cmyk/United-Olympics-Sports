import {
  ArrowLeft,
  ArrowRight,
  Check,
  Dumbbell,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { BilingualText, bi } from "../../components/bilingual/BilingualText";
import { SportConceptVisual } from "../../components/owner-demo/OwnerDemoVisuals";
import { basketballMediaAssets } from "../../data/media/basketball";
import type { SportMediaAsset } from "../../domain/contracts";
import "../../styles/basketball.css";

const basketballMedia = Object.fromEntries(
  basketballMediaAssets.map((asset) => [asset.id, asset])
) as Record<string, SportMediaAsset>;

function BasketballImage({
  asset,
  priority = false,
  className = "",
}: {
  asset: SportMediaAsset;
  priority?: boolean;
  className?: string;
}) {
  const [ok, setOk] = useState(true);
  if (!asset) return <SportConceptVisual sportId="basketball" />;
  if (!ok) return <SportConceptVisual sportId="basketball" />;
  return (
    <img
      className={`basketball-image ${className}`.trim()}
      src={asset.url}
      alt={`${asset.altEn} | ${asset.altAr}`}
      width={1648}
      height={928}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      onError={() => setOk(false)}
    />
  );
}

const pillars = [
  bi("Ball Handling", "التحكم بالكرة"),
  bi("Shooting", "التصويب"),
  bi("Passing", "التمرير"),
  bi("Footwork", "حركة القدمين"),
  bi("Decision Making", "اتخاذ القرار"),
  bi("Team Play", "اللعب الجماعي"),
  bi("Defence", "الدفاع"),
  bi("Endurance", "التحمل"),
];

export function BasketballPage() {
  const [previewMessage, setPreviewMessage] = useState(false);

  const submitInterest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPreviewMessage(true);
  };

  return (
    <div className="basketball-page">
      <section className="basketball-hero">
        <BasketballImage asset={basketballMedia["basketball-08"]} priority />
        <div className="basketball-hero-grid" aria-hidden="true" />
        <div className="basketball-hero-shade" />
        <div className="basketball-hero-content">
          <Link className="basketball-back" to="/sports">
            <ArrowLeft size={16} />
            <BilingualText value={bi("All Sports", "جميع الرياضات")} />
          </Link>
          <BilingualText
            className="basketball-kicker"
            value={bi("Basketball Program", "برنامج كرة السلة")}
            icon={<Sparkles size={15} />}
          />
          <h1>
            <BilingualText value={bi("Move Fast. Think Faster.", "تحرك بسرعة. وفكر أسرع.")} />
          </h1>
          <p>
            <BilingualText
              value={bi(
                "Structured basketball training develops movement, coordination, decision-making, team awareness and confident execution.",
                "يطور تدريب كرة السلة المنظم الحركة والتناسق واتخاذ القرار والوعي الجماعي والتنفيذ بثقة."
              )}
            />
          </p>
          <div className="basketball-actions">
            <a className="button primary" href="#basketball-training">
              <BilingualText value={bi("Explore Training", "استكشف التدريب")} />
              <ArrowRight size={16} />
            </a>
            <a className="button secondary" href="#basketball-interest">
              <BilingualText value={bi("Register Interest", "سجل اهتمامك")} />
              <ArrowRight size={16} />
            </a>
          </div>
        </div>
      </section>

      <section className="basketball-section basketball-pillars-section" id="basketball-training">
        <div className="basketball-heading">
          <BilingualText
            className="basketball-eyebrow"
            value={bi("Training Pillars", "محاور التدريب")}
          />
          <h2>
            <BilingualText
              value={bi(
                "Control the ball. Read the floor. Make the next decision.",
                "تحكم بالكرة. اقرأ الملعب. واتخذ القرار التالي."
              )}
            />
          </h2>
          <p>
            <BilingualText
              value={bi(
                "Basketball development combines technical repetition with movement, awareness and team responsibility.",
                "يجمع تطوير كرة السلة بين التكرار الفني والحركة والوعي والمسؤولية الجماعية."
              )}
            />
          </p>
        </div>
        <div className="basketball-pillars">
          {pillars.map((pillar, index) => (
            <article key={pillar.en} className={index < 3 ? "featured" : ""}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>
                <BilingualText value={pillar} />
              </h3>
            </article>
          ))}
        </div>
      </section>

      <section className="basketball-section basketball-technique basketball-dark-band">
        <div className="basketball-technique-media">
          <BasketballImage asset={basketballMedia["basketball-01"]} />
          <BasketballImage asset={basketballMedia["basketball-02"]} />
        </div>
        <div className="basketball-copy">
          <BilingualText
            className="basketball-eyebrow"
            value={bi("Technique Coaching", "التدريب الفني")}
          />
          <h2>
            <BilingualText
              value={bi("Details create repeatable skill.", "التفاصيل تصنع مهارة قابلة للتكرار.")}
            />
          </h2>
          <p>
            <BilingualText
              value={bi(
                "Coach-led correction connects shooting form, ball control, posture and purposeful repetition without making unverified claims about staff credentials.",
                "يربط التصحيح بقيادة المدرب بين أسلوب التصويب والتحكم بالكرة ووضعية الجسم والتكرار الهادف دون تقديم ادعاءات غير موثقة حول مؤهلات الطاقم."
              )}
            />
          </p>
          <div className="basketball-mini-points">
            <BilingualText value={bi("Shooting form", "أسلوب التصويب")} />
            <BilingualText value={bi("Ball control", "التحكم بالكرة")} />
            <BilingualText value={bi("Posture", "وضعية الجسم")} />
          </div>
        </div>
      </section>

      <section className="basketball-section basketball-children">
        <div className="basketball-copy">
          <BilingualText
            className="basketball-eyebrow"
            value={bi("Children Development", "تطوير الأطفال")}
          />
          <h2>
            <BilingualText
              value={bi(
                "Confidence starts with coordinated movement.",
                "تبدأ الثقة بحركة متناسقة."
              )}
            />
          </h2>
          <p>
            <BilingualText
              value={bi(
                "Progressive child-focused drills can build ball familiarity, listening, movement and confidence through safe repetition. Exact age groups and availability are shown only when verified.",
                "يمكن للتدريبات المتدرجة الموجهة للأطفال بناء الألفة مع الكرة والاستماع والحركة والثقة من خلال تكرار آمن، ولا تُعرض الفئات العمرية أو الإتاحة الفعلية إلا بعد التحقق."
              )}
            />
          </p>
        </div>
        <div className="basketball-stacked-media">
          <BasketballImage asset={basketballMedia["basketball-03"]} />
          <BasketballImage asset={basketballMedia["basketball-06"]} />
        </div>
      </section>

      <section className="basketball-section basketball-girls basketball-dark-band">
        <div className="basketball-heading">
          <BilingualText
            className="basketball-eyebrow"
            value={bi("Girls Development", "تطوير الفتيات")}
          />
          <h2>
            <BilingualText
              value={bi(
                "A dedicated pathway deserves visible space.",
                "المسار المخصص يستحق حضورًا واضحًا."
              )}
            />
          </h2>
          <p>
            <BilingualText
              value={bi(
                "Female-coach-led training is presented as a dedicated development experience focused on passing, defensive positioning, ball handling and confident participation. No timetable or branch availability is invented.",
                "يُعرض التدريب بقيادة المدربة كتجربة تطوير مخصصة تركز على التمرير والتمركز الدفاعي والتحكم بالكرة والمشاركة بثقة، دون اختلاق جداول أو إتاحة للفروع."
              )}
            />
          </p>
        </div>
        <div className="basketball-girls-grid">
          <BasketballImage asset={basketballMedia["basketball-04"]} />
          <BasketballImage asset={basketballMedia["basketball-10"]} />
        </div>
      </section>

      <section className="basketball-section basketball-performance">
        <div className="basketball-performance-media">
          <BasketballImage asset={basketballMedia["basketball-05"]} />
          <BasketballImage asset={basketballMedia["basketball-09"]} />
        </div>
        <div className="basketball-copy">
          <BilingualText
            className="basketball-eyebrow"
            value={bi("Youth Performance", "أداء الناشئين")}
          />
          <h2>
            <BilingualText
              value={bi(
                "Speed stays useful only when it stays controlled.",
                "تبقى السرعة مفيدة عندما تبقى تحت السيطرة."
              )}
            />
          </h2>
          <p>
            <BilingualText
              value={bi(
                "Dribbling and cone work can connect controlled speed, change of direction, ball protection and live decision-making under increasing pressure.",
                "يمكن لتدريبات المراوغة والأقماع ربط السرعة المنضبطة وتغيير الاتجاه وحماية الكرة واتخاذ القرار المباشر تحت ضغط متزايد."
              )}
            />
          </p>
        </div>
      </section>

      <section className="basketball-section basketball-team basketball-dark-band">
        <BasketballImage asset={basketballMedia["basketball-07"]} />
        <div className="basketball-copy">
          <BilingualText
            className="basketball-eyebrow"
            value={bi("Train Together", "تدربوا معًا")}
          />
          <h2>
            <BilingualText
              value={bi(
                "Spacing, communication and shared responsibility.",
                "التمركز والتواصل والمسؤولية المشتركة."
              )}
            />
          </h2>
          <p>
            <BilingualText
              value={bi(
                "Group training develops team habits through movement, communication, spacing and responsibility without presenting a fictional roster or competition record.",
                "يطور التدريب الجماعي عادات الفريق من خلال الحركة والتواصل والتمركز والمسؤولية دون عرض قائمة لاعبين أو سجل منافسات غير حقيقي."
              )}
            />
          </p>
        </div>
      </section>

      <section className="basketball-section basketball-game-like">
        <div className="basketball-copy">
          <BilingualText
            className="basketball-eyebrow"
            value={bi("Game-Like Intensity", "كثافة تحاكي اللعب")}
          />
          <h2>
            <BilingualText
              value={bi(
                "Technique must survive the next decision.",
                "يجب أن تصمد المهارة أمام القرار التالي."
              )}
            />
          </h2>
          <p>
            <BilingualText
              value={bi(
                "Game-like training moves from isolated technique toward live attack, defence and decision-making scenarios. It does not imply official league or tournament participation.",
                "ينتقل التدريب الذي يحاكي اللعب من المهارة المنفردة إلى مواقف الهجوم والدفاع واتخاذ القرار المباشر، دون أن يعني مشاركة رسمية في دوري أو بطولة."
              )}
            />
          </p>
          <div className="basketball-metric-row">
            <BilingualText value={bi("Shooting", "التصويب")} />
            <BilingualText value={bi("Passing", "التمرير")} />
            <BilingualText value={bi("Decision Making", "اتخاذ القرار")} />
            <BilingualText value={bi("Endurance", "التحمل")} />
          </div>
        </div>
        <BasketballImage asset={basketballMedia["basketball-08"]} />
      </section>

      <section className="basketball-section basketball-gallery-section">
        <div className="basketball-heading">
          <BilingualText
            className="basketball-eyebrow"
            value={bi("Basketball Gallery", "معرض كرة السلة")}
          />
          <h2>
            <BilingualText
              value={bi(
                "Ten verified basketball visuals. Ten independent assets.",
                "عشر صور كرة سلة معتمدة. عشرة أصول مستقلة."
              )}
            />
          </h2>
          <p>
            <BilingualText
              value={bi(
                "Every user-supplied image remains its own website asset. No collage, stock replacement or generated substitute is used.",
                "تبقى كل صورة مقدمة من المستخدم أصلًا مستقلًا داخل الموقع، دون كولاج أو استبدال بصور مخزنة أو بدائل مولدة."
              )}
            />
          </p>
        </div>
        <div className="basketball-gallery">
          {basketballMediaAssets.map((asset) => (
            <figure key={asset.id}>
              <BasketballImage asset={asset} />
              <figcaption>
                <span>{String(asset.order).padStart(2, "0")}</span>
                <BilingualText value={bi(asset.altEn, asset.altAr)} />
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="basketball-section basketball-interest" id="basketball-interest">
        <div className="basketball-interest-card">
          <BilingualText
            className="basketball-eyebrow"
            value={bi("Register Interest", "سجل اهتمامك")}
          />
          <h2>
            <BilingualText
              value={bi("Interested in the Basketball pathway?", "مهتم بمسار كرة السلة؟")}
            />
          </h2>
          <p>
            <BilingualText
              value={bi(
                "This Phase 1 form is an interface preview only. It does not send, store or register information.",
                "هذا النموذج في المرحلة الأولى معاينة للواجهة فقط، ولا يرسل أو يحفظ أو يسجل المعلومات."
              )}
            />
          </p>
          <form onSubmit={submitInterest} className="basketball-interest-form">
            <label>
              <BilingualText value={bi("Name", "الاسم")} />
              <input required name="name" autoComplete="name" placeholder="Name | الاسم" />
            </label>
            <label>
              <BilingualText value={bi("Email", "البريد الإلكتروني")} />
              <input
                required
                name="email"
                type="email"
                autoComplete="email"
                placeholder="Email | البريد الإلكتروني"
              />
            </label>
            <label>
              <BilingualText value={bi("Preferred Training Focus", "محور التدريب المفضل")} />
              <select name="focus" defaultValue="">
                <option value="" disabled>
                  Select focus | اختر المحور
                </option>
                <option value="ball-handling">Ball Handling | التحكم بالكرة</option>
                <option value="shooting">Shooting | التصويب</option>
                <option value="team-play">Team Play | اللعب الجماعي</option>
                <option value="general">General Development | تطوير عام</option>
              </select>
            </label>
            <button className="button primary" type="submit">
              <BilingualText value={bi("Preview Registration", "معاينة التسجيل")} />
              <ArrowRight size={16} />
            </button>
          </form>
          {previewMessage && (
            <p className="basketball-preview-note">
              <Check size={15} />
              <BilingualText
                value={bi(
                  "Preview only — no information was submitted or saved.",
                  "معاينة فقط — لم يتم إرسال أو حفظ أي معلومات."
                )}
              />
            </p>
          )}
        </div>
      </section>

      <section className="basketball-related">
        <div>
          <Trophy />
          <BilingualText value={bi("Related Sports Navigation", "التنقل إلى الرياضات المرتبطة")} />
        </div>
        <nav aria-label="Related sports | الرياضات المرتبطة">
          <Link to="/sports">
            <BilingualText value={bi("All Sports", "جميع الرياضات")} />
            <ArrowRight size={15} />
          </Link>
          <Link to="/sports/football">
            <BilingualText value={bi("Football", "كرة القدم")} />
            <ArrowRight size={15} />
          </Link>
          <Link to="/sports/swimming">
            <BilingualText value={bi("Swimming", "السباحة")} />
            <ArrowRight size={15} />
          </Link>
          <Link to="/programs">
            <BilingualText value={bi("Programs", "البرامج")} />
            <ArrowRight size={15} />
          </Link>
        </nav>
      </section>
    </div>
  );
}
